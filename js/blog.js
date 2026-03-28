/* ============================================================
   BLOG ENGINE
   Reads posts from /blog/posts/*.md via fetch,
   parses frontmatter + markdown, renders to the page.
   ============================================================ */

// ---- Registry: add new posts here ----
const POST_REGISTRY = [
  { slug: 'building-in-public', file: '/blog/posts/building-in-public.md' },
  { slug: 'hello-world',        file: '/blog/posts/hello-world.md' },
  // Add more posts here as you write them
];

/* ---- Parse YAML-ish frontmatter ---- */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    // Tags: parse array
    if (val.startsWith('[')) {
      val = val.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    }
    meta[key] = val;
  });
  return { meta, body: match[2] };
}

/* ---- Format date ---- */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ---- Fetch & parse a single post ---- */
async function fetchPost(file) {
  try {
    const res = await fetch(file);
    if (!res.ok) return null;
    const raw = await res.text();
    return parseFrontmatter(raw);
  } catch {
    return null;
  }
}

/* ============================================================
   BLOG LIST PAGE  (blog.html)
   ============================================================ */
async function renderBlogList() {
  const container = document.getElementById('blog-list');
  if (!container) return;

  if (POST_REGISTRY.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✍️</div>
        <p>No posts yet — writing in progress.</p>
      </div>`;
    return;
  }

  container.innerHTML = '<p style="color:var(--fg-muted);font-size:13px">Loading posts…</p>';

  const posts = await Promise.all(
    POST_REGISTRY.map(async ({ slug, file }) => {
      const parsed = await fetchPost(file);
      return parsed ? { slug, ...parsed.meta } : null;
    })
  );

  const valid = posts
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!valid.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">✍️</div><p>No posts yet.</p></div>`;
    return;
  }

  container.innerHTML = valid.map(post => `
    <a class="blog-card reveal" href="/blog/post.html?slug=${post.slug}">
      <div class="blog-card-meta">
        <span>${formatDate(post.date)}</span>
        ${post.readtime ? `<span>· ${post.readtime}</span>` : ''}
        ${Array.isArray(post.tags) && post.tags.length
          ? post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')
          : ''}
      </div>
      <div class="blog-card-title">
        <span>${post.title || 'Untitled'}</span>
        <span class="blog-arrow">↗</span>
      </div>
      ${post.excerpt ? `<p class="blog-card-excerpt">${post.excerpt}</p>` : ''}
    </a>
  `).join('');

  // Re-trigger reveal for dynamically added cards
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
      }, { threshold: 0.08 });
      obs.observe(el);
    });
  }, 50);
}

/* ============================================================
   BLOG POST PAGE  (blog/post.html)
   ============================================================ */
async function renderBlogPost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) { container.innerHTML = '<p>Post not found.</p>'; return; }

  const entry = POST_REGISTRY.find(p => p.slug === slug);
  if (!entry) { container.innerHTML = '<p>Post not found.</p>'; return; }

  const parsed = await fetchPost(entry.file);
  if (!parsed) { container.innerHTML = '<p>Could not load post.</p>'; return; }

  const { meta, body } = parsed;

  // Render title area
  const titleEl = document.getElementById('post-title');
  const metaEl  = document.getElementById('post-meta');
  if (titleEl) titleEl.textContent = meta.title || 'Untitled';
  if (metaEl) {
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    metaEl.innerHTML = `
      <span>${formatDate(meta.date)}</span>
      ${meta.readtime ? `<span>· ${meta.readtime}</span>` : ''}
      ${tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}
    `;
    document.title = (meta.title || 'Post') + ' — Your Name';
  }

  // Render markdown (requires marked.js loaded before this script)
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    container.innerHTML = marked.parse(body);
  } else {
    container.textContent = body;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogList();
  renderBlogPost();
});
