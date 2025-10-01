import { marked } from 'marked';
import fs from 'fs/promises';

const args = process.argv.slice(2);
const markdownFile = args[0];
const titleOverride = args.find(arg => arg.startsWith('--title='))?.split('=')[1];

if (!markdownFile) {
    console.error('Usage: node script.js <markdown-file> [--title="Custom Title"]');
    process.exit(1);
}

async function buildPost(markdownFile, customTitle) {
    const markdown = await fs.readFile(markdownFile, 'utf-8');

    const [_, frontmatter, content] = markdown.match(/^---\n(.*?)\n---\n(.*)$/s) || [null, '', markdown];
    const meta = Object.fromEntries(frontmatter.split('\n').map(line => line.split(': ')));

    const title = customTitle || meta.title || 'MISSING TITLE';
    const html = marked.parse(content);
    const template = await fs.readFile('./templates/blog-template.html', 'utf-8');

    const output = template
        .replace('{{title}}', title)
        .replace('{{content}}', html);

    const filename = markdownFile.split('/').pop().replace('.md', '.html');
    await fs.writeFile(`src/blog/${filename}`, output);
}

await buildPost(markdownFile, titleOverride);