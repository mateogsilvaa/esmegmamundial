'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlagProps {
  code: string;      // ISO 3166-1 alpha-2 like 'es', 'ar', or 'gb-eng'
  name?: string;
  emoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: boolean;
}

// CSS classes per size
const SIZE_CLASSES: Record<string, string> = {
  xs: 'h-4 w-5',
  sm: 'h-5 w-7',
  md: 'h-6 w-9',
  lg: 'h-8 w-12',
  xl: 'h-10 w-16',
};

// flagcdn.com width for each size
const FLAG_WIDTH: Record<string, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export function Flag({ code, name, emoji, size = 'md', className, rounded = false }: FlagProps) {
  const [failed, setFailed] = useState(false);
  const cls  = SIZE_CLASSES[size];
  const w    = FLAG_WIDTH[size];
  // flagcdn.com uses lowercase, dash separator (e.g. gb-eng, gb-sct)
  const flagCode = code.toLowerCase();
  const src  = `https://flagcdn.com/w${w}/${flagCode}.png`;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center overflow-hidden flex-shrink-0 select-none',
        cls,
        rounded && 'rounded',
        className,
      )}
      title={name}
      aria-label={name}
    >
      {failed ? (
        <span
          className="text-center leading-none"
          style={{ fontSize: Math.max(8, w * 0.5) }}
          role="img"
          aria-label={name}
        >
          {emoji ?? '🏳️'}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? code}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

// ─── TeamBadge: flag + name, responsive ──────────────────────────────────────

interface TeamBadgeProps {
  code: string;
  name: string;
  shortName?: string;
  emoji?: string;
  size?: FlagProps['size'];
  className?: string;
  short?: boolean;
}

export function TeamBadge({
  code, name, shortName, emoji, size = 'sm', className, short,
}: TeamBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 min-w-0', className)}>
      <Flag code={code} name={name} emoji={emoji} size={size} rounded />
      <span className="font-medium leading-none truncate">
        {short && shortName ? (
          <>
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{shortName}</span>
          </>
        ) : name}
      </span>
    </span>
  );
}
