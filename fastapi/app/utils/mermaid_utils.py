"""Utilities for Mermaid diagrams."""
import re
from re import compile as re_compile
from typing import Match

VALID_ESCAPES = re_compile(
    r'(\\\\")|(\\\\/)|(\\\\b)|(\\\\f)|(\\\\n)|(\\\\r)|(\\\\t)|(\\\\\\\\)'
)


def extract_error_message(error_text: str) -> str:
    """Extract the error message from the mermaid-cli output."""
    match = re.search(r"^(.*?)(?:\n\s*at )", error_text, flags=re.MULTILINE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return error_text.strip()


def sanitize_escape_sequences(markdown_js: str) -> str:
    """Replace invalid escape sequences with the first character."""

    def replace_invalid_escape(match: Match[str]) -> str:
        """Replace invalid escape sequences with the first character."""
        escape_sequence = match.group(0)
        return escape_sequence if match.group(1) else escape_sequence[0]

    sanitized_string = VALID_ESCAPES.sub(replace_invalid_escape, markdown_js)
    return sanitize_control_characters(sanitized_string)


def trim_invalid_statements(diagram: str) -> str:
    """
    Trims the Mermaid diagram text definition to remove any lines
    until it finds a line that starts with a recognized Mermaid statement.

    Args:
        diagram (str): The Mermaid diagram text definition.

    Returns:
        str: The trimmed Mermaid diagram text definition.
    """
    valid_statements = [
        "graph",
        "subgraph",
        "classDef",
        "%%",
        "style",
        "app",
        "sequenceDiagram",
        "gantt",
        "pie",
        "stateDiagram",
        "erDiagram",
        "journey",
        "requirement",
    ]  # Add other valid starting statements as needed
    lines = diagram.split("\n")

    for i, line in enumerate(lines):
        if any(line.strip().startswith(statement) for statement in valid_statements):
            return "\n".join(lines[i:])

    return ""  # Return an empty string if no valid statements are found


def trim_json_values(json_str: str) -> str:
    """
    Trims whitespace from values inside a JSON string.
    Args:
        json_str (str): The input JSON string.

    Returns:
        str: The JSON string with trimmed values.
    """

    def trim_values(match: Match[str]) -> str:
        """Trims the value in a key-value pair inside JSON."""
        key, value = match.groups()
        new_val = value.strip("\n").strip()
        return f'"{key.strip()}": "{new_val}"'

    pattern = re_compile(r'"([^"]*?)":\s*"([^"]*?)"')
    return pattern.sub(trim_values, json_str)


def sanitize_markdown_js(markdown_js: str) -> str:
    """
    Sanitizes markdown JS string, including escape sequences, control characters,
    and Mermaid diagram text definition.
    Args:
        markdown_js (str): The input markdown JS string.

    Returns:
        str: The sanitized markdown JS string.
    """
    # Regex to match Mermaid diagram text definition enclosed with backticks
    diagram_pattern = re_compile(r'"mermaid_diagram_text_definition":\s*`([^`]*)`')
    match = diagram_pattern.search(markdown_js)
    if match:
        mermaid_diagram_text_definition = match.group(1)

        # Trimming and sanitizing the diagram text definition
        sanitized_diagram_text_definition = sanitize_escape_sequences(
            mermaid_diagram_text_definition.strip()
        )
        trimmed_diagram_text_definition = trim_invalid_statements(
            sanitized_diagram_text_definition
        )

        # Replacing the original diagram text definition with the sanitized version
        markdown_js = markdown_js.replace(
            f"`{mermaid_diagram_text_definition}`",
            f'"{trimmed_diagram_text_definition}"',
        )

    return markdown_js.strip("\n").strip()


def sanitize_control_characters(input_str: str, replacement: str = "") -> str:
    """Remove control characters from a string."""
    translation_table = dict.fromkeys(range(32), replacement)
    return input_str.translate(translation_table)
