import { createConnection } from 'net';

export async function ping(hostname: string, port = 8000, timeout = 10_000) {
    return new Promise<void>((resolve, reject) => {
        const socket = createConnection(port, hostname);
        socket.setTimeout(timeout);
        socket.on('connect', () => {
            socket.end();
            resolve();
        });

        function handleError(error: any) {
            socket.destroy();
            reject(error);
        }

        socket.on('timeout', handleError);
        socket.on('error', handleError);
    });
}
