import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "./", // Generate relative path "./foo.css" instead of absolute path "/foo.css". The absolute path doesn't make sense in the Expo context
    build: {
        assetsDir: "./", // Simpler to generate a flat structure rather than one with subfolders.
    },
    server: {
        open: "/?booksUrlRoot=..%2Fmock-data%2FBooks", // That is, ../mock-data/Books
    },
});
