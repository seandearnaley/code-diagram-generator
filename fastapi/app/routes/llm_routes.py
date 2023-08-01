"""LLM routes."""

from fastapi import APIRouter

from ..models import LLMConfig
from ..services.llm_service import load_llm_config

router = APIRouter()


@router.get("/llm_config", response_model=LLMConfig)
async def load_llm_config_endpoint():
    """Endpoint to get diagram configuration."""
    return await load_llm_config()
