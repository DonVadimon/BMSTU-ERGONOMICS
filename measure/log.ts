import fs from 'fs';
import { env } from './env';

if (!fs.existsSync(env.paths.LOGS_DIR)) {
    fs.mkdirSync(env.paths.LOGS_DIR);
}

type RunLog = {
    run: number;
    build: number | string;
};

type BuildSizeLog = {
    all: number | string;
    js: number | string;
    css: number | string;
    assets: number | string;
};

const LOGS: {
    runs: RunLog[];
    bundleSize: BuildSizeLog;
} = {
    runs: [],
    bundleSize: {
        all: 0,
        js: 0,
        css: 0,
        assets: 0,
    },
};

const formatRunLog = (log: RunLog) => `- ${log.run}. build time - ${log.build}ms`;

const addRunLog = (log: RunLog) => LOGS.runs.push(log);

const addBundleSizeLog = (bundleSize: BuildSizeLog) => (LOGS.bundleSize = bundleSize);

const writeLogToDisk = () => {
    const { meanTime, rows } = LOGS.runs.reduce(
        (accum, runLog, index, arr) => {
            accum.meanTime += Number(runLog.build);
            if (index === arr.length - 1) {
                accum.meanTime = accum.meanTime / arr.length;
            }

            accum.rows.push(formatRunLog(runLog));

            return accum;
        },
        { meanTime: 0, rows: [] as string[] },
    );

    const meanBundleSpeed = env.BUNDLED_MODULES / meanTime;

    const content = [
        '--- RUNS ---',
        ...rows,
        '\n--- MEAN BUILD TIME ---',
        `- ${meanTime}ms`,
        '\n--- BUNDLE SIZE ---',
        `- Total size: ${LOGS.bundleSize.all} bytes`,
        `- JS size: ${LOGS.bundleSize.js} bytes`,
        `- CSS size: ${LOGS.bundleSize.css} bytes`,
        `- Assets size: ${LOGS.bundleSize.assets} bytes`,
        '\n--- BUNDLE SPEED ---',
        `- ${meanBundleSpeed} modules/ms`,
    ].join('\n');

    console.log(`\x1b[42m ${env.paths.CWD_BASE} \x1b[0m`);
    console.log(`\x1b[36m ${content} \x1b[0m`);

    fs.writeFileSync(env.paths.LOG_FILE, content, { encoding: 'utf-8' });
};

export const log = {
    addRunLog,
    addBundleSizeLog,
    writeLogToDisk,
};
