import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import checker from "vite-plugin-checker";

import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

// Export an async config so we can dynamic-import an optional local plugin when present
export default defineConfig(async () => {
  let clearLogPlugin: any = () => () => {};
  const clearLogPluginPath = path.resolve(__dirname, "dala-internal-vite-clear-log-plugin.js");
  if (fs.existsSync(clearLogPluginPath)) {
    // dynamic import when present to avoid module-not-found
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - file may be plain JS without types
    const mod = await import("./dala-internal-vite-clear-log-plugin.js");
    clearLogPlugin = mod?.default ?? (() => () => {});
  }

  return {
    plugins: [
      clearLogPlugin(),
      react(),
      tailwindcss(),
      checker({
        typescript: true,
      }),
    ],
    server: {
      port: 3000,
      host: true,
      allowedHosts: true,
    },
    preview: {
      port: 3000,
      host: true,
      allowedHosts: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 5000, // Increases the limit to 5MB
    },
  };
});
