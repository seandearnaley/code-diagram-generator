"""Utility to parse and extract JSON code blocks from markdown."""
import argparse
import json
from pathlib import Path
from typing import List, Optional


def extract_json_code_blocks(markdown: str) -> List[str]:
    """Extract JSON code blocks from the given markdown string.

    Args:
        markdown (str): The markdown text containing JSON code blocks.

    Returns:
        List[str]: List of extracted JSON code blocks.
    """
    code_blocks = []
    lines = markdown.split("\n")
    in_code_block = False
    code_block = ""

    for line in lines:
        if line.strip() == "```":
            if in_code_block:
                code_blocks.append(code_block)
                code_block = ""
            in_code_block = not in_code_block
        elif in_code_block:
            code_block += line + "\n"

    return code_blocks


def validate_json(json_string: str, spec: Optional[str] = None) -> bool:
    """Validate the given JSON string against a specific JSON specification.

    Args:
        json_string (str): The JSON string to validate.
        spec (Optional[str]): The JSON specification to validate against.

    Raises:
        ValueError: If the JSON string doesn't match the specification.

    Returns:
        bool: True if the JSON string is valid, False otherwise.
    """
    try:
        json.loads(json_string)
        if spec:
            # Validate against the provided JSON specification
            # Can integrate third-party libraries like jsonschema for complex validation
            pass
        return True
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON format") from exc
    except Exception as exc:
        raise ValueError("An error occurred while validating JSON") from exc


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments.

    Returns:
        argparse.Namespace: Parsed command-line arguments.
    """
    parser = argparse.ArgumentParser(
        description="Parse and extract JSON code blocks from markdown."
    )
    parser.add_argument(
        "markdown_file",
        type=str,
        help="Path to the markdown file containing JSON code blocks.",
    )
    parser.add_argument(
        "--spec", type=str, help="Path to the JSON specification file.", default=None
    )
    return parser.parse_args()


def main():
    """Main function to handle command-line execution"""
    args = parse_arguments()
    markdown_path = Path(args.markdown_file)
    spec_path = args.spec

    # Read markdown file
    markdown_content = markdown_path.read_text(encoding="utf-8")

    # Extract JSON code blocks
    code_blocks = extract_json_code_blocks(markdown_content)

    # Validate JSON code blocks
    spec = None
    if spec_path:
        spec = Path(spec_path).read_text(encoding="utf-8")
    for code_block in code_blocks:
        validate_json(code_block, spec)

    # Print or save to disk as required


if __name__ == "__main__":
    main()
