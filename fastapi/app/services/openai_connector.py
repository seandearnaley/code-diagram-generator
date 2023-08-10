"""OpenAI Connector."""

import os

import openai
from openai.openai_object import OpenAIObject

openai.organization = os.environ.get("OPENAI_ORG_ID")
openai.api_key = os.environ.get("OPENAI_API_KEY")


def complete_openai_text(
    prompt: str,
    max_tokens: int,
    model: str,
) -> str:
    """
    Use OpenAI's GPT model to complete text based on the given prompt.

    Args:
        prompt (str): The prompt to use as the starting point for text completion.
        max_tokens (int, optional): The maximum number of tokens to generate in the
        response.
        settings (GenerateSettings): The settings to use for generating the text.

    Returns:
        str: The completed text.
    """

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
        return f"OpenAI Error: {err}"
    except ValueError as err:
        return f"Value error: {err}"
