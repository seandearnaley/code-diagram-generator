"""Service for LLM Models"""
import json
import os
from typing import Any, Dict

import openai
from anthropic import AI_PROMPT, HUMAN_PROMPT, Anthropic
from openai.openai_object import OpenAIObject
from pyrate_limiter import Duration, Limiter, RequestRate

from ..config import ANTHROPIC_AI_VENDOR, LLM_CONFIG_PATH
from ..models import LLMConfig
from ..utils.llm_utils import validate_max_tokens

openai.organization = os.environ.get("OPENAI_ORG_ID")
openai.api_key = os.environ.get("OPENAI_API_KEY")


rate_limits = (RequestRate(10, Duration.MINUTE),)  # 10 requests a minute

# Create the rate limiter / Pyrate Limiter instance
limiter = Limiter(*rate_limits)


class LLMException(Exception):
    """Base exception for LLM errors"""


class OpenAIException(Exception):
    """Exception raised when there is an error with the OpenAI API"""


class AnthropicException(Exception):
    """Exception raised when there is an error with the Anthropic API"""


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


async def load_llm_config() -> LLMConfig:
    """Reads diagram configuration from a JSON file"""
    with LLM_CONFIG_PATH.open(encoding="utf-8") as json_file:
        data: Dict[str, Any] = json.load(json_file)
        llm_vendors = dict(data["llm_vendors"].items())

    return LLMConfig(
        llm_vendors=llm_vendors,
        llm_vendor_names=data["llm_vendor_names"],
    )


def complete_openai_text(
    prompt: str,
    max_tokens: int,
    model: str,
) -> str:
    """Use OpenAI's GPT model to complete text based on the given prompt."""

    try:
        response = openai.ChatCompletion.create(
            model,
            max_tokens,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
        )

        if not isinstance(response, OpenAIObject):
            raise ValueError("Invalid Response")

        if response.choices:
            content = response.choices[0].message.content
            return content.strip()

        return "Response doesn't have choices or choices have no text."

    except openai.OpenAIError as err:
        return f"OpenAI Client Error: {err}"
    except ValueError as err:
        return f"OpenAI Client Value error: {err}"
    except OpenAIException as err:
        return f"OpenAI Client Error: {err}"


def complete_anthropic_text(
    prompt: str,
    max_tokens: int,
    model: str,
) -> str:
    """Use Anthropic's model to complete text based on the given prompt."""

    try:
        anthropic_client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        response = anthropic_client.completions.create(
            prompt=f"{HUMAN_PROMPT} {prompt}{AI_PROMPT}",
            stop_sequences=[HUMAN_PROMPT],
            model=model,
            max_tokens_to_sample=max_tokens,
        )

        return response.completion.strip()
    except AnthropicException as err:
        return f"Anthropic Client Error: {err}"
