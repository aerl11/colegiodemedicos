import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Compilar a JavaScript más compatible: la sintaxis moderna (?. ?? clases, etc.)
    // se transpila a algo que navegadores móviles antiguos (Safari 12+, Chrome 64+,
    // WebView de Android viejos) sí pueden ejecutar. Esto evita la "pantalla en blanco"
    // en algunos teléfonos.
    target: 'es2015',
    cssTarget: 'safari12',
  },
})
