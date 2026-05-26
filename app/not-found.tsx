import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center px-4">
        <p className="font-display text-8xl font-bold text-zinc-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Página no encontrada</h1>
        <p className="text-zinc-500 mb-8">Esta página no existe o fue movida.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
}
