import { defineConfig } from "vite";
import million from "million/compiler";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    million.vite({ auto: true }),
    react()
  ]
});
