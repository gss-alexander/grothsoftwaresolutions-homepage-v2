import { defineConfig } from "vite";
import { resolve } from "path";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import handlebars from "vite-plugin-handlebars";

function getHtmlFiles(dir, baseDir = dir) {
    const entries = {};

    readdirSync(dir).forEach(file => {
        const fullPath = join(dir, file);

        if (statSync(fullPath).isDirectory()) {
            Object.assign(entries, getHtmlFiles(fullPath, baseDir));
        } else if (file.endsWith(".html")) {
            const relativePath = fullPath.slice(baseDir.length + 1);
            const name = relativePath.replace(/\.html$/, "").replace(/\\/g, "/");
            entries[name] = fullPath;
        }
    });

    return entries;
}

export default defineConfig({
    root: "src",
    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, "partials"),
        }),
    ],
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: getHtmlFiles(resolve(__dirname, "src")),
        },
    },
    publicDir: "../public"
});