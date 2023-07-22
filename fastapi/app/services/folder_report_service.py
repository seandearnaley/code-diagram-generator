"""Service to generate a report of the python code outline of a folder."""
from folder_tree_generator import generate_tree
from python_code_outline import get_report


async def folder_report(
    root_folder: str, report_file_path: str, ignore_file_path: str
) -> str:
    """Generate a report of the python code outline of a folder."""
    folder_tree = generate_tree(root_folder, ignore_file_path=ignore_file_path)
    report = get_report(root_folder, ignore_file_path=ignore_file_path)

    with open(report_file_path, "w", encoding="utf-8") as file:
        file.write(folder_tree + "\n\n" + report)

    return report
