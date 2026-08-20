#!/usr/bin/env node
/**
 * Genera public/data/products.json a partir de admin/source/products-private.json.
 *
 * Reglas:
 *  - Solo expone los campos mínimos que el catálogo necesita (sin tabla/final internos).
 *  - Preserva IDs originales; los duplicados reales reciben sufijo técnico (-2, -3...).
 *  - Agrupa productos por sección (orden estable por número de tabla).
 *  - Imagen referenciada como <nombre>.webp (la UI resuelve la ruta pública).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'admin/source/products-private.json')
const OUT = resolve(ROOT, 'public/data/products.json')

const SECTION_ORDER = [
  'CALCETAS Y TINES',
  'ROPA NIÑA',
  'ESTIMULACIÓN PSICOMOTRIZ',
  'PAÑALERAS Y BOLSAS ORGANIZADORAS',
  'ROPA NIÑO',
  'BABEROS',
  'KIT',
  'ZAPATITOS',
  'PELUCHES',
  'HIGIENE',
  'DETALLITOS',
  'TODO PARA SU CHUPÓN',
  'ACCESORIOS PARA SU CABECITA',
  'SABANITAS Y COBIJITAS',
  'FULARES Y CANGURERAS',
]

function normalizeSection(name) {
  const n = String(name || '').trim().toUpperCase()
  return SECTION_ORDER.find((s) => s === n) ?? n
}

function contarExistencias(p) {
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

function toPublicProduct(p, suffix) {
  const base = (p.imagen || '').split('.')[0]
  const existencias = contarExistencias(p)
  return {
    codigo: suffix > 1 ? `${p.codigo}-${suffix}` : p.codigo,
    nombre: (p.nombre || '').trim(),
    talla: (p.talla || '').trim(),
    precio: (p.sugerido || '').trim() || (p.precio || '').trim(),
    existencias,
    disponible: p.disponible !== false && existencias > 0,
    imagen: base ? `${base}.webp` : null,
  }
}

function main() {
  const raw = JSON.parse(readFileSync(SRC, 'utf8'))
  if (!Array.isArray(raw)) throw new Error('products-private.json debe ser un array')

  const seen = new Map() // codigo -> count
  const sections = new Map()
  let sinCodigo = 0

  for (const p of raw) {
    const key = p.codigo || `SINCOD-${++sinCodigo}`
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    const name = normalizeSection(p.seccion)
    if (!sections.has(name)) sections.set(name, { nombre: name, productos: [] })
    sections.get(name).productos.push(toPublicProduct(p, count))
  }

  const catalog = {
    meta: {
      marca: 'MINI ME',
      descripcion: 'Catálogo digital premium de ropa para bebé',
      totalProductos: raw.length,
      totalSecciones: sections.size,
      generado: new Date().toISOString(),
    },
    secciones: [...sections.values()].map((s) => ({
      ...s,
      productos: s.productos.sort((a, b) => a.codigo.localeCompare(b.codigo, 'en', { numeric: true })),
    })),
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(catalog, null, 2), 'utf8')

  const duplicados = [...seen].filter(([, c]) => c > 1)
  console.log(`OK: ${catalog.meta.totalProductos} productos, ${catalog.meta.totalSecciones} secciones -> ${OUT}`)
  if (duplicados.length) {
    console.log(`Duplicados con sufijo: ${duplicados.map(([c, n]) => `${c} (x${n})`).join(', ')}`)
  }
}

main()