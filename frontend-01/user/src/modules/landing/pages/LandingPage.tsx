import { Button } from '../../../shared/components/Button';

export default function LandingPage({ onNavigate }: any) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center gap-8">
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
        Gestão <span className="text-[rgb(var(--primary))]">moderna</span>
      </h1>
      <p className="text-slate-400 max-w-xl text-lg">
        Controle seu estoque com inteligência e simplicidade. 
        A ferramenta ideal para empresas que buscam agilidade.
      </p>
      <Button onClick={() => onNavigate('login')} className="h-14 px-10 text-lg">
        Começar agora
      </Button>
    </div>
  );
}
