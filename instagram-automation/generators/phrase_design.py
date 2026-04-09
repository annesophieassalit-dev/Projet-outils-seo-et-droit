"""
Générateur de posts "phrase design" (flash posts).
Format 1080×1080, fond rose dégradé radial.

Design :
  - Fond rose dégradé radial (#ffffff → #cf9090)
  - Label "SEO conforme" — petit rectangle blanc, texte bleu #1e4e79
  - Texte principal bleu #1e4e79 centré
  - Pilule dégradée (#94b9ff → #e894ff, texte blanc) pour la phrase X ≠ Y
  - Signature auteure en bas
"""

import os
import numpy as np
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_AUTHOR,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient


def _draw_gradient_pill(img: Image.Image,
                         x1: int, y1: int, x2: int, y2: int,
                         text: str, font) -> None:
    """Pilule dégradée bleue/violette (#94b9ff → #e894ff)."""
    w = x2 - x1
    h = y2 - y1

    pill_arr = np.zeros((h, w, 3), dtype=np.uint8)
    for x in range(w):
        t = x / max(w - 1, 1)
        pill_arr[:, x] = [
            int(PILL_LEFT[i] * (1 - t) + PILL_RIGHT[i] * t)
            for i in range(3)
        ]
    pill_img = Image.fromarray(pill_arr, "RGB")

    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = h // 2
    mask_draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)

    img.paste(pill_img, (x1, y1), mask)

    draw = ImageDraw.Draw(img)
    tw = draw.textlength(text, font=font)
    tx = x1 + (w - tw) / 2
    ty = y1 + (h - font.size) / 2 - 4
    draw.text((tx, ty), text, font=font, fill=PILL_TEXT)


def generate_phrase_design_post(
        main_text: str,
        pill_text: str,
        label: str = "Visible et Conforme",
        output_path: str = "output/flash_posts/phrase.png",
) -> str:
    """
    Génère un post phrase design.

    Args:
        main_text  : Texte principal (3–5 lignes courtes).
        pill_text  : Texte de la pilule dégradée (ex: "Site visible ≠ Site sécurisé").
        label      : Étiquette en haut (défaut "Visible et Conforme").
        output_path: Chemin de sauvegarde.
    """
    img  = make_radial_gradient(FEED_W, FEED_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    # ── Label en haut centré ────────────────────────────────────────────────
    font_lbl = load_font(FONT_BOLD, 34)
    lbl_w    = int(draw.textlength(label, font=font_lbl)) + 48
    lbl_h    = 56
    lbl_x    = (FEED_W - lbl_w) // 2
    lbl_y    = 60
    draw.rounded_rectangle([lbl_x, lbl_y, lbl_x + lbl_w, lbl_y + lbl_h],
                            radius=lbl_h // 2, fill=(255, 255, 255))
    tw = draw.textlength(label, font=font_lbl)
    draw.text((lbl_x + (lbl_w - tw) / 2, lbl_y + 10),
              label, font=font_lbl, fill=BRAND_BLUE)

    # ── Texte principal ─────────────────────────────────────────────────────
    pill_h   = 110
    pill_gap = 40
    pill_y   = FEED_H - 80 - pill_h

    font_main = load_font(FONT_BOLD, 72)
    draw_multiline_centered(
        draw, main_text, font_main, BRAND_BLUE,
        70, lbl_y + lbl_h + 30, FEED_W - 70, pill_y - pill_gap,
        line_spacing=1.38,
    )

    # ── Pilule phrase design ─────────────────────────────────────────────────
    pill_mx = 60
    _draw_gradient_pill(
        img,
        pill_mx, pill_y, FEED_W - pill_mx, pill_y + pill_h,
        pill_text,
        load_font(FONT_BLACK, 52),
    )

    # ── Signature ────────────────────────────────────────────────────────────
    font_auth = load_font(FONT_LIGHT, 34)
    aw = draw.textlength(BRAND_AUTHOR, font=font_auth)
    draw.text(((FEED_W - aw) / 2, FEED_H - 46),
              BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)
