import { Client } from '@connected/client';
export function namedFunction(...args) {
    return Client.execute('namedFunction', args);
}
export default function namedDefaultAsyncFunction(...args) {
    return Client.execute('namedDefaultAsyncFunction', args);
}
