""" diagram function definitions for use in diagram service """
from typing import List

from ..utils.llm_utils import FunctionType

# NOTE diagram_type is supposedly the list of mermaid diagram types GPT supports
# from 2021 but the CLI we use is more up to date, it may be possible to teach LLM's
# to generate mermaid diagrams for other types using n-shot learning
# mermaid docs, examples etc.

DIAGRAM_FUNCTION_DEFINITIONS: List[FunctionType] = [
    {
        "name": "create_mermaid_diagram",
        "description": "Generate a mermaid diagram from a mermaid text based script",
        "parameters": {
            "type": "object",
            "properties": {
                "diagram_title": {
                    "type": "string",
                    "description": "Title of the mermaid diagram",
                },
                "diagram_type": {
                    "type": "string",
                    "enum": [
                        "flowchart",
                        "sequence",
                        "gantt",
                        "class",
                        "state",
                        "pie",
                        "git",
                        "entityRelationship",
                        "user-journey",
                        "requirement",
                    ],
                    "description": "Type of mermaid diagram to be created.",
                },
                "explanation": {
                    "type": "string",
                    "description": " explanation of the diagram and various components",
                },
                "diagram_text_definition": {
                    "type": "string",
                    "description": (
                        "mermaid definition. plain text input. Should not"
                        " contain encodings like \n, \t, etc. should be properly"
                        " escaped for embedding in json"
                    ),
                },
            },
            "required": [
                "diagram_title",
                "diagram_type",
                "explanation",
                "diagram_text_definition",
            ],
        },
    }
]
