"""Diagram routes."""

from starlette.requests import Request

from fastapi import APIRouter

from ..models import DiagramConfig, DiagramDefinition
from ..services.diagram_service import get_diagram_by_id

router = APIRouter()


@router.get("/diagram_config", response_model=DiagramConfig)
async def load_diagram_config_endpoint(request: Request):
    """Endpoint to get diagram configuration."""
    return request.app.state.diagram_config


@router.get("/diagram/{diagram_id}", response_model=DiagramDefinition)
async def get_diagram_definition(request: Request, diagram_id: str):
    """Endpoint to get a specific diagram by id."""
    diagram_config = request.app.state.diagram_config
    return get_diagram_by_id(diagram_config, diagram_id)
