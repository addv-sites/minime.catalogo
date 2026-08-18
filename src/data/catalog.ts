export interface Producto {
  codigo: string
  nombre: string
  talla: string
  precio: string
  sugerido: string
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

export function rutaImagen(nombre: string | null): string {
  if (!nombre) return ''
  return `./assets/images/products/${nombre}`
}
