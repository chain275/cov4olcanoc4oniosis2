import json
import os
import glob

def add_exam_type():
    # Define the mapping of filenames to exam types
    type_mapping = {
        'Short_conversation.json': 'short_conversation',
        'Long_conversation.json': 'long_conversation',
        'Article.json': 'article',
        'News_report.json': 'news_report',
        'Product.json': 'product',
        'advertisement.json': 'advertisement',
        'paragraph.json': 'paragraph',
        'text_completion.json': 'text_completion'
    }
    
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to src directory where JSON files are located
    src_dir = os.path.join(script_dir, 'src')
    
    print(f"Looking for JSON files in: {src_dir}")
    
    # Process each JSON file in the mapping
    for json_filename, exam_type in type_mapping.items():
        json_path = os.path.join(src_dir, json_filename)
        
        # Check if the file exists
        if not os.path.exists(json_path):
            print(f"File not found: {json_path}")
            continue
        
        print(f"Processing: {json_filename}")
        
        try:
            # Load the JSON data
            with open(json_path, 'r', encoding='utf-8') as file:
                exams = json.load(file)
            
            # Add the type field to each exam
            for exam in exams:
                if 'type' not in exam:
                    exam['type'] = exam_type
            
            # Save the modified JSON back to the file
            with open(json_path, 'w', encoding='utf-8') as file:
                json.dump(exams, file, ensure_ascii=False, indent=2)
            
            print(f"Added 'type' field to {len(exams)} exams in {json_filename}")
            
        except Exception as e:
            print(f"Error processing {json_filename}: {str(e)}")
    
    print("Processing complete!")

if __name__ == "__main__":
    add_exam_type() 