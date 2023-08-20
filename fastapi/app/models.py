"""Pydantic models for FastAPI."""
from typing import Dict, List, Optional

from pydantic import BaseModel  # pylint: disable=no-name-in-module

# had to disable pylint because it was complaining about BaseModel/
# anthropic is behind fastapi in versions of pydantic, no biggie
# but it's annoying to see the red squiggles.
# we should update to pydantic 2 ASAP---> its faster


class MermaidModel(BaseModel):
    """Pydantic model for Mermaid script."""

    mermaid_def_str: str


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


class MermaidDesignRequest(BaseModel):
    """Pydantic model for Mermaid design request."""

    text: str
    source_folder_option: str
    diagram_category: str
    diagram_option: str
    include_folder_tree: bool
    include_python_code_outline: bool
    git_ignore_file_path: Optional[str]
    llm_vendor_for_instructions: str
    llm_model_for_instructions: str
