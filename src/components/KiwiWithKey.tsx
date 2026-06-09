import kawaiiKiwi from "@/assets/kawaii-kiwi.png";

type Props = {
  className?: string;
  imgClassName?: string;
  keyClassName?: string;
  alt?: string;
  width?: number;
  height?: number;
};

function KawaiiKey({ className }: { className?: string }) {
  // Cute chibi key: round bow with a smiling face + rounded teeth.
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* shaft */}
      <rect x="29" y="26" width="6" height="22" rx="3" fill="#FFD23F" stroke="#3a2a14" strokeWidth="2" />
      {/* teeth */}
      <rect x="35" y="38" width="7" height="4" rx="1.5" fill="#FFD23F" stroke="#3a2a14" strokeWidth="2" />
      <rect x="35" y="44" width="5" height="4" rx="1.5" fill="#FFD23F" stroke="#3a2a14" strokeWidth="2" />
      {/* bow */}
      <circle cx="32" cy="20" r="13" fill="#FFD23F" stroke="#3a2a14" strokeWidth="2.5" />
      {/* inner hole highlight */}
      <circle cx="32" cy="20" r="3" fill="#fff7d6" stroke="#3a2a14" strokeWidth="1.5" />
      {/* face */}
      <circle cx="27" cy="22" r="1.3" fill="#3a2a14" />
      <circle cx="37" cy="22" r="1.3" fill="#3a2a14" />
      <path d="M28.5 25.5 Q32 28 35.5 25.5" stroke="#3a2a14" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* blush */}
      <circle cx="24.5" cy="24.5" r="1.6" fill="#ff9bb3" opacity="0.85" />
      <circle cx="39.5" cy="24.5" r="1.6" fill="#ff9bb3" opacity="0.85" />
      {/* sparkle */}
      <circle cx="25" cy="15" r="1" fill="#fff" />
    </svg>
  );
}

export function KiwiWithKey({
  className,
  imgClassName,
  keyClassName,
  alt = "",
  width = 160,
  height = 160,
}: Props) {
  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <img
        src={kawaiiKiwi}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName}
      />
      {/* Centered on the kiwi */}
      <KawaiiKey
        className={`pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 drop-shadow-sm ${keyClassName ?? ""}`}
      />
    </span>
  );
}
