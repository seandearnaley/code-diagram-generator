"""LLM routes."""

from typing import Dict, Union

from pydantic import BaseModel  # pylint: disable=no-name-in-module

from fastapi import APIRouter

from ..models import LLMConfig
from ..services.llm_service import load_llm_config
from ..utils.llm_utils import estimate_word_count, num_tokens_from_string


class TextRequest(BaseModel):
    """Request model for text."""

    text: str
    llm_vendor: str


router = APIRouter()


@router.get("/llm_config", response_model=LLMConfig)
async def load_llm_config_endpoint():
    """Endpoint to get diagram configuration."""
    return await load_llm_config()


@router.post("/token_count", response_model=Dict[str, Union[int, str]])
async def token_count(request: TextRequest) -> Dict[str, Union[int, str]]:
    """Endpoint to count words in text."""
    count = num_tokens_from_string(request.text, request.llm_vendor)
    return {
        "token_count": count,
        "llm_vendor": request.llm_vendor,
        "est_words": estimate_word_count(count),
    }
