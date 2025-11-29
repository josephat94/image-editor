import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Plugin para manejar imports dinámicos opcionales de onnxruntime-web
const handleOptionalImports = () => {
  return {
    name: "handle-optional-imports",
    resolveId(id: string) {
      // Resolver imports opcionales de onnxruntime-web/webgpu como módulo vacío
      if (id === "onnxruntime-web/webgpu") {
        return "\0virtual:onnxruntime-web-webgpu";
      }
      return null;
    },
    load(id: string) {
      // Retornar módulo vacío para onnxruntime-web/webgpu
      if (id === "\0virtual:onnxruntime-web-webgpu") {
        return "export default {};";
      }
      return null;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), handleOptionalImports()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["@imgly/background-removal"],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar warnings sobre imports dinámicos de onnxruntime-web/webgpu
        if (
          warning.code === "UNRESOLVED_IMPORT" &&
          warning.id?.includes("onnxruntime-web/webgpu")
        ) {
          return;
        }
        warn(warning);
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
