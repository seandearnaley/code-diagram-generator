"""Service to generate a report of the python code outline of a folder."""
from typing import Optional

from folder_tree_generator import generate_tree
from python_code_outline import get_report


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
