"""Service to generate a report of the python code outline of a folder."""
import os
from pathlib import Path
from typing import List, Optional

from folder_tree_generator import generate_tree
from python_code_outline import get_report

from fastapi import HTTPException


async def folder_tree(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
) -> str:
    """Generate a file tree of a folder."""

    return generate_tree(root_folder, ignore_file_path=ignore_file_path)


async def folder_report(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
) -> str:
    """Generate a report of the python code outline of a folder."""

    return get_report(root_folder, ignore_file_path=ignore_file_path)


async def read_folder(
    folder_path: str,
) -> List[str]:
    """Get all folders in a folders."""
    if os.path.exists(folder_path) and os.path.isdir(folder_path):
        folders = [
            entry.name for entry in Path(folder_path).iterdir() if entry.is_dir()
        ]
        return folders

    raise HTTPException(status_code=404, detail="Folder not found")
