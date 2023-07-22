"""Pydantic models for FastAPI."""
from pydantic import BaseModel


class MermaidScript(BaseModel):
    """Pydantic model for Mermaid script."""

    mermaid_script: str


class FolderReportRequest(BaseModel):
    """Pydantic model for folder report request."""

    root_folder: str
    report_file_path: str
    ignore_file_path: str
