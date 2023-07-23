"""Folder report endpoint."""
from typing import Optional

from fastapi import APIRouter

from ..services.folder_tools_service import folder_report, folder_tree

router = APIRouter()


@router.get("/folder_report/")
async def folder_report_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Folder report endpoint."""
    return await folder_report(root_folder, ignore_file_path)


@router.get("/folder_tree/")
async def folder_tree_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Folder report endpoint."""
    return await folder_tree(root_folder, ignore_file_path)
