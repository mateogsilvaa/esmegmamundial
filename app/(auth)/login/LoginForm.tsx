'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/home';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h1>
        <p className="text-zinc-400 text-sm">Entra para ver tus predicciones</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={cn(
              'w-full px-3 py-2.5 rounded-lg text-sm',
              'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500',
              'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500',
              'transition-colors',
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Contraseña</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                'w-full px-3 py-2.5 pr-10 rounded-lg text-sm',
                'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500',
                'transition-colors',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full py-3 rounded-lg font-semibold text-sm',
            'bg-white text-zinc-950 hover:bg-zinc-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors flex items-center justify-center gap-2',
          )}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-white font-medium hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
