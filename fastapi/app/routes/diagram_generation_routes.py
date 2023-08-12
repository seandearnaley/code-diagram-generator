"""Routes for generating diagrams"""

from pathlib import Path
from typing import Optional, Tuple

from pydantic import BaseModel  # pylint: disable=no-name-in-module
from pydantic import validator

from fastapi import APIRouter

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

    @validator("source_folder_option")
    @classmethod
    def validate_source_folder_option(cls, value: str) -> str:
        """Validate source_folder_option"""
        if not value:
            raise ValueError("source_folder_option must not be empty")
        return value


async def get_folder_content(
    payload: DiagramPayload,
) -> Tuple[Optional[str], Optional[str]]:
    """Get the folder content for the payload"""
    source_folder = "/source-repos/" + payload.source_folder_option
    git_ignore_file_path_str = (
        str(payload.git_ignore_file_path)
        if payload.git_ignore_file_path and payload.git_ignore_file_path != Path(".")
        else ""
    )

    ignore_file_path = git_ignore_file_path_str.strip() or None

    folder_tree_content = None
    folder_report_content = None

    if payload.include_folder_tree:
        folder_tree_content = await folder_tree(
            source_folder, ignore_file_path=ignore_file_path
        )

    if payload.include_python_code_outline:
        folder_report_content = await folder_report(
            source_folder, ignore_file_path=ignore_file_path
        )

    return folder_tree_content, folder_report_content


@router.post("/generate_diagram_instructions/")
async def generate_diagram_instructions(payload: DiagramPayload):
    """Generate diagram instructions"""
    print("Received request for generate_diagram_instructions")
    folder_tree_content, folder_report_content = await get_folder_content(payload)

    dump = ""

    if folder_tree_content:
        dump += f"### Folder Tree:\n```\n{folder_tree_content}```\n\n"

    if folder_report_content:
        dump += f"### Python Report:\n```\n{folder_report_content}\n```\n"

    response = {"status": "success", "payload": dump}
    print("Sending response:", response)
    return response
