import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Windows 上 localhost 可能优先解析为 ::1，显式绑定 IPv4。
    host: "127.0.0.1",
    port: 5173,
  },
});
