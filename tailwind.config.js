/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7F3DFF',
        ivory: '#F8F4FF',
        charcoal: '#121212',
        amber: '#FFB86B',
        lavender: '#BFA3FF',
        softgray: '#2A2A40',
      },
      boxShadow: {
        luxeglow: '0 0 12px rgba(127, 61, 255, 0.4)',
      },
    },
  },
  darkMode: 'class', 
  plugins: [],        
}
