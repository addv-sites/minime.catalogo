import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DetalleProducto } from './DetalleProducto'
import type { Producto, Seccion } from '../data/catalog'

const seccion: Seccion = { nombre: 'ZAPATITOS', productos: [] }

function producto(overrides: Partial<Producto> = {}): Producto {
  return {
    codigo: 'Z050',
    nombre: 'CROCS',
    talla: '14CM AZUL DINO ROSA DINO VERDE COCO AMARILLO DINO',
    precio: '$35.00 C/U',
    sugerido: '$95.00',
    disponible: true,
    imagen: 'image452.webp',
    ...overrides,
  }
}

describe('DetalleProducto', () => {
  it('muestra código, sección, talla completa, precio y sugerido', () => {
    render(<DetalleProducto producto={producto()} seccion={seccion} onCerrar={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Detalle de CROCS' })).toBeInTheDocument()
    expect(screen.getByText('Z050')).toBeInTheDocument()
    expect(screen.getByText('ZAPATITOS')).toBeInTheDocument()
    expect(screen.getByText('14CM AZUL DINO ROSA DINO VERDE COCO AMARILLO DINO')).toBeInTheDocument()
    expect(screen.getByText('$35.00')).toBeInTheDocument()
    expect(screen.getByText('Sugerido: $95.00')).toBeInTheDocument()
  })

  it('muestra "Consultar" cuando no hay precio y no muestra sugerido vacío', () => {
    render(
      <DetalleProducto producto={producto({ precio: '', sugerido: '' })} seccion={seccion} onCerrar={vi.fn()} />,
    )
    expect(screen.getByText('Consultar')).toBeInTheDocument()
    expect(screen.queryByText(/Sugerido:/)).not.toBeInTheDocument()
  })

  it('marca AGOTADO cuando no está disponible', () => {
    render(<DetalleProducto producto={producto({ disponible: false })} seccion={seccion} onCerrar={vi.fn()} />)
    expect(screen.getByText('AGOTADO')).toBeInTheDocument()
  })

  it('cierra con Escape', () => {
    const onCerrar = vi.fn()
    render(<DetalleProducto producto={producto()} seccion={seccion} onCerrar={onCerrar} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('cierra al hacer clic en el fondo', () => {
    const onCerrar = vi.fn()
    render(<DetalleProducto producto={producto()} seccion={seccion} onCerrar={onCerrar} />)
    fireEvent.mouseDown(screen.getByRole('dialog', { name: 'Detalle de CROCS' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })
})