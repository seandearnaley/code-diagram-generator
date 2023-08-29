"""Mermaid Service Module"""

import asyncio
import json
from typing import Tuple, Union

from loguru import logger

from ..components.enhanced_conversation_buffer import EnhancedConversationBuffer
from ..exceptions import MermaidCliError
from ..models import LLMDefinition, MermaidDesignRequest, MermaidModel
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_functions, num_tokens_from_string
from ..utils.log_utils import print_markdown
from ..utils.mermaid_utils import sanitize_markdown_js
from .diagram_function_defs import DIAGRAM_FUNCTION_DEFINITIONS
from .mermaid_generator import create_mermaid_diagram


def openai_mermaid_fn_callback(response) -> Union[Tuple[str, str, str], str]:
    """Callback function for mermaid diagram generation."""
    if response.choices:
        response_message = response.choices[0].message
        if response_message.get("function_call"):
            logger.debug(f"response_message: {response_message}")

            try:
                sanitized_string = sanitize_markdown_js(
                    response_message["function_call"]["arguments"]
                )

                logger.debug(f"sanitized_string: {sanitized_string}")
                function_args = json.loads(sanitized_string)
            except json.JSONDecodeError as err:
                # Log or print the JSON string to investigate further
                print(
                    "JSON string that caused error:"
                    f" {response_message['function_call']['arguments']}"
                )
                raise err  # Re-raise the exception if you want it to propagate
            mermaid_def_str = function_args.get("diagram_text_definition")

            explanation = function_args.get("explanation").strip("\n")
            diagram_type = function_args.get("diagram_type")
            if mermaid_def_str:
                print_markdown(f"def str:\n\n{mermaid_def_str}")
                return mermaid_def_str, explanation, diagram_type
        return response_message.content.strip()
    return "Response doesn't have choices or choices have no text."


async def mermaid_request(
    llm_definition: LLMDefinition,
    mermaid_design_request: MermaidDesignRequest,
    convo_retries: int = 4,  # Number of conversation retries
    overall_retries: int = 3,  # Number of overall retries
    parallel_tasks: int = 2,  # Number of parallel tasks
):
    """Generate a mermaid diagram from a mermaid script."""
    logger.debug(f"Mermaid Design Request: {mermaid_design_request}")

    num_tokens = num_tokens_from_string(mermaid_design_request.text)

    function_num_tokens = num_tokens_from_functions(
        DIAGRAM_FUNCTION_DEFINITIONS, model=llm_definition.id
    )

    logger.debug(f"function_num_tokens: {function_num_tokens}")

    max_tokens = llm_definition.max_token_length - num_tokens - function_num_tokens

    # Debug logs
    logger.debug(f"max_tokens: {max_tokens}")
    logger.debug(f"llm_definition.max_token_length: {llm_definition.max_token_length}")
    logger.debug(f"num_tokens from mermaid_design_request.text: {num_tokens}")

    buffer = EnhancedConversationBuffer(
        max_tokens=llm_definition.max_token_length - function_num_tokens,
        num_tokens_from_string=num_tokens_from_string,
    )

    logger.debug(f"Initialized buffer with max_tokens: {max_tokens}")

    # Add initial system and user messages to the buffer
    buffer.add_message(
        {
            "role": "system",
            "content": (
                "You are a helpful assistant specialized in writing professional system"
                " diagrams using mermaid js."
            ),
        }
    )
    buffer.add_message({"role": "user", "content": mermaid_design_request.text})

    for _ in range(convo_retries):
        logger.info(
            "Starting Generate Design with Complete Text: max tokens:"
            f" {max_tokens} ({llm_definition.max_token_length} - {num_tokens}) using"
            f" model: {llm_definition.name} "
        )

        # if i > 0:
        #     messages.pop(1)
        logger.debug(f"Buffer state before complete_text: {buffer.buffer_as_messages}")

        result = complete_text(
            messages=buffer.buffer_as_messages,
            max_tokens=max_tokens,
            model=mermaid_design_request.llm_model_for_instructions,
            vendor=mermaid_design_request.llm_vendor_for_instructions,
            functions=DIAGRAM_FUNCTION_DEFINITIONS,
            callback=openai_mermaid_fn_callback,
        )

        logger.debug(f"Buffer state after complete_text: {buffer.buffer_as_messages}")

        if isinstance(result, str):
            logger.info("result is a string, retry the conversation")
            buffer.add_message({"role": "assistant", "content": result})

            buffer.add_message(
                {
                    "role": "user",
                    "content": (
                        "Sorry that definition did not work, maybe there was a"
                        " syntax mistake, could you try"
                        " the create_mermaid_diagram function again?"
                    ),
                }
            )
            continue

        mermaid_def_str, explanation, diagram_type = result

        # if mermaid_def_str is empty after being trimmed/stripped, raise an error
        if not mermaid_def_str.strip():
            raise ValueError("Mermaid definition is empty")

        logger.info(f"mermaid_def_str:\n\n{mermaid_def_str}")

        markdown_svg, error_message = await create_mermaid_diagram(
            MermaidModel(mermaid_def_str=mermaid_def_str)
        )

        if error_message:
            logger.error(f"error message, push the conversation: {error_message}")
            # Adding assistant's message with mermaid definition
            buffer.add_message({"role": "assistant", "content": mermaid_def_str})

            buffer.add_message(
                {
                    "role": "user",
                    "content": (
                        "Sorry but that definition did not work, maybe there was a"
                        " syntax mistake, could you take a look at this error and try"
                        " the create_mermaid_diagram function again:\n```"
                        f" {error_message}```"
                    ),
                }
            )
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
        for result in results:
            if result is not None:
                return result

    raise MermaidCliError(f"Mermaid CLI failed after {convo_retries} attempts")
