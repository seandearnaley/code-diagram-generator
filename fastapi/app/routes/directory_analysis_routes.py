"""Folder report endpoint."""
import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from ..services.directory_analysis_service import (
    find_gitignore,
    folder_report,
    folder_tree,
    read_python_projects,
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


@router.get("/source_folders/", response_model=List[str])
async def read_python_projects_endpoint():
    """
    Get all python projects in a folder.
    """

    source_folder = os.getenv("SOURCE_FOLDER")

    if source_folder is None:
        raise HTTPException(
            status_code=500, detail="SOURCE_FOLDER environment variable is not set"
        )

    path = Path(source_folder)

    if not path.exists() or not path.is_dir():
        raise HTTPException(
            status_code=500, detail="SOURCE_FOLDER does not exist or is not a directory"
        )

    return await read_python_projects(str(path))


@router.get("/gitignore_file/", response_model=str)
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
