/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Phil-IRI reading level colors — used consistently throughout the app
        independent: {
          light: '#dcfce7',
          DEFAULT: '#16a34a',
          dark: '#14532d',
        },
        instructional: {
          light: '#fef9c3',
          DEFAULT: '#ca8a04',
          dark: '#713f12',
        },
        frustration: {
          light: '#fee2e2',
          DEFAULT: '#dc2626',
          dark: '#7f1d1d',
        },
        // App brand
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Minimum tap target size for tablet use
      minHeight: {
        'tap': '44px',
      },
      minWidth: {
        'tap': '44px',
      }
    },
  },
  plugins: [],
}
