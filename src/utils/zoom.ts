export const ESCALA_MIN = 1
export const ESCALA_MAX = 3
export const ESCALA_DOBLE_TOQUE = 2.5
export const UMBRAL_REGRESO = 1.05

export interface Transformacion {
  x: number
  y: number
  escala: number
}

export interface Caja {
  left: number
  top: number
  width: number
  height: number
}

export const IDENTIDAD: Transformacion = { x: 0, y: 0, escala: ESCALA_MIN }

export function limitarEscala(escala: number): number {
  if (!Number.isFinite(escala)) return ESCALA_MIN
  return Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala))
}

export function limitePan(escala: number, ancho: number, alto: number): { maxX: number; maxY: number } {
  if (escala <= ESCALA_MIN) return { maxX: 0, maxY: 0 }
  const exceso = (escala - ESCALA_MIN) / 2
  return { maxX: exceso * ancho, maxY: exceso * alto }
}

export function limitarPan(t: Transformacion, ancho: number, alto: number): Transformacion {
  const { maxX, maxY } = limitePan(t.escala, ancho, alto)
  return {
    escala: t.escala,
    x: Math.min(maxX, Math.max(-maxX, t.x)),
    y: Math.min(maxY, Math.max(-maxY, t.y)),
  }
}

/** Convierte coordenadas de pantalla a coordenadas internas de la caja según la transformación actual. */
export function puntoEnCaja(clientX: number, clientY: number, caja: Caja, t: Transformacion): { x: number; y: number } {
  const centroX = caja.left + caja.width / 2
  const centroY = caja.top + caja.height / 2
  return {
    x: (clientX - centroX - t.x) / t.escala,
    y: (clientY - centroY - t.y) / t.escala,
  }
}

/** Nueva transformación que mantiene fijo `puntoCaja` en pantalla al escalar de `t.escala` a `escalaDestino`. */
export function aplicarZoomHacia(t: Transformacion, escalaDestino: number, puntoCaja: { x: number; y: number }): Transformacion {
  return {
    escala: escalaDestino,
    x: t.x + (t.escala - escalaDestino) * puntoCaja.x,
    y: t.y + (t.escala - escalaDestino) * puntoCaja.y,
  }
}

export function transformarCss(t: Transformacion): string {
  return `translate(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px) scale(${t.escala.toFixed(4)})`
}

export function esDobleToque(
  tiempo: number,
  tiempoPrevio: number,
  x: number,
  y: number,
  xPrevio: number,
  yPrevio: number,
): boolean {
  const dentroTiempo = tiempo - tiempoPrevio < 300
  const distancia = Math.hypot(x - xPrevio, y - yPrevio)
  return dentroTiempo && distancia < 30
}
