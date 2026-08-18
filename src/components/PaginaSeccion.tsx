import type { Seccion } from '../data/catalog'

interface Props {
  seccion: Seccion
}

export function PaginaSeccion({ seccion }: Props) {
  return (
    <div className="seccion">
      <p className="seccion__kicker">Sección</p>
      <h2 className="seccion__titulo">{seccion.nombre}</h2>
      <p className="seccion__cantidad">
        {seccion.productos.length} {seccion.productos.length === 1 ? 'producto' : 'productos'}
      </p>
    </div>
  )
}