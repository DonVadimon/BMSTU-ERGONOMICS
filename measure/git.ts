import fs from 'fs';
import childProcess from 'child_process';

import { env } from './env';

const changeSource = () => {
    fs.appendFileSync(env.paths.SRC_FILE, `\nconsole.info("change source ${new Date().toString()}");\n`);
};

const cleanSource = () => {
    childProcess.execSync(`git restore ${env.paths.SRC_FILE}`);
};

export const git = {
    changeSource,
    cleanSource,
};
