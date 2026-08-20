import { useEffect, useMemo, useState } from 'react'

interface ProductoPrivado {
  seccion: string
  tabla: number
  codigo: string
  nombre: string
  talla: string
  precio: string
  sugerido: string
  final: string
  imagen: string
  disponible?: boolean
}

const DATA_URL = './admin/source/products-private.json'

function contarExistencias(p: ProductoPrivado): number {
  // Regla: se cuentan SOLO los '°' que no van seguidos de un dígito.
  // '°50', '°65', '°°47.5' → los '°' pegados a un número son precios, se ignoran.
  const final = (p.final || '').trim()
  if (!final) return 0
  let n = 0
  for (let i = 0; i < final.length; i++) {
    if (final[i] === '°') {
      const siguiente = final[i + 1]
      if (!siguiente || !/[0-9]/.test(siguiente)) n++
    }
  }
  return n
}

export function AdminApp() {
  const [productos, setProductos] = useState<ProductoPrivado[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [seccion, setSeccion] = useState('')

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: ProductoPrivado[]) => setProductos(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error desconocido'))
  }, [])

  const secciones = useMemo(() => {
    if (!productos) return []
    const orden = Array.from(new Set(productos.map((p) => p.seccion)))
    const indice = new Map(orden.map((s, i) => [s, i]))
    return [...productos.reduce((acc, p) => {
      const idx = indice.get(p.seccion) ?? 0
      acc.set(p.seccion, { nombre: p.seccion, total: (acc.get(p.seccion)?.total ?? 0) + 1, idx })
      return acc
    }, new Map<string, { nombre: string; total: number; idx: number }>()).values()].sort((a, b) => a.idx - b.idx)
  }, [productos])

  const filtrados = useMemo(() => {
    if (!productos) return []
    const q = filtro.trim().toLowerCase()
    return productos.filter((p) => {
      if (seccion && p.seccion !== seccion) return false
      if (!q) return true
      return [p.codigo, p.nombre, p.talla].some((v) => v.toLowerCase().includes(q))
    })
  }, [productos, filtro, seccion])

  const actualizar = (codigo: string, patch: Partial<ProductoPrivado>) => {
    setProductos((prev) => (prev ? prev.map((p) => (p.codigo === codigo ? { ...p, ...patch } : p)) : prev))
  }

  const actualizarExistencias = (codigo: string, raw: string) => {
    const n = Math.max(0, Number.parseInt(raw, 10) || 0)
    actualizar(codigo, { final: n > 0 ? '°'.repeat(n) : '' })
  }

  const exportar = () => {
    if (!productos) return
    const blob = new Blob([JSON.stringify(productos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-private.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <main className="admin">
        <h1 className="admin__titulo">Administrador MINI ME</h1>
        <p role="alert" className="admin__error">
          No se pudo cargar {DATA_URL}: {error}. Asegurate de correr el servidor de dev (npm run admin).
        </p>
      </main>
    )
  }

  if (!productos) {
    return (
      <main className="admin">
        <h1 className="admin__titulo">Administrador MINI ME</h1>
        <p>Cargando datos…</p>
      </main>
    )
  }

  return (
    <main className="admin">
      <header className="admin__barra">
        <h1 className="admin__titulo">Administrador MINI ME</h1>
        <button type="button" className="admin__exportar" onClick={exportar}>
          Exportar JSON
        </button>
      </header>

      <div className="admin__filtros">
        <label className="admin__filtro">
          <span>Buscar</span>
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Código, nombre o talla…" />
        </label>
        <label className="admin__filtro">
          <span>Sección</span>
          <select value={seccion} onChange={(e) => setSeccion(e.target.value)}>
            <option value="">Todas</option>
            {secciones.map((s) => (
              <option key={s.nombre} value={s.nombre}>
                {s.nombre} ({s.total})
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="admin__conteo">
        {filtrados.length} de {productos.length} productos
      </p>

<div className="admin__tabla">
          <div className="admin__fila admin__fila--cabecera">
            <span>Código</span>
            <span>Nombre</span>
            <span>Talla</span>
            <span>Precio orig</span>
            <span>Precio catálogo</span>
            <span>Existencias</span>
            <span>Disponible</span>
          </div>
          {filtrados.map((p) => {
            const existencias = contarExistencias(p)
            const efectivo = p.disponible !== false && existencias > 0
            return (
              <div className="admin__fila" key={`${p.codigo}-${p.imagen}`}>
                <span className="admin__codigo">{p.codigo || 'SINCOD'}</span>
                <input value={p.nombre} onChange={(e) => actualizar(p.codigo, { nombre: e.target.value })} aria-label="Nombre" />
                <input value={p.talla} onChange={(e) => actualizar(p.codigo, { talla: e.target.value })} aria-label="Talla" />
                <input value={p.precio} onChange={(e) => actualizar(p.codigo, { precio: e.target.value })} aria-label="Precio original" />
                <input value={p.sugerido} onChange={(e) => actualizar(p.codigo, { sugerido: e.target.value })} aria-label="Precio catálogo" />
                <input
                  type="number"
                  min={0}
                  value={existencias}
                  onChange={(e) => actualizarExistencias(p.codigo, e.target.value)}
                  aria-label={`Existencias ${p.codigo}`}
                  title="Existencias (edita el campo final, ° por pieza)"
                />
                <div className="admin__disp">
                  <input
                    type="checkbox"
                    className="admin__checkbox"
                    aria-label={`Disponible ${p.codigo}`}
                    checked={p.disponible !== false}
                    onChange={(e) => actualizar(p.codigo, { disponible: e.target.checked })}
                  />
                  <span className={efectivo ? 'admin__estado admin__estado--ok' : 'admin__estado admin__estado--no'}>
                    {efectivo ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
    </main>
  )
}