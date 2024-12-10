import fs from 'fs';
import path from 'path';

export function dirSizeSync(dirPath: string) {
    const stat = fs.statSync(dirPath);
    switch (true) {
        case stat.isFile():
            return stat.size;
        case stat.isDirectory():
            return fs.readdirSync(dirPath).reduce((accum, item) => accum + dirSizeSync(path.join(dirPath, item)), 0);
        default:
            return 0; // can't take size of a stream/symlink/socket/etc
    }
}
