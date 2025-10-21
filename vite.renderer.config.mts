import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [tailwindcss(), react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    optimizeDeps: {
        include: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', '@fortawesome/fontawesome-svg-core'],
        esbuildOptions: {
            supported: {
                'top-level-await': true
            }
        }
    },
    server: {
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 5173
        }
    },
    build: {
        emptyOutDir: true,
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    fontawesome: ['@fortawesome/react-fontawesome', '@fortawesome/fontawesome-svg-core']
                }
            }
        }
    }
});
