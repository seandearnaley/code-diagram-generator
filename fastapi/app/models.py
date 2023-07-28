"""Pydantic models for FastAPI."""
from typing import List

from pydantic import BaseModel


class MermaidScript(BaseModel):
    """Pydantic model for Mermaid script."""

    mermaid_script: str


class DiagramType(BaseModel):
    """Model for a diagram type"""

    id: str
    name: str
    description: str


class DiagramTypes(BaseModel):
    """Model for a list of diagram types"""

    flowchart: List[DiagramType]
    sequenceDiagram: List[DiagramType]
