"""Service for various folder tools."""
from pathlib import Path
from typing import List, Optional

from folder_tree_generator import generate_tree
from python_code_outline import get_report


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


async def read_python_projects(folder_path: str) -> List[str]:
    """
    Get all folders in a folder that contain a Python project.

    A Python project is defined as a folder that contains at least one .py file
    or a `pyproject.toml` file.

    Parameters:
    - folder_path: The directory path to read.

    Returns:
    - A list of names of all Python project folders in the given directory.
      If the directory doesn't exist, an empty list is returned.
    """
    path = Path(folder_path)

    if not path.exists() or not path.is_dir():
        return []

    project_folders: List[str] = []
    for entry in path.iterdir():
        if entry.is_dir():
            python_files = list(entry.glob("*.py"))
            pyproject_files = list(entry.glob("pyproject.toml"))

            if python_files or pyproject_files:
                project_folders.append(entry.name)

    return project_folders
