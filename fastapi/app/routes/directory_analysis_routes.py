"""Folder report endpoint."""
import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from ..services.directory_analysis_service import (
    find_gitignore,
    folder_report,
    folder_tree,
    read_python_projects,
)

router = APIRouter()


def get_source_folder() -> str:
    """Get and validate the SOURCE_FOLDER environment variable."""
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

    return str(path)


@router.get("/folder_report/", response_class=PlainTextResponse)
async def folder_report_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Endpoint to get a report of the python code outline of a folder."""
    try:
        return await folder_report(root_folder, ignore_file_path)
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex


@router.get("/folder_tree/", response_class=PlainTextResponse)
async def folder_tree_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Endpoint to get a file tree of a folder."""
    try:
        return await folder_tree(root_folder, ignore_file_path)
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex


@router.get("/source_folders/", response_model=List[str])
async def read_python_projects_endpoint():
    """Endpoint to get all python projects in the source folder."""
    source_folder = get_source_folder()
    return await read_python_projects(source_folder)


@router.get("/gitignore_file/", response_model=Optional[str])
async def gitignore_file_endpoint(root_folder: str):
    """Endpoint to get the path of the first .gitignore file."""
    try:
        source_folder = get_source_folder()
        path = Path(source_folder + "/" + root_folder)

        if not path.exists() or not path.is_dir():
            raise HTTPException(
                status_code=500,
                detail="folder does not exist or is not a directory",
            )

        return await find_gitignore(str(path))
    except ValueError as ex:
        raise HTTPException(status_code=404, detail=str(ex)) from ex
