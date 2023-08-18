"""Mermaid Service Module"""
import re
import subprocess
from tempfile import NamedTemporaryFile

from loguru import logger

from fastapi.responses import FileResponse

from ..models import LLMDefinition, MermaidDesignRequest, MermaidModel
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_string

# make this line up to create_mermaid_diagram, try functools
MERMAID_FUNCTIONS = [
    {
        "name": "create_mermaid_diagram",
        "description": "Generate a mermaid diagram from a mermaid text based script",
        "parameters": {
            "type": "object",
            "properties": {
                "mermaid_diagram_text_definition": {
                    "type": "string",
                    "description": (
                        "mermaid diagram text definition. plain text input. Should"
                        " not contain encodings like \n, \t, etc."
                    ),
                },
                "notes_markdown": {
                    "type": "string",
                    "description": (
                        "markdown formatted notes about the diagram, readme and more"
                    ),
                },
            },
            "required": ["mermaid_diagram_text_definition"],
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


async def create_mermaid_diagram(mermaid_model: MermaidModel):
    """Generate a mermaid diagram from a mermaid text based script."""

    if mermaid_model.mermaid_script.strip() == "":
        raise MermaidUnexpectedError("Mermaid script is empty")

    try:
        logger.info(f"Attempt for Mermaid Script: {mermaid_model}")

        # Create temporary files for mermaid script and output svg
        with NamedTemporaryFile(
            delete=False, suffix=".mmd"
        ) as temp_in, NamedTemporaryFile(delete=False, suffix=".svg") as temp_out:
            # Write mermaid script to temporary input file
            temp_in.write(mermaid_model.mermaid_script.encode())
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
            return FileResponse(temp_out.name, media_type="image/svg+xml")

    except subprocess.CalledProcessError as err:
        logger.error(f"Exception Details: {extract_error_message(err.stderr.decode())}")
        # traceback.print_exc()
        raise MermaidCliError(f"Mermaid CLI failed: {err.stderr.decode()}") from err
    except MermaidUnexpectedError as err:
        logger.error("Unexpected Exception:")
        # traceback.print_exc()
        raise MermaidUnexpectedError(f"Unexpected error occurred: {err}") from err


async def mermaid_request(
    llm_definition: LLMDefinition, mermaid_design_request: MermaidDesignRequest
):
    """Generate a mermaid diagram from a mermaid script."""
    logger.debug(f"Mermaid Design Request: {mermaid_design_request}")

    num_tokens = num_tokens_from_string(mermaid_design_request.text)
    max_tokens = (
        llm_definition.max_token_length - num_tokens - 300
    )  # ( 300 for functions and msgs TODO: count that)

    logger.info(
        "Starting Generate Design with Complete Text LLM fn: max tokens:"
        f" {max_tokens} ({llm_definition.max_token_length} - {num_tokens}) using model:"
        f" {llm_definition.name} "
    )

    mermaid_script = complete_text(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant specialized in writing"
                    " professional system diagrams using mermaid js."
                ),
            },
            {"role": "user", "content": mermaid_design_request.text},
        ],
        max_tokens=max_tokens,
        model=mermaid_design_request.llm_model_for_instructions,
        vendor=mermaid_design_request.llm_vendor_for_instructions,
        functions=MERMAID_FUNCTIONS,
    )

    logger.info(f"complete_text mermaid_script: {mermaid_script}")

    return await create_mermaid_diagram(MermaidModel(mermaid_script=mermaid_script))
