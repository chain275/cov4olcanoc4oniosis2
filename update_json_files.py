import os
import re
import json

replacements = [
    ('''"description"''', '"des"'),
    ('''"subtitle"''','''"st"'''),
    ('''"duration"''','''"dur"'''),
    ('''"totalQuestions"''','''"tq"'''),
    ('''"questions"''','''"q"'''),
    ('''"text"''','''"te"'''),
    ('''"prompt"''','''"p"'''),
    ('''"options"''','''"op"'''),
    ('''"correctAnswer"''','''"ca"'''),

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

def minify_json(file_path):
    """Minify JSON file by removing all unnecessary whitespace."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # Parse JSON content
            data = json.load(file)
        
        # Write back minified JSON without pretty printing
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, separators=(',', ':'), ensure_ascii=False)
        
        print(f"JSON minified: {file_path}")
        return True
    except json.JSONDecodeError as e:
        print(f"Error minifying {file_path}: {e}")
        return False

def update_html_files():
    """
    Update all HTML files in the public directory to include responsive.css
    and add the menu overlay element.
    """
    # Directory containing HTML files
    public_dir = 'data'
    
    # Get a list of all JSON files
    json_files = [f for f in os.listdir(public_dir) if f.endswith('.json')]
    
    for filename in json_files:
        file_path = os.path.join(public_dir, filename)
        
        # Replace strings first
        replace_in_file(file_path)
        
        # Then minify the JSON
        minify_json(file_path)
        

if __name__ == "__main__":
    update_html_files()
    print("JSON files update and minification complete!") 