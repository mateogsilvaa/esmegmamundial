'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/home',      label: 'Inicio',      icon: Home },
  { href: '/prediccion',label: 'Predicción',  icon: Trophy },
  { href: '/grupos',    label: 'Grupos',      icon: Users },
  { href: '/ranking',   label: 'Ranking',     icon: BarChart2 },
  { href: '/perfil',    label: 'Perfil',      icon: User },
];

export function Nav({ username }: { username: string }) {
  const path = usePathname();

  const isActive = (href: string) =>
    href === '/home' ? path === '/home' : path.startsWith(href);

  return (
    <>
      {/* ── Desktop top nav ── */}
      <header className="hidden md:flex sticky top-0 z-40 bg-white border-b border-zinc-200 h-16 items-center px-6">
        <div className="flex items-center gap-2 mr-10">
          <span className="font-display font-bold text-xl tracking-tight text-zinc-900">
            Mundial
          </span>
          <span className="text-xs font-semibold bg-zinc-900 text-white px-1.5 py-0.5 rounded">
            2026
          </span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
              )}
            >
              <Icon size={15} strokeWidth={2.2} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-zinc-500 font-medium">
          @{username}
        </div>
      </header>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden flex sticky top-0 z-40 bg-white border-b border-zinc-200 h-14 items-center px-4">
        <span className="font-display font-bold text-lg tracking-tight text-zinc-900">
          Mundial <span className="text-zinc-400">2026</span>
        </span>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 safe-area-pb">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                isActive(href)
                  ? 'text-zinc-900'
                  : 'text-zinc-400',
              )}
            >
              <Icon
                size={20}
                strokeWidth={isActive(href) ? 2.5 : 2}
                className={isActive(href) ? 'text-zinc-900' : 'text-zinc-400'}
              />
              <span className={cn('text-[10px]', isActive(href) ? 'text-zinc-900' : 'text-zinc-400')}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
