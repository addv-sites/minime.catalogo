# MINI ME — Admin local (loca.md)

Guía rápida para levantar y usar el **administrador local** del catálogo. El admin **nunca** se publica en GitHub Pages (queda excluido del build).

## URLs locales (dev server)

| Recurso | URL |
|---|---|
| Administrador | http://localhost:5173/admin.html |
| JSON privado (datos fuente, 675 productos) | http://localhost:5173/admin/source/products-private.json |
| JSON público (catálogo generado) | http://localhost:5173/data/products.json |
| Catálogo (vista pública) | http://localhost:5173/ |

## Rutas de archivos en el repo

| Archivo | Ruta |
|---|---|
| JSON privado (fuente del admin) | `admin/source/products-private.json` |
| Imágenes originales (JPEG) | `admin/source/media/` |
| JSON público generado | `public/data/products.json` |
| Imágenes WebP del catálogo | `public/assets/images/products/` |
| Código del admin | `src/admin/` (`AdminApp.tsx`, `main.tsx`, `admin.css`) |
| Entrada del admin | `admin.html` |

## Comandos

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Levantar el admin en local
npm run admin        # abre http://localhost:5173/admin.html

# Alternativa: levantar el catálogo público en dev
npm run dev          # abre http://localhost:5173/

# 3. Generar el JSON público desde el JSON privado (tras editar en el admin)
npm run products:generate

# 4. Validar la integridad de los datos
npm run products:validate

# 5. Pruebas y calidad
npm test             # pruebas unitarias (Vitest)
npm run lint         # lint (oxlint)
npm run build        # typecheck + build estático (excluye el admin)
```

## Flujo típico de trabajo

1. `npm run admin` → editar productos en `http://localhost:5173/admin.html`.
2. Botón **Exportar JSON** (o guardar el archivo) para descargar `products-private.json` actualizado.
3. Reemplazar `admin/source/products-private.json` con el archivo exportado.
4. `npm run products:generate` → regenera `public/data/products.json`.
5. `npm run products:validate` → confirma que no hay errores de integridad.

> Nota: las **existencias** se editan como número en la columna *Existencias*; el admin las guarda en el campo `final` como `°` por pieza (formato original del documento). El precio mostrado en el catálogo es la columna *Precio catálogo* (campo `sugerido`); *Precio orig* es el precio interno sin publicar.