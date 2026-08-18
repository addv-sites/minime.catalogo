import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./components/Libro', () => ({
  Libro: () => <div data-testid="libro" />,
}))

vi.mock('./data/catalog', () => ({
  cargarCatalogo: vi.fn().mockResolvedValue({
    meta: { marca: 'MINI ME', descripcion: 'Catálogo digital premium', totalProductos: 675, totalSecciones: 15, generado: '2026-08-17' },
    secciones: [{ nombre: 'CALCETAS Y TINES', productos: [{ codigo: 'C0001', nombre: 'Calcetín flor', talla: '', precio: '$93.70', existencias: 5, disponible: true, imagen: 'image2.webp' }] }],
  }),
}))

describe('App', () => {
  it('muestra la marca y los totales del catálogo', async () => {
    render(<App />)
    expect(await screen.findByText(/675 productos · 15 secciones/)).toBeInTheDocument()
    expect(screen.getByText('MINI ME')).toBeInTheDocument()
  })

  it('renderiza el libro del catálogo', async () => {
    render(<App />)
    expect(await screen.findByTestId('libro')).toBeInTheDocument()
  })
})