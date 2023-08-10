"""Configuration for the app."""
from pathlib import Path

DIAGRAM_CONFIG_PATH = Path("app/config/diagram_config.json")
LLM_CONFIG_PATH = Path("app/config/llm_config.json")

OPEN_AI_CHAT_TYPE = "OpenAI Chat"
OPEN_AI_INSTRUCT_TYPE = "OpenAI Instruct"
ANTHROPIC_AI_TYPE = "Anthropic Chat"
