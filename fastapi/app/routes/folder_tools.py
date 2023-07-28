"""Folder report endpoint."""
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from ..services.folder_tools_service import (
    FolderNotFoundException,
    folder_report,
    folder_tree,
    read_folder,
)

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


@router.get("/folders/{folder_path:path}", response_model=List[str])
async def read_folder_endpoint(folder_path: str):
    """Get all folders in a folder."""
    try:
        return await read_folder(folder_path)
    except FolderNotFoundException as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex
