import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["razorpay"],
  },
  build: {
    outDir: "dist", // Ensure the correct output directory
    emptyOutDir: true, // Clean old files before building
  },
  server: {
    port: 5173, // Required for local development
    host: "0.0.0.0", // Ensures it's accessible in containerized environments
  },
  preview: {
    port: 4173, // Preview mode port
  },
  base: "/", // Ensures correct routing for Render deployments
});



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   optimizeDeps: {
//         exclude: ["razorpay"],
//     },
//   plugins: [react()],
// })
