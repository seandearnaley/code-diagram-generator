"""Service to read diagram types from a JSON file and return them as a FastAPI model"""
import json
from typing import Any, Dict

from ..config import DIAGRAM_CONFIG_PATH
from ..models import DiagramConfig, DiagramDefinition


async def load_diagram_config() -> DiagramConfig:
    """Reads diagram configration from a JSON file"""
    with DIAGRAM_CONFIG_PATH.open(encoding="utf-8") as json_file:
        data: Dict[str, Any] = json.load(json_file)
        diagram_categories = dict(data["diagram_categories"].items())

    return DiagramConfig(
        diagram_categories=diagram_categories,
        diagram_category_names=data["diagram_category_names"],
    )


def get_diagram_by_id(
    diagram_config: DiagramConfig, diagram_id: str
) -> DiagramDefinition | None:
    """Get a diagram by id from the loaded diagram configuration"""
    for _, diagrams in diagram_config.diagram_categories.items():
        for diagram in diagrams:
            if diagram.id == diagram_id:
                return diagram
    return None


def get_category_by_id(diagram_config: DiagramConfig, category_id: str) -> str | None:
    """Get a diagram category by id from the loaded diagram configuration"""
    for category in diagram_config.diagram_category_names:
        if category == category_id:
            return diagram_config.diagram_category_names[category]
    return None
