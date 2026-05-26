import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/home');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl tracking-tight">Mundial</span>
          <span className="text-xs font-bold bg-white text-zinc-950 px-1.5 py-0.5 rounded">2026</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/registro" className="text-sm font-semibold bg-white text-zinc-950 px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors">
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-2xl">
          {/* Flags decoration */}
          <div className="flex justify-center gap-2 mb-8 text-3xl">
            <span>🇦🇷</span><span>🇧🇷</span><span>🇫🇷</span><span>🇪🇸</span><span>🇩🇪</span><span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span><span>🇵🇹</span><span>🇳🇱</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            Predice el<br />
            <span className="text-amber-400">Mundial 2026</span>
          </h1>

          <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            48 selecciones. 12 grupos. Un campeón. Haz tus predicciones y compite con tus amigos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto text-center font-semibold bg-white text-zinc-950 px-8 py-3.5 rounded-xl hover:bg-zinc-100 transition-colors text-base"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center font-semibold text-zinc-400 border border-zinc-700 px-8 py-3.5 rounded-xl hover:text-white hover:border-zinc-500 transition-colors text-base"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-zinc-800 px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '48', label: 'Selecciones' },
            { num: '12', label: 'Grupos' },
            { num: '104', label: 'Partidos' },
            { num: '1', label: 'Campeón' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="font-display text-4xl font-bold text-white mb-1">{num}</div>
              <div className="text-sm text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-zinc-600 text-sm">
        Mundial 2026 · Predicciones
      </footer>
    </div>
  );
}
