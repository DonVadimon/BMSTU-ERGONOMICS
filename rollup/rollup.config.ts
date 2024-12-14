import path from 'path';
import fs from 'fs';

import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import html, { makeHtmlAttributes } from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss';
import _dotenvPlugin from 'rollup-plugin-dotenv';
import devServer from 'rollup-plugin-dev';
import copy from 'rollup-plugin-copy';
import bundleSize from '@atomico/rollup-plugin-sizes';
import dotenv from 'dotenv';

const dotenvPlugin =
    typeof _dotenvPlugin === 'function' ? _dotenvPlugin : ((_dotenvPlugin as any).default as typeof _dotenvPlugin);

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

function makeTerserPlugin() {
    return terser({
        compress: {
            drop_console: true,
        },
        output: {
            comments: false,
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
            browser: true,
            preferBuiltins: true,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
        typescript({ tsconfig: './tsconfig.json' }),
        getBabelOutputPlugin({
            allowAllFormats: true,
            presets: [['@babel/preset-env']],
        }),
        dotenvPlugin(),
        postcss({
            extract: true,
            minimize: !isDev,
        }),
        makeHtmlPlugin(),
        copy({ ignore: ['*.html'], targets: [{ src: resolveRoot('public', '*'), dest: resolveOut() }] }),
        isDev ? [] : [makeTerserPlugin()],
        process.env.RLP_SERVE
            ? devServer({ dirname: resolveOut(), host: '127.0.0.1', port: Number(process.env.PORT || 8000) })
            : [],
        isDev || !process.env.RLP_SIZE ? [] : bundleSize(),
    ].flat(),
    watch: {
        exclude: 'node_modules/**',
        skipWrite: false,
    },
};
