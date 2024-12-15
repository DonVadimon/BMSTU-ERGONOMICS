import rollup from 'rollup';

import { run } from '../measure/run';
import { env } from '../measure/env';
import { log } from '../measure/log';
import { git } from '../measure/git';
import { measureDevServer } from '../measure/measure-dev-server';

env.setEnvVars();

// импортим после установки переменных
import _cfg from './rollup.config';
const cfg = { ..._cfg, cache: false, logLevel: 'silent' } as rollup.RollupOptions;

const measureBuild = async () => {
    for (let index = 0; index < env.argv.repeat; index++) {
        const startTime = Date.now();
        const bundle = await rollup.rollup(cfg);
        await bundle.write(cfg.output as rollup.OutputOptions);
        const endTime = Date.now();
        log.addRunLog({
            run: index + 1,
            build: endTime - startTime,
        });
    }
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
                endTime = Date.now();
                log.addRunLog({
                    run: ++run,
                    build: endTime - startTime,
                });

                if (run === env.argv.repeat) {
                    return watcher.close().then(resolve);
                }

                git.changeSource();
            }
        });
    });
};

run.setupMeasure({ measureBuild, measureWatch, measureDevServer })();
