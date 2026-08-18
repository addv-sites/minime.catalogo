# Project State — MINI ME Catálogo Digital

> Última actualización: 2026-08-17 (scaffold Vite+React desplegado, pipeline de datos e imágenes operativo)
> Estado general: **Datos e imágenes migrados · Stack definido y scaffold funcional · Implementación del catálogo libro pendiente**

---

## 1. Qué existe hoy en el repo

| Elemento | Estado |
|---|---|
| `Productos.docx` | ✅ Fuente de datos original (20 MB, 675 productos) |
| `.gitignore` | ✅ Creado (macOS, IDE, node_modules, build, coverage) |
| `README.md` | ✅ Actualizado con el estado real del proyecto |
| `project_state.md` | ✅ Este archivo |
| `claude.md` | ✅ Contexto operativo del repo |
| `cmem.md` | ✅ Memoria de conversación optimizada |
| `admin/source/products-private.json` | ✅ Datos extraídos (675 productos, 15 secciones) |
| `admin/source/media/` | ✅ 675 JPEG originales migrados al repo |
| `scripts/optimize-images.py` | ✅ Pipeline WebP (nativo / @2x / thumb) |
| `scripts/validate-products.mjs` | ✅ Validación de integridad de datos |
| `scripts/generate-products.mjs` | ✅ Generador de `public/data/products.json` |
| `public/data/products.json` | ✅ JSON público generado (675 productos, 15 secciones) |
| `public/assets/images/products/` | ✅ 2022 WebP (674 productos × 3 variantes) |
| `src/` | ✅ Scaffold React (App, catalog loader, tokens, tests) |
| `package.json` | ✅ Stack: Vite 8 + React 19 + TypeScript 6 + Vitest + oxlint |

**Código fuente del catálogo libro: pendiente.**

## 2. Stack y entorno (definidos y operativos)

| Herramienta | Estado |
|---|---|
| Node.js | ✅ v24.19.0 |
| npm | ✅ 11.17.0 |
| Vite | ✅ 8.2.x (config `base: './'` para GitHub Pages) |
| React | ✅ 19.2.x + react-dom |
| TypeScript | ✅ ~6.0 |
| react-pageflip | ✅ Instalado (aún sin integrar en la UI) |
| Vitest + Testing Library | ✅ 4.1.x (entorno jsdom) |
| oxlint | ✅ 1.75.x |
| Python 3.11 + Pillow | ✅ (script de imágenes) |

Los cambios del scaffold están **staged pero aún sin commitear** (ramas en working tree).

## 3. Pipeline de datos e imágenes (operativo)

### 3.1 Datos

```text
admin/source/products-private.json  ──>  scripts/generate-products.mjs  ──>  public/data/products.json
     (675 productos, datos internos)         (JSON público mínimo, duplicados con sufijo -2/-3)
```

- Reglas del generador: expone solo campos del catálogo (`codigo`, `nombre`, `talla`, `precio`, `sugerido`, `disponible`, `imagen`); preserva IDs originales; agrupa por sección en orden estable; imagen referenciada como `<nombre>.webp`.

### 3.2 Imágenes

```text
admin/source/media/imageN.jpeg  ──>  scripts/optimize-images.py  ──>  public/assets/images/products/
     (675 JPEG ~346×224 px)              WebP: nativa + @2x (692px) + -thumb (160px)
```

- Resultado: 674 productos × 3 variantes = **2022 WebP** (SC015 sin imagen).

### 3.3 Resultados de validación (`npm run products:validate`)

- 675 productos · 15 secciones · **VALIDACIÓN OK** (sin errores graves).
- 12 códigos duplicados reales (reciben sufijo): `RA0031`, `Z050` (x3), `APC017`, `APC019`, `APC020`, `APC021`, `APC022`, `APC024`, `APC025`, `APC026`, `APC027`, `APC028`.
- 11 productos **sin código** → ID técnico `SINCOD-*` (image40, 167–173, 256, 360–364).
- `SC015`: sin imagen y precio vacío (placeholder en catálogo).
- `APC020`: marcador `final` inesperado (warn, no bloquea).

## 4. Scaffold del catálogo (implementado)

