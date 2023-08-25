""" mermaid function definitions for use in mermaid service """


# NOTE diagram_type is supposedly the list of mermaid diagram types GPT supports
# from 2021 but the CLI we use is more up to date, it may be possible to teach LLM's
# to generate mermaid diagrams for other types using n-shot learning
# mermaid docs, examples etc.

MERMAID_SCRIPT_FUNCTION_DEFINITIONS = [
    {
        "name": "create_mermaid_diagram",
        "description": "Generate a mermaid diagram from a mermaid text based script",
        "parameters": {
            "type": "object",
            "properties": {
                "mermaid_diagram_text_definition": {
                    "type": "string",
                    "description": (
                        "mermaid definition. plain text input. Should not"
                        " contain encodings like \n, \t, etc. should be properly"
                        " escaped for embedding in json"
                    ),
                },
                "notes_markdown": {
                    "type": "string",
                    "description": (
                        "markdown formatted notes about the diagram,"
                        " explanation of diagram and various components"
                    ),
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
            },
            "required": [
                "mermaid_diagram_text_definition",
                "notes_markdown",
                "diagram_type",
            ],
        },
    }
]
