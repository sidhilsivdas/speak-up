import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths, so the build works at https://<user>.github.io/speak-up/.
  base: './',
  plugins: [react(), tailwindcss()],
})
