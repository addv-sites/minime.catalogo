import type { Producto, Seccion } from '../data/catalog'
import { normalizarPrecio } from '../utils/format'
import { rutaImagen, srcsetImagen } from '../data/catalog'

interface Props {
  producto: Producto
  seccion: Seccion
}

export function TarjetaProducto({ producto, seccion }: Props) {
  const nombre = producto.nombre || 'Producto sin nombre'
  const imagen = rutaImagen(producto.imagen, 'nativa')
  const srcset = srcsetImagen(producto.imagen)
  const precio = normalizarPrecio(producto.precio)
  const agotado = !producto.disponible

  return (
    <article className={`tarjeta${agotado ? ' tarjeta--agotado' : ''}`}>
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
  )
}