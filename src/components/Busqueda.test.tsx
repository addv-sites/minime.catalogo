import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { Busqueda } from './Busqueda'
import type { Seccion } from '../data/catalog'

const secciones: Seccion[] = [
  {
    nombre: 'ZAPATITOS',
    productos: [
      { codigo: 'Z050', nombre: 'CROCS', talla: '14CM AZUL', precio: '$35.00', existencias: 3, disponible: true, imagen: 'image452.webp' },
    ],
  },
  {
    nombre: 'BABEROS',
    productos: [
      { codigo: 'B001', nombre: 'Babero Oso', talla: '', precio: '$40.00', existencias: 0, disponible: false, imagen: 'image100.webp' },
    ],
  },
]

describe('Busqueda', () => {
  it('muestra resultados al escribir', () => {
    render(<Busqueda secciones={secciones} onSeleccionar={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'croc' } })
    expect(screen.getByText('CROCS')).toBeInTheDocument()
  })

  it('invoca onSeleccionar con el código al elegir', () => {
    const onSeleccionar = vi.fn()
    render(<Busqueda secciones={secciones} onSeleccionar={onSeleccionar} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'babero' } })
    fireEvent.click(screen.getByText('Babero Oso'))
    expect(onSeleccionar).toHaveBeenCalledWith('B001')
  })

  it('muestra mensaje cuando no hay resultados', () => {
    render(<Busqueda secciones={secciones} onSeleccionar={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzz' } })
    expect(screen.getByText(/Sin resultados/)).toBeInTheDocument()
  })
})