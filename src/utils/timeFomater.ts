export function formatSecond(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}


export function formatSecondPlanFree(seconds: number) {
    const horas = Math.floor(seconds / 3600)
    const minutos = Math.floor((seconds % 3600) / 60)
    const restoSegundos = seconds % 60

    return `${horas}h ${minutos}m ${restoSegundos}s`
  }