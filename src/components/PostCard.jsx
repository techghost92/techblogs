import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="post-card">
      <div className="title">{post.title}</div>
      {post.excerpt && <div className="excerpt">{post.excerpt}</div>}
      <div className="meta">
        {formatDate(post.date)}
        {post.tag ? ` · ${post.tag}` : ` · ${post.readingTime} min read`}
      </div>
    </Link>
  );
}
