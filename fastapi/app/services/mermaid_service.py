"""Mermaid Service Module"""
import subprocess
import traceback
from tempfile import NamedTemporaryFile

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

            print("Mermaid CLI Output:", process.stdout.decode())
            print("Mermaid CLI Errors:", process.stderr.decode())

            # Return generated svg
            return FileResponse(temp_out.name, media_type="image/svg+xml")

    except subprocess.CalledProcessError as err:
        print("Exception Details:")
        print(err.stderr.decode())
        traceback.print_exc()
        raise MermaidCliError(f"Mermaid CLI failed: {err.stderr.decode()}") from err
    except Exception as err:
        print("Unexpected Exception:")
        traceback.print_exc()
        raise MermaidUnexpectedError(f"Unexpected error occurred: {str(err)}") from err


async def post_mermaid_design_requestx(
    llm_definition: LLMDefinition, mermaid_design_request: MermaidDesignRequest
):
    """Generate a mermaid diagram from a mermaid script."""
    print("Mermaid Design Request:")

    print_markdown(mermaid_design_request.text)

    num_tokens = num_tokens_from_string(mermaid_design_request.text)
    max_tokens = (
        llm_definition.max_token_length - num_tokens - 300
    )  # ( 300 for functions and msgs TODO: count that)

    print(
        "Max Tokens:",
        max_tokens,
        "using model:",
        llm_definition.name,
        llm_definition.max_token_length,
        "-",
        num_tokens,
    )

    completion = complete_text(
        prompt=mermaid_design_request.text,
        max_tokens=max_tokens,
        model=mermaid_design_request.llm_model_for_instructions,
        vendor=mermaid_design_request.llm_vendor_for_instructions,
    )

    print("Completion:", completion)

    return await create_mermaid_diagram(MermaidScript(mermaid_script=completion))
