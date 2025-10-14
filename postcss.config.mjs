const config = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F0F8FF",  // màu mặc định
          light: "#60A5FA",   // xanh nhạt
          dark: "#1E3A8A",    // xanh đậm
        },
        primary: {
          DEFAULT: '#1677ff',
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#91caff',
          300: '#69b1ff',
          400: '#4096ff',
          500: '#1677ff',
          600: '#0958d9',
          700: '#003eb3',
          800: '#002c8c',
          900: '#001d66'
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'Arial']
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: ["@tailwindcss/postcss"],
};

export default config;
