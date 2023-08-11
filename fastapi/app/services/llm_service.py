"""Service for LLM Models"""
import json
import os
from typing import Any, Dict

import openai
from anthropic import AI_PROMPT, HUMAN_PROMPT, Anthropic
from openai.openai_object import OpenAIObject

from ..config import LLM_CONFIG_PATH
from ..models import LLMConfig

openai.organization = os.environ.get("OPENAI_ORG_ID")
openai.api_key = os.environ.get("OPENAI_API_KEY")


class OpenAIException(Exception):
    """Exception raised when there is an error with the OpenAI API"""


class AnthropicException(Exception):
    """Exception raised when there is an error with the Anthropic API"""


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
