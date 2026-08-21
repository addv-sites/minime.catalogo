import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Producto, Seccion } from '../data/catalog'
import { normalizarPrecio } from '../utils/format'
import { rutaImagen, srcsetImagen } from '../data/catalog'
import { usePinchZoom } from '../hooks/usePinchZoom'

interface Props {
  producto: Producto
  seccion: Seccion
  onCerrar: () => void
}

export function DetalleProducto({ producto, seccion, onCerrar }: Props) {
  const refCerrar = useRef<HTMLButtonElement>(null)
  const { ref: refZoom } = usePinchZoom()
  const nombre = producto.nombre || 'Producto sin nombre'
  const imagen = rutaImagen(producto.imagen, 'detalle')
  const srcset = srcsetImagen(producto.imagen)
  const precio = normalizarPrecio(producto.precio)
  const agotado = !producto.disponible
  const etiquetaExistencias =
    producto.existencias === 1 ? '1 pieza en existencia' : `${producto.existencias} piezas en existencia`

  useEffect(() => {
    refCerrar.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar])

  const cerrarSiFondo = (e: { target: EventTarget; currentTarget: EventTarget }) => {
    if (e.target === e.currentTarget) onCerrar()
  }

  return createPortal(
    <div
      className="detalle"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${nombre}`}
      onMouseDown={cerrarSiFondo}
      onTouchEnd={cerrarSiFondo}
    >
      <div className="detalle__panel" onKeyDown={(e) => e.stopPropagation()}>
        <button
          ref={refCerrar}
          type="button"
          className="detalle__cerrar"
          onClick={onCerrar}
          aria-label="Cerrar detalle"
        >
          ✕
        </button>
        <div className="detalle__imagen-wrap" ref={refZoom}>
          {imagen ? (
            <img
              className="detalle__imagen"
              src={imagen}
              srcSet={srcset}
              sizes="(max-width: 640px) 92vw, 480px"
              alt={`${nombre} de ${seccion.nombre}`}
              decoding="async"
            />
          ) : (
            <div className="tarjeta__sin-imagen" aria-label="Producto sin imagen" />
          )}
          {agotado && <span className="tarjeta__agotado">AGOTADO</span>}
        </div>
        <div className="detalle__cuerpo">
          <p className="detalle__codigo">{producto.codigo}</p>
          <h2 className="detalle__nombre">{nombre}</h2>
          <p className="detalle__seccion">{seccion.nombre}</p>
          {producto.talla && <p className="detalle__talla">{producto.talla}</p>}
          <p className="detalle__precio">{precio || 'Consultar'}</p>
          {producto.existencias > 0 && <p className="detalle__existencias">{etiquetaExistencias}</p>}
          <p className="detalle__zoom">Puedes hacer zoom con dos dedos</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}