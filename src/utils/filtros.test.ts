import { describe, expect, it } from 'vitest'
import { soloDisponibles } from './filtros'
import type { Catalogo, Producto, Seccion } from '../data/catalog'

function producto(codigo: string, disponible: boolean): Producto {
  return {
    codigo,
    nombre: `Producto ${codigo}`,
    talla: 'TALLA',
    precio: '$10.00',
    existencias: disponible ? 3 : 0,
    disponible,
    imagen: 'image1.webp',
  }
}

const catalogo: Catalogo = {
  meta: { marca: 'MINI ME', descripcion: 'Catálogo', totalProductos: 3, totalSecciones: 2, generado: 'x' },
  secciones: [
    { nombre: 'A', productos: [producto('A1', true), producto('A2', false)] },
    { nombre: 'B', productos: [producto('B1', false)] },
  ],
}

describe('soloDisponibles', () => {
  it('conserva solo los productos disponibles', () => {
    const resultado = soloDisponibles(catalogo)
    const disponibles = resultado.secciones.flatMap((s) => s.productos)
    expect(disponibles).toHaveLength(1)
    expect(disponibles[0].codigo).toBe('A1')
  })

  it('descarta secciones sin productos disponibles', () => {
    const resultado = soloDisponibles(catalogo)
    expect(resultado.secciones.map((s: Seccion) => s.nombre)).toEqual(['A'])
  })

  it('actualiza los totales de meta', () => {
    const resultado = soloDisponibles(catalogo)
    expect(resultado.meta.totalProductos).toBe(1)
    expect(resultado.meta.totalSecciones).toBe(1)
  })

  it('devuelve el mismo catálogo si todo está disponible', () => {
    const todoDisponible: Catalogo = {
      ...catalogo,
      secciones: [{ nombre: 'A', productos: [producto('A1', true)] }],
    }
    const resultado = soloDisponibles(todoDisponible)
    expect(resultado.secciones[0].productos).toHaveLength(1)
  })
})