import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TarjetaProducto } from './TarjetaProducto'
import type { Producto, Seccion } from '../data/catalog'

const seccion: Seccion = { nombre: 'ZAPATITOS', productos: [] }

function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    codigo: 'Z050',
    nombre: 'CROCS',
    talla: '14CM AZUL',
    precio: '$35.00 C/U',
    sugerido: '$95.00',
    disponible: true,
    imagen: 'image452.webp',
    ...overrides,
  }
}

describe('TarjetaProducto', () => {
  it('muestra nombre, código y precio normalizado', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    expect(screen.getByRole('heading', { name: 'CROCS' })).toBeInTheDocument()
    expect(screen.getByText('Z050')).toBeInTheDocument()
    expect(screen.getByText('$35.00')).toBeInTheDocument()
  })

  it('marca el producto como AGOTADO si no está disponible', () => {
    render(<TarjetaProducto producto={producto({ disponible: false })} seccion={seccion} />)
    expect(screen.getByText('AGOTADO')).toBeInTheDocument()
  })

  it('no marca AGOTADO si está disponible', () => {
    render(<TarjetaProducto producto={producto({ disponible: true })} seccion={seccion} />)
    expect(screen.queryByText('AGOTADO')).not.toBeInTheDocument()
  })

  it('muestra "Consultar" si no hay precio', () => {
    render(<TarjetaProducto producto={producto({ precio: '' })} seccion={seccion} />)
    expect(screen.getByText('Consultar')).toBeInTheDocument()
  })

  it('muestra placeholder cuando no hay imagen', () => {
    render(<TarjetaProducto producto={producto({ imagen: null })} seccion={seccion} />)
    expect(screen.getByLabelText('Producto sin imagen')).toBeInTheDocument()
  })

  it('usa un alt descriptivo con la sección', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    expect(screen.getByAltText('CROCS de ZAPATITOS')).toBeInTheDocument()
  })
})