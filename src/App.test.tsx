import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./data/catalog', () => ({
  cargarCatalogo: vi.fn().mockResolvedValue({
    meta: { marca: 'MINI ME', descripcion: 'Catálogo digital premium', totalProductos: 675, totalSecciones: 15, generado: '2026-08-17' },
    secciones: [{ nombre: 'CALCETAS Y TINES', productos: [{ codigo: 'C0001', nombre: 'Calcetín flor', talla: '', precio: '$93.70', sugerido: '$50.00', disponible: true, imagen: 'image2.webp' }] }],
  }),
}))

describe('App', () => {
  it('muestra el nombre y el conteo del catálogo', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: /Catálogo/i })).toBeInTheDocument()
    expect(screen.getByText(/675 productos/)).toBeInTheDocument()
  })

  it('muestra las secciones cargadas', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: /CALCETAS Y TINES/ })).toBeInTheDocument()
  })
})
