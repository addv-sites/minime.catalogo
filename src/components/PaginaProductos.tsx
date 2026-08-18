import type { Producto, Seccion } from '../data/catalog'
import { TarjetaProducto } from './TarjetaProducto'

interface Props {
  seccion: Seccion
  productos: Producto[]
  numero: number
  total: number
}

export function PaginaProductos({ seccion, productos, numero, total }: Props) {
  return (
    <div className="pagina-productos">
      <header className="pagina-productos__encabezado">
        <h2 className="pagina-productos__titulo">{seccion.nombre}</h2>
        <p className="pagina-productos__indicador">
          {numero} de {total}
        </p>
      </header>
      <div className="pagina-productos__rejilla">
        {productos.map((producto) => (
          <TarjetaProducto key={`${producto.codigo}-${producto.imagen}`} producto={producto} seccion={seccion} />
        ))}
      </div>
    </div>
  )
}