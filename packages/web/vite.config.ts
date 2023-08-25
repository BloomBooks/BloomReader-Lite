import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "./", // Generate relative path "./foo.css" instead of absolute path "/foo.css". The absolute path doesn't make sense in the Expo context
    build: {
        assetsDir: "./", // Simpler to generate a flat structure rather than one with subfolders.  But it's okay to delete this if needed. Downstream consumers (e.g. Expo's webBundleAssets) may just need more smarts added to them.
        rollupOptions: {
            external: [
                "@shared/models/BookCollection",
                "@shared/models/BookOrShelf",
            ],
        },
    },
    server: {
        open: "/?booksUrlRoot=..%2Fmock-data%2FBooks", // That is, ../mock-data/Books
    },
});
