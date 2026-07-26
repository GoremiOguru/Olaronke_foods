/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#F97316',
            hover: '#EA580C',
            light: '#FFEDD5',
            glow: '#FB923C',
            dark: '#C2410C'
          },
          lemon: {
            DEFAULT: '#84CC16',
            hover: '#65A30D',
            light: '#ECFCCB',
            glow: '#A3E635',
            dark: '#4D7C0F'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 0 25px -3px rgba(249, 115, 22, 0.4)',
        'lemon-glow': '0 0 25px -3px rgba(132, 204, 22, 0.4)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
