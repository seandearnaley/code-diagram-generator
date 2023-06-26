""" Generate a report of the python code outline of a folder. """
from folder_tree_generator import generate_tree
from python_code_outline import get_report

# Define the root folder
ROOT_FOLDER = "/Users/seandearnaley/Documents/GitHub/reddit-gpt-summarizer"

# Specify the report and ignore file paths (optional)
REPORT_FILE_PATH = "custom_report.txt"
IGNORE_FILE_PATH = ROOT_FOLDER + "/.gitignore"
FOLDER_TREE = generate_tree(ROOT_FOLDER, ignore_file_path=IGNORE_FILE_PATH)

# Generate the report
REPORT = get_report(ROOT_FOLDER, ignore_file_path=IGNORE_FILE_PATH)

# Write the report to a file
with open(REPORT_FILE_PATH, "w", encoding="utf-8") as file:
    file.write(FOLDER_TREE + "\n\n" + REPORT)

print(f"Report generated successfully to {REPORT_FILE_PATH}.")
