import type { Catalogo } from '../data/catalog'

export function soloDisponibles(catalogo: Catalogo): Catalogo {
  const secciones = catalogo.secciones
    .map((seccion) => ({ ...seccion, productos: seccion.productos.filter((p) => p.disponible) }))
    .filter((seccion) => seccion.productos.length > 0)

  return {
    ...catalogo,
    meta: {
      ...catalogo.meta,
      totalProductos: secciones.reduce((n, s) => n + s.productos.length, 0),
      totalSecciones: secciones.length,
    },
    secciones,
  }
}