import { spawn } from 'child_process';

import axios from 'axios';

import { poll } from './utils/poll';
import { env } from './env';
import { log } from './log';

const waitForDocumentReady = (hostname: string, port = 8000) => poll(() => axios.get(`http://${hostname}:${port}`));

export const measureDevServer = async () => {
    for (let index = 0; index < env.argv.repeat; index++) {
        const serverProc = spawn('npm', ['start'], { cwd: env.paths.CWD });
        const start = Date.now();
        await waitForDocumentReady(env.DEV_SERVER_HOST, env.DEV_SERVER_PORT);
        const end = Date.now();

        log.addRunLog({
            run: index + 1,
            build: end - start,
        });

        await new Promise((resolve) => {
            serverProc.on('close', resolve);
            serverProc.kill();
        });
    }
};
