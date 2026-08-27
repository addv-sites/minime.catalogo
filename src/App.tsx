import { useEffect, useMemo, useRef, useState } from 'react'
import { cargarCatalogo, type Catalogo } from './data/catalog'
import { Libro, type FlipApi } from './components/Libro'
import { Busqueda } from './components/Busqueda'
import { indiceProducto, paginarCatalogo } from './utils/paginacion'
import { soloDisponibles } from './utils/filtros'
import './App.css'

export default function App() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [soloDisponiblesActivo, setSoloDisponiblesActivo] = useState(false)
  const apiLibro = useRef<FlipApi | null>(null)

  useEffect(() => {
    cargarCatalogo()
      .then(setCatalogo)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error desconocido'))
  }, [])

  const catalogoVisible = useMemo(
    () => (catalogo && soloDisponiblesActivo ? soloDisponibles(catalogo) : catalogo),
    [catalogo, soloDisponiblesActivo],
  )

  const paginas = useMemo(
    () => (catalogoVisible ? paginarCatalogo(catalogoVisible.secciones) : []),
    [catalogoVisible],
  )

  if (error) {
    return (
      <main className="app">
        <h1 className="app__brand">MINI ME</h1>
        <p role="alert">No se pudo cargar el catálogo: {error}</p>
      </main>
    )
  }

  if (!catalogo || !catalogoVisible) {
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
          <div className="app__marca">
            <p className="app__brand">{catalogoVisible.meta.marca}</p>
            <p className="app__totales">
              {catalogoVisible.meta.totalProductos} productos · {catalogoVisible.meta.totalSecciones} secciones
            </p>
          </div>
          <label className="app__filtro">
            <input
              type="checkbox"
              className="app__filtro-input"
              checked={soloDisponiblesActivo}
              onChange={(e) => setSoloDisponiblesActivo(e.target.checked)}
              role="switch"
              aria-checked={soloDisponiblesActivo}
              aria-label="Ver solo productos disponibles"
            />
            <span className="app__filtro-track" aria-hidden="true" />
            <span className="app__filtro-texto">
              <span className="app__filtro-texto--largo">Solo disponibles</span>
              <span className="app__filtro-texto--corto" aria-hidden="true">
                Solo disp.
              </span>
            </span>
          </label>
        </div>
        <Busqueda secciones={catalogoVisible.secciones} onSeleccionar={irAProducto} />
      </header>
      <Libro key={soloDisponiblesActivo ? 'disponibles' : 'catalogo'} catalogo={catalogoVisible} apiRef={apiLibro} />
      <footer className="app__pie">
        <p className="app__pie-texto">Catálogo hecho por ADDV</p>
        <a className="app__pie-enlace" href="https://addv.mx" target="_blank" rel="noopener noreferrer">
          Sitio web addv.mx
        </a>
        <a className="app__pie-enlace" href="mailto:info@addv.mx">
          Contacto info@addv.mx
        </a>
      </footer>
    </main>
  )
}