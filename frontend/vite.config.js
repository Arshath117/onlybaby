import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["razorpay"],
  },
  build: {
    outDir: "dist", 
    emptyOutDir: true, 
  },
  server: {
    historyApiFallback: true, 
  },
  base: "/", 
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
