import { dirSizeSync } from './dir-size';
import { env } from '../env';

export const calcBuildSizes = () => {
    const allSize = dirSizeSync(env.paths.BUILD_DIR);
    const jsSize = dirSizeSync(env.paths.BUILD_DIR, /\.js$/);
    const cssSize = dirSizeSync(env.paths.BUILD_DIR, /\.css$/);
    const assetsSize = allSize - jsSize - cssSize;

    return {
        all: allSize,
        assets: assetsSize,
        css: cssSize,
        js: jsSize,
    };
};
