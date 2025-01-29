import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // Change port if needed
        open: true, // Automatically open browser
    },
    resolve: {
        alias: {
            "@": "/src", // Allows importing like "@/components/Component"
        },
    },
    build: {
        outDir: "dist",
        sourcemap: true, // Helps with debugging
    },
});