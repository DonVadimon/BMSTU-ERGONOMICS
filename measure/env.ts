import path from 'path';
import fs from 'fs';
import parseArgs from 'args-parser';

const argv: { measure: 'build' | 'watch' | 'server'; repeat: number } = Object.assign(
    {},
    { measure: 'build', repeat: 2 },
    parseArgs(process.argv),
);

const mode = argv.measure === 'build' ? ('production' as const) : ('development' as const);

const setEnvVars = () => {
    process.env.NODE_ENV = mode;
};

const CFG_PER_DIR: Record<string, string> = {
    parcel: '1',
    rollup: 'rollup.config.ts',
    webpack: 'webpack.config.ts',
};

const CWD = process.cwd();
const CWD_BASE = path.basename(CWD);
const LOGS_DIR = path.resolve(CWD, '.logs');
const LOG_FILE = path.resolve(LOGS_DIR, `.${argv.measure}.log`);
const LOG_RAW_FILE = path.resolve(LOGS_DIR, `.${argv.measure}.raw.json`);
const SRC_FILE = path.resolve(CWD, 'src', 'index.tsx');
const BUILD_DIR = path.resolve(CWD, '.build');

const CFG_OR_LINES = CFG_PER_DIR[CWD_BASE];
const CFG = path.resolve(CWD, CFG_OR_LINES);

export const env = {
    argv,
    mode,
    setEnvVars,
    paths: {
        CWD,
        CWD_BASE,
        LOGS_DIR,
        LOG_FILE,
        LOG_RAW_FILE,
        SRC_FILE,
        BUILD_DIR,
        CFG: fs.existsSync(CFG) ? CFG : null,
        PKG_JSON: path.resolve(CWD, 'package.json'),
    },
    // Не все сборщики дают инфу о модулях. Значение взято из webpack.Stats
    BUNDLED_MODULES: 120,
    CFG_OR_LINES: CFG_PER_DIR[CWD_BASE],
    DEV_SERVER_HOST: '127.0.0.1',
    DEV_SERVER_PORT: 8000,
};
