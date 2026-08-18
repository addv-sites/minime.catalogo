import type { Producto, Seccion } from '../data/catalog'

export type Pagina =
  | { tipo: 'portada' }
  | { tipo: 'intro' }
  | { tipo: 'seccion'; seccion: Seccion }
  | { tipo: 'productos'; seccion: Seccion; productos: Producto[]; numero: number; total: number }
  | { tipo: 'contraportada' }

export const PRODUCTOS_POR_PAGINA = 6

function trocear<T>(items: T[], tamano: number): T[][] {
  const trozos: T[][] = []
  for (let i = 0; i < items.length; i += tamano) {
    trozos.push(items.slice(i, i + tamano))
  }
  return trozos
}

export function paginarCatalogo(secciones: Seccion[]): Pagina[] {
  const paginas: Pagina[] = [{ tipo: 'portada' }, { tipo: 'intro' }]
  for (const seccion of secciones) {
    paginas.push({ tipo: 'seccion', seccion })
    const trozos = trocear(seccion.productos, PRODUCTOS_POR_PAGINA)
    trozos.forEach((productos, i) => {
      paginas.push({ tipo: 'productos', seccion, productos, numero: i + 1, total: trozos.length })
    })
  }
  paginas.push({ tipo: 'contraportada' })
  return paginas
}

export function indiceSeccion(paginas: Pagina[], nombreSeccion: string): number {
  return paginas.findIndex(
    (p) => (p.tipo === 'seccion' || p.tipo === 'productos') && p.seccion.nombre === nombreSeccion,
  )
}

export function indiceProducto(paginas: Pagina[], codigo: string): number {
  return paginas.findIndex(
    (p) => p.tipo === 'productos' && p.productos.some((pr) => pr.codigo === codigo),
  )
}

export function totalPaginasProducto(paginas: Pagina[]): number {
  return paginas.filter((p) => p.tipo === 'productos').length
}