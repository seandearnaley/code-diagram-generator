"""Folder report endpoint."""
from fastapi import APIRouter

from ..models import FolderReportRequest
from ..services.folder_report_service import folder_report

router = APIRouter()


@router.post("/folder_report/")
async def folder_report_endpoint(folder_report_request: FolderReportRequest):
    """Folder report endpoint."""
    return await folder_report(
        folder_report_request.root_folder,
        folder_report_request.report_file_path,
        folder_report_request.ignore_file_path,
    )
