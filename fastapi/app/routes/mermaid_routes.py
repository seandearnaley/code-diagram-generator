""" Mermaid diagram route. """ ""
from fastapi import APIRouter, HTTPException

from ..models import MermaidScript
from ..services.mermaid_service import (
    MermaidCliError,
    MermaidUnexpectedError,
    create_mermaid_diagram,
)

router = APIRouter()


@router.post("/mermaid/")
async def mermaid_endpoint(mermaid_script: MermaidScript):
    """Mermaid diagram endpoint."""
    try:
        return await create_mermaid_diagram(mermaid_script)
    except MermaidCliError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
    except MermaidUnexpectedError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
