/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // =========================
      // COLORS
      // =========================
      colors: {
        // BRAND
        brandOrange: '#ff7a00',
        brandOrangeDark: '#d95f00',
        brandOrangeSoft: '#ff9d42',

        // BACKGROUNDS
        primaryBg: '#030712',
        secondaryBg: '#071020',
        cardBg: '#091224',

        // BORDERS
        cardBorder: 'rgba(255,255,255,0.06)',

        // CYAN
        neonCyan: '#00d9ff',

        // GREEN
        neonGreen: '#00e6a7',

        // VIOLET
        neonViolet: '#8b5cf6',

        // ORANGE
        neonOrange: '#ff8800',
      },

      // =========================
      // BLUR
      // =========================
      backdropBlur: {
        xs: '2px',
      },

      // =========================
      // BOX SHADOWS
      // =========================
      boxShadow: {
        glass:
          '0 8px 32px rgba(0,0,0,0.35)',

        neonOrange:
          '0 0 10px rgba(255,122,0,0.45)',

        neonCyan:
          '0 0 10px rgba(0,217,255,0.35)',

        neonGreen:
          '0 0 10px rgba(0,230,167,0.35)',

        neonViolet:
          '0 0 10px rgba(139,92,246,0.35)',

        card:
          '0 10px 30px rgba(0,0,0,0.45)',
      },

      // =========================
      // BORDER RADIUS
      // =========================
      borderRadius: {
        '4xl': '2rem',
      },

      // =========================
      // BACKGROUND IMAGES
      // =========================
      backgroundImage: {
        dashboardGlow:
          `
          radial-gradient(
            circle at top left,
            rgba(0,217,255,0.08),
            transparent 35%
          ),
          radial-gradient(
            circle at top right,
            rgba(255,122,0,0.08),
            transparent 35%
          )
        `,

        cardGlow:
          `
          linear-gradient(
            180deg,
            rgba(255,255,255,0.03),
            rgba(255,255,255,0.01)
          )
        `,
      },

      // =========================
      // ANIMATIONS
      // =========================
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },

          '50%': {
            opacity: '.8',
            transform: 'scale(1.04)',
          },
        },

        floatSlow: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },

          '50%': {
            transform: 'translateY(-6px)',
          },
        },
      },

      animation: {
        pulseGlow:
          'pulseGlow 3s ease-in-out infinite',

        floatSlow:
          'floatSlow 6s ease-in-out infinite',
      },

      // =========================
      // FONT
      // =========================
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },

      // =========================
      // MAX WIDTH
      // =========================
      maxWidth: {
        dashboard: '1600px',
      },
    },
  },

  plugins: [],
};