"""Pydantic models for FastAPI."""
from typing import Dict, List

from pydantic import BaseModel


class MermaidScript(BaseModel):
    """Pydantic model for Mermaid script."""

    mermaid_script: str


class DiagramDefinition(BaseModel):
    """Model for a diagram definition."""

    id: str
    name: str
    description: str


class DiagramConfig(BaseModel):
    """Model for diagram configs"""

    diagramCategories: Dict[str, List[DiagramDefinition]]
    diagramCategoryNames: Dict[str, str]
