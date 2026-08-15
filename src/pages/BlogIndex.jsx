import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import { getAllPosts, getPostsByTag, getTagCounts } from '../lib/posts.js';
import { ALLOWED_TAGS } from '../lib/tags.js';

export default function BlogIndex() {
  const { tag } = useParams();
  useEffect(() => {
    document.title = tag ? `${tag} — coderscript.dev` : 'Blog — coderscript.dev';
  }, [tag]);

  const counts = getTagCounts();
  const posts = tag ? getPostsByTag(tag) : getAllPosts();

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
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
