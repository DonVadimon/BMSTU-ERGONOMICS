import fs from 'fs';
import path from 'path';
import parseArgs from 'args-parser';
import childProcess from 'child_process';

const argv: { watch: boolean; clear: boolean; repeat: number } = Object.assign(
    {},
    { watch: false, clear: true, repeat: 2 },
    parseArgs(process.argv),
);

const mode = argv.watch ? ('development' as const) : ('production' as const);

const setEnvVars = () => {
    process.env.NODE_ENV = mode;
};

export const env = {
    argv,
    mode,
    setEnvVars,
};

const CWD = process.cwd();
const LOGS_DIR = path.resolve(CWD, '.logs');
const LOG_FILE = path.resolve(LOGS_DIR, argv.watch ? '.watch-time.log' : '.build-time.log');
const SRC_FILE = path.resolve(CWD, 'src', 'index.tsx');

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

if (argv.clear) {
    fs.rmSync(LOG_FILE, { force: true });
}

const writeLog = (info: { run: number; build: number | string }) => {
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '', { encoding: 'utf-8' });
    }

    const logRow = `- ${info.run}. build time - ${info.build}\n`;
    console.log(logRow);

    fs.appendFileSync(LOG_FILE, logRow, {
        encoding: 'utf-8',
    });
};

export const log = {
    writeLog,
};

const changeSource = () => {
    fs.appendFileSync(SRC_FILE, `\nconsole.info("change source ${new Date().toString()}");\n`);
};

const cleanSource = () => {
    childProcess.execSync(`git restore ${SRC_FILE}`);
};

export const git = {
    changeSource,
    cleanSource,
};

const setupMeasure =
    ({ measureBuild, measureWatch }: { measureBuild: () => Promise<void>; measureWatch: () => Promise<void> }) =>
    async () => {
        if (env.argv.watch) {
            await measureWatch();
            git.cleanSource();
            return process.exit(0);
        }

        await measureBuild();
    };

export const run = {
    setupMeasure,
};
