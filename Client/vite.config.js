import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            external: [
                '@clerk/clerk-react', // Add external libraries you might need here
                'three' // If you need three.js externally
            ],
        },
    },
});