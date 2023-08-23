""" Mermaid Generator Service """

import subprocess
from tempfile import NamedTemporaryFile
from typing import Tuple, Union

from loguru import logger

from fastapi.responses import FileResponse

from ..exceptions import MermaidUnexpectedError
from ..models import MermaidModel
from ..utils.mermaid_utils import extract_error_message


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
