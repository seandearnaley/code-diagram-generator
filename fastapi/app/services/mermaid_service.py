"""Mermaid Service Module"""

import asyncio
import json
from typing import Callable, Dict, Tuple, Union

from loguru import logger

from ..components.enhanced_conversation_buffer import EnhancedConversationBuffer
from ..exceptions import MermaidCliError
from ..models import LLMDefinition, MermaidDesignRequest, MermaidModel
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_functions, num_tokens_from_string
from ..utils.mermaid_utils import sanitize_markdown_js
from .diagram_function_defs import DIAGRAM_FUNCTION_DEFINITIONS
from .mermaid_generator import create_mermaid_diagram


def create_buffer(max_tokens: int, num_tokens_from_string_fn: Callable):
    """Creates an enhanced conversation buffer."""
    return EnhancedConversationBuffer(max_tokens, num_tokens_from_string_fn)


def openai_mermaid_fn_callback(response) -> Union[Tuple[str, str, str], str]:
    """Callback function for mermaid diagram generation with direct call to sanitize_markdown_js."""
    if not response.choices:
        return "Response doesn't have choices or choices have no text."

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        for tool_call in tool_calls:
            if tool_call.function.name == "create_mermaid_diagram":
                sanitized_string = sanitize_markdown_js(tool_call.function.arguments)

                try:
                    args_dict = json.loads(sanitized_string)
                except json.JSONDecodeError as err:
                    logger.error(f"JSONDecodeError after sanitizing: {err}")
                    return "Error processing sanitized string."

                mermaid_def_str = args_dict.get("diagram_text_definition", "")
                explanation = args_dict.get("explanation", "").strip("\n")
                diagram_type = args_dict.get("diagram_type", "")

                if mermaid_def_str:
                    return mermaid_def_str, explanation, diagram_type
    else:
        return response_message.content.strip()
    # Add a default return at the end
    return "Unexpected response format."


async def init_buffer(
    buffer: EnhancedConversationBuffer, mermaid_design_request: MermaidDesignRequest
):
    """Initialize the buffer with the initial messages."""
    buffer.add_messages(
        [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant specialized in writing professional"
                    " system diagrams."
                ),
            },
            {"role": "user", "content": mermaid_design_request.text},
        ]
    )


async def buffer_add_errormsg(
    buffer: EnhancedConversationBuffer, mermaid_def_str: str, error_message: str
):
    """Buffer the error message."""
    # Adding assistant's message with mermaid definition
    buffer.add_messages(
        [
            {"role": "assistant", "content": mermaid_def_str},
            {
                "role": "user",
                "content": (
                    "Sorry but that definition did not work, maybe there was a"
                    " syntax mistake, could you take a look at this error and try"
                    " the function again:\n```"
                    f" {error_message}```"
                ),
            },
        ]
    )


async def buffer_result_is_str(buffer: EnhancedConversationBuffer, result: str):
    """Buffer the result if it is a string."""
    buffer.add_messages(
        [
            {"role": "assistant", "content": result},
            {
                "role": "user",
                "content": (
                    "Sorry that definition did not work, maybe there was a"
                    " syntax mistake, could you try"
                    " the function again?"
                ),
            },
        ]
    )


async def mermaid_request(
    llm_definition: LLMDefinition,
    mermaid_design_request: MermaidDesignRequest,
    convo_retries: int = 4,  # Number of conversation retries
    overall_retries: int = 3,  # Number of overall retries
    parallel_tasks: int = 2,  # Number of parallel tasks
    buffer_factory: Callable[..., EnhancedConversationBuffer] = create_buffer,
    token_util: Callable[..., int] = num_tokens_from_functions,
) -> Union[Dict[str, str], Tuple[str, str, str], str]:
    """Generate a mermaid diagram from a mermaid script."""
    logger.debug(f"Mermaid Design Request: {mermaid_design_request}")

    function_num_tokens = token_util(
        DIAGRAM_FUNCTION_DEFINITIONS, model=llm_definition.id
    )

    logger.debug(f"function_num_tokens: {function_num_tokens}")

    num_tokens = num_tokens_from_string(mermaid_design_request.text)
    buffer_max_tokens = llm_definition.max_token_length - function_num_tokens
    complete_text_max_tokens = buffer_max_tokens - num_tokens

    # Ensure they are positive
    buffer_max_tokens = max(buffer_max_tokens, 1)
    complete_text_max_tokens = max(complete_text_max_tokens, 1)

    buffer = buffer_factory(buffer_max_tokens, num_tokens_from_string)

    logger.debug(f"Initialized buffer with max_tokens: {buffer_max_tokens}")

    await init_buffer(buffer, mermaid_design_request)

    for _ in range(convo_retries):
        logger.debug(f"Buffer state before complete_text: {buffer.buffer_as_messages}")

        # Calculate the max tokens for this iteration of complete_text
        iteration_max_tokens = min(complete_text_max_tokens, 2000)

        result = complete_text(
            messages=buffer.buffer_as_messages,
            max_tokens=iteration_max_tokens,
            model=mermaid_design_request.llm_model_for_instructions,
            vendor=mermaid_design_request.llm_vendor_for_instructions,
            functions=DIAGRAM_FUNCTION_DEFINITIONS,
            callback=openai_mermaid_fn_callback,
        )

        logger.debug(f"Buffer state after complete_text: {buffer.buffer_as_messages}")

        if isinstance(result, str):
            logger.info("result is a string, retry the conversation")
            await buffer_result_is_str(buffer, result)
            continue

        mermaid_def_str, explanation, diagram_type = result

        if not mermaid_def_str.strip():
            raise ValueError("Mermaid definition is empty")

        logger.info(f"mermaid_def_str: {mermaid_def_str}")

        markdown_svg, err_message = await create_mermaid_diagram(
            MermaidModel(mermaid_def_str=mermaid_def_str)
        )

        if err_message:
            logger.error(f"error message, push error into conversation: {err_message}")
            await buffer_add_errormsg(buffer, mermaid_def_str, err_message)
            continue

        if markdown_svg is None:
            raise MermaidCliError("Mermaid CLI failed to generate diagram")

        # Read the SVG content from the file
        with open(markdown_svg.path, "r", encoding="utf-8") as file:
            svg_content = file.read()

        logger.debug(f"markdown_svg: {markdown_svg}")

        return {
            "markdown_svg": svg_content,
            "explanation": explanation,
            "diagram_type": diagram_type,
        }

    # If the function hasn't returned by now, it means all conversation retries
    # have failed So we retry the whole function
    for _ in range(overall_retries):
        tasks = [
            mermaid_request(
                llm_definition,
                mermaid_design_request,
                convo_retries,
                overall_retries,
                parallel_tasks,
            )
            for _ in range(parallel_tasks)
        ]
        results = await asyncio.gather(*tasks)

        # If any of the tasks succeeded, return the result
        # need to try to make the algo have simple return types
        for result in results:
            if result is not None:
                return result

    raise MermaidCliError(f"Mermaid CLI failed after {overall_retries} attempts")
