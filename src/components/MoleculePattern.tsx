export function MoleculePattern({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      style={{ opacity }}
    >
      <g
        fill="none"
        stroke="var(--ril-ink-soft)"
        strokeWidth="1"
        opacity="0.4"
      >
        <path d="M 80 200 Q 60 140 120 100 Q 180 60 220 110 Q 260 160 200 200 Q 140 240 200 280 Q 260 320 320 280 Q 360 240 320 180" />
        <path d="M 150 80 Q 200 140 150 200 Q 100 260 150 320" />
      </g>
      <g>
        <circle cx="120" cy="100" r="38" fill="var(--ril-teal-soft)" opacity="0.55" />
        <circle cx="220" cy="110" r="32" fill="var(--ril-teal-light)" opacity="0.5" />
        <circle cx="320" cy="180" r="40" fill="var(--ril-sage)" opacity="0.4" />
        <circle cx="200" cy="200" r="36" fill="var(--ril-teal)" opacity="0.45" />
        <circle cx="280" cy="280" r="34" fill="var(--ril-teal-light)" opacity="0.5" />
        <circle cx="150" cy="200" r="30" fill="var(--ril-teal-soft)" opacity="0.55" />
        <circle cx="170" cy="300" r="26" fill="var(--ril-sage)" opacity="0.5" />
      </g>
    </svg>
  );
}

export function MiniMolecule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" stroke="var(--ril-teal)" strokeWidth="1.5" opacity="0.7">
        <circle cx="50" cy="15" r="10" fill="var(--ril-teal-soft)" />
        <circle cx="82" cy="35" r="10" fill="var(--ril-teal-light)" />
        <circle cx="82" cy="65" r="10" fill="var(--ril-teal)" />
        <circle cx="50" cy="85" r="10" fill="var(--ril-sage)" />
        <circle cx="18" cy="65" r="10" fill="var(--ril-teal-light)" />
        <circle cx="18" cy="35" r="10" fill="var(--ril-teal-soft)" />
        <line x1="50" y1="15" x2="82" y2="35" />
        <line x1="82" y1="35" x2="82" y2="65" />
        <line x1="82" y1="65" x2="50" y2="85" />
        <line x1="50" y1="85" x2="18" y2="65" />
        <line x1="18" y1="65" x2="18" y2="35" />
        <line x1="18" y1="35" x2="50" y2="15" />
      </g>
    </svg>
  );
}

export function LighthouseLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="var(--ril-ink-soft)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      >
        {/* rays */}
        <line x1="100" y1="20" x2="100" y2="0" />
        <line x1="70" y1="30" x2="55" y2="15" />
        <line x1="130" y1="30" x2="145" y2="15" />
        <line x1="55" y1="50" x2="35" y2="45" />
        <line x1="145" y1="50" x2="165" y2="45" />
        {/* top dome */}
        <path d="M 88 30 Q 100 18 112 30 L 112 45 L 88 45 Z" />
        {/* light room */}
        <rect x="85" y="45" width="30" height="22" />
        <line x1="92" y1="45" x2="92" y2="67" />
        <line x1="100" y1="45" x2="100" y2="67" />
        <line x1="108" y1="45" x2="108" y2="67" />
        {/* platform */}
        <rect x="80" y="67" width="40" height="6" />
        {/* tower */}
        <path d="M 84 73 L 76 180 L 124 180 L 116 73 Z" />
        <line x1="80" y1="105" x2="120" y2="105" />
        <line x1="78" y1="140" x2="122" y2="140" />
        <rect x="94" y="115" width="12" height="18" />
        {/* base */}
        <path d="M 70 180 L 130 180 L 138 200 L 62 200 Z" />
        {/* ground */}
        <path d="M 30 200 Q 60 205 100 200 Q 140 195 180 200" />
        <path d="M 20 215 Q 70 225 130 215 Q 170 210 195 220" />
        {/* small houses left */}
        <path d="M 30 195 L 30 180 L 38 172 L 46 180 L 46 195 Z" />
        <path d="M 50 195 L 50 178 L 56 170 L 62 178 L 62 195 Z" />
        {/* windmill right */}
        <line x1="160" y1="195" x2="160" y2="155" />
        <line x1="160" y1="155" x2="172" y2="148" />
        <line x1="160" y1="155" x2="148" y2="148" />
        <line x1="160" y1="155" x2="160" y2="142" />
      </g>
    </svg>
  );
}
