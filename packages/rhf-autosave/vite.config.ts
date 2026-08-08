import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "react-router": "src/react-router.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-hook-form",
        "react-router-dom",
      ],
    },
  },
});
