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


class LLMDefinition(BaseModel):
    """Model for a LLM definition."""

    id: str
    name: str
    description: str
    max_token_length: int


class LLMConfig(BaseModel):
    """Model for LLM configs"""

    llmVendors: Dict[str, List[LLMDefinition]]
    llmVendorNames: Dict[str, str]
