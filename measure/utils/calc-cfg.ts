import fs from 'fs';

import { env } from '../env';

export const calcCfg = () => {
    const cfgContent = env.paths.CFG ? fs.readFileSync(env.paths.CFG, { encoding: 'utf-8' }).split('\n') : null;
    const cfgLines = cfgContent?.length || Number(env.CFG_OR_LINES);
    const cfgNonEmptyLines = cfgContent?.filter(Boolean).length || cfgLines;
    const cfgEmptyLines = cfgLines - cfgNonEmptyLines;

    return {
        cfgLines,
        cfgEmptyLines,
        cfgNonEmptyLines,
    };
};
