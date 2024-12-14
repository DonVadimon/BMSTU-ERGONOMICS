import fs from 'fs';
import path from 'path';

export function dirSizeSync(dirPath: string, include?: RegExp): number {
    const stat = fs.statSync(dirPath);
    switch (true) {
        case stat.isFile():
            return !include || include.test(dirPath) ? stat.size : 0;
        case stat.isDirectory():
            return fs
                .readdirSync(dirPath)
                .reduce((accum, item) => accum + dirSizeSync(path.join(dirPath, item), include), 0);
        default:
            return 0; // can't take size of a stream/symlink/socket/etc
    }
}
