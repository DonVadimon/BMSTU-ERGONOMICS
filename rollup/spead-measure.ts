import fs from 'fs';
import rollup from 'rollup';
import path from 'path';
import parseArgs from 'args-parser';
import childProcess from 'child_process';

const argv: { watch: boolean; clear: boolean; repeat: number } = Object.assign(
    {},
    { watch: false, clear: true, repeat: 2 },
    parseArgs(process.argv),
);

process.env.NODE_ENV = argv.watch ? 'development' : 'production';
import _cfg from './rollup.config';
const cfg = { ..._cfg, cache: false, logLevel: 'silent' } as rollup.RollupOptions;

const BUILD_INFO_FILE = path.resolve(__dirname, '.build-time.log');
const SRC_FILE = path.resolve(__dirname, 'src', 'index.tsx');

if (argv.clear) {
    fs.rmSync(BUILD_INFO_FILE, { force: true });
}

const writeLog = (info: { run: number; build: number | string }) => {
    if (!fs.existsSync(BUILD_INFO_FILE)) {
        fs.writeFileSync(BUILD_INFO_FILE, '', { encoding: 'utf-8' });
    }

    const logRow = `- ${info.run}. build time - ${info.build}\n`;
    console.log(logRow);

    fs.appendFileSync(BUILD_INFO_FILE, logRow, {
        encoding: 'utf-8',
    });
};

const measureBuild = async () => {
    for (let index = 0; index < argv.repeat; index++) {
        const startTime = Date.now();
        await rollup.rollup(cfg);
        const endTime = Date.now();
        writeLog({
            run: index + 1,
            build: endTime - startTime,
        });
    }
};

const changeSource = () => {
    fs.appendFileSync(SRC_FILE, `\nconsole.info("change source ${new Date().toString()}");\n`);
};

const cleanSource = () => {
    childProcess.execSync(`git restore ${SRC_FILE}`);
};

const measureWatch = () => {
    let run = 0;
    let startTime,
        endTime = 0;

    return new Promise<void>((resolve) => {
        const watcher = rollup.watch(cfg);

        watcher.on('event', (event) => {
            if (event.code === 'START') {
                startTime = Date.now();
            }

            if (event.code === 'END') {
                run++;

                endTime = Date.now();
                writeLog({
                    run: ++run,
                    build: endTime - startTime,
                });

                if (run === argv.repeat) {
                    return watcher.close().then(resolve);
                }

                changeSource();
            }
        });
    });
};

(async () => {
    if (argv.watch) {
        await measureWatch();
        cleanSource();
        return process.exit(0);
    }

    await measureBuild();
})();
