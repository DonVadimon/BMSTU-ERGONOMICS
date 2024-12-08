import fs from 'fs';
import { Parcel } from '@parcel/core';
import path from 'path';
import parseArgs from 'args-parser';
import childProcess from 'child_process';

const argv: { watch: boolean; clear: boolean; repeat: number } = Object.assign(
    {},
    { watch: false, clear: true, repeat: 2 },
    parseArgs(process.argv),
);

const bundler = new Parcel({
    entries: 'public/index.html',
    defaultConfig: '@parcel/config-default',
    defaultTargetOptions: { distDir: '.build' },
    mode: argv.watch ? 'development' : 'production',
});

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
        const { buildTime } = await bundler.run();
        writeLog({
            run: index + 1,
            build: buildTime,
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

    return new Promise<void>((resolve) => {
        const watcher = bundler.watch((error, event) => {
            if (error) {
                throw error;
            }

            if (event?.type === 'buildSuccess') {
                writeLog({
                    run: ++run,
                    build: event.buildTime,
                });

                if (run === argv.repeat) {
                    return watcher.then((subscription) => subscription.unsubscribe()).then(() => resolve());
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
