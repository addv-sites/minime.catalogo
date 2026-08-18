import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { TarjetaProducto } from './TarjetaProducto'
import type { Producto, Seccion } from '../data/catalog'

const seccion: Seccion = { nombre: 'ZAPATITOS', productos: [] }

function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    codigo: 'Z050',
    nombre: 'CROCS',
    talla: '14CM AZUL',
    precio: '$35.00 C/U',
    existencias: 12,
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

  it('abre el detalle al tocar la tarjeta y muestra la talla completa', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle de CROCS' }))
    const dialogo = screen.getByRole('dialog', { name: 'Detalle de CROCS' })
    expect(dialogo).toBeInTheDocument()
    expect(within(dialogo).getByText('14CM AZUL')).toBeInTheDocument()
    expect(within(dialogo).getByText('12 piezas en existencia')).toBeInTheDocument()
  })

  it('abre el detalle con un tap táctil corto (móvil)', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    const tarjeta = screen.getByRole('button', { name: 'Ver detalle de CROCS' })
    fireEvent.touchStart(tarjeta, { touches: [{ clientX: 50, clientY: 80 }] })
    fireEvent.touchEnd(tarjeta, { changedTouches: [{ clientX: 51, clientY: 81 }] })
    expect(screen.getByRole('dialog', { name: 'Detalle de CROCS' })).toBeInTheDocument()
  })

  it('no abre el detalle si el toque se convierte en un swipe (arrastre)', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    const tarjeta = screen.getByRole('button', { name: 'Ver detalle de CROCS' })
    fireEvent.touchStart(tarjeta, { touches: [{ clientX: 50, clientY: 80 }] })
    fireEvent.touchEnd(tarjeta, { changedTouches: [{ clientX: 120, clientY: 85 }] })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra el detalle al pulsar el botón de cerrar y devuelve el foco a la tarjeta', () => {
    render(<TarjetaProducto producto={producto()} seccion={seccion} />)
    const boton = screen.getByRole('button', { name: 'Ver detalle de CROCS' })
    fireEvent.click(boton)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(boton).toHaveFocus()
  })
})