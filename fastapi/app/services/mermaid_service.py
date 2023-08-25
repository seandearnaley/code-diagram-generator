"""Mermaid Service Module"""

import asyncio
import json
from typing import Tuple, Union

from loguru import logger

from ..exceptions import MermaidCliError
from ..models import LLMDefinition, MermaidDesignRequest, MermaidModel
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_string
from ..utils.log_utils import print_markdown
from ..utils.mermaid_utils import sanitize_markdown_js
from .mermaid_function_defs import MERMAID_SCRIPT_FUNCTION_DEFINITIONS
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
            mermaid_def_str = function_args.get("mermaid_diagram_text_definition")

            notes_markdown = function_args.get("notes_markdown").strip("\n")
            diagram_type = function_args.get("diagram_type")
            if mermaid_def_str:
                print_markdown(f"def str:\n\n{mermaid_def_str}")
                return mermaid_def_str, notes_markdown, diagram_type
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
    max_tokens = (
        llm_definition.max_token_length - num_tokens - 400
    )  # ( 300 for functions and msgs TODO: count that)

    # todo update max_tokens with retries OR langchain

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant specialized in writing"
                " professional system diagrams using mermaid js."
            ),
        },
        {"role": "user", "content": mermaid_design_request.text},
    ]

    for _ in range(convo_retries):
        logger.info(
            "Starting Generate Design with Complete Text: max tokens:"
            f" {max_tokens} ({llm_definition.max_token_length} - {num_tokens}) using"
            f" model: {llm_definition.name} "
        )

        # if i > 0:
        #     messages.pop(1)

        result = complete_text(
            messages=messages,
            max_tokens=min(max_tokens, 2000),
            model=mermaid_design_request.llm_model_for_instructions,
            vendor=mermaid_design_request.llm_vendor_for_instructions,
            functions=MERMAID_SCRIPT_FUNCTION_DEFINITIONS,
            callback=openai_mermaid_fn_callback,
        )

        if isinstance(result, str):
            logger.info("result is a string, retry the conversation")

            messages.append({"role": "assistant", "content": result})

            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Sorry that definition did not work, maybe there was a"
                        " syntax mistake, could you try"
                        " the create_mermaid_diagram function again?```"
                    ),
                }
            )
            continue

        mermaid_def_str, notes_markdown, diagram_type = result

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
            messages.append({"role": "assistant", "content": mermaid_def_str})

            messages.append(
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
            "notes_markdown": notes_markdown,
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
