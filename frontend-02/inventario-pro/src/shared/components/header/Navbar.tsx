// src/shared/components/header/Navbar.tsx

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../modules/auth/context/AuthContext';

import {
  LayoutDashboard,
  Database,
  Server,
  Boxes,
  Users,
} from 'lucide-react';

// =========================
// LINKS
// =========================

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'cyan',
  },

  {
    to: '/racks',
    label: 'Racks',
    icon: Database,
    color: 'cyan',
  },

  {
    to: '/assets',
    label: 'Ativos',
    icon: Server,
    color: 'emerald',
  },

  {
    to: '/applications',
    label: 'Aplicações',
    icon: Boxes,
    color: 'violet',
  },

  {
    to: '/users',
    label: 'Usuários',
    icon: Users,
    color: 'orange',
  },
];

// =========================
// COLORS
// =========================

const colors: any = {
  cyan: {
    active:
      `
      bg-cyan-500/15
      text-cyan-300
      border
      border-cyan-400/20
      shadow-[0_0_25px_rgba(34,211,238,0.12)]
      backdrop-blur-xl
    `,

    hover:
      `
      hover:bg-cyan-500/10
      hover:text-cyan-200
      hover:border-cyan-400/10
    `,
  },

  emerald: {
    active:
      `
      bg-emerald-500/15
      text-emerald-300
      border
      border-emerald-400/20
      shadow-[0_0_25px_rgba(16,185,129,0.12)]
      backdrop-blur-xl
    `,

    hover:
      `
      hover:bg-emerald-500/10
      hover:text-emerald-200
      hover:border-emerald-400/10
    `,
  },

  violet: {
    active:
      `
      bg-violet-500/15
      text-violet-300
      border
      border-violet-400/20
      shadow-[0_0_25px_rgba(139,92,246,0.12)]
      backdrop-blur-xl
    `,

    hover:
      `
      hover:bg-violet-500/10
      hover:text-violet-200
      hover:border-violet-400/10
    `,
  },

  orange: {
    active:
      `
      bg-orange-500/15
      text-orange-300
      border
      border-orange-400/20
      shadow-[0_0_25px_rgba(249,115,22,0.14)]
      backdrop-blur-xl
    `,

    hover:
      `
      hover:bg-orange-500/10
      hover:text-orange-200
      hover:border-orange-400/10
    `,
  },
};

export default function Navbar() {
  const { user } = useAuth();

  // =========================
  // ROLE FILTER (Corrigido para ocultar se não for ADMIN)
  // =========================

  const visibleLinks =
    user?.role !== 'ADMIN'
      ? links.filter((link) =>
          ['/', '/applications'].includes(link.to),
        )
      : links;

  return (
    <div className="flex items-center">
      <nav
        className="
          flex
          items-center
          gap-2
          rounded-3xl
          border
          border-white/5
          bg-[#060b17]/80
          p-2
          shadow-2xl
          shadow-black/40
          backdrop-blur-2xl
        "
      >
        {visibleLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({
                isActive,
              }) =>
                `
                group
                relative
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-2xl
                border
                px-4
                py-3
                transition-all
                duration-300
                ${
                  isActive
                    ? colors[
                        link.color
                      ].active
                    : `
                      border-transparent
                      text-slate-400
                      ${colors[link.color].hover}
                    `
                }
              `
              }
            >
              {/* glow hover */}
              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                  bg-gradient-to-r
                  from-white/[0.03]
                  to-transparent
                "
              />

              {/* icon */}
              <div
                className="
                  relative
                  z-10
                  flex
                  items-center
                  justify-center
                "
              />
              <Icon
                size={18}
                className="
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              />

              {/* label */}
              <span
                className="
                  relative
                  z-10
                  hidden
                  text-sm
                  font-semibold
                  tracking-wide
                  lg:block
                "
              >
                {link.label}
              </span>

              {/* active indicator */}
              <div
                className={`
                  absolute
                  bottom-0
                  left-1/2
                  h-[2px]
                  w-0
                  -translate-x-1/2
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    link.color === 'cyan'
                      ? 'bg-cyan-400 group-hover:w-10'
                      : link.color === 'emerald'
                        ? 'bg-emerald-400 group-hover:w-10'
                        : link.color === 'violet'
                          ? 'bg-violet-400 group-hover:w-10'
                          : 'bg-orange-400 group-hover:w-10'
                  }
                `}
              />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}