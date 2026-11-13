// يبني أنماط القالب وسكربته: npm exec -- node wordpress/tools/build-theme.mjs
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const theme = path.resolve(import.meta.dirname, '..', 'abo-elezz-theme');
const input = path.join(theme, 'assets/src/theme.css');
const result = await postcss([tailwind({ base: theme, optimize: { minify: true } })]).process(readFileSync(input, 'utf8'), { from: input });
writeFileSync(path.join(theme, 'assets/app.css'), result.css);
copyFileSync(path.join(theme, 'assets/src/app.js'), path.join(theme, 'assets/app.js'));
console.log('app.css', (result.css.length / 1024).toFixed(1), 'KB');
