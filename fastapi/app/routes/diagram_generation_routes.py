""" Routes for generating diagrams """
from pydantic import BaseModel

from fastapi import APIRouter, Body

from ..services.directory_analysis_service import folder_report, folder_tree

router = APIRouter()


class DiagramPayload(BaseModel):
    """Payload for generating diagrams"""

    sourceFolderOption: str
    diagramCategory: str
    diagramOption: str
    includeFolderTree: bool
    includePythonCodeOutline: bool
    gitIgnoreFilePath: str
    llmVendorForInstructions: str
    llmModelForInstructions: str


@router.post("/generate_diagram/")
async def generate_diagram(payload: DiagramPayload = Body(...)):
    """Generate a diagram based on the payload"""
    # Here you can process the payload and generate diagrams

    dump = (
        await folder_tree(
            "/source-repos/" + payload.sourceFolderOption,
            ignore_file_path=payload.gitIgnoreFilePath,
        )
        + "\n\n"
        + await folder_report(
            "/source-repos/" + payload.sourceFolderOption,
            ignore_file_path=payload.gitIgnoreFilePath,
        )
    )

    # Returning it as JSON
    return {"status": "success", "payload": dump}
