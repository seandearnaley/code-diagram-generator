"""Mermaid Service Module"""

import json
import re
import subprocess
from re import compile as re_compile
from tempfile import NamedTemporaryFile
from typing import Match, Tuple, Union

from loguru import logger

from fastapi.responses import FileResponse

from ..models import LLMDefinition, MermaidDesignRequest, MermaidModel
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_string
from ..utils.log_utils import print_markdown

MERMAID_SCRIPT_FUNCTION_DEFINITIONS = [
    {
        "name": "create_mermaid_diagram",
        "description": "Generate a mermaid diagram from a mermaid text based script",
        "parameters": {
            "type": "object",
            "properties": {
                "mermaid_diagram_text_definition": {
                    "type": "string",
                    "description": (
                        "mermaid definition. plain text input. Should not"
                        " contain encodings like \n, \t, etc. should be properly"
                        " escaped for embedding in json"
                    ),
                },
                "notes_markdown": {
                    "type": "string",
                    "description": (
                        "markdown formatted notes about the diagram, readme etc"
                    ),
                },
                "diagram_type": {
                    "type": "string",
                    "enum": [
                        "flowchart",
                        "sequence",
                        "gantt",
                        "class",
                        "state",
                        "pie",
                        "git",
                        "entityRelationship",
                        "user-journey",
                        "requirement",
                    ],
                    "description": "Type of mermaid diagram to be created.",
                },
            },
            "required": [
                "mermaid_diagram_text_definition",
                "notes_markdown",
                "diagram_type",
            ],
        },
    }
]


class MermaidCliError(Exception):
    """Exception raised when the mermaid-cli fails."""


class MermaidUnexpectedError(Exception):
    """Exception raised when an unexpected error occurs."""


