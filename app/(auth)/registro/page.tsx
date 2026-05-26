'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ACCESS_CODE } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function RegistroPage() {
  const router = useRouter();

  const [step, setStep] = useState<'code' | 'form'>('code');
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError]   = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim().toUpperCase() === ACCESS_CODE) {
      setStep('form');
      setCodeError('');
    } else {
      setCodeError('Código incorrecto. Necesitas el código de acceso para registrarte.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (err) {
      setError(err.message === 'User already registered'
        ? 'Ya existe una cuenta con ese email.'
        : err.message,
      );
      setLoading(false);
      return;
    }

    router.push('/home');
    router.refresh();
  };

  if (step === 'code') {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Código de acceso</h1>
          <p className="text-zinc-400 text-sm">Necesitas un código para unirte</p>
        </div>

        <form onSubmit={handleCodeSubmit} className="space-y-4">
          {codeError && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
              {codeError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Código de acceso</label>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="XXXXXXXX"
              className={cn(
                'w-full px-3 py-2.5 rounded-lg text-sm font-mono uppercase tracking-widest',
                'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500',
                'transition-colors',
              )}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-sm bg-white text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            Verificar código
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-white font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 mb-4 text-green-400 text-sm font-medium">
          <CheckCircle2 size={16} />
          Código verificado
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
        <p className="text-zinc-400 text-sm">Únete y empieza a predecir</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Nombre de usuario</label>
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20))}
            placeholder="tunombre"
            className={cn(
              'w-full px-3 py-2.5 rounded-lg text-sm',
              'bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500',
              'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500',
              'transition-colors',
            )}
          />
          <p className="text-xs text-zinc-600">Solo letras, números y guiones bajos</p>
        </div>

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
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
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
            'w-full py-3 rounded-lg font-semibold text-sm mt-2',
            'bg-white text-zinc-950 hover:bg-zinc-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors flex items-center justify-center gap-2',
          )}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-white font-medium hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
