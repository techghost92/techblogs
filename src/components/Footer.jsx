import LogoMark from './LogoMark.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <LogoMark size={24} color="#6b7094" />
        <span>© {year} coderscript.dev</span>
      </div>
      <div className="footer-links">
        {/* TODO: replace with your real profile URLs */}
        <a href="https://instagram.com/coderscript.dev" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://github.com/onkar3003" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="mailto:hello@coderscript.dev">Email</a>
      </div>
    </footer>
  );
}
