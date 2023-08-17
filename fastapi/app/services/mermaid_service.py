"""Mermaid Service Module"""
import subprocess
import traceback
from tempfile import NamedTemporaryFile

from loguru import logger
from rich.console import Console
from rich.markdown import Markdown

from fastapi.responses import FileResponse

from ..models import LLMDefinition, MermaidDesignRequest, MermaidScript
from ..services.llm_service import complete_text
from ..utils.llm_utils import num_tokens_from_string


def print_markdown(log_str):
    """Print markdown to console."""
    markdown = Markdown(log_str)
    console = Console()
    console.print(markdown)


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


async def create_mermaid_diagram(mermaid_script: MermaidScript):
    """Generate a mermaid diagram from a mermaid text based script."""
    try:
        # Create temporary files for mermaid script and output svg
        with NamedTemporaryFile(
            delete=False, suffix=".mmd"
        ) as temp_in, NamedTemporaryFile(delete=False, suffix=".svg") as temp_out:
            # Write mermaid script to temporary input file
            temp_in.write(mermaid_script.mermaid_script.encode())
            temp_in.close()
            temp_out.close()

            # Run mermaid-cli to generate svg from script, capturing output
            process = subprocess.run(
                ["mmdc", "-i", temp_in.name, "-o", temp_out.name],
                check=True,
                capture_output=True,
            )

            logger.warning("Mermaid CLI Output:", process.stdout.decode())
            logger.error("Mermaid CLI Errors:", process.stderr.decode())

            # Return generated svg
            return FileResponse(temp_out.name, media_type="image/svg+xml")

    except subprocess.CalledProcessError as err:
        logger.error("Exception Details:")
        logger.error(err.stderr.decode())
        traceback.print_exc()
        raise MermaidCliError(f"Mermaid CLI failed: {err.stderr.decode()}") from err
    except Exception as err:
        logger.error("Unexpected Exception:")
        traceback.print_exc()
        raise MermaidUnexpectedError(f"Unexpected error occurred: {str(err)}") from err


async def post_mermaid_design_requestx(
    llm_definition: LLMDefinition, mermaid_design_request: MermaidDesignRequest
):
    """Generate a mermaid diagram from a mermaid script."""
    logger.debug("Mermaid Design Request", mermaid_design_request.text[:300])

    num_tokens = num_tokens_from_string(mermaid_design_request.text)
    max_tokens = (
        llm_definition.max_token_length - num_tokens - 300
    )  # ( 300 for functions and msgs TODO: count that)

    logger.info(
        "Starting Job:",
        max_tokens,
        "using model:",
        llm_definition.name,
        llm_definition.max_token_length,
        "-",
        num_tokens,
    )

    completion = complete_text(
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

    logger.info("Completion:", completion)

    return await create_mermaid_diagram(MermaidScript(mermaid_script=completion))
