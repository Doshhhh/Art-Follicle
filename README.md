# Clean version of the site

This is a reorganized version of the Tilda project with separated HTML, CSS, and JS files.

## Project structure

```
website_clean/
├── index.html                 # Главный HTML файл
├── assets/                    # Все статические ресурсы
│   ├── css/
│   │   ├── app/
│   │   │   └── site.css        # Main project styles
│   │   └── vendor/             # Tilda libraries (min.css)
│   ├── js/
│   │   ├── app/
│   │   │   └── site.js         # Main project scripts
│   │   └── vendor/             # Tilda libraries (min.js)
│   ├── images/                # All images
│   └── media/                 # Video/media
├── robots.txt                 # File for search robots
├── sitemap.xml                # Sitemap
├── 404.html                   # 404 error page
└── trash/                     # Archive of deleted/unnecessary files
```

## What was done

1. ✅ All inline `<style>` tags extracted into separate CSS files
2. ✅ All inline `<script>` tags extracted into separate JS files
3. ✅ All extracted files merged into `assets/css/app/site.css` and `assets/js/app/site.js`
4. ✅ HTML file updated to use merged files
5. ✅ Existing CSS and JS files copied
6. ✅ All images copied
7. ✅ HTML file cleaned and made readable
8. ✅ All resource paths preserved correctly

## How to work with the project

### Open the site locally
Simply open `index.html` in a browser or start a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if http-server is installed)
npx http-server

# PHP
php -S localhost:8000
```

Then open in browser: `http://localhost:8000`

### Editing

- **HTML**: Edit `index.html`
- **CSS**: Edit `assets/css/app/site.css` (main file)
  - `assets/css/vendor/` — Tilda libraries (better not to touch)
- **JavaScript**: Edit `assets/js/app/site.js` (main file)
  - `assets/js/vendor/` — Tilda libraries (better not to touch)

### Recommendations

1. **Deleted/unnecessary files** moved to `trash/` for rollback.

2. **Add your own files**:
   - Create `assets/css/app/main.css` for additional styles
   - Create `assets/js/app/main.js` for additional scripts
   - Connect them in `index.html` after `assets/css/app/site.css` and `assets/js/app/site.js`

3. **Do not edit minified Tilda files** — they will be overwritten on export

4. **Work with `site.css` and `site.js`** — these are the main files for customization

## Notes

- All files saved in UTF-8 encoding
- External scripts (with `src=`) remained connected as is
- HTML structure preserved, only inline styles and scripts removed

