import LogoMark from './LogoMark.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <LogoMark size={24} color="#6b7094" />
        <span>© {year} your-domain.com</span>
      </div>
      <div className="footer-links">
        <a href="https://www.instagram.com/your-domain.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="mailto:contact@your-domain.com">Email</a>
      </div>
    </footer>
  );
}
