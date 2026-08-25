// Solid squircle badge with a white terminal-prompt glyph (chevron + cursor
// block) — reads clearly down to favicon size, where a thin outline mark
// loses definition. `color` sets the badge fill; the glyph stays white for
// contrast against it.
export default function LogoMark({ size = 34, color = '#4F46E5' }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <rect x="8" y="8" width="184" height="184" rx="52" fill={color} />
      <path d="M62,64 L104,100 L62,136" fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="120" y="88" width="26" height="22" rx="4" fill="#fff" />
    </svg>
  );
}
