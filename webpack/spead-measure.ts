import fs from 'fs';
import webpack from 'webpack';
import path from 'path';
import parseArgs from 'args-parser';
import childProcess from 'child_process';

const argv: { watch: boolean; clear: boolean; repeat: number } = Object.assign(
    {},
    { watch: false, clear: true, repeat: 2 },
    parseArgs(process.argv),
);

process.env.NODE_ENV = argv.watch ? 'development' : 'production';
const compiler = webpack({ ...require('./webpack.config').default, cache: false });

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

const onBuild = (error: any, stats: webpack.Stats | undefined, run: number) => {
    if (error) {
        console.error(error);

        throw error;
    }

    if (typeof stats === 'undefined') {
        throw new Error('Starts are undefined');
    }

    writeLog({
        run,
        build: stats.endTime - stats.startTime,
    });
};

const measureBuild = async () => {
    for (let index = 0; index < argv.repeat; index++) {
        await new Promise<void>((resolve) => {
            compiler.run((error, stats) => {
                onBuild(error, stats, index + 1);
                resolve();
            });
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
        const watching = compiler.watch({}, (error, stats) => {
            onBuild(error, stats, ++run);

            if (run === argv.repeat) {
                return watching.close(() => resolve());
            }

            changeSource();
        });
    });
};

(async () => {
    if (argv.watch) {
        await measureWatch();
        return cleanSource();
    }

    await measureBuild();
})();
