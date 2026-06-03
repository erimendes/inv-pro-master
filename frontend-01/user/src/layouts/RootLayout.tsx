// src/layouts/RootLayout.tsx
import { Notification } from '../shared/components/Notification';
import { Footer } from '../shared/components/Footer';
import { Avatar } from '../modules/user/components/Avatar';
import * as Icons from 'lucide-react';
import { useAuth } from '../app/providers/AuthContext';
import { Button } from '../shared/components/Button';

export function RootLayout({ children, onNavigate }: any) {
  const auth = useAuth();
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});

  const LogoIcon = Icons.LayoutDashboard;
  const RackIcon = Icons.Server;
  const BoxIcon = Icons.Package;
  const CodeIcon = Icons.Code2;
  const CloudIcon = Icons.Cloud;
  const ServiceIcon = Icons.BookOpen;
  const AppIcon = Icons.AppWindow;

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-[#e2e8f0]">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2 font-black text-xl text-[rgb(var(--primary))] cursor-pointer" onClick={() => onNavigate('landing')}>
            <LogoIcon size={28} />
            <span className="tracking-tighter uppercase">Inventário Pro</span>
          </div>

          <nav className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('racks')} className="nav-btn">
                  <RackIcon size={14} /> <span>Racks</span>
                </button>
                <button onClick={() => onNavigate('assets')} className="nav-btn">
                  <BoxIcon size={14} /> <span>Ativos</span>
                </button>
                <button onClick={() => onNavigate('software')} className="nav-btn">
                  <CodeIcon size={14} /> <span>Software</span>
                </button>
                <button onClick={() => onNavigate('cloud')} className="nav-btn">
                  <CloudIcon size={14} /> <span>Nuvem</span>
                </button>
                <button onClick={() => onNavigate('services')} className="nav-btn">
                  <ServiceIcon size={14} /> <span>Serviços</span>
                </button>
                <button onClick={() => onNavigate('applications')} className="nav-btn">
                  <AppIcon size={14} /> <span>Aplicações</span>
                </button>

                <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
                
                  <Avatar />
                  <Button variant="outline" onClick={logout} className="px-3 py-1.5 text-[9px] border-red-500/20 text-red-400 hover:bg-red-500/10 uppercase font-black">
                    Sair
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onNavigate('login')}>Entrar</Button>
                <Button variant="primary" onClick={() => onNavigate('register')} className="px-6">Criar Conta</Button>
              </div>
            )}
</nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
<Footer />
      <Notification />
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-weight: 800;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }
        .nav-btn:hover { color: rgb(var(--primary)); }
        .nav-btn span { display: none; }
        @media (min-width: 1200px) { .nav-btn span { display: inline; } }
      `}} />
    </div>
  );
}
