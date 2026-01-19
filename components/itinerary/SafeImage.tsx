"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

type SafeImageProps = {
  src?: string;
  alt?: string;
  fallbackTitle?: string;
  aspectClassName?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

export function SafeImage({
  src,
  alt,
  fallbackTitle,
  aspectClassName = "aspect-[4/3]",
  className,
  imageClassName,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = useMemo(() => (src ?? "").trim(), [src]);
  const resolvedAlt = alt?.trim() || fallbackTitle?.trim() || "Itinerary image";
  const showFallback = !normalizedSrc || hasError;

  return (
    <div className={`relative ${aspectClassName} ${className ?? ""}`}>
      {showFallback ? (
        <div
          role="img"
          aria-label={resolvedAlt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-gradient-to-br from-primary/20 via-muted/40 to-primary/10 px-4 text-center"
        >
          <div className="rounded-full border border-primary/20 bg-background/70 p-2 text-primary/70 shadow-sm">
            <ImageOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="text-sm font-semibold text-foreground/80">
            {fallbackTitle ?? "Image unavailable"}
          </div>
        </div>
      ) : (
        <Image
          src={normalizedSrc}
          alt={resolvedAlt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imageClassName ?? ""}`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
