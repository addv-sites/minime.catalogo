import { describe, expect, it } from 'vitest'
import { buscarProductos, normalizarTexto } from './busqueda'
import type { Producto, Seccion } from '../data/catalog'

function producto(codigo: string, nombre: string, talla = ''): Producto {
  return { codigo, nombre, talla, precio: '$10.00', sugerido: '', disponible: true, imagen: 'image1.webp' }
}

function seccion(nombre: string, productos: Producto[]): Seccion {
  return { nombre, productos }
}

describe('normalizarTexto', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizarTexto('Sábanas Él')).toBe('sabanas el')
  })

  it('recorta espacios', () => {
    expect(normalizarTexto('  Z050  ')).toBe('z050')
  })
})

describe('buscarProductos', () => {
  const catalogo: Seccion[] = [
    seccion('ZAPATITOS', [producto('Z050', 'CROCS', '14CM AZUL DINO'), producto('Z010', 'Sandalias', '20CM')]),
    seccion('BABEROS', [producto('B001', 'Babero Oso')]),
  ]

  it('encuentra por código', () => {
    expect(buscarProductos(catalogo, 'z05')[0].producto.codigo).toBe('Z050')
  })

  it('encuentra por nombre sin acentos', () => {
    expect(buscarProductos(catalogo, 'sandalias')).toHaveLength(1)
  })

  it('encuentra por talla', () => {
    expect(buscarProductos(catalogo, 'azul dino')[0].producto.codigo).toBe('Z050')
  })

  it('devuelve vacío si no hay consulta', () => {
    expect(buscarProductos(catalogo, '')).toEqual([])
  })

  it('devuelve vacío si no hay coincidencias', () => {
    expect(buscarProductos(catalogo, 'inexistente')).toEqual([])
  })

  it('respeta el límite de resultados', () => {
    const muchos: Seccion[] = [seccion('A', Array.from({ length: 50 }, (_, i) => producto(`A${i}`, 'Calcetín')))]
    expect(buscarProductos(muchos, 'calcetin', 10)).toHaveLength(10)
  })
})