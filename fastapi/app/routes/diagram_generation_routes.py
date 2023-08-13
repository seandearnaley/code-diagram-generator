"""Routes for generating diagrams"""

from pathlib import Path
from typing import Optional, Tuple

# pylint: disable=no-name-in-module
from pydantic import BaseModel, validator

from fastapi import APIRouter, HTTPException, Query

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


class DiagramGenerationException(Exception):
    """Exception for diagram generation"""


def create_payload(
    source_folder_option: str = "",
    diagram_category: str = "",
    diagram_option: str = "",
    include_folder_tree: bool = False,
    include_python_code_outline: bool = False,
    git_ignore_file_path: Optional[str] = None,
    llm_vendor_for_instructions: str = "",
    llm_model_for_instructions: str = "",
) -> DiagramPayload:
    """Create a payload"""
    return DiagramPayload(
        source_folder_option=source_folder_option,
        diagram_category=diagram_category,
        diagram_option=diagram_option,
        include_folder_tree=include_folder_tree,
        include_python_code_outline=include_python_code_outline,
        git_ignore_file_path=Path(git_ignore_file_path)
        if git_ignore_file_path
        else None,
        llm_vendor_for_instructions=llm_vendor_for_instructions,
        llm_model_for_instructions=llm_model_for_instructions,
    )


def handle_generation_exception(err: Exception) -> None:
    """Handle a diagram generation exception"""
    raise HTTPException(status_code=500, detail=str(err)) from err


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
        try:
            folder_tree_content = await folder_tree(
                source_folder, ignore_file_path=ignore_file_path
            )
        except DiagramGenerationException as err:
            handle_generation_exception(err)

    if payload.include_python_code_outline:
        try:
            folder_report_content = await folder_report(
                source_folder, ignore_file_path=ignore_file_path
            )
        except DiagramGenerationException as err:
            handle_generation_exception(err)

    return folder_tree_content, folder_report_content


@router.get("/generate_diagram_instructions")
async def generate_diagram_instructions(
    source_folder_option: str = Query(...),
    diagram_category: str = Query(...),
    diagram_option: str = Query(...),
    include_folder_tree: bool = Query(...),
    include_python_code_outline: bool = Query(...),
    git_ignore_file_path: Optional[str] = Query(None),
    llm_vendor_for_instructions: str = Query(...),
    llm_model_for_instructions: str = Query(...),
):
    """Generate diagram instructions"""
    payload = create_payload(
        source_folder_option,
        diagram_category,
        diagram_option,
        include_folder_tree,
        include_python_code_outline,
        git_ignore_file_path,
        llm_vendor_for_instructions,
        llm_model_for_instructions,
    )

    folder_tree_content, folder_report_content = await get_folder_content(payload)

    dump = ""
    if folder_tree_content:
        dump += f"### Folder Tree:\n```\n{folder_tree_content[:1000]}\n```\n\n"
    if folder_report_content:
        dump += f"### Python Report:\n```\n{folder_report_content[:1000]}\n```\n"

    response = {"status": "success", "payload": dump}
    return response
