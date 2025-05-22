// /lib/queue.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis("rediss://default:AWxAAAIjcDFjZjZkMzUwZDNiZTc0OGJhYTBjMDNiN2YzZmUyNjQyZnAxMA@desired-rhino-27712.upstash.io:6379",{
    maxRetriesPerRequest: null,
}); // ou upstash


export const aiQueue = new Queue('ask-ai', { connection });

export async function addJobToQueue(data: {
    messageUser: string;
    type_theology: string;
    userId: string;
    perguntaHash: string;
}) {
    await aiQueue.add('process-response', data, {
        attempts: 3,
    });
}
