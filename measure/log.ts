import fs from 'fs';
import { env } from './env';

if (!fs.existsSync(env.paths.LOGS_DIR)) {
    fs.mkdirSync(env.paths.LOGS_DIR);
}

type RunLog = {
    run: number;
    build: number | string;
};

const LOGS: {
    runs: RunLog[];
    bundleSize: number | string;
} = {
    runs: [],
    bundleSize: 0,
};

const formatRunLog = (log: RunLog) => `- ${log.run}. build time - ${log.build}ms`;

const addRunLog = (log: RunLog) => {
    LOGS.runs.push(log);
    console.log(formatRunLog(log));
};

const addBundleSizeLog = (bundleSize: string | number) => (LOGS.bundleSize = bundleSize);

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

    const meanBundleSpeed = env.BUNDLED_MODULES / meanTime

    const content = [
        '--- RUNS ---',
        ...rows,
        '\n--- MEAN BUILD TIME ---',
        `- ${meanTime}ms`,
        '\n--- BUNDLE SIZE ---',
        `- ${LOGS.bundleSize} bytes`,
        '\n--- BUNDLE SPEED ---',
        `- ${meanBundleSpeed} modules/ms`,
    ].join('\n');

    fs.writeFileSync(env.paths.LOG_FILE, content, { encoding: 'utf-8' });
};

export const log = {
    addRunLog,
    addBundleSizeLog,
    writeLogToDisk,
};
