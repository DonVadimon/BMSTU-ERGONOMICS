import { sleep } from './sleep';

export const poll = (fn: () => void, retries = Infinity, timeout = 200) => {
    const retry = (error: any) => {
        if (retries-- > 0) {
            return sleep(timeout).then(fn).catch(retry);
        }

        throw error;
    };

    return Promise.resolve().then(fn).catch(retry);
};
