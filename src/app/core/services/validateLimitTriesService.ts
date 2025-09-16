import { formatSecond, formatSecondPlanFree } from "@/utils/timeFomater";

export function validateLimitTriesService(error: boolean,ttl: number) {
  if (error) {
    throw new Error(`Você atingiu o limite de 5 requisições. Tente novamente em ${formatSecondPlanFree(ttl)}`)
  }
}