"""Service to read diagram types from a JSON file and return them as a FastAPI model"""
import json
from typing import Any, Dict

from ..config import DIAGRAM_CONFIG_PATH
from ..models import DiagramTypes


async def load_diagram_types() -> DiagramTypes:
    """Reads diagram types from a JSON file and returns them as a FastAPI model"""
    with DIAGRAM_CONFIG_PATH.open(encoding="utf-8") as json_file:
        data: Dict[str, Any] = json.load(json_file)
        types = {k: v for k, v in data["types"].items()}

    return DiagramTypes(types=types, diagramTypeNames=data["diagramTypeNames"])
