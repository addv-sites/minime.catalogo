export function normalizarPrecio(raw: string): string {
  const m = raw.match(/\$[\d.]+/)
  return m ? m[0] : ''
}

export function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
