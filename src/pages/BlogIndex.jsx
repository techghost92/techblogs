import { useEffect } from 'react';
import PostCard from '../components/PostCard.jsx';
import { getAllPosts } from '../lib/posts.js';

export default function BlogIndex() {
  useEffect(() => { document.title = 'Blog — coderscript.dev'; }, []);
  const posts = getAllPosts();

  return (
    <div className="archive-page">
      <div className="blog-section-header">
        <h2>All posts</h2>
      </div>
      {posts.length === 0 && <p className="empty-state">No posts yet — add one to src/content/posts/.</p>}
      <div className="post-grid">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
