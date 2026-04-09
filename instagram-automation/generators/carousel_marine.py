"""
Générateur de carousels — fond rose dégradé radial, texte bleu #1e4e79.
Format 1080×1080.

Structure d'un carousel :
  Slide 0 — Photo    : photo auteure (ou placeholder) + texte d'accroche
  Slides 1…N — Content : contenu numéroté
  Dernière slide — CTA : question + branding
"""

import os
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_AUTHOR,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient

AUTHOR_PHOTO = Path("assets/author_photo.jpg")


# ─── Fond rose dégradé radial ────────────────────────────────────────────────

def _rose_sq_base() -> tuple:
    img  = make_radial_gradient(FEED_W, FEED_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


# ─── Flèche jaune dégradée bas-droite ───────────────────────────────────────

def _yellow_arrow(img: Image.Image, draw: ImageDraw.Draw,
                  x: int, y: int, size: int = 58) -> None:
    """Dessine → en jaune (couleur unie YELLOW_RIGHT)."""
    tip_x  = x + size
    shaft  = int(size * 0.62)
    half_h = int(size * 0.14)
    head_h = int(size * 0.36)
    arrow_color = YELLOW_RIGHT
    draw.rectangle([x, y - half_h, x + shaft, y + half_h], fill=arrow_color)
    draw.polygon([
        (x + shaft, y - head_h),
        (tip_x,     y),
        (x + shaft, y + head_h),
    ], fill=arrow_color)


# ─── Numéro slide (bleu semi-transparent) ───────────────────────────────────

def _slide_number(draw: ImageDraw.Draw, number: int) -> None:
    font_n = load_font(FONT_BLACK, 110)
    n_str  = str(number)
    n_w    = draw.textlength(n_str, font=font_n)
    draw.text((FEED_W - n_w - 40, 20), n_str,
              font=font_n, fill=(*BRAND_BLUE, 130))


# ─── Signature auteure ───────────────────────────────────────────────────────

def _author_foot(draw: ImageDraw.Draw) -> None:
    font = load_font(FONT_LIGHT, 32)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((FEED_W - w) / 2, FEED_H - 52),
              BRAND_AUTHOR, font=font, fill=BRAND_BLUE)


# ─── Slide 0 : Photo + accroche ──────────────────────────────────────────────

def generate_marine_photo_slide(
        hook_text: str,
        output_path: str = "output/carousels/c_photo.png",
) -> str:
    img, draw = _rose_sq_base()

    if AUTHOR_PHOTO.exists():
        try:
            photo = Image.open(AUTHOR_PHOTO).convert("RGB")
            photo = photo.resize((FEED_W, FEED_H), Image.LANCZOS)
            img.paste(photo, (0, 0))
            # Dégradé blanc en bas pour lisibilité
            overlay = Image.new("RGBA", (FEED_W, FEED_H), (0, 0, 0, 0))
            ov_draw = ImageDraw.Draw(overlay)
            for y_px in range(FEED_H // 2, FEED_H):
                alpha = int((y_px - FEED_H // 2) / (FEED_H // 2) * 200)
                ov_draw.line([(0, y_px), (FEED_W, y_px)],
                             fill=(255, 255, 255, alpha))
            img_rgba = img.convert("RGBA")
            img_rgba.alpha_composite(overlay)
            img = img_rgba.convert("RGB")
            draw = ImageDraw.Draw(img)
        except Exception:
            pass
    else:
        # Placeholder
        font_ph = load_font(FONT_LIGHT, 34)
        ph_txt  = "VOTRE PHOTO ICI"
        ph_w    = draw.textlength(ph_txt, font=font_ph)
        draw.text(((FEED_W - ph_w) / 2, 60), ph_txt,
                  font=font_ph, fill=BRAND_BLUE)
        draw.rounded_rectangle([40, 40, FEED_W - 40, FEED_H // 2 - 40],
                                radius=20, outline=BRAND_BLUE, width=2)

    # Accroche en bas
    font_h = load_font(FONT_BOLD, 66)
    draw_multiline_centered(
        draw, hook_text, font_h, BRAND_BLUE,
        55, FEED_H // 2 + 20, FEED_W - 55, FEED_H - 70,
        line_spacing=1.3,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide contenu numéroté ──────────────────────────────────────────────────

def generate_marine_content_slide(
        number: int,
        text: str,
        output_path: str = "output/carousels/c_content.png",
) -> str:
    img, draw = _rose_sq_base()

    _slide_number(draw, number)

    font_t = load_font(FONT_BOLD, 64)
    draw_multiline_centered(
        draw, text, font_t, BRAND_BLUE,
        65, 150, FEED_W - 65, FEED_H - 130,
        line_spacing=1.42,
    )

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide CTA ───────────────────────────────────────────────────────────────

def generate_marine_cta_slide(
        cta_text: str,
        output_path: str = "output/carousels/c_cta.png",
) -> str:
    img, draw = _rose_sq_base()

    # Barre jaune en haut
    draw.rectangle([0, 0, FEED_W, 10], fill=YELLOW_RIGHT)

    font = load_font(FONT_BOLD, 64)
    draw_multiline_centered(
        draw, cta_text, font, BRAND_BLUE,
        65, 70, FEED_W - 65, FEED_H - 130,
        line_spacing=1.42,
    )

    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Point d'entrée ──────────────────────────────────────────────────────────

def generate_marine_carousel_set(
        carousel: dict,
        output_dir: str = "output/carousels",
) -> list[str]:
    """
    Génère toutes les slides d'un carousel.

    Format du dictionnaire attendu :
    {
        "id": 1,
        "hook_text": "...",
        "slides": ["...", "..."],
        "cta": "...",
        "caption": "..."
    }
    """
    cid   = carousel.get("id", "x")
    paths = []

    paths.append(generate_marine_photo_slide(
        hook_text=carousel["hook_text"],
        output_path=f"{output_dir}/c_m{cid}_s0.png",
    ))

    for i, text in enumerate(carousel["slides"], start=1):
        paths.append(generate_marine_content_slide(
            number=i,
            text=text,
            output_path=f"{output_dir}/c_m{cid}_s{i}.png",
        ))

    paths.append(generate_marine_cta_slide(
        cta_text=carousel["cta"],
        output_path=f"{output_dir}/c_m{cid}_s{len(carousel['slides']) + 1}.png",
    ))

    return paths
