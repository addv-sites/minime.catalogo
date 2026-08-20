#!/usr/bin/env python3
"""
Actualiza los costos de admin/source/products-private.json desde Productos.docx.

Qué actualiza (por código, conservando nombre/talla/imagen/disponible existentes):
  - precio   (columna "Precio")
  - sugerido (columna "Precio sugerido") = el costo final mostrado en el catálogo
  - final    (columna "Precio final")     = fuente de existencias (formato Npz°PRECIO)

Productos nuevos presentes solo en el docx se agregan (imagen → null, placeholder).

Regla de existencias (se aplica en generate-products.mjs y en el admin):
  - Se cuentan SOLO los '°' que NO van seguidos de un dígito.
  - '°50', '°65', '°°47.5' → los '°' pegados a un número son PRECIOS, se ignoran.
  - '1pz°' = 1 · '2pz°°' = 2 · '1pz°95' = 0 · '2pz°30°' = 1.

Uso: python3 scripts/update-costos.py [ruta_docx]
"""
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCX = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "Productos.docx"
SRC = ROOT / "admin" / "source" / "products-private.json"

SECCIONES = [
    "CALCETAS Y TINES", "ROPA NIÑA", "ESTIMULACIÓN PSICOMOTRIZ",
    "PAÑALERAS Y BOLSAS ORGANIZADORAS", "ROPA NIÑO", "BABEROS", "KIT",
    "ZAPATITOS", "PELUCHES", "HIGIENE", "DETALLITOS", "TODO PARA SU CHUPÓN",
    "ACCESORIOS PARA SU CABECITA", "SABANITAS Y COBIJITAS", "FULARES Y CANGURERAS",
]

CODIGO = re.compile(r"^[A-Z]{1,4}\d+")

PREFIJO_SECCION = {
    "C": "CALCETAS Y TINES",
    "RA": "ROPA NIÑA",
    "EP": "ESTIMULACIÓN PSICOMOTRIZ",
    "PB": "PAÑALERAS Y BOLSAS ORGANIZADORAS",
    "PN": "PAÑALERAS Y BOLSAS ORGANIZADORAS",
    "RO": "ROPA NIÑO",
    "B": "BABEROS",
    "K": "KIT",
    "Z": "ZAPATITOS",
    "P": "PELUCHES",
    "H": "HIGIENE",
    "D": "DETALLITOS",
    "TPC": "TODO PARA SU CHUPÓN",
    "APC": "ACCESORIOS PARA SU CABECITA",
    "SC": "SABANITAS Y COBIJITAS",
    "FC": "FULARES Y CANGURERAS",
}


def seccion_por_prefijo(codigo: str) -> str:
    for prefijo, seccion in PREFIJO_SECCION.items():
        if codigo.startswith(prefijo):
            return seccion
    return ""


def extraer_filas(docx: Path):
    with zipfile.ZipFile(docx) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    filas = []
    for fila in re.findall(r"<w:tr[ >].*?</w:tr>", xml, re.S):
        celdas = [re.sub(r"<[^>]+>", "", c).strip() for c in re.findall(r"<w:tc>.*?</w:tc>", fila, re.S)]
        if celdas:
            filas.append(celdas)
    return filas


def seccion_de(texto: str) -> str | None:
    for s in SECCIONES:
        if texto.upper() == s or texto.upper() in s:
            return s
    return None


def main() -> int:
    filas = extraer_filas(DOCX)
    actual = json.loads(SRC.read_text("utf-8"))
    por_codigo = {p.get("codigo"): p for p in actual if p.get("codigo")}

    seccion_actual = None
    docx_por_codigo: dict[str, dict] = {}
    fila_codigos = []
    for fila in filas:
        if any(seccion_de(c) for c in fila if c):
            for c in fila:
                if seccion_de(c):
                    seccion_actual = seccion_de(c)
        if len(fila) < 6:
            continue
        texto = fila[1]
        m = CODIGO.match(texto)
        if not m:
            continue
        codigo = m.group(0)
        fila_codigos.append(codigo)
        nombre = texto[m.end():].strip()
        docx_por_codigo[codigo] = {
            "seccion": seccion_actual or seccion_por_prefijo(codigo),
            "nombre": nombre,
            "talla": fila[2],
            "precio": fila[3],
            "sugerido": fila[4],
            "final": fila[5],
        }

    actualizados = 0
    nuevos = []
    for codigo, fila in docx_por_codigo.items():
        if codigo in por_codigo:
            p = por_codigo[codigo]
            p["seccion"] = fila["seccion"]
            p["precio"] = fila["precio"]
            p["sugerido"] = fila["sugerido"]
            p["final"] = fila["final"]
            actualizados += 1
        else:
            actual.append({
                "seccion": fila["seccion"],
                "tabla": 0,
                "codigo": codigo,
                "nombre": fila["nombre"],
                "talla": fila["talla"],
                "precio": fila["precio"],
                "sugerido": fila["sugerido"],
                "final": fila["final"],
                "imagen": None,
            })
            nuevos.append(codigo)

    SRC.write_text(json.dumps(actual, ensure_ascii=False, indent=2) + "\n", "utf-8")

    sin_match = [c for c in por_codigo if c not in docx_por_codigo and c]
    print(f"DOCX: {DOCX.name}")
    print(f"Filas de producto leídas: {len(docx_por_codigo)} | códigos únicos: {len(set(fila_codigos))}")
    print(f"Actualizados (precio/sugerido/final): {actualizados}")
    print(f"Nuevos agregados: {len(nuevos)} -> {nuevos}")
    print(f"Existentes sin match en docx (se conservan): {len(sin_match)} -> {sin_match}")
    print(f"Total JSON: {len(actual)} productos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())