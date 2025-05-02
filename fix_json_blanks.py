import re
import json

test_str = '''
[
  {
    "id": "A-Level English No.49",
    "title": "Speaking (49)",
    "description": "A-Level อังกฤษพาร์ท Short Conversation 49",
    "subtitle": "\\nMia: Hey, Liam! Have you heard about that new indie band everyone's talking about?  \\nLiam: Not yet. What's ____()____ ?  \\nMia: They're called Velvet Echoes. Their music has this ____()____  of jazz and electronic beats.  \\nLiam: Interesting! How'd you ____()____  them?  \\nMia: My cousin ____()____  their EP last week. I've had their tracks on repeat since!  \\nLiam: I need to check them out. Got a playlist link?  \\nMia: Sure! I'll send it now. Let me know what you think.  \\nLiam: ____()____ . If I like their sound, maybe we could…  \\nMia: ____()____ ?  \\nLiam: …go to their gig next month? Tickets go on sale tomorrow.  \\nMia: ____()____ ! I'll set a reminder.  \\n\\n",
    "duration": 30,
    "totalQuestions": 4,
    "questions": [
      {
        "id": 1,
        "type": "speaking",
        "text": "",
        "prompt": "",
        "options": [
          " unique mixture between  ",
          " unique blend of  ",
          " rare combination with  ",
          " strange fusion among  "
        ],
        "correctAnswer": 1,
        "image": ""
      },
      {
        "id": 2,
        "type": "speaking",
        "text": "",
        "prompt": "",
        "options": [
          " come across  ",
          " came across  ",
          " check off  ",
          " checked off  "
        ],
        "correctAnswer": 1
      },
      {
        "id": 3,
        "type": "speaking",
        "text": "",
        "prompt": "",
        "options": [
          " That's cool. Anyway, how's your day?  ",
          " Absolutely! I'm already hooked.  ",
          " That's awesome! I'll listen tonight.  ",
          " Hmm, maybe. I'm not sure.  "
        ],
        "correctAnswer": 2
      },
      {
        "id": 4,
        "type": "speaking",
        "text": "",
        "prompt": "",
        "options": [
          " I'm not into live shows  ",
          " That sounds perfect  ",
          " Let's wait for reviews  ",
          " Concerts are too loud  "
        ],
        "correctAnswer": 1
      }
    ],
    "type": "short_conversation"
  }
]
'''

# Method 1: Parse JSON approach
try:
    # Parse the JSON
    data = json.loads(test_str.strip())
    
    counter = 0
    
    # Function to replace blanks
    def replace_blank(match):
        global counter
        counter += 1
        return f'____({counter})____'
    
    # Process each item's subtitle field
    for item in data:
        if "subtitle" in item:
            item["subtitle"] = re.sub(r'_{3,}\(\)_{3,}', replace_blank, item["subtitle"])
    
    # Convert back to JSON with proper formatting
    modified_str = json.dumps(data, indent=2, ensure_ascii=False)
    
    # Save the modified string to a file
    with open('modified_test_str.txt', "w", encoding="utf-8") as f:
        f.write(modified_str)
    print(f"Modified string saved to modified_test_str.txt with {counter} blanks numbered")
    
except json.JSONDecodeError as e:
    print(f"JSON parsing failed: {e}")
    
    # Method 2: Simple regex approach without parsing JSON
    counter = 0
    
    def simple_replace_blank(match):
        global counter
        counter += 1
        return f'____({counter})____'
    
    # Replace only in the parts where blanks are found
    modified_str = re.sub(r'_{3,}\(\)_{3,}', simple_replace_blank, test_str)
    
    with open('modified_test_str.txt', "w", encoding="utf-8") as f:
        f.write(modified_str)
    print(f"Used simple regex method. Modified string saved with {counter} blanks numbered") 