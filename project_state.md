# Project State — MINI ME Catálogo Digital

> Última actualización: 2026-08-17 (retomado tras crash de Mac; datos migrados al repo)
> Estado general: **Análisis de datos completado · Datos migrados al repo · Implementación pendiente**

---

## 1. Qué existe hoy en el repo

| Elemento | Estado |
|---|---|
| `Productos.docx` | ✅ Fuente de datos original (20 MB, 675 productos) |
| `.gitignore` | ✅ Creado (macOS, IDE, node_modules, build) |
| `README.md` | ✅ Creado (descripción, estado, estructura, próximos pasos) |
| `project_state.md` | ✅ Este archivo |
| `claude.md` | ✅ Creado (contexto operativo del repo) |
| `cmem.md` | ✅ Creado (memoria de conversación optimizada) |
| `admin/source/products-private.json` | ✅ **Datos extraídos migrados al repo (158 KB, 675 productos)** |
| `scripts/optimize-images.py` | ✅ Script de optimización de imágenes (WebP/@2x/thumb) |
| `public/` | ✅ Estructura base creada (`assets/images/`, `data/`) — aún vacía |

**No hay código fuente del catálogo todavía.**

## 2. Migración desde el directorio temporal

Los datos definitivos ya están migrados al repo en `admin/source/products-private.json`
(equivalente exacto de `products_extracted.json`).

Todavía residen en el temporal `/var/folders/vy/gdlc5dlj6_d_rp8vjpx2f3rr0000gn/T/opencode/minime/`:
`extracted/`, `paras.txt`, `products_raw.json`, `products_extracted.json`, `sample/`.

⚠️ **Riesgo pendiente**: las **imágenes** (675 JPEG extraídos del .docx) siguen dentro del
`.docx` y/o del temporal. Deben extraerse al repo (o directamente al pipeline de
optimización) cuando se ejecute `scripts/optimize-images.py`.

**Pendiente de limpieza**: el temporal puede borrarse una vez las imágenes estén seguras.

## 3. Evaluación de calidad de imágenes — nota importante

El intento de inspección visual de `sample/C0001.png`/`.jpeg` quedó **bloqueado**:
el modelo de agente actual **no admite entrada de imágenes**, por lo que NO se pudo
evaluar visualmente la calidad fotográfica.

Alternativas disponibles (por decidir):
- Inspección técnica por línea de comandos (dimensiones, formato, tamaño, exif) con `sips`/Python.
- Revisión visual por parte del usuario (ver la imagen en Finder).
- Aplazar la decisión del tratamiento fotográfico hasta tener stack + HTML real del catálogo.

La decisión de tratamiento sigue **abierta** (estilización editorial vs. otra), tal como
se acordó: sin upscaling mágico de 346×224 px.

## 4. Decisiones ya tomadas

1. **Códigos duplicados reales** (`RA0031`, `Z050`, `APC017–028`): preservar el ID original añadiendo sufijo técnico interno (ej. `Z050-2`) — decisión conservadora, sin alterar IDs del documento.
2. **Tratamiento fotográfico**: las imágenes son de baja resolución (346×224 px). No se pueden ampliar sin pixelar → **estilización editorial** (fondo, marco, tratamiento) en vez de upscaling.
3. **Sin upscaling de imágenes.**
4. **Diseño Mobile First** (paradigma obligatorio del prompt maestro).
5. **Sitio 100% estático** compatible con GitHub Pages, sin backend/BD/API/CMS.
6. **Administrador local fuera del build público** (nunca accesible en producción).
7. **JSON público mínimo**: solo datos necesarios para mostrar el catálogo.
8. **Datos "final (°)"**: campo checkbox por variante; todos vacíos → disponibilidad/agotado aún sin definir.

## 5. En progreso

- 🕐 **Tratamiento fotográfico definitivo**: bloqueado por modelo sin visión (ver §3). Evaluación técnica por CLI o decisión del usuario pendiente.
- 🕐 **Confirmación del diseño de Stitch**: se recibió HTML de referencia (paleta + tipografías), pero el prompt maestro prometía un "md de Stitch" que aún no llega como archivo `.md`.

## 6. Pendiente (sin empezar)

1. Definir arquitectura técnica (stack frontend, solución page-flip).
2. Implementar catálogo público: libro/page-flip, navegación, búsqueda, filtros, estados de agotado.
3. Implementar administrador local (CRUD simple: disponibilidad/precio/imagen) + generación de JSON.
4. Pipeline de imágenes: extraer → optimizar → WebP/AVIF → thumbnails → lazy loading.
5. Scripts de mantenimiento (`products:validate`, `products:generate`, `images:optimize`, etc.).
6. Build estático + GitHub Actions (`deploy.yml`) para GitHub Pages.
7. Validaciones de datos (IDs duplicados, precios inválidos, productos sin imagen...).
8. Auditoría final completa (funcionalidad, responsive, performance, seguridad, accesibilidad, WCAG).

## 7. Decisiones pendientes de confirmación con el usuario

- [ ] ¿El HTML recibido de Stitch es la identidad visual definitiva, o aún llegará el "md de Stitch"?
- [ ] ¿Cómo se inspecciona la calidad de imágenes si el agente no tiene visión (CLI/sips, revisión manual, o aplazar)?
- [ ] ¿Género (Niña/Niño): cómo se deriva? Las secciones actuales no lo marcan explícitamente (ej. "Ropa Niña" vs "Ropa Niño" sí se infieren; otras secciones no).
- [ ] ¿Se requiere apilado de tallas/colores parseado, o se conservan como texto?
- [ ] Confirmación del stack a usar (¿plan: tecnologías propuestas en claude.md).

## 8. Entorno de desarrollo detectado

- **Sin Node.js / npm** en la máquina.
- **Python 3.11** disponible.
- **Pillow NO instalado** (no hay Node/Pillow para imágenes).
- Disponibles: `sips`, `brew`, `python3`.

## 9. Riesgos actuales

- **Pérdida de imágenes extraídas**: residen en el `.docx` / temporal `/var/folders/.../opencode/minime/`. Migrar al repo o pipeline antes de limpiar el temporal.
- **Sin Node**: si la arquitectura elegida requiere Node para build, habrá que instalarlo (nvm/brew) o elegir un stack sin Node.
- **Calidad de imágenes**: baja resolución; el resultado premium depende de la estilización, no del upscaling.
- **Ambigüedad género/secciones**: no está resuelto cómo derivar Niña/Niño para todas las secciones.
- **Agente sin visión**: limita la evaluación visual de imágenes y diseño (requiere asistencia del usuario o herramientas CLI).