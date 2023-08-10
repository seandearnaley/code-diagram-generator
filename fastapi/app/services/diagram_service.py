"""Service to read diagram types from a JSON file and return them as a FastAPI model"""
import json
from typing import Any, Dict

from ..config import DIAGRAM_CONFIG_PATH
from ..models import DiagramConfig


async def load_diagram_config() -> DiagramConfig:
    """Reads diagram configration from a JSON file"""
    with DIAGRAM_CONFIG_PATH.open(encoding="utf-8") as json_file:
        data: Dict[str, Any] = json.load(json_file)
        diagram_categories = dict(data["diagram_categories"].items())

    return DiagramConfig(
        diagram_categories=diagram_categories,
        diagram_category_names=data["diagram_category_names"],
    )
