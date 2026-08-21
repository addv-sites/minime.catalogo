import { useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import type { Catalogo } from '../data/catalog'
import { indiceSeccion, paginarCatalogo, type Pagina } from '../utils/paginacion'
import { usePinchZoom } from '../hooks/usePinchZoom'
import { Portada } from './Portada'
import { Introduccion } from './Introduccion'
import { PaginaSeccion } from './PaginaSeccion'
import { PaginaProductos } from './PaginaProductos'
import { Contraportada } from './Contraportada'
import './libro.css'

export interface FlipApi {
  flipNext: () => void
  flipPrev: () => void
  turnToPage: (pagina: number) => void
}

type FlipHandle = { pageFlip: () => FlipApi }

interface Props {
  catalogo: Catalogo
  apiRef?: React.RefObject<FlipApi | null>
}

function ContenidoPagina({ pagina }: { pagina: Pagina }) {
  switch (pagina.tipo) {
    case 'portada':
      return <Portada />
    case 'intro':
      return <Introduccion />
    case 'seccion':
      return <PaginaSeccion seccion={pagina.seccion} />
    case 'productos':
      return <PaginaProductos seccion={pagina.seccion} productos={pagina.productos} numero={pagina.numero} total={pagina.total} />
    case 'contraportada':
      return <Contraportada />
  }
}

export function Libro({ catalogo, apiRef }: Props) {
  const paginas = useMemo(() => paginarCatalogo(catalogo.secciones), [catalogo])
  const flipRef = useRef<FlipHandle | null>(null)
  const { ref: refZoom } = usePinchZoom()
  const [indiceActual, setIndiceActual] = useState(0)
  const [indiceVisible, setIndiceVisible] = useState(false)
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const totalPaginas = paginas.length

  const voltear = (direccion: 1 | -1) => {
    const flip = flipRef.current?.pageFlip()
    if (!flip) return
    const conAjustes = flip as unknown as {
      getSettings: () => { disableFlipByClick: boolean }
    }
    const ajustes = conAjustes.getSettings()
    const previo = ajustes.disableFlipByClick
    ajustes.disableFlipByClick = false
    if (direccion === 1) flip.flipNext()
    else flip.flipPrev()
    ajustes.disableFlipByClick = previo
  }

  const irAdelante = () => voltear(1)
  const irAtras = () => voltear(-1)

  useEffect(() => {
    if (!apiRef) return
    apiRef.current = {
      flipNext: () => voltear(1),
      flipPrev: () => voltear(-1),
      turnToPage: (pagina: number) => flipRef.current?.pageFlip().turnToPage(pagina),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiRef])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const objetivo = e.target as HTMLElement | null
      const esInput = objetivo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo.tagName)
      if (indiceVisible || esInput) return
      if (e.key === 'ArrowRight') irAdelante()
      if (e.key === 'ArrowLeft') irAtras()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceVisible])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIndiceVisible(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const saltarASeccion = (nombre: string) => {
    const pagina = indiceSeccion(paginas, nombre)
    if (pagina >= 0) {
      flipRef.current?.pageFlip().turnToPage(pagina)
      setIndiceVisible(false)
    }
  }

  return (
    <section className="libro" aria-label="Catálogo MINI ME">
      <div className="libro__escena">
        <div className="libro__zoom" ref={refZoom}>
          <HTMLFlipBook
          startPage={0}
          size="stretch"
          width={360}
          height={540}
          minWidth={240}
          maxWidth={600}
          minHeight={360}
          maxHeight={900}
          drawShadow={true}
          flippingTime={reducedMotion ? 1 : 600}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.35}
          showCover={true}
          mobileScrollSupport={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={20}
          showPageCorners={false}
          disableFlipByClick={true}
          className="libro__flip"
          style={{}}
          onFlip={(e: { data: number }) => setIndiceActual(e.data)}
          ref={flipRef}
        >
          {paginas.map((pagina, i) => (
            <div className="pagina" key={`${pagina.tipo}-${i}`}>
              <ContenidoPagina pagina={pagina} />
            </div>
          ))}
          </HTMLFlipBook>
        </div>
      </div>

      <div className="libro__controles">
        <button type="button" className="libro__boton" onClick={irAtras} aria-label="Página anterior">
          ‹
        </button>
        <p className="libro__indicador" aria-live="polite">
          Página {indiceActual + 1} de {totalPaginas}
        </p>
        <button type="button" className="libro__boton" onClick={irAdelante} aria-label="Página siguiente">
          ›
        </button>
        <button
          type="button"
          className="libro__boton libro__boton--indice"
          onClick={() => setIndiceVisible((v) => !v)}
          aria-expanded={indiceVisible}
          aria-haspopup="true"
        >
          Índice
        </button>
      </div>

      {indiceVisible && (
        <div className="libro__indice" role="dialog" aria-modal="false" aria-label="Índice de secciones">
          <h2 className="libro__indice-titulo">Secciones</h2>
          <ul className="libro__indice-lista">
            {catalogo.secciones.map((seccion) => (
              <li key={seccion.nombre}>
                <button type="button" className="libro__indice-item" onClick={() => saltarASeccion(seccion.nombre)}>
                  <span className="libro__indice-nombre">{seccion.nombre}</span>
                  <span className="libro__indice-cantidad">{seccion.productos.length}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="libro__indice-cerrar" onClick={() => setIndiceVisible(false)}>
            Cerrar
          </button>
        </div>
      )}
    </section>
  )
}