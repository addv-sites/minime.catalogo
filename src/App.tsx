import { useEffect, useMemo, useRef, useState } from 'react'
import { cargarCatalogo, type Catalogo } from './data/catalog'
import { Libro, type FlipApi } from './components/Libro'
import { Busqueda } from './components/Busqueda'
import { indiceProducto, paginarCatalogo } from './utils/paginacion'
import './App.css'

export default function App() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const apiLibro = useRef<FlipApi | null>(null)

  useEffect(() => {
    cargarCatalogo()
      .then(setCatalogo)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error desconocido'))
  }, [])

  const paginas = useMemo(() => (catalogo ? paginarCatalogo(catalogo.secciones) : []), [catalogo])

  if (error) {
    return (
      <main className="app">
        <h1 className="app__brand">MINI ME</h1>
        <p role="alert">No se pudo cargar el catálogo: {error}</p>
      </main>
    )
  }

  if (!catalogo) {
    return (
      <main className="app">
        <h1 className="app__brand">MINI ME</h1>
        <p>Cargando catálogo…</p>
      </main>
    )
  }

  const irAProducto = (codigo: string) => {
    const pagina = indiceProducto(paginas, codigo)
    if (pagina >= 0) apiLibro.current?.turnToPage(pagina)
  }

  return (
    <main className="app">
      <header className="app__barra">
        <div className="app__cabecera">
          <p className="app__brand">{catalogo.meta.marca}</p>
          <p className="app__totales">
            {catalogo.meta.totalProductos} productos · {catalogo.meta.totalSecciones} secciones
          </p>
        </div>
        <Busqueda secciones={catalogo.secciones} onSeleccionar={irAProducto} />
      </header>
      <Libro catalogo={catalogo} apiRef={apiLibro} />
      <footer className="app__pie">
        <p className="app__pie-texto">Catálogo hecho por ADDV</p>
        <a className="app__pie-enlace" href="mailto:info@addv.mx">
          Contacto info@addv.mx
        </a>
      </footer>
    </main>
  )
}