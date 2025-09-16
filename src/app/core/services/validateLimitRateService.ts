import { formatSecond } from "@/utils/timeFomater";

export function validateLimitRate(error: boolean,ttl: number) {
  if (error) {
    throw new Error(`Você atingiu o limite de 10 requisições. Tente novamente em ${formatSecond(ttl)}`)
  }
}