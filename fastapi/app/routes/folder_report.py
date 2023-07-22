"""Folder report endpoint."""
from typing import Optional

from fastapi import APIRouter

from ..services.folder_report_service import folder_report

router = APIRouter()


@router.get("/folder_report/")
async def folder_report_endpoint(
    root_folder: str,
    ignore_file_path: Optional[str] = None,
):
    """Folder report endpoint."""
    return await folder_report(root_folder, ignore_file_path)
