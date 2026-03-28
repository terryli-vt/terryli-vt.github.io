# Personal Portfolio — GitHub Pages

Minimal personal portfolio site. Pure HTML/CSS/JS — no build step, no framework.

## File Structure

```
portfolio/
├── index.html              ← Home page
├── css/
│   └── style.css           ← All styles (design tokens, components)
├── js/
│   ├── main.js             ← Theme toggle, nav, scroll reveal
│   └── blog.js             ← Blog engine (markdown rendering)
├── pages/
│   ├── projects.html       ← Projects page
│   ├── blog.html           ← Blog list page
│   └── about.html          ← About page
├── blog/
│   ├── post.html           ← Single post reader
│   └── posts/
│       └── hello-world.md  ← Example post
└── assets/
    ├── resume.pdf          ← Add your resume here
    └── avatar.jpg          ← Add your photo here (optional)
```

---

## Setup & Deploy

### 1. Publish to GitHub Pages

```bash
# Create a repo named: yourusername.github.io
git init
git add .
git commit -m "init"
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

Your site is live at `https://yourusername.github.io` within a minute.

### 2. Custom domain (optional)

Add a `CNAME` file to the root containing your domain:

```
yourname.dev
```

Then point your DNS to `185.199.108.153` (GitHub Pages IP).

---

## Customisation

### Logo Creation

[ideogram.ai](https://ideogram.ai) to create logo style in png, then

[recraft.ai](https://recraft.ai) to convert image to svg

### Personal info

Search for `Your Name`, `yourusername`, `you@example.com`, `yourprofile` across all files and replace them.

### Accent color

In `css/style.css`, find `--accent: #3d6b4f` and change to any color you like.

### Skills

In `index.html`, edit the `.skill-item` blocks.
Icons come from [Simple Icons CDN](https://simpleicons.org/) — swap the slug in the URL:

```html
<img src="https://cdn.simpleicons.org/SLUG/COLOR" />
```

### Projects

In `pages/projects.html`, duplicate the `.project-detail` block for each project.
To add screenshots: place images in `assets/screenshots/` and update the `<img src>`.

### Blog posts

**Step 1** — Create a markdown file in `blog/posts/`:

```markdown
---
title: "Your Post Title"
date: "2025-04-01"
excerpt: "Short preview shown on the list page."
tags: ["engineering"]
readtime: "4 min read"
---

Your markdown content here...
```

**Step 2** — Register it in `js/blog.js`:

```js
const POST_REGISTRY = [
  { slug: "hello-world", file: "/blog/posts/hello-world.md" },
  { slug: "your-new-post", file: "/blog/posts/your-new-post.md" },
];
```

That's it. The blog engine fetches and renders the markdown automatically.

---

## Light/Dark Mode

Stored in `localStorage`. Respects `prefers-color-scheme` on first visit.
All colors are CSS custom properties in `:root` and `[data-theme="dark"]`.

---

## Local Development

No build step needed. Just open `index.html` in a browser.

For the blog (which uses `fetch()`), you need a local server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.
