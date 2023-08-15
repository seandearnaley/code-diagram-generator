""" Mermaid diagram route. """ ""

from fastapi import APIRouter, Body, HTTPException

from ..models import MermaidDesignRequest
from ..services.mermaid_service import (
    MermaidCliError,
    MermaidUnexpectedError,
    post_mermaid_design_requestx,
)

router = APIRouter()


@router.post("/mermaid_design_request/")
async def post_mermaid_design_request_endpoint(
    mermaid_design_request: MermaidDesignRequest = Body(...),
):
    """Mermaid diagram request endpoint."""
    try:
        return await post_mermaid_design_requestx(mermaid_design_request)
    except MermaidCliError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
    except MermaidUnexpectedError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
