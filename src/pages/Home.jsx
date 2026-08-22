import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/LogoMark.jsx';
import PostCard from '../components/PostCard.jsx';
import { getAllPosts } from '../lib/posts.js';

export default function Home() {
  useEffect(() => {
    document.title = 'your-domain.com';
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">a blog for people who read code out loud</div>
          <h1>Debugging<br />out loud.</h1>
          <p className="lede">
            Writing things down is the cheapest debugger I know. Half the bugs
            I've fixed, I fixed while typing out the problem for someone else
            — usually before I finished the sentence.
          </p>
          <div className="hero-actions">
            <Link to="/blog" className="btn-primary">Read the blog →</Link>
            <a href="#subscribe" className="btn-secondary">Subscribe</a>
          </div>
        </div>
        <div className="hero-mark">
          <LogoMark size={280} />
        </div>
      </section>

      <section id="about" className="about-quote">
        <div className="eyebrow">why this exists</div>
        <p>"Not because the world needs another one — but because writing things down is the cheapest debugger I know."</p>
      </section>

      <section className="blog-section">
        <div className="blog-section-header">
          <h2>Latest posts</h2>
          <Link to="/blog">View all →</Link>
        </div>
        {posts.length === 0 && <p className="empty-state">No posts yet — add one to src/content/posts/.</p>}
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section id="subscribe" className="subscribe-section">
        <div className="subscribe-box">
          <div>
            <h2>Get new posts in your inbox</h2>
            <p>No spam, just the bugs worth writing about.</p>
          </div>
          {/* Visual only for now — wire this up to a real provider
              (Buttondown, ConvertKit, Mailchimp, etc.) when you're ready */}
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@email.com" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
