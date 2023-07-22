""" Mermaid diagram route. """ ""
from fastapi import APIRouter

from ..models import MermaidScript
from ..services.mermaid_service import create_mermaid_diagram

router = APIRouter()


@router.post("/mermaid/")
async def mermaid_endpoint(mermaid_script: MermaidScript):
    """Mermaid diagram endpoint."""
    return await create_mermaid_diagram(mermaid_script)