- `src/main.tsx`: bootstrap React + tokens.css + global.css.
- `src/App.tsx`: carga `./data/products.json` y muestra header (marca, totales) + grid de secciones. Estados: carga, error, contenido.
- `src/data/catalog.ts`: tipos `Producto`/`Seccion`/`Catalogo`, loader con cache, `rutaImagen()`.
- `src/utils/format.ts`: `normalizarPrecio()`, `slugificar()` (con tests).
- `src/styles/tokens.css`: tokens de identidad Stitch (paleta, tipografías, radios, sombras, motion, `prefers-reduced-motion`).
- `src/styles/global.css`: reset, tipografía base, focus-visible accesible.
- Tests: 2 archivos, **8 tests pasando** (`npm test`).
- Lint: **sin errores** (`npm run lint`). Build: **OK** (`npm run build`).

## 5. Decisiones ya tomadas

1. **Códigos duplicados reales**: preservar el ID original añadiendo sufijo técnico interno (`Z050-2`, `Z050-3`).
2. **Tratamiento fotográfico**: baja resolución (346×224 px) → estilización editorial, **sin upscaling mágico** (el script @2x hace un upscale suave a 692px SOLO como variante de detalle).
3. **Mobile First** obligatorio (320→1920px).
4. **Sitio 100% estático** compatible con GitHub Pages, sin backend/BD/API/CMS.
5. **Administrador local fuera del build público** (nunca accesible en producción).
6. **JSON público mínimo**: solo datos para mostrar el catálogo.
7. **Datos `final (°)`**: todos vacíos → disponibilidad/agotado aún sin definir.
8. **Stack elegido**: Vite + React + TypeScript + react-pageflip (sin Svelte/Vue).
9. **Base relativa `./`** en Vite para servir correctamente en sub-ruta de GitHub Pages.

## 6. En progreso

- 🕐 **Tratamiento fotográfico definitivo (estilización editorial)**: bloqueado por modelo sin visión. Evaluación técnica por CLI (`sips`/Python) o revisión manual del usuario.
- 🕐 **Confirmación del diseño de Stitch**: se recibió HTML de referencia (paleta + tipografías); el "md de Stitch" prometido no ha llegado como archivo `.md`.

## 7. Pendiente (sin empezar)

1. **Implementar el catálogo libro/page-flip** (core del encargo): portada → secciones → cierre, navegación swipe/tap/teclado, profundidad/sombras con `react-pageflip`.
2. Búsqueda, filtros, estados de AGOTADO (con `final (°)` vacío, falta decidir cómo marcar disponibilidad).
3. Administrador local (CRUD: disponibilidad/precio/imagen) + regeneración de JSON.
4. Generación de variantes responsivas (srcset `-thumb`/`@2x`) y lazy loading en la UI.
5. GitHub Actions (`deploy.yml`) para GitHub Pages.
6. SEO (meta, OG, canonical, sitemap, robots.txt, structured data) y accesibilidad final.
7. Auditoría final completa (funcionalidad, responsive, performance, seguridad, accesibilidad WCAG).

## 8. Decisiones pendientes de confirmación con el usuario

- [ ] ¿El HTML recibido de Stitch es la identidad visual definitiva, o aún llegará el "md de Stitch"?
- [ ] ¿Cómo se inspecciona la calidad de imágenes si el agente no tiene visión (CLI/sips, revisión manual, o aplazar)?
- [ ] ¿Género (Niña/Niño): cómo se deriva para secciones ambiguas?
- [ ] ¿Se requiere apilado de tallas/colores parseado, o se conservan como texto?
- [ ] ¿Cómo se determina la disponibilidad (campo `final` °) para marcar AGOTADO?

## 9. Riesgos actuales

- **Temporal `/var/folders/.../opencode/minime/`**: ya no es crítico (datos e imágenes están en el repo), puede limpiarse.
- **Peso del repo**: 675 JPEG + 2022 WebP + `Productos.docx` (~20 MB) → tamaño de clon alto; considerar LFS o limpieza si molesta.
- **Calidad de imágenes**: baja resolución; el resultado premium depende de la estilización, no del upscaling.
- **Ambigüedad género/secciones y disponibilidad**: no resueltos; afectan el diseño de filtros y estados AGOTADO.
- **Agente sin visión**: limita la evaluación visual de imágenes y diseño (requiere asistencia del usuario o herramientas CLI).
