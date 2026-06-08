import { Key } from "lucide-react";
import kawaiiKiwi from "@/assets/kawaii-kiwi.png";

type Props = {
  className?: string;
  imgClassName?: string;
  keyClassName?: string;
  alt?: string;
  width?: number;
  height?: number;
};

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
      <Key
        aria-hidden
        strokeWidth={2.5}
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground drop-shadow ${keyClassName ?? ""}`}
      />
    </span>
  );
}
