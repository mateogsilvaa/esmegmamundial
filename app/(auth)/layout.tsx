import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="flex items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-xl tracking-tight text-white">Mundial</span>
          <span className="text-xs font-bold bg-white text-zinc-950 px-1.5 py-0.5 rounded">2026</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
