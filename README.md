# MINI ME — Catálogo Digital Premium de Ropa para Bebé

Catálogo online premium de ropa para bebé de la marca **MINI ME**, diseñado para sentirse como un **catálogo editorial físico convertido en experiencia digital interactiva**.

El sitio será **100% estático** y desplegable en **GitHub Pages**, sin backend, base de datos, API ni CMS.

---

## Estado actual

> **Fase actual: Análisis de datos y assets — completado. Datos migrados al repo. Implementación pendiente.**

| Fase | Estado |
|---|---|
| Análisis de `Productos.docx` | ✅ Completado (675 productos, 15 secciones) |
| Extracción de datos a JSON | ✅ Completado → `admin/source/products-private.json` |
| Extracción de imágenes del .docx | ✅ Completado (675 JPEG ~346×224 px, aún sin migrar al repo) |
| Recepción del diseño de Stitch | ✅ Recibido (HTML de referencia, paleta y tipografías) |
| Script de optimización de imágenes | ✅ `scripts/optimize-images.py` (WebP / @2x / thumb) |
| Migración de datos al repo | ✅ Completado (`admin/source/products-private.json`) |
| Decisión de tratamiento fotográfico | 🕐 Bloqueada (modelo de agente sin visión; ver §"Notas de trabajo") |
| Definición de arquitectura técnica | ⏳ Pendiente |
| Implementación del catálogo | ⏳ Pendiente |
| Administrador local | ⏳ Pendiente |
| Build estático + GitHub Pages | ⏳ Pendiente |

---

## Fuente de datos: `Productos.docx`

Archivo Word (~20 MB) en la raíz del proyecto, fuente única y verdadera de productos.

**Contenido analizado:**
- 15 tablas con 675 productos.
- 675 imágenes JPEG (~346×224 px, ~29 KB, baja resolución).
- Columnas por producto: `imagen | código+nombre | talla+colores | precio | precio sugerido | marcador ° (disponibilidad por variante)`.

### Secciones reales (675 productos)

| Sección | Prefijo | Nº prod. |
|---|---|---|
| Calcetas y tines | C | 39 |
| Ropa Niña | RA | 133 |
| Estimulación psicomotriz | EP | 41 |
| Pañaleras y bolsas organizadoras | PB/PN | 42 |
| Ropa Niño | RO | 108 |
| Baberos | B | 11 |
| Kit | K | 27 |
| Zapatitos | Z | 74 |
| Peluches | P | 39 |
| Higiene | H | 24 |
| Detallitos | D | 33 |
| Todo para su chupón | TPC | 21 |
| Accesorios para su cabecita | APC | 52 |
| Sabanitas y cobijitas | SC | 18 |
| Fulares y cangureras | FC | 13 |

### Modelo de datos extraído (campos por producto)

```json
{
  "seccion": "ZAPATITOS",
  "tabla": 7,
  "codigo": "Z050",
  "nombre": "CROCS",
  "talla": "14CM AZUL DINO ROSA DINO VERDE COCO AMARILLO DINO",
  "precio": "$35.00 C/U",
  "sugerido": "$95.00",
  "final": "°°°°°",
  "imagen": "image452.jpeg"
}
```

### Anomalías documentadas del documento

- **`SC015`** (COBIJA POLAR): sin imagen y con precio vacío.
- **Códigos duplicados reales** (`RA0031`, `Z050`, `APC017–028`): un mismo código cubre 2+ variantes distintas. Decisión conservadora: preservar el ID original añadiendo un sufijo técnico interno (ej. `Z050`, `Z050-2`).
- **Talla + colores mezclados** en una sola celda (ej. `6-12 meses Azul Blanco Camel cafe 1-2 años Azul...`).
- **Campo `final` (°)**: checkbox por variante, todos vacíos (nada marcado como disponible/agotado aún).

---

## Identidad visual (diseño de Stitch)

