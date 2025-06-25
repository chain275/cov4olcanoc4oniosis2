import json
import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import random

class CombineExamsApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Combine Exams Tool")
        self.root.geometry("800x600")
        
        # Data storage
        self.exam_files = {}
        self.exams_data = {}
        self.selected_exams = []
        
        # Define preset distribution
        self.preset_distribution = {
            'short_conversation': 3,
            'long_conversation': 1,
            'advertisement': 2,
            'product': 2,
            'news_report': 2,
            'article': 2,
            'text_completion': 3,
            'paragraph': 5
        }
        
        # Create UI
        self.create_ui()
        
        # Load available exam files
        self.load_exam_files()
    
    def create_ui(self):
        # Create frames
        self.left_frame = ttk.Frame(self.root, padding=10)
        self.left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.right_frame = ttk.Frame(self.root, padding=10)
        self.right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Left frame - Available exams
        ttk.Label(self.left_frame, text="Available Exams", font=('Arial', 12, 'bold')).pack(anchor=tk.W, pady=(0, 10))
        
        # Search box
        self.search_var = tk.StringVar()
        self.search_var.trace("w", self.filter_available_exams)
        ttk.Label(self.left_frame, text="Search:").pack(anchor=tk.W)
        ttk.Entry(self.left_frame, textvariable=self.search_var).pack(fill=tk.X, pady=(0, 10))
        
        # Exam type filter
        ttk.Label(self.left_frame, text="Filter by Type:").pack(anchor=tk.W)
        self.type_var = tk.StringVar(value="All")
        self.type_combo = ttk.Combobox(self.left_frame, textvariable=self.type_var, state="readonly")
        self.type_combo.pack(fill=tk.X, pady=(0, 10))
        self.type_combo.bind("<<ComboboxSelected>>", self.filter_available_exams)
        
        # Available exams listbox with scrollbar
        ttk.Label(self.left_frame, text="Double-click to add:").pack(anchor=tk.W)
        self.available_frame = ttk.Frame(self.left_frame)
        self.available_frame.pack(fill=tk.BOTH, expand=True)
        
        self.available_scrollbar = ttk.Scrollbar(self.available_frame)
        self.available_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.available_listbox = tk.Listbox(self.available_frame, yscrollcommand=self.available_scrollbar.set)
        self.available_listbox.pack(fill=tk.BOTH, expand=True)
        self.available_scrollbar.config(command=self.available_listbox.yview)
        
        self.available_listbox.bind("<Double-1>", self.add_selected_exam)
        
        # Right frame - Selected exams
        ttk.Label(self.right_frame, text="Selected Exams", font=('Arial', 12, 'bold')).pack(anchor=tk.W, pady=(0, 10))
        
        # Selected exams listbox with scrollbar
        ttk.Label(self.right_frame, text="Double-click to remove:").pack(anchor=tk.W)
        self.selected_frame = ttk.Frame(self.right_frame)
        self.selected_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        self.selected_scrollbar = ttk.Scrollbar(self.selected_frame)
        self.selected_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.selected_listbox = tk.Listbox(self.selected_frame, yscrollcommand=self.selected_scrollbar.set)
        self.selected_listbox.pack(fill=tk.BOTH, expand=True)
        self.selected_scrollbar.config(command=self.selected_listbox.yview)
        
        self.selected_listbox.bind("<Double-1>", self.remove_selected_exam)
        
        # Preset distribution option
        self.use_preset_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(self.right_frame, text="Use preset distribution", variable=self.use_preset_var, 
                       command=self.toggle_preset_mode).pack(anchor=tk.W)
        
        # Preset distribution summary
        preset_text = "Preset: Short conversation (3), Long conversation (1), Advertisement (2), "
        preset_text += "Product (2), News report (2), Article (2), Text completion (3), Paragraph (5)"
        self.preset_label = ttk.Label(self.right_frame, text=preset_text, wraplength=350)
        self.preset_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Shuffle option
        self.shuffle_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(self.right_frame, text="Shuffle exams in final output", variable=self.shuffle_var).pack(anchor=tk.W)
        
        # Output file name
        ttk.Label(self.right_frame, text="Output File Name:").pack(anchor=tk.W, pady=(10, 0))
        self.output_name_var = tk.StringVar(value="combined_exam.json")
        ttk.Entry(self.right_frame, textvariable=self.output_name_var).pack(fill=tk.X)
        
        # Number of exams section
        self.num_exams_frame = ttk.Frame(self.right_frame)
        self.num_exams_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Label(self.num_exams_frame, text="Number of exams to include (0 for all):").pack(anchor=tk.W)
        self.num_exams_var = tk.StringVar(value="0")
        self.num_exams_entry = ttk.Entry(self.num_exams_frame, textvariable=self.num_exams_var)
        self.num_exams_entry.pack(fill=tk.X)
        
        # Button frame
        button_frame = ttk.Frame(self.right_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(button_frame, text="Combine Exams", command=self.combine_exams).pack(side=tk.RIGHT)
        ttk.Button(button_frame, text="Clear Selection", command=self.clear_selection).pack(side=tk.RIGHT, padx=5)
    
    def toggle_preset_mode(self):
        """Handle UI changes when preset mode is toggled"""
        if self.use_preset_var.get():
            # If preset is enabled, disable manual selection
            self.available_listbox.configure(state=tk.DISABLED)
            self.selected_listbox.configure(state=tk.DISABLED)
            self.num_exams_entry.configure(state=tk.DISABLED)
            # Clear selected exams since we'll use preset
            self.clear_selection()
        else:
            # If preset is disabled, enable manual selection
            self.available_listbox.configure(state=tk.NORMAL)
            self.selected_listbox.configure(state=tk.NORMAL)
            self.num_exams_entry.configure(state=tk.NORMAL)
    
    def load_exam_files(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        src_dir = os.path.join(script_dir, 'data')
        
        # Get all JSON files in src directory
        json_files = [f for f in os.listdir(src_dir) if f.endswith('.json')]
        
        # Load metadata for each file
        exam_types = ["All"]
        
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
                    if exam_type not in exam_types:
                        exam_types.append(exam_type)
                    
                    # Store file data
                    self.exam_files[json_file] = {
                        'path': file_path,
                        'type': exam_type,
                        'count': len(data)
                    }
                    
                    # Store in memory to avoid loading multiple times
                    self.exams_data[json_file] = data
                    
            except Exception as e:
                print(f"Error loading {json_file}: {str(e)}")
        
        # Update type combobox
        self.type_combo['values'] = exam_types
        
        # Update available listbox
        self.update_available_listbox()
    
    def update_available_listbox(self):
        self.available_listbox.delete(0, tk.END)
        
        for file_name, info in self.exam_files.items():
            self.available_listbox.insert(tk.END, f"{file_name} ({info['count']} exams, {info['type']})")
    
    def filter_available_exams(self, *args):
        search_term = self.search_var.get().lower()
        selected_type = self.type_var.get()
        
        self.available_listbox.delete(0, tk.END)
        
        for file_name, info in self.exam_files.items():
            # Apply type filter
            if selected_type != "All" and info['type'] != selected_type:
                continue
            
            # Apply search filter
            if search_term and search_term not in file_name.lower():
                continue
            
            # Display item
            self.available_listbox.insert(tk.END, f"{file_name} ({info['count']} exams, {info['type']})")
    
    def add_selected_exam(self, event):
        # Get selected item
        if not self.available_listbox.curselection():
            return
        
        selected_idx = self.available_listbox.curselection()[0]
        selected_text = self.available_listbox.get(selected_idx)
        
        # Extract filename from display text
        file_name = selected_text.split(" (")[0]
        
        # Add to selected exams if not already there
        if file_name not in self.selected_exams:
            self.selected_exams.append(file_name)
            self.selected_listbox.insert(tk.END, selected_text)
    
    def remove_selected_exam(self, event):
        # Get selected item
        if not self.selected_listbox.curselection():
            return
        
        selected_idx = self.selected_listbox.curselection()[0]
        selected_text = self.selected_listbox.get(selected_idx)
        
        # Extract filename from display text
        file_name = selected_text.split(" (")[0]
        
        # Remove from selected exams
        if file_name in self.selected_exams:
            self.selected_exams.remove(file_name)
            self.selected_listbox.delete(selected_idx)
    
    def clear_selection(self):
        self.selected_exams = []
        self.selected_listbox.delete(0, tk.END)
    
    def apply_preset_distribution(self):
        """Select exams according to preset distribution"""
        all_exams = []
        type_counts = {exam_type: 0 for exam_type in self.preset_distribution.keys()}
        
        # Create a dictionary to organize exams by type
        exams_by_type = {exam_type: [] for exam_type in self.preset_distribution.keys()}
        
        # Collect all exams from all files and organize by type
        for file_name, exams in self.exams_data.items():
            for exam in exams:
                exam_type = exam.get('type', 'unknown')
                if exam_type in exams_by_type:
                    exams_by_type[exam_type].append(exam)
        
        # Randomly select the required number of exams for each type
        selected_exams = []
        missing_types = []
        
        for exam_type, count in self.preset_distribution.items():
            available_exams = exams_by_type[exam_type]
            
            if not available_exams:
                missing_types.append(exam_type)
                continue
                
            # Shuffle available exams of this type
            random.shuffle(available_exams)
            
            # Take required number or all available if less
            selected_count = min(count, len(available_exams))
            selected_exams.extend(available_exams[:selected_count])
            
            if selected_count < count:
                print(f"Warning: Only {selected_count} exams of type '{exam_type}' available, {count} requested")
        
        # Show warning if any types are missing
        if missing_types:
            messagebox.showwarning("Missing Exam Types", 
                                 f"No exams found for types: {', '.join(missing_types)}")
        
        return selected_exams
    
    def combine_exams(self):
        try:
            all_exams = []
            
            if self.use_preset_var.get():
                # Use preset distribution
                all_exams = self.apply_preset_distribution()
            else:
                # Use manually selected exams
                if not self.selected_exams:
                    messagebox.showwarning("No Exams Selected", "Please select at least one exam file.")
                    return
                
                # Collect all exams from selected files
                for file_name in self.selected_exams:
                    exams = self.exams_data[file_name]
                    all_exams.extend(exams)
                
                # Limit number of exams if specified
                try:
                    num_exams = int(self.num_exams_var.get())
                    if num_exams > 0 and num_exams < len(all_exams):
                        all_exams = all_exams[:num_exams]
                except ValueError:
                    pass  # Ignore invalid number
            
            if not all_exams:
                messagebox.showwarning("No Exams", "No exams could be selected with the current settings.")
                return
            
            # Shuffle if requested (for both preset and manual modes)
            if self.shuffle_var.get():
                random.shuffle(all_exams)
            
            # Get output file path
            output_name = self.output_name_var.get()
            if not output_name.endswith('.json'):
                output_name += '.json'
            
            script_dir = os.path.dirname(os.path.abspath(__file__))
            output_path = os.path.join(script_dir, output_name)
            
            # Write combined data to file
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(all_exams, file, ensure_ascii=False, indent=2)
            
            # Get distribution of exam types in output
            type_counts = {}
            for exam in all_exams:
                exam_type = exam.get('type', 'unknown')
                type_counts[exam_type] = type_counts.get(exam_type, 0) + 1
            
            # Format type distribution for message
            type_distribution = ", ".join([f"{t} ({c})" for t, c in type_counts.items()])
            
            messagebox.showinfo("Success", 
                              f"Combined {len(all_exams)} exams into {output_name}\n\n"
                              f"Distribution: {type_distribution}")
            
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")

def main():
    root = tk.Tk()
    app = CombineExamsApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 