import { useEffect, useState } from 'react'
import { cargarCatalogo, type Catalogo } from './data/catalog'
import './App.css'

export default function App() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    cargarCatalogo()
      .then(setCatalogo)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error desconocido'))
  }, [])

  if (error) {
    return (
      <main className="app">
        <h1>MINI ME</h1>
        <p role="alert">No se pudo cargar el catálogo: {error}</p>
      </main>
    )
  }

  if (!catalogo) {
    return (
      <main className="app">
        <h1>MINI ME</h1>
        <p>Cargando catálogo…</p>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="app__header">
        <p className="app__brand">{catalogo.meta.marca}</p>
        <h1 className="app__title">Catálogo</h1>
        <p className="app__subtitle">
          {catalogo.meta.totalProductos} productos · {catalogo.meta.totalSecciones} secciones
        </p>
      </header>
      <section className="app__section-list" aria-label="Secciones del catálogo">
        {catalogo.secciones.map((seccion) => (
          <article key={seccion.nombre} className="app__section">
            <h2 className="app__section-title">{seccion.nombre}</h2>
            <p className="app__section-count">{seccion.productos.length} productos</p>
          </article>
        ))}
      </section>
    </main>
  )
}
