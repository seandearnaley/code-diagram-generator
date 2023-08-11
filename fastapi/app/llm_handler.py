"""Handler for the LLM app."""

from pyrate_limiter import Duration, Limiter, RequestRate

from .config import ANTHROPIC_AI_VENDOR
from .services.llm_service import complete_anthropic_text, complete_openai_text
from .utils.llm_utils import validate_max_tokens

rate_limits = (RequestRate(10, Duration.MINUTE),)  # 10 requests a minute

# Create the rate limiter / Pyrate Limiter instance
limiter = Limiter(*rate_limits)


class LLMException(Exception):
    """Base exception for LLM errors"""


def complete_text(
    prompt: str,
    max_tokens: int,
    model: str,
    vendor: str,
) -> str:
    """LLM orchestrator"""

    validate_max_tokens(max_tokens)

    is_anthropic = vendor == ANTHROPIC_AI_VENDOR

    try:
        limiter.ratelimit("complete_text")

        # delegate to the appropriate completion method

        if is_anthropic:
            return complete_anthropic_text(
                prompt=prompt,
                max_tokens=max_tokens,
                model=model,
            )

        return complete_openai_text(
            prompt=prompt,
            max_tokens=max_tokens,
            model=model,
        )

    except LLMException as exc:
        return f"Error completing text: {exc}"
