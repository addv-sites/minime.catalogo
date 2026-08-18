import { useRef, useState } from 'react'
import type { Producto, Seccion } from '../data/catalog'
import { normalizarPrecio } from '../utils/format'
import { rutaImagen, srcsetImagen } from '../data/catalog'
import { DetalleProducto } from './DetalleProducto'

interface Props {
  producto: Producto
  seccion: Seccion
}

const UMBRAL_TAP_PX = 10
const UMBRAL_TAP_MS = 300

export function TarjetaProducto({ producto, seccion }: Props) {
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const refTarjeta = useRef<HTMLDivElement>(null)
  const refInicioToque = useRef<{ x: number; y: number; t: number } | null>(null)
  const nombre = producto.nombre || 'Producto sin nombre'
  const imagen = rutaImagen(producto.imagen, 'nativa')
  const srcset = srcsetImagen(producto.imagen)
  const precio = normalizarPrecio(producto.precio)
  const agotado = !producto.disponible

  const abrirDetalle = () => {
    setDetalleAbierto(true)
  }

  const cerrarDetalle = () => {
    setDetalleAbierto(false)
    refTarjeta.current?.focus()
  }

  const onTeclado = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      abrirDetalle()
    }
  }

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const toque = e.touches[0]
    if (toque) refInicioToque.current = { x: toque.clientX, y: toque.clientY, t: Date.now() }
  }

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const inicio = refInicioToque.current
    refInicioToque.current = null
    const fin = e.changedTouches[0]
    if (!inicio || !fin) return
    const dx = fin.clientX - inicio.x
    const dy = fin.clientY - inicio.y
    const esTap = Math.hypot(dx, dy) < UMBRAL_TAP_PX && Date.now() - inicio.t < UMBRAL_TAP_MS
    if (esTap) abrirDetalle()
  }

  return (
    <>
      <article className={`tarjeta${agotado ? ' tarjeta--agotado' : ''}`}>
        <div
          ref={refTarjeta}
          role="button"
          tabIndex={0}
          className="tarjeta__boton"
          onClick={abrirDetalle}
          onKeyDown={onTeclado}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-haspopup="dialog"
          aria-label={`Ver detalle de ${nombre}`}
        />
        <div className="tarjeta__imagen-wrap">
          {imagen ? (
            <img
              className="tarjeta__imagen"
              src={imagen}
              srcSet={srcset}
              sizes="(max-width: 640px) 80vw, 320px"
              alt={`${nombre} de ${seccion.nombre}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="tarjeta__sin-imagen" aria-label="Producto sin imagen" />
          )}
          {agotado && <span className="tarjeta__agotado">AGOTADO</span>}
        </div>
        <div className="tarjeta__cuerpo">
          <h3 className="tarjeta__nombre">{nombre}</h3>
          <p className="tarjeta__codigo">{producto.codigo}</p>
          {producto.talla && <p className="tarjeta__talla">{producto.talla}</p>}
          <p className="tarjeta__precio">{precio || 'Consultar'}</p>
        </div>
      </article>
      {detalleAbierto && (
        <DetalleProducto producto={producto} seccion={seccion} onCerrar={cerrarDetalle} />
      )}
    </>
  )
}