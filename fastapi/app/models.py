"""Pydantic models for FastAPI."""

from pydantic import BaseModel


class MermaidScript(BaseModel):
    """Pydantic model for Mermaid script."""

    mermaid_script: str
