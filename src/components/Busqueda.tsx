import { useMemo, useRef, useState } from 'react'
import type { Seccion } from '../data/catalog'
import { buscarProductos } from '../utils/busqueda'

interface Props {
  secciones: Seccion[]
  onSeleccionar: (codigo: string) => void
}

export function Busqueda({ secciones, onSeleccionar }: Props) {
  const [consulta, setConsulta] = useState('')
  const [activo, setActivo] = useState(false)
  const [indiceResultado, setIndiceResultado] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const resultados = useMemo(() => buscarProductos(secciones, consulta, 12), [secciones, consulta])

  const cerrar = () => {
    setActivo(false)
    setConsulta('')
    inputRef.current?.blur()
  }

  const seleccionar = (codigo: string) => {
    onSeleccionar(codigo)
    cerrar()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!resultados.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceResultado((i) => (i + 1) % resultados.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceResultado((i) => (i - 1 + resultados.length) % resultados.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const resultado = resultados[indiceResultado]
      if (resultado) seleccionar(resultado.producto.codigo)
    } else if (e.key === 'Escape') {
      cerrar()
    }
  }

  return (
    <div className="busqueda">
      <label className="busqueda__etiqueta" htmlFor="busqueda-input">
        Buscar producto
      </label>
      <input
        ref={inputRef}
        id="busqueda-input"
        className="busqueda__input"
        type="search"
        placeholder="Código, nombre o talla…"
        value={consulta}
        onChange={(e) => {
          setConsulta(e.target.value)
          setIndiceResultado(0)
          setActivo(true)
        }}
        onFocus={() => setActivo(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={activo && resultados.length > 0}
        aria-controls="busqueda-resultados"
        aria-autocomplete="list"
        autoComplete="off"
      />

      {activo && resultados.length > 0 && (
        <ul id="busqueda-resultados" className="busqueda__resultados" role="listbox">
          {resultados.map(({ producto, seccion }, i) => (
            <li key={`${producto.codigo}-${producto.imagen}`} role="option" aria-selected={i === indiceResultado}>
              <button
                type="button"
                className="busqueda__item"
                data-selected={i === indiceResultado}
                onClick={() => seleccionar(producto.codigo)}
                onMouseEnter={() => setIndiceResultado(i)}
              >
                <span className="busqueda__codigo">{producto.codigo}</span>
                <span className="busqueda__nombre">{producto.nombre}</span>
                <span className="busqueda__seccion">{seccion.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {activo && consulta && resultados.length === 0 && (
        <p className="busqueda__vacio" role="status">
          Sin resultados para “{consulta}”
        </p>
      )}
    </div>
  )
}