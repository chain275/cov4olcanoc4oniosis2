import os
import re

def update_html_files():
    """
    Update all HTML files in the public directory to include responsive.css
    and add the menu overlay element.
    """
    # Directory containing HTML files
    public_dir = 'public'
    
    # Get a list of all HTML files
    html_files = [f for f in os.listdir(public_dir) if f.endswith('.html')]
    
    for filename in html_files:
        file_path = os.path.join(public_dir, filename)
        
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Skip files that already have responsive.css
        if 'responsive.css' in content:
            print(f"Skipping {filename}: responsive.css already included")
            continue
        
        # Add responsive.css link after styles.css
        if 'styles.css' in content:
            content = content.replace(
                '<link rel="stylesheet" href="styles.css">',
                '<link rel="stylesheet" href="styles.css">\n    <link rel="stylesheet" href="responsive.css">'
            )
        
        # Add menu overlay before the first section or div if it doesn't exist
        if '<div class="menu-overlay"></div>' not in content:
            # Find the body tag
            body_match = re.search(r'<body[^>]*>(.*?)', content, re.DOTALL)
            if body_match:
                # Insert menu overlay after body tag
                insert_pos = body_match.end()
                content = content[:insert_pos] + '\n    <!-- Mobile Menu Overlay -->\n    <div class="menu-overlay"></div>\n' + content[insert_pos:]
        
        # Update placeholder divs for header and footer
        content = re.sub(
            r'<div\s+data-include="header.*?">\s*</div>',
            '<div id="header-placeholder"></div>',
            content
        )
        
        content = re.sub(
            r'<div\s+data-include="footer.*?">\s*</div>',
            '<div id="footer-placeholder"></div>',
            content
        )
        
        # Write the updated content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"Updated {filename}")

if __name__ == "__main__":
    update_html_files()
    print("HTML files update complete!") 