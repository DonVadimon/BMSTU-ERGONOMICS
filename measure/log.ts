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

export type CollectingLogs = {
    runs: RunLog[];
    meanRunTime: number;
    bundleSize: BuildSizeLog;
    plugins: PluginsLog;
    cfg: CfgSizeLog;
};

const LOGS: CollectingLogs = {
    runs: [],
    meanRunTime: 0,
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

const addRunLog = (log: RunLog) => {
    LOGS.runs.push(log);
    LOGS.meanRunTime = LOGS.runs.reduce((accum, runLog, index, arr) => {
        accum += Number(runLog.build);
        if (index === arr.length - 1) {
            accum = accum / arr.length;
        }

        return accum;
    }, 0);
};
const addBundleSizeLog = (log: BuildSizeLog) => (LOGS.bundleSize = log);
const addBundlePluginLog = (log: PluginsLog) => (LOGS.plugins = log);
const addCfgLog = (log: CfgSizeLog) => (LOGS.cfg = log);

const formatRunLog = (log: RunLog) => `- ${log.run}. build time - ${log.build}ms`;

const formatCfgLogs = (logs: CollectingLogs) => {
    const { cfg } = logs;

    return [
        `4.1 Размер конфигурационного файла`,
        `- Всего строк - ${cfg.cfgLines} шт`,
        `- Пустых строк - ${cfg.cfgEmptyLines} шт`,
        `- Непустых строк - ${cfg.cfgNonEmptyLines} шт`,
        `- Размер конфига - ${cfg.cfgLines} - ${cfg.cfgEmptyLines} = ${cfg.cfgNonEmptyLines} шт`,
    ].join('\n');
};

const formatPluginsLogs = (logs: CollectingLogs) => {
    const { plugins } = logs;

    return [
        `4.2 Количество дополнительных плагинов`,
        `- Все плагины:`,
        JSON.stringify(plugins, null, 4),
        `- Количество дополнительных плагинов - ${plugins.plugins.length} - 1 = ${plugins.plugins.length - 1}`,
    ].join('\n');
};

const formatProdBuildSpeed = (logs: CollectingLogs) => {
    const { bundleSize, meanRunTime } = logs;

    return [
        `4.3 Скорость продакшн сборки проекта`,
        `- Размер сборки - ${bundleSize.all} bytes`,
        `- Время сборки - ${meanRunTime} ms`,
        `- Скорость продакшн сборки - ${bundleSize.all / meanRunTime} bytes/ms`,
    ].join('\n');
};

const formatDevServerLaunch = (logs: CollectingLogs) => {
    const { meanRunTime } = logs;

    return [
        `4.4 Скорость запуска дев-сервера`,
        `- Среднее время за ${env.argv.repeat} запусков - ${meanRunTime} ms`,
    ].join('\n');
};

const formatHMRSpeed = (logs: CollectingLogs) => {
    const { meanRunTime } = logs;

    return [
        `4.5 Скорость пересборки (HMR)`,
        `- Количество пересобираемых модулей - 1 modules`,
        `- Среднее время пересборки за ${env.argv.repeat} запусков - ${meanRunTime / 1000} s`,
        `- Средняя скорость пересборки за ${env.argv.repeat} запусков = 1 / ${meanRunTime / 1000} = ${
            1 / meanRunTime / 1000
        } modules/s`,
    ].join('\n');
};

const formatProdBuildSize = (logs: CollectingLogs) => {
    const { bundleSize } = logs;

    return [
        `4.6 Финальный размер сборки`,
        `- Размер JS чанков - ${bundleSize.js} bytes`,
        `- Размер CSS чанков - ${bundleSize.css} bytes`,
        `- Размер ассетов - ${bundleSize.assets} bytes`,
        `- Размер сборки - ${bundleSize.assets} + ${bundleSize.js} + ${bundleSize.css} = ${bundleSize.all} bytes`,
    ].join('\n');
};

const writeLogToDisk = () => {
    const rows = LOGS.runs.map(formatRunLog);

    const content = [
        '--- Запуски ---',
        ...rows,
        '',
        '---------------',
        `--- Метрики ---`,
        '---------------',
        '',
        formatCfgLogs(LOGS),
        '',
        formatPluginsLogs(LOGS),
        '',
        env.argv.measure === 'watch' ? formatHMRSpeed(LOGS) : [],
        env.argv.measure === 'build' ? [formatProdBuildSpeed(LOGS), formatProdBuildSize(LOGS)] : [],
        env.argv.measure === 'server' ? formatDevServerLaunch(LOGS) : [],
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

export const format = {
    formatRunLog,
    formatCfgLogs,
    formatPluginsLogs,
    formatProdBuildSpeed,
    formatDevServerLaunch,
    formatHMRSpeed,
    formatProdBuildSize,
};
