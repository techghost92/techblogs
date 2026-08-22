import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getPostBySlug } from '../lib/posts.js';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    if (post) document.title = `${post.title} — your-domain.com`;
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="article-page">
      <div className="article-meta">
        {post.author && `By ${post.author} · `}
        {formatDate(post.date)}
        {post.tag ? ` · ${post.tag}` : ` · ${post.readingTime} min read`}
      </div>
      <h1>{post.title}</h1>

      {/* Content comes from local markdown files this site owns, not
          user input, so rendering it as HTML here is safe. */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }} />

      <Link className="back-link" to="/blog">← back to all posts</Link>
    </div>
  );
}
