"""Tests for the markdown JSON parser."""
import sys
import unittest

# import functions extract_json_code_blocks, validate_json from a module
# called markdown_json_parser from multiple folders up
from app.utils.markdown_json_parser import extract_json_code_blocks, validate_json

print(sys.path)


class TestMarkdownJSONParser(unittest.TestCase):
    """Tests for the markdown JSON parser."""

    def test_extract_json_code_blocks(self):
        """Test that the JSON code blocks are extracted from the markdown."""
        markdown = '```\n{"key": "value"}\n```\n```\n[1, 2, 3]\n```'
        result = extract_json_code_blocks(markdown)
        expected = ['{"key": "value"}\n', "[1, 2, 3]\n"]
        self.assertEqual(result, expected)

    def test_validate_json_valid(self):
        """Test that valid JSON is validated."""
        valid_json = '{"key": "value"}'
        self.assertTrue(validate_json(valid_json))

    def test_validate_json_invalid(self):
        """Test that invalid JSON is not validated."""
        invalid_json = '{"key": "value"'
        with self.assertRaises(ValueError):
            validate_json(invalid_json)
