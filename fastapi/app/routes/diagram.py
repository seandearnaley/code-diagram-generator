"""Diagram routes."""

from fastapi import APIRouter

from ..models import DiagramTypes
from ..services.diagram_service import load_diagram_types

router = APIRouter()


@router.get("/diagram_types", response_model=DiagramTypes)
async def get_diagram_types():
    """Endpoint to get diagram types."""
    return await load_diagram_types()
