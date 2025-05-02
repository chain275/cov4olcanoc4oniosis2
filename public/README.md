# English Exam Website

## Header and Footer Management

This website uses a component-based approach for header and footer management. This means you can edit the header and footer in a single place, and the changes will apply to all pages.

### How it Works

1. The header content is stored in `header.html`
2. The footer content is stored in `footer.html`
3. Each page includes these components using JavaScript
4. The `include.js` file handles loading these components into each page

### How to Edit the Header or Footer

1. To modify the header, edit the `header.html` file
2. To modify the footer, edit the `footer.html` file
3. The changes will automatically appear on all pages that use these components

### How to Create a New Page

1. Copy the `template.html` file and rename it
2. Modify the content in the `<main>` section
3. Keep the `<div data-include="header"></div>` and `<div data-include="footer"></div>` elements
4. Make sure to include the scripts at the bottom:
   ```html
   <script src="include.js"></script>
   <script src="scripts.js"></script>
   ```

### Notes

- The system automatically highlights the current page in the navigation
- If you add new dropdown menus to the header, the JavaScript will handle their functionality
- If you need to add page-specific styles, add them in the `<head>` section of that page

## Troubleshooting

If components don't load properly:

1. Make sure the page includes `include.js` before any other scripts
2. Check that the `header.html` and `footer.html` files exist and are in the same directory as your HTML pages
3. Ensure there are elements with `data-include="header"` and `data-include="footer"` attributes
4. Check the browser console for any error messages 