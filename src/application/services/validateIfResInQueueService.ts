
export function validateIfResInQueueService(error: boolean) {
  if (error) {
    throw new Error("Essa pergunta já está sendo processada. Aguarde alguns segundos para ver a resposta pronta.")
  }
}