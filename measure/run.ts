import fs from 'fs';

import { env } from './env';
import { log } from './log';
import { git } from './git';
import { calcBuildDeps } from './utils/calc-deps';
import { calcCfg } from './utils/calc-cfg';
import { calcBuildSizes } from './utils/calc-build';

type MeasureOpts = {
    measureBuild: () => Promise<void>;
    measureWatch: () => Promise<void>;
    measureDevServer: () => Promise<void>;
};

const setupMeasure =
    ({ measureBuild, measureWatch, measureDevServer }: MeasureOpts) =>
    async () => {
        fs.rmSync(env.paths.BUILD_DIR, { recursive: true, force: true });

        switch (env.argv.measure) {
            case 'build':
                await measureBuild();
                break;
            case 'watch':
                await measureWatch();
                git.cleanSource();
                break;
            case 'server':
                await measureDevServer();
                break;
        }

        log.addBundleSizeLog(calcBuildSizes());
        log.addBundlePluginLog({ plugins: calcBuildDeps() });
        log.addCfgLog(calcCfg());
        log.writeLogToDisk();
        return process.exit(0);
    };

export const run = {
    setupMeasure,
};
