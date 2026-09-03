/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['"Syne Mono"', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
        body: ['"Rajdhani"', 'sans-serif'],
      },
      colors: {
        bio: {
          bg: '#050814',
          surface: '#0a0f24',
          card: '#0e1638',
          border: '#1a2758',
          cyan: '#00f5ff',
          magenta: '#d946ef',
          amber: '#fbbf24',
          emerald: '#10b981',
          coral: '#ff0055',
          muted: '#64748b',
          text: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
};
