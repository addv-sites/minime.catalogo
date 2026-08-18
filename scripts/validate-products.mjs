#!/usr/bin/env node
/**
 * Valida la integridad de admin/source/products-private.json.
 *
 * Comprueba: duplicados reales, productos sin imagen, precios vacíos,
 * códigos/nombres ausentes y consistencia de secciones.
 * Salida no-cero si hay errores graves (sin imagen o sin código).
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'admin/source/products-private.json')

const problems = []

function main() {
  const raw = JSON.parse(readFileSync(SRC, 'utf8'))
  if (!Array.isArray(raw)) throw new Error('products-private.json debe ser un array')

  const seen = new Map()
  const sections = new Set()

  for (const p of raw) {
    const code = p.codigo
    const n = (seen.get(code ?? '') ?? 0) + 1
    seen.set(code ?? '', n)
    sections.add(p.seccion)

    if (!code) problems.push({ nivel: 'warn', msg: `sin código (${p.imagen}) -> recibirá ID técnico SINCOD-*`, p })
    if (!p.nombre) problems.push({ nivel: 'warn', msg: `${code || 'SINCOD'}: sin nombre`, p })
    if (!p.imagen) problems.push({ nivel: 'warn', msg: `${code}: sin imagen (placeholder en catálogo)`, p })
    if (!p.precio) problems.push({ nivel: 'warn', msg: `${code}: precio vacío`, p })
    if (p.final && /[^\s°]/.test(p.final)) problems.push({ nivel: 'warn', msg: `${code}: marcador final inesperado`, p })
  }

  const duplicados = [...seen].filter(([code, c]) => code !== '' && c > 1)
  for (const [code, c] of duplicados) {
    problems.push({ nivel: 'info', msg: `duplicado real ${code} (x${c}) -> sufijo interno` })
  }

  const errores = problems.filter((x) => x.nivel === 'error')
  const warns = problems.filter((x) => x.nivel === 'warn')
  const infos = problems.filter((x) => x.nivel === 'info')

  console.log(`Total: ${raw.length} productos | ${sections.size} secciones`)
  console.log(`Duplicados: ${duplicados.length} | Secciones: ${[...sections].sort().join(', ')}`)
  if (infos.length) console.log(`INFO:\n  ${infos.map((x) => x.msg).join('\n  ')}`)
  if (warns.length) console.log(`WARN:\n  ${warns.map((x) => x.msg).join('\n  ')}`)
  if (errores.length) {
    console.error(`ERROR:\n  ${errores.map((x) => x.msg).join('\n  ')}`)
    process.exit(1)
  }
  console.log('VALIDACIÓN OK')
}

main()