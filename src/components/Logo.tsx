export function Logo({
  className = "",
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        {/* 6 nodes molecule */}
        <g fill="none" stroke="var(--ril-teal)" strokeWidth="1.5">
          <circle cx="20" cy="6" r="3.5" fill="var(--ril-teal-soft)" />
          <circle cx="33" cy="13" r="3.5" fill="var(--ril-teal-light)" />
          <circle cx="33" cy="27" r="3.5" fill="var(--ril-teal)" />
          <circle cx="20" cy="34" r="3.5" fill="var(--ril-sage)" />
          <circle cx="7" cy="27" r="3.5" fill="var(--ril-teal-light)" />
          <circle cx="7" cy="13" r="3.5" fill="var(--ril-teal-soft)" />
          <line x1="20" y1="6" x2="33" y2="13" />
          <line x1="33" y1="13" x2="33" y2="27" />
          <line x1="33" y1="27" x2="20" y2="34" />
          <line x1="20" y1="34" x2="7" y2="27" />
          <line x1="7" y1="27" x2="7" y2="13" />
          <line x1="7" y1="13" x2="20" y2="6" />
        </g>
      </svg>
      <div className="flex flex-col leading-none">
        <span
          className="font-condensed font-bold tracking-tight text-ril-ink text-2xl"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          RIL
        </span>
        {showTagline && (
          <span
            className="text-[9px] tracking-[0.2em] text-ril-ink-soft uppercase mt-0.5"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Argentina
          </span>
        )}
      </div>
    </div>
  );
}
