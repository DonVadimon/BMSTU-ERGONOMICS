import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import html, { makeHtmlAttributes } from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import dotenvPlugin from 'rollup-plugin-dotenv';
import devServer from 'rollup-plugin-dev';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolveRoot = (...paths) => path.resolve(__dirname, ...paths);
const resolveOut = (...paths) => resolveRoot('.build', ...paths);

const dotenvPath = resolveRoot(`.env.${process.env.NODE_ENV}`);
dotenv.config({ path: dotenvPath });

const isDev = process.env.NODE_ENV === 'development';

function makeHtmlPlugin() {
    return html({
        publicPath: '/',
        template: ({ files, attributes, publicPath }) => {
            const template = fs.readFileSync('public/index.html', { encoding: 'utf-8' });
            const scripts = (files.js || [])
                .map(({ fileName }) => {
                    const attrs = makeHtmlAttributes(attributes.script);
                    return `<script src="${publicPath}${fileName}"${attrs}></script>`;
                })
                .join('\n');
            const styles = (files.css || [])
                .map(({ fileName }) => {
                    const attrs = makeHtmlAttributes(attributes.link);
                    return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
                })
                .join('\n');

            const replaceValue = (template, key, value) => template.replace(`{{${key}}}`, value);

            return replaceValue(replaceValue(template, 'scripts', scripts), 'styles', styles);
        },
    });
}

export default {
    input: 'src/index.tsx',
    output: {
        dir: resolveOut(),
        format: 'iife',
    },
    plugins: [
        commonjs(),
        nodeResolve({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
        nodePolyfills({ sourceMap: false }),
        typescript({ tsconfig: './tsconfig.json' }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env'],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            exclude: 'node_modules/**',
        }),
        dotenvPlugin(),
        postcss({
            extract: !isDev,
            minimize: !isDev,
        }),
        makeHtmlPlugin(),
        isDev ? [] : [terser()],
        devServer({ dirname: resolveOut(), host: '127.0.0.1', port: process.env.PORT || 8000 }),
    ].flat(),
    watch: {
        exclude: 'node_modules/**',
    },
};
