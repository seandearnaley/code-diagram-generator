"""LLM routes."""

from typing import Dict, Union

from pydantic import BaseModel  # pylint: disable=no-name-in-module
from starlette.requests import Request

from fastapi import APIRouter

from ..models import LLMConfig
from ..utils.llm_utils import estimate_word_count, num_tokens_from_string


class TextRequest(BaseModel):
    """Request model for text."""

    text: str
    llm_vendor: str


router = APIRouter()


@router.get("/llm_config", response_model=LLMConfig)
async def load_llm_config_endpoint(request: Request):
    """Endpoint to get llm configuration."""
    return request.app.state.llm_config


@router.post("/token_count", response_model=Dict[str, Union[int, str]])
async def token_count(request: TextRequest) -> Dict[str, Union[int, str]]:
    """Endpoint to count words in text."""
    count = num_tokens_from_string(request.text, request.llm_vendor)
    return {
        "token_count": 0,  # count,
        "llm_vendor": request.llm_vendor,
        "est_words": estimate_word_count(count),
    }
