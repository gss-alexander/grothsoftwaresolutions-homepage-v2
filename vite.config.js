import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                skills: resolve(__dirname, 'skills.html'),
                process: resolve(__dirname, 'process.html')
            }
        }
    }
})