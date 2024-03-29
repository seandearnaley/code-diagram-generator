""" Mermaid diagram route. """ ""

from starlette.requests import Request

from fastapi import APIRouter, Body, HTTPException

from ..exceptions import MermaidUnexpectedError
from ..models import MermaidDesignRequest
from ..services.llm_service import get_llm_by_id
from ..services.mermaid_service import MermaidCliError, mermaid_request

router = APIRouter()


@router.post("/mermaid_design_request/")
async def mermaid_request_endpoint(
    request: Request,
    mermaid_design_request: MermaidDesignRequest = Body(...),
):
    """Mermaid diagram request endpoint."""

    llm_config = request.app.state.llm_config

    llm_definition = get_llm_by_id(
        llm_config, mermaid_design_request.llm_model_for_instructions
    )

    if llm_definition is None:
        raise ValueError(
            f"LLM model '{mermaid_design_request.llm_model_for_instructions}' not"
            " found."
        )

    try:
        return await mermaid_request(llm_definition, mermaid_design_request)
    except MermaidCliError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
    except MermaidUnexpectedError as ex:
        raise HTTPException(status_code=500, detail=str(ex)) from ex
