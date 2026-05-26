'use client';

import { cn } from '@/lib/utils';

interface ScoreInputProps {
  value: number | '';
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function ScoreInput({ value, onChange, disabled, className, size = 'md' }: ScoreInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0 && n <= 20) onChange(n);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'tabular text-center font-bold rounded-lg border border-zinc-200 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent',
        'disabled:opacity-40 disabled:bg-zinc-50 disabled:cursor-not-allowed',
        'transition-colors appearance-none',
        '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        size === 'md' ? 'w-12 h-10 text-xl' : 'w-9 h-8 text-base',
        className,
      )}
    />
  );
}
