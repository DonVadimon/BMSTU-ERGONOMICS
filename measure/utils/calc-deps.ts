import fs from 'fs';

import { env } from '../env';

const IGNORE = /(prettier|eslint|@types\/|args-parser|json-server)/gi;

export const calcBuildDeps = () => {
    const pkgJson = JSON.parse(fs.readFileSync(env.paths.PKG_JSON, { encoding: 'utf-8' }));

    return Object.keys(pkgJson.devDependencies).filter((dep) => !dep.match(IGNORE));
};
