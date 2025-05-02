# Images for Exam Questions

This directory contains images used in exam questions. The image URLs in the exam data (exams.json) should point to files in this directory.

## Adding Images

1. Place image files in this directory
2. Reference them in the exam data using the path format: `/images/filename.jpg`
3. Images should ideally be:
   - Optimized for web (compressed JPG, PNG, or WebP)
   - Maximum dimensions of 800x600px recommended
   - File size under 200KB when possible

## Example Usage in exams.json

```json
{
  "questions": [
    {
      "text": "What does this image show?",
      "image": "/images/vocabulary-image1.jpg",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option C"
    }
  ]
}
```

## Supported Image Types

- JPG/JPEG
- PNG
- WebP
- GIF (non-animated recommended)
- SVG 