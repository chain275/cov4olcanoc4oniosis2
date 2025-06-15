import os
import re

replacements = [
    ('<link rel="stylesheet" href="../assets/css/styles.css">', '<link rel="stylesheet" href="../assets/css/styles.min.css">')
    ,
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


def update_html_files():
    """
    Update all HTML files in the public directory to include responsive.css
    and add the menu overlay element.
    """
    # Directory containing HTML files
    public_dir = 'templates'
    
    # Get a list of all HTML files
    html_files = [f for f in os.listdir(public_dir) if f.endswith('.html')]
    
    for filename in html_files:
        file_path = os.path.join(public_dir, filename)
        
        # Read the file content
        replace_in_file(file_path)
        

if __name__ == "__main__":
    update_html_files()
    print("HTML files update complete!") 