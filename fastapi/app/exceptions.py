"""Exceptions for the services module."""


class MermaidCliError(Exception):
    """Exception raised when the mermaid-cli fails."""


class MermaidUnexpectedError(Exception):
    """Exception raised when an unexpected error occurs."""


class LLMException(Exception):
    """Base exception for LLM errors"""


class OpenAIException(Exception):
    """Exception raised when there is an error with the OpenAI API"""


class AnthropicException(Exception):
    """Exception raised when there is an error with the Anthropic API"""
