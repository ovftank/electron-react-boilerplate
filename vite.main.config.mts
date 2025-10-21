import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    optimizeDeps: {
        exclude: ['onnxruntime-node', 'sharp', 'bufferutil', 'utf-8-validate', 'ws']
    },
    build: {
        target: 'esnext',
        rollupOptions: {
            external: ['onnxruntime-node', 'sharp', 'bufferutil', 'utf-8-validate', 'ws'],
            output: {
                format: 'cjs',
                interop: 'auto'
            }
        }
    }
});
