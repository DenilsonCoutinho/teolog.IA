
export type rateLimitRepo = {
  checkLimit: (userId: string) => Promise<void>
}
