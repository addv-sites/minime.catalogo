import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./components/Libro', () => ({
  Libro: () => <div data-testid="libro" />,
}))

vi.mock('./data/catalog', () => ({
  cargarCatalogo: vi.fn().mockResolvedValue({
    meta: { marca: 'MINI ME', descripcion: 'Catálogo digital premium', totalProductos: 2, totalSecciones: 1, generado: '2026-08-17' },
    secciones: [
      {
        nombre: 'CALCETAS Y TINES',
        productos: [
          { codigo: 'C0001', nombre: 'Calcetín flor', talla: '', precio: '$93.70', existencias: 5, disponible: true, imagen: 'image2.webp' },
          { codigo: 'C0002', nombre: 'Calceta agotada', talla: '', precio: '$95.00', existencias: 0, disponible: false, imagen: 'image3.webp' },
        ],
      },
    ],
  }),
}))

describe('App', () => {
  it('muestra la marca y los totales del catálogo', async () => {
    render(<App />)
    expect(await screen.findByText(/2 productos · 1 secciones/)).toBeInTheDocument()
    expect(screen.getByText('MINI ME')).toBeInTheDocument()
  })

  it('renderiza el libro del catálogo', async () => {
    render(<App />)
    expect(await screen.findByTestId('libro')).toBeInTheDocument()
  })

  it('filtra por disponibles al activar el toggle', async () => {
    render(<App />)
    const toggle = await screen.findByRole('switch', { name: /Ver solo productos disponibles/ })
    expect(toggle).not.toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(await screen.findByText(/1 productos · 1 secciones/)).toBeInTheDocument()
  })
})