export default function LogoMark({ size = 34, color = '#4F46E5' }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M65,67 L100,100 L65,133" stroke={color} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="118" y="90" width="24" height="20" rx="3" fill={color} />
    </svg>
  );
}
