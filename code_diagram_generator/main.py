""" Generate a report of the python code outline of a folder. """
from python_code_outline import python_report_generator

# Define the root folder
ROOT_FOLDER = "/Users/seandearnaley/Documents/GitHub/reddit-gpt-summarizer"

# Specify the report and ignore file paths (optional)
REPORT_FILE_PATH = "custom_report.txt"
IGNORE_FILE_PATH = ROOT_FOLDER + ".gitignore"

# Generate the report
REPORT = python_report_generator.get_report(ROOT_FOLDER)

# Write the report to a file
with open(REPORT_FILE_PATH, "w", encoding="utf-8") as file:
    file.write(REPORT)

print(f"Report generated successfully to {REPORT_FILE_PATH}.")
