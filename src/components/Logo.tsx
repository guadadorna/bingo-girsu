import Image from "next/image";

const ASPECT = 2130 / 1346;

export function Logo({
  className = "",
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  const height = showTagline ? 48 : 36;
  const width = Math.round(height * ASPECT);

  return (
    <div className={`inline-flex flex-col leading-none ${className}`}>
      <Image
        src="/RIL_logo.png"
        alt="RIL — Red de Innovación Local"
        width={width}
        height={height}
        priority
        sizes={`${width}px`}
        style={{ width: "auto", height }}
      />
      {showTagline && (
        <span
          className="text-[9px] tracking-[0.2em] text-ril-ink-soft uppercase mt-1.5"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Red de Innovación Local
        </span>
      )}
    </div>
  );
}
