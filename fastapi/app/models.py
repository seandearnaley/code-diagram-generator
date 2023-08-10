"""Pydantic models for FastAPI."""
from typing import Dict, List

from pydantic import BaseModel

OPEN_AI_CHAT_TYPE = "OpenAI Chat"
OPEN_AI_INSTRUCT_TYPE = "OpenAI Instruct"
ANTHROPIC_AI_TYPE = "Anthropic Chat"


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

    diagram_categories: Dict[str, List[DiagramDefinition]]
    diagram_category_names: Dict[str, str]


class LLMDefinition(BaseModel):
    """Model for a LLM definition."""

    id: str
    name: str
    description: str
    max_token_length: int


class LLMConfig(BaseModel):
    """Model for LLM configs"""

    llm_vendors: Dict[str, List[LLMDefinition]]
    llm_vendor_names: Dict[str, str]
