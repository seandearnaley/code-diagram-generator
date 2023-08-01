"""Diagram routes."""

from fastapi import APIRouter

from ..models import DiagramConfig
from ..services.diagram_service import load_diagram_config

router = APIRouter()


@router.get("/diagram_config", response_model=DiagramConfig)
async def load_diagram_config_endpoint():
    """Endpoint to get diagram configuration."""
    return await load_diagram_config()
