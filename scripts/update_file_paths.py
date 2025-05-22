import os
import re

def update_file_paths(html_file_path):
    """
    Update file paths in HTML files to point to the new assets directory structure.
    """
    # Read the HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Update CSS file references
    content = re.sub(r'href="(styles\.css)"', r'href="../assets/css/\1"', content)
    content = re.sub(r'href="(responsive\.css)"', r'href="../assets/css/\1"', content)
    content = re.sub(r'href="(slideshow\.css)"', r'href="../assets/css/\1"', content)
    content = re.sub(r'href="(combined_exam\.css)"', r'href="../assets/css/\1"', content)
    
    # Update JS file references
    content = re.sub(r'src="(scripts\.js)"', r'src="../assets/js/\1"', content)
    content = re.sub(r'src="(slideshow\.js)"', r'src="../assets/js/\1"', content)
    content = re.sub(r'src="(include\.js)"', r'src="../assets/js/\1"', content)
    content = re.sub(r'src="(combined_exam\.js)"', r'src="../assets/js/\1"', content)
    content = re.sub(r'src="(progress\.js)"', r'src="../assets/js/\1"', content)
    
    # Update links to other HTML files
    html_files = [
        'Advertisement.html', 'Article.html', 'Combined_Exam.html', 
        'contact.html', 'donate.html', 'index.html', 
        'Long_conversation.html', 'News_report.html', 'Paragraph.html',
        'Product.html', 'progress.html', 'Short_conversation.html',
        'template.html', 'Text_completion.html', 'tutors.html'
    ]
    
    for html_file in html_files:
        content = re.sub(fr'href="{html_file}"', fr'href="../templates/{html_file}"', content)
        content = re.sub(fr'location\.href=\'{html_file}\'', fr'location.href=\'../templates/{html_file}\'', content)
        content = re.sub(fr'location\.href="{html_file}"', fr'location.href="../templates/{html_file}"', content)
    
    # Update image references
    content = re.sub(r'src="images/', r'src="../assets/images/', content)
    content = re.sub(r'href="images/', r'href="../assets/images/', content)
    
    # Write the updated content back to the file
    with open(html_file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Updated: {html_file_path}")

def main():
    # Directory containing HTML files
    templates_dir = "../templates"
    
    # Update all HTML files in the templates directory
    for file_name in os.listdir(templates_dir):
        if file_name.endswith('.html'):
            file_path = os.path.join(templates_dir, file_name)
            update_file_paths(file_path)
    
if __name__ == "__main__":
    main() 