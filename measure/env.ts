import path from 'path';
import parseArgs from 'args-parser';

const argv: { watch: boolean; repeat: number } = Object.assign(
    {},
    { watch: false, repeat: 2 },
    parseArgs(process.argv),
);

const mode = argv.watch ? ('development' as const) : ('production' as const);

const setEnvVars = () => {
    process.env.NODE_ENV = mode;
};

const CWD = process.cwd();
const CWD_BASE = path.basename(CWD);
const LOGS_DIR = path.resolve(CWD, '.logs');
const LOG_FILE = path.resolve(LOGS_DIR, argv.watch ? '.watch-time.log' : '.build-time.log');
const SRC_FILE = path.resolve(CWD, 'src', 'index.tsx');
const BUILD_DIR = path.resolve(CWD, '.build');

export const env = {
    argv,
    mode,
    setEnvVars,
    paths: {
        CWD,
        CWD_BASE,
        LOGS_DIR,
        LOG_FILE,
        SRC_FILE,
        BUILD_DIR,
    },
    // Не все сборщики дают инфу о модулях. Значение взято из webpack.Stats
    BUNDLED_MODULES: 120,
};
