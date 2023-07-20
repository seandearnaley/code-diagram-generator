""" Generate a report of the python code outline of a folder. """

import subprocess
import traceback
from tempfile import NamedTemporaryFile

from folder_tree_generator import generate_tree
from pydantic import BaseModel
from python_code_outline import get_report

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()

# Set up CORS
origins = [
    "http://localhost:3000",  # Allow requests from the Next.js app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MermaidScript(BaseModel):
    """MermaidScript model."""

    mermaid_script: str


@app.post("/mermaid/")
async def create_mermaid_diagram(mermaid_script: MermaidScript):
    """Create a mermaid diagram from a mermaid script."""

    script = mermaid_script.mermaid_script
    print("mermaid_script=", script)

    try:
        # Create temporary files for mermaid script and output svg
        with NamedTemporaryFile(
            delete=False, suffix=".mmd"
        ) as temp_in, NamedTemporaryFile(delete=False, suffix=".svg") as temp_out:
            # Write mermaid script to temporary input file
            temp_in.write(script.encode())
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


@app.post("/detail/")
async def detail():
    """Query the node-express server."""
    # Define the root folder
    root_folder = "/Users/seandearnaley/Documents/GitHub/reddit-gpt-summarizer"

    # Specify the report and ignore file paths (optional)
    report_file_path = "custom_report.txt"
    ignore_file_path = root_folder + "/.gitignore"
    folder_tree = generate_tree(root_folder, ignore_file_path=ignore_file_path)

    # Generate the report
    report = get_report(root_folder, ignore_file_path=ignore_file_path)

    # Write the report to a file
    with open(report_file_path, "w", encoding="utf-8") as file:
        file.write(folder_tree + "\n\n" + report)

    print(f"Report generated successfully to {report_file_path}.")

    return report_file_path
