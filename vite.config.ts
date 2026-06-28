import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Настройки сборщика проекта
export default defineConfig({
  plugins: [
    react(),        // Подключаем React
    tailwindcss(),  // Подключаем Tailwind CSS для стилей
  ],
})