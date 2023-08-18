"""Logging utilities."""
from rich.console import Console
from rich.markdown import Markdown


def print_markdown(log_str):
    """Print markdown to console."""
    markdown = Markdown(log_str)
    console = Console()
    console.print(markdown)
