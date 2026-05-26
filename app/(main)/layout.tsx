import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/layout/Nav';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav username={profile?.username ?? user.email?.split('@')[0] ?? 'usuario'} />
      <main className="pb-safe md:pb-6">
        {children}
      </main>
    </div>
  );
}
