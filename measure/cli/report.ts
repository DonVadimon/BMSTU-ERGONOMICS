import path from 'path';
import fs from 'fs';

import { MeasureMode, env, Bundler, ALL_MEASURE_MODES, ALL_BUNDLERS } from '../env';
import { format, CollectingLogs } from '../log';

const readRawLogs = async (bundler: Bundler) => {
    const logs: Record<MeasureMode, CollectingLogs> = {} as any;

    for (const mode of ALL_MEASURE_MODES) {
        const raw = await fs.promises.readFile(
            env.paths.buildRawLogFilePath(path.resolve(env.paths.CWD, bundler, '.logs')),
            {
                encoding: 'utf-8',
            },
        );
        logs[mode] = JSON.parse(raw);
    }

    return logs;
};

const processBundler = async (bundler: Bundler) => {
    const rawLogs = await readRawLogs(bundler);
    return [
        `--- ${bundler} ---`,
        '',
        format.formatCfgLogs(rawLogs.build),
        '',
        format.formatPluginsLogs(rawLogs.build),
        '',
        format.formatProdBuildSpeed(rawLogs.build),
        '',
        format.formatDevServerLaunch(rawLogs.server),
        '',
        format.formatHMRSpeed(rawLogs.watch),
        '',
        format.formatProdBuildSize(rawLogs.build),
    ]
        .flat()
        .join('\n');
};

(async () => {
    const logs: string[] = [];

    for (const bundler of ALL_BUNDLERS) {
        const bundlerLogs = await processBundler(bundler);
        logs.push(bundlerLogs);
    }

    fs.writeFileSync(env.paths.LOG_REPORT_FILE, logs.join('\n\n'), { encoding: 'utf-8' });
})();
