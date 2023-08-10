"""Service for LLM Models"""
import json
from typing import Any, Dict

from ..config import LLM_CONFIG_PATH
from ..models import LLMConfig


async def load_llm_config() -> LLMConfig:
    """Reads diagram configration from a JSON file"""
    with LLM_CONFIG_PATH.open(encoding="utf-8") as json_file:
        data: Dict[str, Any] = json.load(json_file)
        llm_vendors = dict(data["llm_vendors"].items())

    return LLMConfig(
        llm_vendors=llm_vendors,
        llm_vendor_names=data["llm_vendor_names"],
    )
