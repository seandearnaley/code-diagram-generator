"""Folder report endpoint."""
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from ..services.directory_analysis_service import (
    find_gitignore,
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
    """Folder report endpoint, returns code outline report, respects ignore files."""
    try:
        return await folder_report(root_folder, ignore_file_path)
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex


@router.get("/folder_tree/")
async def folder_tree_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Folder tree endpoint, returns text based folder tree, respects ignore files."""
    try:
        return await folder_tree(root_folder, ignore_file_path)
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex


@router.get("/folders/{folder_path:path}", response_model=List[str])
async def read_folder_endpoint(folder_path: str):
    """
    Get all folders in a folder.

    Parameters:
    - folder_path: The directory path to read.

    Returns:
    - A list of names of all folders in the given directory. If the directory doesn't
      exist, an empty list is returned.
    """
    return await read_folder(folder_path)


@router.get("/gitignore_file/")
async def gitignore_file_endpoint(root_folder: str):
    """
    Find the first .gitignore file starting from the root directory.

    Parameters:
    - root_folder: The root directory to start searching from.

    Returns:
    - The path of the first .gitignore file found, or None if no such file is found.
    """
    try:
        return await find_gitignore(root_folder)
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex
