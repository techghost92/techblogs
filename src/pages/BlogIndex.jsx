import { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { getAllPosts, getPostsByTag, getTagCounts } from '../lib/posts.js';
import { ALLOWED_TAGS } from '../lib/tags.js';

const PAGE_SIZE = 10;

// Windowed page list: first, last, current ± 1, with '...' for gaps.
// Keeps the control usable even with 100+ pages instead of listing every one.
function getPageNumbers(current, total) {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) pages.push(i);
  }
  const withGaps = [];
  let prev;
  for (const p of pages) {
    if (prev && p - prev === 2) withGaps.push(prev + 1);
    else if (prev && p - prev > 2) withGaps.push('…');
    withGaps.push(p);
    prev = p;
  }
  return withGaps;
}

export default function BlogIndex() {
  const { tag } = useParams();
  const [searchParams] = useSearchParams();
  const basePath = tag ? `/blog/tag/${tag}` : '/blog';

  useEffect(() => {
    document.title = tag ? `${tag} — coderscript.dev` : 'Blog — coderscript.dev';
  }, [tag]);

  const counts = getTagCounts();
  const posts = tag ? getPostsByTag(tag) : getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const requestedPage = Number(searchParams.get('page')) || 1;
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const visiblePosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="archive-page">
      <div className="archive-layout">
        <aside className="tag-sidebar">
          <div className="tag-sidebar-title">Tags</div>
          <nav className="tag-list">
            <Link to="/blog" className={`tag-item${!tag ? ' active' : ''}`}>
              All posts
            </Link>
            {ALLOWED_TAGS.filter((t) => counts[t] > 0).map((t) => (
              <Link
                key={t}
                to={`/blog/tag/${t}`}
                className={`tag-item${tag === t ? ' active' : ''}`}
              >
                {t}
                <span className="tag-count">{counts[t]}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="archive-main">
          <div className="blog-section-header">
            <h2>{tag ? `Tagged "${tag}"` : 'All posts'}</h2>
          </div>
          {posts.length === 0 && (
            <p className="empty-state">
              {tag ? `No posts tagged "${tag}" yet.` : 'No posts yet — add one to src/content/posts/.'}
            </p>
          )}
          <div className="post-grid">
            {visiblePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              {currentPage > 1 && (
                <Link to={`${basePath}?page=${currentPage - 1}`} className="page-link">
                  ← Prev
                </Link>
              )}
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="page-ellipsis">…</span>
                ) : (
                  <Link
                    key={p}
                    to={`${basePath}?page=${p}`}
                    className={`page-link${p === currentPage ? ' active' : ''}`}
                  >
                    {p}
                  </Link>
                )
              )}
              {currentPage < totalPages && (
                <Link to={`${basePath}?page=${currentPage + 1}`} className="page-link">
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
