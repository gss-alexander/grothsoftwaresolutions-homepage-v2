import { defineConfig } from "vite";
import { resolve } from "path";
import handlebars from "vite-plugin-handlebars";
import fs from "fs";

const DEV_LOCALE = "en";

const localeData = JSON.parse(
    fs.readFileSync(`locales/${DEV_LOCALE}.json`, 'utf-8')
);

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, "partials"),
      context: localeData
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        skills: resolve(__dirname, "skills.html"),
        process: resolve(__dirname, "process.html"),
      },
    },
  },
});