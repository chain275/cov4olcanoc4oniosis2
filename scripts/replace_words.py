
import re
import sys
from pathlib import Path

# Define the replacements
replacements = [
    ('<span class="stat-label">เกณฑ์คะแนน:</span>', '<span class="stat-label">คอมเม้นต์:</span>')
    ]

def replace_in_file(file_path):
    """Replace words in the given file based on the defined replacements."""
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Apply each replacement
    for old_text, new_text in replacements:
        content = content.replace(old_text, new_text)
    
    # Write the updated content back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Replacements applied to {file_path}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python replace_words.py <html_file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not Path(file_path).exists():
        print(f"Error: File {file_path} does not exist.")
        sys.exit(1)
    
    replace_in_file(file_path)

if __name__ == "__main__":
    main() 