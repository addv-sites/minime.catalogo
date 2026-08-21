import { useEffect, useRef } from 'react'
import {
  aplicarZoomHacia,
  esDobleToque,
  ESCALA_DOBLE_TOQUE,
  IDENTIDAD,
  limitarEscala,
  limitarPan,
  puntoEnCaja,
  transformarCss,
  UMBRAL_REGRESO,
  type Caja,
  type Transformacion,
} from '../utils/zoom'

type Modo = 'nada' | 'pinch' | 'pan'

/**
 * Zoom a dos dedos (pinch) + pan con un dedo + doble toque/clic + Ctrl+rueda.
 * Devuelve un `ref` para asignar al contenedor que se quiere ampliar.
 * Los gestos se interceptan en fase captura: un dedo sin zoom sigue fluyendo
 * al resto de componentes (p. ej. el volteo de páginas del libro).
 */
export function usePinchZoom() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let base: Transformacion = { ...IDENTIDAD }
    let modo: Modo = 'nada'
    let distPrevio = 0
    let centroPrevio = { x: 0, y: 0 }
    let panPrevio = { x: 0, y: 0 }
    let caja: Caja = { left: 0, top: 0, width: el.offsetWidth, height: el.offsetHeight }
    let toquePrevio = { tiempo: 0, x: 0, y: 0 }
    let temporizadorTransicion = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const medirCaja = () => {
      const r = el.getBoundingClientRect()
      const centroX = r.left + r.width / 2 - base.x
      const centroY = r.top + r.height / 2 - base.y
      caja = {
        left: centroX - el.offsetWidth / 2,
        top: centroY - el.offsetHeight / 2,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }
    }

    const pintar = () => {
      base = limitarPan(base, caja.width, caja.height)
      el.style.transform = transformarCss(base)
    }

    const regresar = () => {
      window.clearTimeout(temporizadorTransicion)
      if (!reducedMotion) el.style.transition = 'transform 200ms ease-out'
      base = { ...IDENTIDAD }
      el.style.transform = transformarCss(base)
      temporizadorTransicion = window.setTimeout(() => {
        el.style.transition = ''
      }, 220)
    }

    const zoomEnPunto = (clientX: number, clientY: number, escalaDestino: number) => {
      medirCaja()
      const p = puntoEnCaja(clientX, clientY, caja, base)
      base = aplicarZoomHacia(base, limitarEscala(escalaDestino), p)
      pintar()
    }

    const alternarDobleToque = (clientX: number, clientY: number) => {
      if (base.escala > 1) {
        regresar()
        return
      }
      zoomEnPunto(clientX, clientY, ESCALA_DOBLE_TOQUE)
    }

    const distancia = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const puntoMedio = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    })

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.stopPropagation()
        modo = 'pinch'
        medirCaja()
        distPrevio = distancia(e.touches)
        centroPrevio = puntoMedio(e.touches)
        return
      }
      if (e.touches.length !== 1) return
      const t0 = e.touches[0]

      if (esDobleToque(performance.now(), toquePrevio.tiempo, t0.clientX, t0.clientY, toquePrevio.x, toquePrevio.y)) {
        e.stopPropagation()
        toquePrevio = { tiempo: 0, x: 0, y: 0 }
        modo = 'nada'
        alternarDobleToque(t0.clientX, t0.clientY)
        return
      }
      toquePrevio = { tiempo: performance.now(), x: t0.clientX, y: t0.clientY }

      if (base.escala > 1 && modo === 'nada') {
        e.stopPropagation()
        modo = 'pan'
        medirCaja()
        panPrevio = { x: t0.clientX, y: t0.clientY }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (modo === 'pinch' && e.touches.length >= 2) {
        e.preventDefault()
        e.stopPropagation()
        medirCaja()
        const d = distancia(e.touches)
        const m = puntoMedio(e.touches)
        const factor = d / distPrevio
        if (Number.isFinite(factor) && factor > 0) {
          const p = puntoEnCaja(m.x, m.y, caja, base)
          base = aplicarZoomHacia(base, limitarEscala(base.escala * factor), p)
          base.x += m.x - centroPrevio.x
          base.y += m.y - centroPrevio.y
          pintar()
        }
        distPrevio = d
        centroPrevio = m
        return
      }
      if (modo === 'pan' && e.touches.length === 1) {
        e.preventDefault()
        e.stopPropagation()
        const t0 = e.touches[0]
        base.x += t0.clientX - panPrevio.x
        base.y += t0.clientY - panPrevio.y
        panPrevio = { x: t0.clientX, y: t0.clientY }
        pintar()
      }
    }

    const onTouchFin = (e: TouchEvent) => {
      if (modo === 'pinch') {
        if (e.touches.length === 1) {
          modo = 'pan'
          medirCaja()
          panPrevio = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        } else if (e.touches.length === 0) {
          modo = 'nada'
          if (base.escala <= UMBRAL_REGRESO) regresar()
        }
        return
      }
      if (modo === 'pan' && e.touches.length === 0) {
        modo = 'nada'
        if (base.escala <= UMBRAL_REGRESO) regresar()
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      zoomEnPunto(e.clientX, e.clientY, base.escala * Math.exp(-e.deltaY * 0.002))
    }

    const onDobleClic = (e: MouseEvent) => {
      alternarDobleToque(e.clientX, e.clientY)
    }

    const opciones = { capture: true } as AddEventListenerOptions
    el.addEventListener('touchstart', onTouchStart, opciones)
    el.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    el.addEventListener('touchend', onTouchFin, opciones)
    el.addEventListener('touchcancel', onTouchFin, opciones)
    el.addEventListener('wheel', onWheel, { capture: true, passive: false })
    el.addEventListener('dblclick', onDobleClic, opciones)

    return () => {
      const quitar = { capture: true } as EventListenerOptions
      el.removeEventListener('touchstart', onTouchStart, quitar)
      el.removeEventListener('touchmove', onTouchMove, quitar)
      el.removeEventListener('touchend', onTouchFin, quitar)
      el.removeEventListener('touchcancel', onTouchFin, quitar)
      el.removeEventListener('wheel', onWheel, quitar)
      el.removeEventListener('dblclick', onDobleClic, quitar)
      window.clearTimeout(temporizadorTransicion)
      el.style.transition = ''
      el.style.transform = ''
    }
  }, [])

  return { ref }
}
