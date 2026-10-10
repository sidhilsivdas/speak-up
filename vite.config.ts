import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative asset paths, so the build works at https://<user>.github.io/speak-up/.
  base: './',
  plugins: [
    react({
      // React Compiler memoizes components and values automatically, so parts of the page
      // whose inputs didn't change (settings, mode buttons, dialog) skip re-rendering.
      babel: { plugins: ['babel-plugin-react-compiler'] },
    }),
    tailwindcss(),
  ],
})
