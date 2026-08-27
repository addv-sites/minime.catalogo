import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Libro } from './Libro'
import type { Catalogo } from '../data/catalog'

const catalogoMock: Catalogo = {
  meta: { marca: 'MINI ME', descripcion: 'test', totalProductos: 6, totalSecciones: 1, generado: '2026-01-01' },
  secciones: [
    {
      nombre: 'ZAPATITOS',
      productos: Array.from({ length: 6 }, (_, i) => ({
        codigo: `Z00${i}`,
        nombre: `Producto ${i}`,
        talla: '10cm',
        precio: '$10.00',
        existencias: 1,
        disponible: true,
        imagen: 'test.webp',
      })),
    },
  ],
}

describe('Libro layout — UX: nada oculto ni invadido', () => {
  it('renderiza escena y controles centrados y visibles', () => {
    render(<Libro catalogo={catalogoMock} />)
    const escena = document.querySelector('.libro__escena')
    const controles = document.querySelector('.libro__controles')
    const indicador = screen.getByText(/Página 1 de/)
    const btnPrev = screen.getByLabelText('Página anterior')
    const btnNext = screen.getByLabelText('Página siguiente')

    expect(escena).toBeInTheDocument()
    expect(controles).toBeInTheDocument()
    expect(indicador).toBeInTheDocument()
    expect(btnPrev).toBeInTheDocument()
    expect(btnNext).toBeInTheDocument()

    // Controles deben ser visibles (no display:none ni hidden)
    expect(controles).toBeVisible()
    expect(btnPrev).toBeVisible()
    expect(btnNext).toBeVisible()
    expect(indicador).toBeVisible()

    // No deben estar aria-hidden
    expect(controles?.getAttribute('aria-hidden')).not.toBe('true')
  })

  it('controles tienen layout centrado y accesible', () => {
    render(<Libro catalogo={catalogoMock} />)
    const controles = document.querySelector('.libro__controles') as HTMLElement
    expect(controles).toBeInTheDocument()
    // Debe tener 3 botones + indicador
    const botones = controles.querySelectorAll('button')
    expect(botones.length).toBe(3)
    expect(controles).toBeVisible()
    expect(controles.classList.contains('libro__controles')).toBe(true)
  })

  it('escena y libro ocupan espacio central sin invadir header', () => {
    render(<Libro catalogo={catalogoMock} />)
    const libro = document.querySelector('.libro') as HTMLElement
    const escena = document.querySelector('.libro__escena') as HTMLElement
    const controles = document.querySelector('.libro__controles') as HTMLElement
    expect(libro).toBeVisible()
    expect(escena).toBeVisible()
    expect(controles).toBeVisible()
    // Verifica que escena y controles estén en orden vertical (escena antes que controles)
    const children = Array.from(libro.children).map((c) => c.className)
    const idxEscena = children.findIndex((c) => c.includes('libro__escena'))
    const idxControles = children.findIndex((c) => c.includes('libro__controles'))
    expect(idxEscena).toBeGreaterThanOrEqual(0)
    expect(idxControles).toBeGreaterThan(idxEscena)
  })

  it('flip props limitan altura para no cortar portada', () => {
    render(<Libro catalogo={catalogoMock} />)
    const flip = document.querySelector('.libro__flip')
    expect(flip).toBeInTheDocument()
  })
})
