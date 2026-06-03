export default function Logo3D() {
  return (
    <div className="flex items-center gap-3">
      {/* Cubo azul com ícones */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className="w-12 h-12"
      >
        {/* Gradiente azul */}
        <defs>
          <linearGradient id="cubeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Cubo */}
        <rect x="40" y="40" width="120" height="120" rx="12" fill="url(#cubeGradient)" />

        {/* Ícone de laptop (topo) */}
        <path
          d="M70 60h60v30H70z M65 95h70v5H65z"
          fill="white"
        />

        {/* Ícone de monitor (lado esquerdo) */}
        <rect x="55" y="110" width="40" height="25" rx="3" fill="white" />
        <rect x="70" y="135" width="10" height="5" fill="white" />

        {/* Ícone de servidor (lado direito) */}
        <rect x="110" y="110" width="35" height="30" rx="3" fill="white" />
        <circle cx="125" cy="135" r="2" fill="white" />
        <line x1="115" y1="120" x2="140" y2="120" stroke="white" strokeWidth="2" />
        <line x1="115" y1="127" x2="140" y2="127" stroke="white" strokeWidth="2" />
      </svg>

      {/* Texto do logo */}
      <div>
        <h1 className="text-xl font-black text-white">
          Inventário ProMaster
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-blue-400">
          Datacenter Platform
        </p>
      </div>
    </div>
  );
}
