import { describe, expect, it } from 'vitest'
import { normalizarPrecio, slugificar } from './format'

describe('normalizarPrecio', () => {
  it('extrae el precio en formato moneda', () => {
    expect(normalizarPrecio('$35.00 C/U')).toBe('$35.00')
  })

  it('devuelve vacío si no hay precio', () => {
    expect(normalizarPrecio('')).toBe('')
  })

  it('solo toma la primera cifra con $', () => {
    expect(normalizarPrecio('$200.00')).toBe('$200.00')
  })
})

describe('slugificar', () => {
  it('convierte texto a slug', () => {
    expect(slugificar('Calceta orejas ratón')).toBe('calceta-orejas-raton')
  })

  it('quita acentos', () => {
    expect(slugificar('Sabanitas y cobijitas')).toBe('sabanitas-y-cobijitas')
  })

  it('normaliza espacios y símbolos', () => {
    expect(slugificar('  Z050 - Crocs  ')).toBe('z050-crocs')
  })
})
