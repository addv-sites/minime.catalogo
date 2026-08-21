import { describe, expect, it } from 'vitest'
import {
  aplicarZoomHacia,
  esDobleToque,
  ESCALA_MAX,
  ESCALA_MIN,
  IDENTIDAD,
  limitePan,
  limitarEscala,
  limitarPan,
  puntoEnCaja,
  transformarCss,
} from './zoom'

describe('limitarEscala', () => {
  it('acepta valores dentro del rango', () => {
    expect(limitarEscala(1)).toBe(1)
    expect(limitarEscala(2.5)).toBe(2.5)
  })

  it('satura en los extremos', () => {
    expect(limitarEscala(0.5)).toBe(ESCALA_MIN)
    expect(limitarEscala(9)).toBe(ESCALA_MAX)
  })

  it('devuelve el mínimo ante valores no finitos', () => {
    expect(limitarEscala(Number.NaN)).toBe(ESCALA_MIN)
    expect(limitarEscala(Number.POSITIVE_INFINITY)).toBe(ESCALA_MIN)
  })
})

describe('limitePan / limitarPan', () => {
  it('sin zoom no permite desplazamiento', () => {
    expect(limitePan(1, 400, 600)).toEqual({ maxX: 0, maxY: 0 })
  })

  it('a escala 3 permite la mitad del exceso por lado', () => {
    expect(limitePan(3, 400, 600)).toEqual({ maxX: 400, maxY: 600 })
  })

  it('recorta el pan a los bordes del contenido', () => {
    const t = limitarPan({ x: 999, y: -999, escala: 2 }, 400, 600)
    expect(t.x).toBe(200)
    expect(t.y).toBe(-300)
  })

  it('no altera la escala', () => {
    const t = limitarPan({ x: 50, y: 50, escala: 1.5 }, 400, 600)
    expect(t.escala).toBe(1.5)
  })
})

describe('puntoEnCaja', () => {
  it('mapea el centro de pantalla al centro de la caja sin transformación', () => {
    const caja = { left: 0, top: 0, width: 400, height: 600 }
    const p = puntoEnCaja(200, 300, caja, IDENTIDAD)
    expect(p).toEqual({ x: 0, y: 0 })
  })

  it('compensa traslación y escala', () => {
    const caja = { left: 0, top: 0, width: 400, height: 600 }
    const t = { x: 40, y: -30, escala: 2 }
    // pantalla (240, 270) → centro + t → interno ((240-200-40)/2, (270-300+30)/2)
    const p = puntoEnCaja(240, 270, caja, t)
    expect(p.x).toBe(0)
    expect(p.y).toBe(0)
  })
})

describe('aplicarZoomHacia', () => {
  it('mantiene fijo el punto focal al escalar desde identidad', () => {
    const base = IDENTIDAD
    const foco = { x: 100, y: -50 }
    const t = aplicarZoomHacia(base, 2, foco)
    expect(t.escala).toBe(2)
    expect(t.x).toBe(-100)
    expect(t.y).toBe(50)
  })

  it('es acumulable: el punto bajo el foco no se mueve en pantalla', () => {
    const foco = { x: 80, y: 20 }
    const paso1 = aplicarZoomHacia(IDENTIDAD, 1.5, foco)
    const paso2 = aplicarZoomHacia(paso1, 3, foco)
    // posición en pantalla del foco (relativa al centro): escala*punto + traslación
    const pantalla1 = 1.5 * foco.x + paso1.x
    const pantalla2 = 3 * foco.x + paso2.x
    expect(pantalla2).toBeCloseTo(pantalla1, 5)
    expect(paso2.escala).toBe(3)
  })
})

describe('transformarCss', () => {
  it('genera translate + scale con decimales acotados', () => {
    expect(transformarCss({ x: 12.34567, y: -6.78901, escala: 1.234567 })).toBe(
      'translate(12.35px, -6.79px) scale(1.2346)',
    )
  })

  it('identidad sin desplazamiento', () => {
    expect(transformarCss(IDENTIDAD)).toBe('translate(0.00px, 0.00px) scale(1.0000)')
  })
})

describe('esDobleToque', () => {
  it('detecta dos toques rápidos y cercanos', () => {
    expect(esDobleToque(400, 150, 100, 100, 95, 102)).toBe(true)
  })

  it('rechaza toques lentos o lejanos', () => {
    expect(esDobleToque(600, 150, 100, 100, 95, 102)).toBe(false)
    expect(esDobleToque(400, 150, 200, 200, 95, 102)).toBe(false)
  })
})