def extract_error_message(error_text: str) -> str:
    """Extract the error message from the mermaid-cli output."""
    match = re.search(r"^(.*?)(?:\n\s*at )", error_text, flags=re.MULTILINE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return error_text.strip()


async def create_mermaid_diagram(
    mermaid_model: MermaidModel,
) -> Tuple[Union[FileResponse, None], str]:
    """Generate a mermaid diagram from a mermaid text based script."""

    try:
        logger.info(f"Attempt for Mermaid Script: {mermaid_model}")

        # Create temporary files for mermaid script and output svg
        with NamedTemporaryFile(
            delete=False, suffix=".mmd"
        ) as temp_in, NamedTemporaryFile(delete=False, suffix=".svg") as temp_out:
            # Write mermaid script to temporary input file
            temp_in.write(mermaid_model.mermaid_def_str.encode())
            temp_in.close()
            temp_out.close()

            # Run mermaid-cli to generate svg from script, capturing output
            process = subprocess.run(
                ["mmdc", "-i", temp_in.name, "-o", temp_out.name],
                check=True,
                capture_output=True,
            )

            logger.warning(f"Mermaid CLI Output: {process.stdout.decode()}")

            if process.stderr:
                logger.error(f"Mermaid CLI Errors: {process.stderr.decode()}")

            # Return generated svg
        return FileResponse(temp_out.name, media_type="image/svg+xml"), ""
    except subprocess.CalledProcessError as err:
        error_message = extract_error_message(err.stderr.decode())
        logger.error(f"Mermaid CLI failed: {error_message}")
        return None, error_message
    except MermaidUnexpectedError as err:
        raise MermaidUnexpectedError(f"Unexpected error occurred: {err}") from err


def sanitize_control_characters(input_str: str, replacement: str = "") -> str:
    """Remove control characters from a string."""
    translation_table = dict.fromkeys(range(32), replacement)
    return input_str.translate(translation_table)


VALID_ESCAPES = re_compile(
    r'(\\\\")|(\\\\/)|(\\\\b)|(\\\\f)|(\\\\n)|(\\\\r)|(\\\\t)|(\\\\\\\\)'
)


def sanitize_escape_sequences(markdown_js: str) -> str:
    """Replace invalid escape sequences with the first character."""

    def replace_invalid_escape(match: Match[str]) -> str:
        """Replace invalid escape sequences with the first character."""
        escape_sequence = match.group(0)
        return escape_sequence if match.group(1) else escape_sequence[0]

    sanitized_string = VALID_ESCAPES.sub(replace_invalid_escape, markdown_js)
    return sanitize_control_characters(sanitized_string)


def trim_invalid_statements(diagram: str) -> str:
    """
    Trims the Mermaid diagram text definition to remove any lines
    until it finds a line that starts with a recognized Mermaid statement.

    Args:
        diagram (str): The Mermaid diagram text definition.

    Returns:
        str: The trimmed Mermaid diagram text definition.
    """
    valid_statements = [
        "graph",
        "subgraph",
        "classDef",
        "%%",
        "style",
        "app",
        "sequenceDiagram",
        "gantt",
        "pie",
        "stateDiagram",
        "erDiagram",
        "journey",
        "requirement",
    ]  # Add other valid starting statements as needed
    lines = diagram.split("\n")

    for i, line in enumerate(lines):
        if any(line.strip().startswith(statement) for statement in valid_statements):
            return "\n".join(lines[i:])

    return ""  # Return an empty string if no valid statements are found


def trim_json_values(json_str: str) -> str:
    """
    Trims whitespace from values inside a JSON string.
    Args:
        json_str (str): The input JSON string.

    Returns:
        str: The JSON string with trimmed values.
    """

    def trim_values(match: Match[str]) -> str:
        """Trims the value in a key-value pair inside JSON."""
        key, value = match.groups()
        new_val = value.strip("\n").strip()
        return f'"{key.strip()}": "{new_val}"'

    pattern = re_compile(r'"([^"]*?)":\s*"([^"]*?)"')
    return pattern.sub(trim_values, json_str)


def sanitize_markdown_js(markdown_js: str) -> str:
    """
    Sanitizes markdown JS string, including escape sequences, control characters,
    and Mermaid diagram text definition.
    Args:
        markdown_js (str): The input markdown JS string.

    Returns:
        str: The sanitized markdown JS string.
    """
    # Regex to match Mermaid diagram text definition enclosed with backticks
    diagram_pattern = re_compile(r'"mermaid_diagram_text_definition":\s*`([^`]*)`')
    match = diagram_pattern.search(markdown_js)
    if match:
        mermaid_diagram_text_definition = match.group(1)

        # Trimming and sanitizing the diagram text definition
        sanitized_diagram_text_definition = sanitize_escape_sequences(
            mermaid_diagram_text_definition.strip()
        )
        trimmed_diagram_text_definition = trim_invalid_statements(
            sanitized_diagram_text_definition
        )

        # Replacing the original diagram text definition with the sanitized version
        markdown_js = markdown_js.replace(
            f"`{mermaid_diagram_text_definition}`",
            f'"{trimmed_diagram_text_definition}"',
        )

    return markdown_js.strip("\n").strip()


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
    llm_definition: LLMDefinition, mermaid_design_request: MermaidDesignRequest
):
    """Generate a mermaid diagram from a mermaid script."""
    logger.debug(f"Mermaid Design Request: {mermaid_design_request}")

    num_tokens = num_tokens_from_string(mermaid_design_request.text)
    max_tokens = (
        llm_definition.max_token_length - num_tokens - 400
    )  # ( 300 for functions and msgs TODO: count that)

    # NOTE diagram_type is supposedly the list of mermaid diagram types GPT supports
    # from 2021 but the CLI we use is more up to date, it may be possible to teach LLM's
    # to generate mermaid diagrams for other types using n-shot learning
    # mermaid docs, examples etc.

    # notes_markdown and diagram_type aren't actually used on the diagram renderer, they
    # are there simply to help the LLM spread out it's answer, more tokens out tends to
    # have higher performance.  diagram_type helps steer the sampler to the correct
    # diagram type

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

    retries = 6
    for i in range(retries):
        logger.info(
            "Starting Generate Design with Complete Text: max tokens:"
            f" {max_tokens} ({llm_definition.max_token_length} - {num_tokens}) using"
            f" model: {llm_definition.name} "
        )

        if i > 0:
            messages.pop(1)

        result = complete_text(
            messages=messages,
            max_tokens=max_tokens,
            model=mermaid_design_request.llm_model_for_instructions,
            vendor=mermaid_design_request.llm_vendor_for_instructions,
            functions=MERMAID_SCRIPT_FUNCTION_DEFINITIONS,
            callback=openai_mermaid_fn_callback,
        )

        if isinstance(result, str):
            logger.info("Response was msg")

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

        # could be error
        logger.info(f"result==={result}")
        mermaid_def_str, notes_markdown, diagram_type = result

        logger.info(f"notes_markdown: {notes_markdown}")
        logger.info(f"diagram_type: {diagram_type}")

        # if mermaid_def_str is empty after being trimmed/stripped, raise an error
        if not mermaid_def_str.strip():
            raise ValueError("Mermaid definition is empty")

        logger.info(f"mermaid_def_str:\n\n{mermaid_def_str}")

        markdown_svg, error_message = await create_mermaid_diagram(
            MermaidModel(mermaid_def_str=mermaid_def_str)
        )

        # Adding user's message if there was an error
        if error_message:
            logger.error(f"Mermaid Error: {error_message}")
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
        return markdown_svg

    raise MermaidCliError(f"Mermaid CLI failed after {retries} attempts")
