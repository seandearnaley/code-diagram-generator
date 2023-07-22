"""Mermaid Service Module"""
import subprocess
import traceback
from tempfile import NamedTemporaryFile

from fastapi import HTTPException
from fastapi.responses import FileResponse

from ..models import MermaidScript


async def create_mermaid_diagram(mermaid_script: MermaidScript):
    """Generate a mermaid diagram from a mermaid script."""
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
        # If mermaid-cli failed, raise an HTTPException that includes the error message
        print("Exception Details:")
        print(err.stderr.decode())
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Mermaid CLI failed: {err.stderr.decode()}"
        ) from err
    except Exception as err:
        print("Unexpected Exception:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Unexpected error occurred: {str(err)}"
        ) from err
