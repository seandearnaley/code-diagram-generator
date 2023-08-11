"""Routes for generating diagrams"""

from pathlib import Path
from typing import Optional, Tuple

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from fastapi import APIRouter, Body

from ..services.directory_analysis_service import folder_report, folder_tree

router = APIRouter()


class DiagramPayload(BaseModel):
    """Payload for generating diagrams"""

    source_folder_option: str
    diagram_category: str
    diagram_option: str
    include_folder_tree: bool
    include_python_code_outline: bool
    git_ignore_file_path: Optional[Path] = None
    llm_vendor_for_instructions: str
    llm_model_for_instructions: str


async def get_folder_content(payload: DiagramPayload) -> Tuple[str, str]:
    """Get the folder tree and folder report content"""
    source_folder = "/source-repos/" + payload.source_folder_option
    ignore_file_path = (
        str(payload.git_ignore_file_path) if payload.git_ignore_file_path else None
    )
    folder_tree_content = await folder_tree(
        source_folder, ignore_file_path=ignore_file_path
    )
    folder_report_content = await folder_report(
        source_folder, ignore_file_path=ignore_file_path
    )
    return folder_tree_content, folder_report_content


@router.post("/generate_diagram_instructions/")
async def generate_diagram_instructions(payload: DiagramPayload = Body(...)) -> dict:
    """Generate a diagram based on the payload"""
    folder_tree_content, folder_report_content = await get_folder_content(payload)

    dump = (
        f"### Folder Tree:\n```\n{folder_tree_content}```\n\n"
        f"### Python Report:\n```\n{folder_report_content}\n```\n"
    )

    return {"status": "success", "payload": dump}
