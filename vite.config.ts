import { defineConfig, loadEnv, type Plugin } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // app/lib/site-config.ts reads SITE_* env vars at import time and is also
  // part of the client bundle (Nav/Footer/home import it), where `process`
  // doesn't exist. Vite's `define` only applies at build, so a small transform
  // plugin inlines the values for dev too. Sources: .env files first, real
  // env on top. Restart the dev server after .env edits.
  const env = {
    ...loadEnv(mode, process.cwd(), "SITE_"),
    ...Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith("SITE_"))
    ),
  };

  const siteEnvInline = (): Plugin => ({
    name: "site-env-inline",
    enforce: "pre",
    transform(code) {
      if (!code.includes("process.env.SITE_")) return null;
      let out = code;
      for (const [key, value] of Object.entries(env)) {
        out = out.replaceAll(`process.env.${key}`, JSON.stringify(value));
      }
      return out === code ? null : { code: out, map: null };
    },
  });

  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      siteEnvInline(),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      // Bind explicitly to IPv4: Vite's default `localhost` resolves to `::1`
      // first on Windows, which leaves 127.0.0.1:5173 unreachable.
      host: "127.0.0.1",
      port: 5173,
    },
  };
});
