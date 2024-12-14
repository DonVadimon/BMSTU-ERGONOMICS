import fs from 'fs';

import { env } from './env';
import { log } from './log';
import { git } from './git';
import { dirSizeSync } from './dir-size';

const setupMeasure =
    ({ measureBuild, measureWatch }: { measureBuild: () => Promise<void>; measureWatch: () => Promise<void> }) =>
    async () => {
        fs.rmSync(env.paths.BUILD_DIR, { recursive: true, force: true });

        if (env.argv.watch) {
            await measureWatch();
            git.cleanSource();
        } else {
            await measureBuild();
        }

        const allSize = dirSizeSync(env.paths.BUILD_DIR);
        const jsSize = dirSizeSync(env.paths.BUILD_DIR, /\.js$/);
        const cssSize = dirSizeSync(env.paths.BUILD_DIR, /\.css$/);
        const assetsSize = allSize - jsSize - cssSize;
        log.addBundleSizeLog({
            all: allSize,
            assets: assetsSize,
            css: cssSize,
            js: jsSize,
        });
        log.writeLogToDisk();
        return process.exit(0);
    };

export const run = {
    setupMeasure,
};
