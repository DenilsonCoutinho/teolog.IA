import { validateIfResInQueueService } from "@/application/services/validateIfResInQueueService";
import { responseInQueueRepo } from "@/domain/repositories/responseInQueueRepo";
import Redis from "ioredis";

export function responseInQueue(): responseInQueueRepo {
    return {
        async checkResponseInQueue(perguntaHash: string) {
            const redisClient = new Redis(process.env.URL_CONECTION_REDIS as string);

            const lockKey = `lock:${perguntaHash}`;
            const lock = await redisClient.set(lockKey, "locked", "EX", 20, "NX");

            if (!lock) {
                validateIfResInQueueService(true)
            }else{
                validateIfResInQueueService(false)
            }
        }
    }
}