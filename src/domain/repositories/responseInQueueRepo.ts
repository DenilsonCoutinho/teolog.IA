export type responseInQueueRepo = {
  checkResponseInQueue: (perguntaHash: string) => Promise<void>
}
