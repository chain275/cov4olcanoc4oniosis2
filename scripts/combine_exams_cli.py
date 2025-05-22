import json
import os
import argparse
import random
import glob

# Define preset distribution
PRESET_DISTRIBUTION = {
    'short_conversation': 3,
    'long_conversation': 1,
    'advertisement': 2,
    'product': 2,
    'news_report': 2,
    'article': 2,
    'text_completion': 3,
    'paragraph': 5
}

def list_exam_files():
    """List all available exam JSON files in the src directory"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.join(script_dir, 'src')
    
    json_files = [f for f in os.listdir(src_dir) if f.endswith('.json')]
    exam_info = {}
    
    print("\nAvailable exam files:")
    print("-" * 70)
    print(f"{'Filename':<30} {'Type':<20} {'Count':<10}")
    print("-" * 70)
    
    for json_file in json_files:
        file_path = os.path.join(src_dir, json_file)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Skip files that don't contain exam data
                if not isinstance(data, list) or len(data) == 0:
                    continue
                
                # Get exam type
                exam_type = data[0].get('type', 'unknown')
                
                # Print file info
                print(f"{json_file:<30} {exam_type:<20} {len(data):<10}")
                
                # Store in dictionary
                exam_info[json_file] = {
                    'path': file_path,
                    'type': exam_type,
                    'count': len(data)
                }
                
        except Exception as e:
            print(f"Error loading {json_file}: {str(e)}")
    
    print("-" * 70)
    return exam_info

def apply_preset_distribution():
    """Apply the preset distribution from available exam files"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    src_dir = os.path.join(script_dir, 'src')
    
    # Create a dictionary to organize exams by type
    exams_by_type = {exam_type: [] for exam_type in PRESET_DISTRIBUTION.keys()}
    
    # Get all JSON files in src directory
    json_files = [f for f in os.listdir(src_dir) if f.endswith('.json')]
    
    # Collect all exams from all files and organize by type
    for json_file in json_files:
        file_path = os.path.join(src_dir, json_file)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                
                # Skip files that don't contain exam data
                if not isinstance(data, list) or len(data) == 0:
                    continue
                
                # Add exams to the appropriate type list
                for exam in data:
                    exam_type = exam.get('type', 'unknown')
                    if exam_type in exams_by_type:
                        exams_by_type[exam_type].append(exam)
                
        except Exception as e:
            print(f"Error processing {json_file}: {str(e)}")
    
    # Randomly select the required number of exams for each type
    selected_exams = []
    missing_types = []
    
    print("\nSelecting exams based on preset distribution:")
    print("-" * 70)
    
    for exam_type, count in PRESET_DISTRIBUTION.items():
        available_exams = exams_by_type[exam_type]
        
        if not available_exams:
            missing_types.append(exam_type)
            print(f"{exam_type}: No exams available (requested {count})")
            continue
            
        # Shuffle available exams of this type
        random.shuffle(available_exams)
        
        # Take required number or all available if less
        selected_count = min(count, len(available_exams))
        selected_exams.extend(available_exams[:selected_count])
        
        availability_status = "OK" if selected_count == count else "PARTIAL"
        print(f"{exam_type}: Selected {selected_count}/{count} ({availability_status})")
    
    print("-" * 70)
    
    # Show warning if any types are missing
    if missing_types:
        print(f"\nWARNING: No exams found for types: {', '.join(missing_types)}")
    
    return selected_exams

def combine_exams(exam_files, output_file, limit=0, shuffle=True, use_preset=False):
    """Combine selected exam files into a single JSON file"""
    all_exams = []
    
    if use_preset:
        print("\nUsing preset distribution:")
        for exam_type, count in PRESET_DISTRIBUTION.items():
            print(f"  - {exam_type}: {count} questions")
        
        all_exams = apply_preset_distribution()
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        src_dir = os.path.join(script_dir, 'src')
        
        processed_files = []
        
        # Process each file pattern
        for file_pattern in exam_files:
            # Convert to full path if not already
            if not os.path.isabs(file_pattern):
                file_pattern = os.path.join(src_dir, file_pattern)
            
            # Get matching files
            matching_files = glob.glob(file_pattern)
            
            if not matching_files:
                print(f"Warning: No files match pattern '{file_pattern}'")
                continue
            
            # Process each matching file
            for file_path in matching_files:
                if not os.path.isfile(file_path):
                    continue
                    
                file_name = os.path.basename(file_path)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        data = json.load(file)
                        
                        # Skip files that don't contain exam data
                        if not isinstance(data, list) or len(data) == 0:
                            print(f"Skipping {file_name}: Not an exam file format")
                            continue
                        
                        # Add exams to the list
                        all_exams.extend(data)
                        processed_files.append(file_name)
                        print(f"Added {len(data)} exams from {file_name}")
                        
                except Exception as e:
                    print(f"Error processing {file_name}: {str(e)}")
        
        # Limit number of exams if specified
        if limit > 0 and limit < len(all_exams):
            all_exams = all_exams[:limit]
            print(f"Limited output to {limit} exams")
    
    if not all_exams:
        print("No exams were found or loaded. Combination failed.")
        return False
    
    # Shuffle if requested
    if shuffle:
        random.shuffle(all_exams)
        print(f"Shuffled {len(all_exams)} exams")
    
    # Ensure output file has .json extension
    if not output_file.endswith('.json'):
        output_file += '.json'
    
    # Use absolute path if not already
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if not os.path.isabs(output_file):
        output_file = os.path.join(script_dir, output_file)
    
    # Write combined data to file
    try:
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(all_exams, file, ensure_ascii=False, indent=2)
        
        # Get distribution of exam types in output
        type_counts = {}
        for exam in all_exams:
            exam_type = exam.get('type', 'unknown')
            type_counts[exam_type] = type_counts.get(exam_type, 0) + 1
        
        # Format type distribution for message
        type_distribution = ", ".join([f"{t} ({c})" for t, c in type_counts.items()])
        
        print(f"\nSuccessfully combined {len(all_exams)} exams into {output_file}")
        print(f"Distribution: {type_distribution}")
        return True
    except Exception as e:
        print(f"Error writing output file: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Combine multiple exam JSON files into one')
    parser.add_argument('--list', action='store_true', help='List available exam files')
    parser.add_argument('--files', nargs='+', help='List of exam files to combine (supports wildcards)')
    parser.add_argument('--output', default='combined_exam.json', help='Output filename')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of exams in output (0 for unlimited)')
    parser.add_argument('--no-shuffle', action='store_true', help='Do not shuffle exams in output')
    parser.add_argument('--preset', action='store_true', 
                      help='Use preset distribution of exam types instead of selecting specific files')
    
    args = parser.parse_args()
    
    # Print preset distribution information
    if args.preset:
        print("\nPreset distribution:")
        for exam_type, count in PRESET_DISTRIBUTION.items():
            print(f"  - {exam_type}: {count} questions")
    
    # If list flag is set, just list available files and exit
    if args.list:
        list_exam_files()
        return
    
    # Check if files are specified when not using preset
    if not args.preset and not args.files:
        print("No exam files specified. Use --files option to specify files to combine.")
        print("Example: python combine_exams_cli.py --files Article.json Short_conversation.json")
        print("Use --list to see available files")
        print("Or use --preset to use the predefined distribution")
        return
    
    # Combine the exams
    combine_exams(
        exam_files=args.files if not args.preset else [], 
        output_file=args.output, 
        limit=args.limit if not args.preset else 0, 
        shuffle=not args.no_shuffle,
        use_preset=args.preset
    )

if __name__ == "__main__":
    main() 