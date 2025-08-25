import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildForLocale(locale, translations) {
    console.log(`Building for locale: ${locale}`);

    const { default: handlebars } = await import('vite-plugin-handlebars');

    await build({
        configFile: false,
        plugins: [
            handlebars({
                partialDirectory: path.resolve(process.cwd(), "partials"),
                context: translations
            })
        ],
        build: {
            outDir: `dist/${locale}`,
            rollupOptions: {
                input: {
                    main: path.resolve(process.cwd(), "index.html"),
                    skills: path.resolve(process.cwd(), "skills.html"),
                    process: path.resolve(process.cwd(), "process.html"),
                },
            },
        },
    });
}

async function buildAll() {
    const locales = ['en', 'no'];
    const localeDir = 'locales';

    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true });
    }

    for (const locale of locales) {
        const localePath = path.join(localeDir, `${locale}.json`);
        let translations = {};

        if (fs.existsSync(localePath)) {
            translations = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
        }

        await buildForLocale(locale, translations);
    }

    console.log('Build complete!');
}

buildAll().catch(console.error);