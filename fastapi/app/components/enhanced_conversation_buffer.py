"""Enhanced conversation buffer."""
from typing import Callable, Dict, List, Union


class EnhancedConversationBuffer:
    """
    Enhanced conversation buffer that manages a list of interactions
    based on token count.
    """

    def __init__(
        self,
        max_tokens: int,
        num_tokens_from_string: Callable[[str], int],
        human_prefix: str = "Human",
        ai_prefix: str = "AI",
    ):
        self.buffer: List[Dict[str, str]] = []
        self.max_tokens: int = max_tokens
        self.current_tokens: int = 0
        self.num_tokens_from_string = num_tokens_from_string
        self.human_prefix = human_prefix
        self.ai_prefix = ai_prefix

    def add_message(self, message: Dict[str, str]) -> None:
        """Adds a message to the buffer."""
        message_tokens = self.num_tokens_from_string(message["content"])
        self.current_tokens += message_tokens
        self.buffer.append(message)
        self.flush_buffer()

    def flush_buffer(self) -> None:
        """Flushes the buffer to keep it under the max token count."""
        while self.current_tokens > self.max_tokens:
            removed_message = self.buffer.pop(0)
            self.current_tokens -= self.num_tokens_from_string(
                removed_message["content"]
            )

    @property
    def buffer_as_str(self) -> str:
        """Returns the buffer as a string."""
        return "\n".join(
            [
                f"{self.human_prefix if msg['role'] == 'user' else self.ai_prefix}:"
                f" {msg['content']}"
                for msg in self.buffer
            ]
        )

    @property
    def buffer_as_messages(self) -> List[Dict[str, str]]:
        """Returns the buffer as a list of messages."""
        return self.buffer

    def save_context(self) -> Dict[str, Union[int, List[Dict[str, str]]]]:
        """Serializes the current state of the buffer to a dictionary."""
        return {
            "max_tokens": self.max_tokens,
            "current_tokens": self.current_tokens,
            "buffer": self.buffer,
        }


def load_context(self, context: Dict[str, Union[int, List[Dict[str, str]]]]) -> None:
    """Loads the state of the buffer from a serialized dictionary."""
    max_tokens = context["max_tokens"]
    current_tokens = context["current_tokens"]
    buffer = context["buffer"]

    if isinstance(max_tokens, int):
        self.max_tokens = max_tokens
    else:
        raise TypeError("Expected max_tokens to be an int")

    if isinstance(current_tokens, int):
        self.current_tokens = current_tokens
    else:
        raise TypeError("Expected current_tokens to be an int")

    if isinstance(buffer, list):
        self.buffer = buffer
    else:
        raise TypeError("Expected buffer to be a list")
