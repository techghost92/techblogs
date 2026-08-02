import { NavLink } from 'react-router-dom';
import LogoMark from './LogoMark.jsx';

export default function Header() {
  return (
    <nav className="site-nav-bar">
      <NavLink to="/" className="brand-lockup">
        <LogoMark size={34} />
        coderscript<span className="accent">.dev</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/#about">About</NavLink>
        <NavLink to="/#subscribe">Subscribe</NavLink>
      </div>
    </nav>
  );
}
