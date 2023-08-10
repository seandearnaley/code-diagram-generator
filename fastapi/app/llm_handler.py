"""Handler for the LLM app."""

from pyrate_limiter import Duration, Limiter, RequestRate

from .config import ANTHROPIC_AI_TYPE
from .services.anthropic_connector import complete_anthropic_text
from .services.openai_connector import complete_openai_text
from .utils.llm_utils import validate_max_tokens

rate_limits = (RequestRate(10, Duration.MINUTE),)  # 10 requests a minute

# Create the rate limiter
# Pyrate Limiter instance
limiter = Limiter(*rate_limits)


def complete_text(
    prompt: str,
    max_tokens: int,
    model: str,
) -> str:
    """LLM orchestrator"""

    validate_max_tokens(max_tokens)

    selected_model_type = vendor

    is_anthropic = selected_model_type == ANTHROPIC_AI_TYPE

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

    except Exception as exc:  # pylint: disable=broad-except
        app_logger.error("Error completing text: %s", exc)
        return f"Error completing text: {exc}"
