import { describe, expect, it } from 'vitest'
import { indiceProducto, indiceSeccion, paginarCatalogo, PRODUCTOS_POR_PAGINA, totalPaginasProducto, type Pagina } from './paginacion'
import type { Producto, Seccion } from '../data/catalog'

function producto(codigo: string): Producto {
  return {
    codigo,
    nombre: `Producto ${codigo}`,
    talla: 'TALLA',
    precio: '$10.00',
    sugerido: '$20.00',
    disponible: true,
    imagen: 'image1.webp',
  }
}

function seccion(nombre: string, cantidad: number): Seccion {
  return { nombre, productos: Array.from({ length: cantidad }, (_, i) => producto(`${nombre}${i}`)) }
}

describe('paginarCatalogo', () => {
  it('empieza con portada e introducción y termina con contraportada', () => {
    const paginas = paginarCatalogo([seccion('A', 1)])
    expect(paginas[0].tipo).toBe('portada')
    expect(paginas[1].tipo).toBe('intro')
    expect(paginas[paginas.length - 1].tipo).toBe('contraportada')
  })

  it('agrega un divisor por sección', () => {
    const paginas = paginarCatalogo([seccion('A', 6), seccion('B', 6)])
    const divisores = paginas.filter((p) => p.tipo === 'seccion')
    expect(divisores).toHaveLength(2)
  })

  it('trocea los productos por página respetando el máximo', () => {
    const paginas = paginarCatalogo([seccion('A', PRODUCTOS_POR_PAGINA * 2 + 1)])
    const productos = paginas.filter((p) => p.tipo === 'productos') as Extract<Pagina, { tipo: 'productos' }>[]
    expect(productos).toHaveLength(3)
    expect(productos[0].productos).toHaveLength(PRODUCTOS_POR_PAGINA)
    expect(productos[2].productos).toHaveLength(1)
  })

  it('numera las páginas de productos de cada sección', () => {
    const paginas = paginarCatalogo([seccion('A', PRODUCTOS_POR_PAGINA * 2)])
    const productos = paginas.filter((p) => p.tipo === 'productos') as Extract<Pagina, { tipo: 'productos' }>[]
    expect(productos[0].numero).toBe(1)
    expect(productos[0].total).toBe(2)
    expect(productos[1].numero).toBe(2)
  })
})

describe('totalPaginasProducto', () => {
  it('cuenta solo las páginas de productos', () => {
    const paginas = paginarCatalogo([seccion('A', PRODUCTOS_POR_PAGINA * 2)])
    expect(totalPaginasProducto(paginas)).toBe(2)
  })
})

describe('indiceSeccion', () => {
  it('encuentra el índice de la primera página de una sección', () => {
    const paginas = paginarCatalogo([seccion('A', 1), seccion('B', 1)])
    expect(paginas[indiceSeccion(paginas, 'B')].tipo).toBe('seccion')
    expect(paginas[indiceSeccion(paginas, 'A')].tipo).toBe('seccion')
  })

  it('devuelve -1 si la sección no existe', () => {
    const paginas = paginarCatalogo([seccion('A', 1)])
    expect(indiceSeccion(paginas, 'NO EXISTE')).toBe(-1)
  })
})

describe('indiceProducto', () => {
  it('encuentra la página que contiene un producto', () => {
    const paginas = paginarCatalogo([seccion('A', PRODUCTOS_POR_PAGINA + 2)])
    const indice = indiceProducto(paginas, 'A6')
    expect(indice).toBeGreaterThan(0)
    expect((paginas[indice] as Extract<Pagina, { tipo: 'productos' }>).productos.some((p) => p.codigo === 'A6')).toBe(true)
  })

  it('devuelve -1 si el producto no existe', () => {
    const paginas = paginarCatalogo([seccion('A', 1)])
    expect(indiceProducto(paginas, 'NOEXISTE')).toBe(-1)
  })
})