'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlagProps {
  code: string;      // ISO code like 'es', 'ar', 'gb-eng'
  name?: string;
  emoji?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: boolean;
}

const SIZES = {
  xs: { px: 16, h: 'h-4', w: 'w-6' },
  sm: { px: 24, h: 'h-5', w: 'w-7' },
  md: { px: 32, h: 'h-6', w: 'w-9' },
  lg: { px: 48, h: 'h-8', w: 'w-12' },
  xl: { px: 64, h: 'h-10', w: 'w-16' },
};

// Special cases where flagcdn code differs from our code
const FLAG_OVERRIDES: Record<string, string> = {
  'gb-eng': 'gb-eng',
  'gb-sct': 'gb-sct',
};

export function Flag({ code, name, emoji, size = 'md', className, rounded = false }: FlagProps) {
  const { px, h, w } = SIZES[size];
  const flagCode = FLAG_OVERRIDES[code] ?? code.toLowerCase();
  const src = `https://flagcdn.com/${px}x${Math.round(px * 0.67)}/${flagCode}.png`;
  const src2x = `https://flagcdn.com/${px * 2}x${Math.round(px * 2 * 0.67)}/${flagCode}.png`;

  return (
    <span
      className={cn('inline-flex items-center justify-center overflow-hidden flex-shrink-0', h, w, rounded && 'rounded', className)}
      title={name}
      aria-label={name}
    >
      <Image
        src={src}
        alt={name ?? code}
        width={px}
        height={Math.round(px * 0.67)}
        className="w-full h-full object-cover"
        unoptimized
        onError={(e) => {
          // Fallback to emoji if image fails
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          if (emoji && target.parentElement) {
            target.parentElement.textContent = emoji;
            target.parentElement.style.fontSize = `${px * 0.6}px`;
          }
        }}
      />
    </span>
  );
}

// Compact flag + team name combination used throughout the app
interface TeamBadgeProps {
  code: string;
  name: string;
  shortName?: string;
  emoji?: string;
  size?: FlagProps['size'];
  className?: string;
  short?: boolean; // use shortName on mobile
}

export function TeamBadge({ code, name, shortName, emoji, size = 'md', className, short }: TeamBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
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
