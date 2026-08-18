#!/usr/bin/env python3
"""
Pipeline de optimización de imágenes para MINI ME.

Lee admin/source/products-private.json y convierte cada imagen referenciada
a WebP optimizado para el catálogo:

  - <nombre>.webp        -> resolución nativa (móvil / cards)
  - <nombre>@2x.webp     -> 692px upscale suave (vista de detalle)
  - <nombre>-thumb.webp  -> thumbnail ~160px (lazy / preload)

Dependencia: Pillow (soporte WebP incluido).
  python3 -m pip install Pillow

Uso:
  python3 scripts/optimize-images.py <media_dir> [--dry-run]

<media_dir>: directorio con los JPEG originales (extraídos del .docx).
"""
import json
import os
import sys

from PIL import Image, ImageOps

OUT_DIR = os.path.join("public", "assets", "images", "products")
SOURCE_JSON = os.path.join("admin", "source", "products-private.json")
DETAIL_WIDTH = 692
THUMB_WIDTH = 160
WEBP_QUALITY = 82


def main():
    if len(sys.argv) < 2:
        sys.exit("Uso: python3 scripts/optimize-images.py <media_dir> [--dry-run]")
    media_dir = sys.argv[1]
    dry_run = "--dry-run" in sys.argv[2:]

    if not os.path.isdir(media_dir):
        sys.exit(f"Directorio de imágenes no encontrado: {media_dir}")
    if not os.path.isfile(SOURCE_JSON):
        sys.exit(f"Fuente de datos no encontrada: {SOURCE_JSON}")

    os.makedirs(OUT_DIR, exist_ok=True)

    with open(SOURCE_JSON, encoding="utf-8") as f:
        products = json.load(f)

    n_native = n_detail = n_thumb = 0
    n_missing = 0
    missing = []

    for p in products:
        name = p.get("imagen", "")
        if not name:
            missing.append((p.get("codigo"), "(sin imagen)"))
            n_missing += 1
            continue

        base = os.path.splitext(name)[0]
        src = os.path.join(media_dir, name)
        if not os.path.isfile(src):
            missing.append((p.get("codigo"), f"no existe {name}"))
            n_missing += 1
            continue

        # 1) Resolución nativa (sin ampliar)
        native = os.path.join(OUT_DIR, f"{base}.webp")
        if not dry_run:
            _to_webp(src, native, quality=WEBP_QUALITY)
        n_native += 1

        # 2) Variante @2x para detalle (upscale suave)
        detail = os.path.join(OUT_DIR, f"{base}@2x.webp")
        if not dry_run:
            _to_webp(src, detail, quality=WEBP_QUALITY, width=DETAIL_WIDTH)
        n_detail += 1

        # 3) Thumbnail
        thumb = os.path.join(OUT_DIR, f"{base}-thumb.webp")
        if not dry_run:
            _to_webp(src, thumb, quality=WEBP_QUALITY, width=THUMB_WIDTH)
        n_thumb += 1

    print(f"OK nativo: {n_native} | @2x: {n_detail} | thumb: {n_thumb} | sin imagen: {n_missing}")
    if missing:
        print("Productos sin imagen:")
        for code, why in missing:
            print(f"  {code}: {why}")


def _to_webp(src, out, quality, width=None):
    """Convierte src -> out (WebP). Si width, redimensiona manteniendo aspecto."""
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode != "RGB":
            im = im.convert("RGB")
        if width:
            ratio = width / im.width
            height = max(1, round(im.height * ratio))
            im = im.resize((width, height), Image.LANCZOS)
        im.save(out, "WEBP", quality=quality, method=6)


if __name__ == "__main__":
    main()