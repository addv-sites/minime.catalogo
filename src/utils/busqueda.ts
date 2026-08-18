import type { Producto, Seccion } from '../data/catalog'

export interface ResultadoBusqueda {
  producto: Producto
  seccion: Seccion
}

export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function buscarProductos(secciones: Seccion[], consulta: string, limite = 20): ResultadoBusqueda[] {
  const q = normalizarTexto(consulta)
  if (!q) return []

  const resultados: ResultadoBusqueda[] = []
  for (const seccion of secciones) {
    for (const producto of seccion.productos) {
      const nombre = normalizarTexto(producto.nombre || '')
      const codigo = normalizarTexto(producto.codigo || '')
      const talla = normalizarTexto(producto.talla || '')
      if (nombre.includes(q) || codigo.includes(q) || talla.includes(q)) {
        resultados.push({ producto, seccion })
        if (resultados.length >= limite) return resultados
      }
    }
  }
  return resultados
}