Recibida como HTML de referencia. Elementos clave:

- **Paleta**: rosa vino (primario `#994158`, contenedor `#f58aa3`, `blush-highlight #FADDE1`), verde menta (terciario `#71b6b3`, `#a9efec`), superficie cálida (`#fff8f3`), tinta `#4A3E3E`.
- **Tipografías**: Nunito Sans, Plus Jakarta Sans, Quicksand.
- **Iconos**: Material Symbols Outlined.
- **Estilo**: Mobile First, catálogo editorial premium.

> ⚠️ Queda pendiente confirmar si el HTML recibido reemplaza al "md de Stitch" prometido, o si aún llegará un archivo Markdown adicional.

---

## Arquitectura planificada

La siguiente estructura es la referencia definida en el prompt maestro (puede ajustarse según decisión de arquitectura):

```text
minime_cat/
│
├── public/                  # Build público (lo único desplegado)
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── data/
│       └── products.json    # JSON público del catálogo
│
├── src/
│   ├── catalog/             # Catálogo público
│   ├── components/
│   ├── styles/
│   └── utils/
│
├── admin/                   # Administrador local (NO se publica)
│   ├── components/
│   ├── data/
│   └── pages/
│
├── scripts/
│   ├── extract-products/
│   ├── generate-data/
│   └── optimize-images/
│
├── .github/
│   └── workflows/
│
├── Productos.docx           # Fuente de datos original
├── package.json
└── README.md
```

Reglas de arquitectura fijadas por el prompt maestro:

- El **administrador NO forma parte del build público** (nunca accesible vía `/admin` en GitHub Pages).
- El **JSON público contiene únicamente la información necesaria** para el catálogo (precio, nombre, imagen, disponibilidad).
- Datos administrativos separados (ej. `admin/source/products-private.json`) → build/generador → `public/data/products.json`.
- Sin falsa sensación de seguridad: los datos que el navegador necesita son accesibles al cliente; lo que se protege es el admin y los datos internos.

---

## Entorno de desarrollo detectado

- **Sin Node.js** disponible (no hay `node`/`npm`).
- **Python 3.11** disponible.
- **Pillow** no instalado.
- Herramientas disponibles: `sips`, `brew`, `python3`.

---

## Próximos pasos

1. **Migrar las 675 imágenes** al repo (o extraerlas del temporal directamente al pipeline de optimización).
2. **Decidir el tratamiento fotográfico** (baja resolución: estilización editorial — fondo, marco, tratamiento — en vez de upscaling). Nota: el agente actual no tiene visión; evaluar por CLI (`sips`) o con el usuario.
3. **Definir la arquitectura técnica** del proyecto (stack frontend y solución page-flip).
4. **Implementar** el catálogo (mobile-first, page flip, búsqueda, filtros, estados de agotado).
5. **Implementar** el administrador local y la generación de JSON.
6. **Optimizar** imágenes (WebP/AVIF, thumbnails, lazy loading).
7. **Configurar** build estático + GitHub Actions para GitHub Pages.
8. **Auditar** calidad final (funcionalidad, responsive, performance, seguridad, accesibilidad).

---

## Notas de trabajo

- Los datos extraídos ya están migrados al repo: `admin/source/products-private.json` (158 KB, 675 productos).
- Las **imágenes** (675 JPEG) aún están dentro de `Productos.docx` y/o del temporal `/var/folders/.../opencode/minime/`; migrar antes de limpiar el temporal.
- El script `scripts/optimize-images.py` convierte las imágenes a WebP (nativo / @2x 692px / thumb 160px) y necesita Pillow: `python3 -m pip install Pillow`.
- ⚠️ **Limitación del agente**: el modelo actual no admite entrada de imágenes, por lo que la evaluación visual del tratamiento fotográfico requiere inspección técnica por CLI (`sips`) o revisión manual del usuario.
- Reglas del protocolo de trabajo: ver `claude.md`.