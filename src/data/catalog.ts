export interface Producto {
  codigo: string
  nombre: string
  talla: string
  precio: string
  existencias: number
  disponible: boolean
  imagen: string | null
}

export interface Seccion {
  nombre: string
  productos: Producto[]
}

export interface Catalogo {
  meta: {
    marca: string
    descripcion: string
    totalProductos: number
    totalSecciones: number
    generado: string
  }
  secciones: Seccion[]
}

const DATA_URL = './data/products.json'

let cache: Catalogo | null = null

export async function cargarCatalogo(): Promise<Catalogo> {
  if (cache) return cache
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`No se pudo cargar el catálogo (${res.status})`)
  cache = (await res.json()) as Catalogo
  return cache
}

export type VarianteImagen = 'nativa' | 'thumb' | 'detalle'

const SUFIJO_VARIANTE: Record<VarianteImagen, string> = {
  nativa: '',
  thumb: '-thumb',
  detalle: '@2x',
}

export function rutaImagen(nombre: string | null, variante: VarianteImagen = 'nativa'): string {
  if (!nombre) return ''
  const base = nombre.replace(/\.webp$/, '')
  return `./assets/images/products/${base}${SUFIJO_VARIANTE[variante]}.webp`
}

export function srcsetImagen(nombre: string | null): string {
  if (!nombre) return ''
  const base = nombre.replace(/\.webp$/, '')
  return [
    `./assets/images/products/${base}-thumb.webp 160w`,
    `./assets/images/products/${base}.webp 346w`,
    `./assets/images/products/${base}@2x.webp 692w`,
  ].join(', ')
}
