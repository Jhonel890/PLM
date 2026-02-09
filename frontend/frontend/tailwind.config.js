/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "Paper Pop"
        paper: '#fdf6e3',     // Color crema/cuaderno viejo
        ink: '#2d2d2d',       // Negro no puro (tipo bolígrafo)
        neon: {
          pink: '#ff2a6d',    // Acción / Error / Párame la mano
          blue: '#05d9e8',    // Primario / Títulos
          yellow: '#ffc857',  // Resaltado / Advertencia
          green: '#d1f149'    // Éxito / Puntos
        }
      },
      fontFamily: {
        // Definiremos estas fuentes en el CSS luego
        hand: ['"Patrick Hand"', 'cursive'], // Para textos "escritos a mano"
        bold: ['"Rubik"', 'sans-serif'],     // Para UI y botones
      },
      boxShadow: {
        // Sombra dura (Hard Shadow) para efecto papel recortado
        'pop': '4px 4px 0px 0px rgba(0,0,0,1)',
        'pop-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
      }
    },
  },
  plugins: [],
}