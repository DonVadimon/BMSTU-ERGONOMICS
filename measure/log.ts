import fs from 'fs';
import { env } from './env';

if (!fs.existsSync(env.paths.LOGS_DIR)) {
    fs.mkdirSync(env.paths.LOGS_DIR);
}

type RunLog = {
    run: number;
    build: number | string;
};

type BuildSizeLog = {
    all: number;
    js: number;
    css: number;
    assets: number;
};

type CfgSizeLog = {
    cfgLines: number;
    cfgEmptyLines: number;
    cfgNonEmptyLines: number;
};

type PluginsLog = {
    plugins: string[];
};

const LOGS: {
    runs: RunLog[];
    bundleSize: BuildSizeLog;
    plugins: PluginsLog;
    cfg: CfgSizeLog;
} = {
    runs: [],
    bundleSize: {
        all: 0,
        js: 0,
        css: 0,
        assets: 0,
    },
    plugins: { plugins: [] },
    cfg: {
        cfgLines: 0,
        cfgEmptyLines: 0,
        cfgNonEmptyLines: 0,
    },
};

const formatRunLog = (log: RunLog) => `- ${log.run}. build time - ${log.build}ms`;

const addRunLog = (log: RunLog) => LOGS.runs.push(log);
const addBundleSizeLog = (log: BuildSizeLog) => (LOGS.bundleSize = log);
const addBundlePluginLog = (log: PluginsLog) => (LOGS.plugins = log);
const addCfgLog = (log: CfgSizeLog) => (LOGS.cfg = log);

const writeLogToDisk = () => {
    const { bundleSize, cfg, plugins, runs } = LOGS;

    const { meanTime: meanBundleTime, rows } = runs.reduce(
        (accum, runLog, index, arr) => {
            accum.meanTime += Number(runLog.build);
            if (index === arr.length - 1) {
                accum.meanTime = accum.meanTime / arr.length;
            }

            accum.rows.push(formatRunLog(runLog));

            return accum;
        },
        { meanTime: 0, rows: [] as string[] },
    );

    const content = [
        '--- Запуски ---',
        ...rows,
        '',
        '---------------',
        `--- Метрики ---`,
        '---------------',
        '',
        `4.1 Размер конфигурационного файла`,
        `- Всего строк - ${cfg.cfgLines} шт`,
        `- Пустых строк - ${cfg.cfgEmptyLines} шт`,
        `- Непустых строк - ${cfg.cfgNonEmptyLines} шт`,
        `- Размер конфига - ${cfg.cfgLines} - ${cfg.cfgEmptyLines} = ${cfg.cfgNonEmptyLines} шт`,
        '',
        `4.2 Количество дополнительных плагинов`,
        `- Все плагины:`,
        JSON.stringify(plugins, null, 4),
        `- Количество дополнительных плагинов - ${plugins.plugins.length} - 1 = ${plugins.plugins.length - 1}`,
        '',
        env.argv.measure === 'watch'
            ? [
                  `4.5 Скорость пересборки (HMR)`,
                  `- Количество пересобираемых модулей - 1 modules`,
                  `- Среднее время пересборки за ${env.argv.repeat} запусков - ${meanBundleTime / 1000} s`,
                  `- Средняя скорость пересборки за ${env.argv.repeat} запусков = 1 / ${meanBundleTime / 1000} = ${
                      1 / meanBundleTime / 1000
                  } modules/s`,
              ]
            : [],
        env.argv.measure === 'build'
            ? [
                  `4.3 Скорость продакшн сборки проекта`,
                  `- Размер сборки - ${bundleSize.all} bytes`,
                  `- Время сборки - ${meanBundleTime} ms`,
                  `- Скорость продакшн сборки - ${bundleSize.all / meanBundleTime} bytes/ms`,
                  '',
                  `4.6 Финальный размер сборки`,
                  `- Размер JS чанков - ${bundleSize.js} bytes`,
                  `- Размер CSS чанков - ${bundleSize.css} bytes`,
                  `- Размер ассетов - ${bundleSize.assets} bytes`,
                  `- Размер сборки - ${bundleSize.assets} + ${bundleSize.js} + ${bundleSize.css} = ${bundleSize.all} bytes`,
              ]
            : [],
        env.argv.measure === 'server'
            ? [
                  `4.4 Скорость запуска дев-сервера`,
                  `- Среднее время за ${env.argv.repeat} запусков - ${meanBundleTime} ms`,
              ]
            : [],
    ]
        .flat()
        .join('\n');

    console.log(`\x1b[42m ${env.paths.CWD_BASE} \x1b[0m`);
    console.log(`\x1b[36m ${content} \x1b[0m`);

    fs.writeFileSync(env.paths.LOG_FILE, content, { encoding: 'utf-8' });
    fs.writeFileSync(env.paths.LOG_RAW_FILE, JSON.stringify(LOGS, null, 4), { encoding: 'utf-8' });
};

export const log = {
    addRunLog,
    addBundleSizeLog,
    addBundlePluginLog,
    addCfgLog,
    writeLogToDisk,
};
