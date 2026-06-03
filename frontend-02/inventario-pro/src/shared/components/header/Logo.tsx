import { Link } from 'react-router-dom';
import logoImg from '../../../assets/logo-cube-03.png'; // caminho da imagem que você baixou

export default function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3"
    >
      {/* Usa a imagem do logo */}
      <img
        src={logoImg}
        alt="Inventário ProMaster Logo"
        className="w-15 h-15 rounded-2xl"
      />

      {/* Texto do logo */}
      <div>
        <h1 className="text-xl font-black text-white">
          Inventário ProMaster
        </h1>
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.35em]
            text-[#ff8a1c]
            font-bold
          "
          style={{
            textShadow:
              '0 0 4px #ff6a00, 0 0 8px #ff6a00, 0 0 16px #ff5a00',
          }}
        >
          Datacenter Platform
        </p>
      </div>
    </Link>
  );
}
