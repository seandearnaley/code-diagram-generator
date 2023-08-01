"""Service for various folder tools."""
from pathlib import Path
from typing import List, Optional

from folder_tree_generator import generate_tree
from python_code_outline import get_report


class FolderNotFoundException(Exception):
    """Exception raised when a folder is not found."""


async def find_gitignore(root_folder: str) -> Optional[str]:
    """
    Find the first .gitignore file starting from the root directory.

    Parameters:
    - root_folder: The root directory to start searching from.

    Returns:
    - The path of the first .gitignore file found, or None if no such file is found.
    """
    try:
        return str(next(Path(root_folder).rglob(".gitignore")))
    except StopIteration:
        return None


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


async def read_folder(folder_path: str) -> List[str]:
    """
    Get all folders in a folder.

    Parameters:
    - folder_path: The directory path to read.

    Returns:
    - A list of names of all folders in the given directory. If the directory doesn't
      exist, an empty list is returned.
    """
    path = Path(folder_path)

    if not path.exists() or not path.is_dir():
        return []

    return [entry.name for entry in path.iterdir() if entry.is_dir()]
