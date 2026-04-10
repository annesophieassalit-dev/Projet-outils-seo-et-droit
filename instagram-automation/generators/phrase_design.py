"""
Générateur de posts "phrase design" (flash posts).
Format 1080×1080, fond rose dégradé radial.

Design :
  - Fond rose dégradé radial (#ffffff → #cf9090)
  - Texte principal bleu #1e4e79 en haut
  - Badge label blanc centré (ex: "Visible et Conforme")
  - Deux pilules jaunes dégradées empilées (X ≠ Y), texte bleu
  - Badge auteure blanc en bas : prénom italique + tagline
"""

import os
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT_I,
    BRAND_AUTHOR, BRAND_TAGLINE,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient, draw_yellow_pill


def generate_phrase_design_post(
        main_text: str,
        pill_text: str,
        label: str = "Visible et Conforme",
        output_path: str = "output/flash_posts/phrase.png",
) -> str:
    """
    Génère un post phrase design.

    Args:
        main_text  : Texte principal (3–4 lignes courtes, séparées par \\n).
        pill_text  : Texte des pilules (ex: "Site visible ≠ Site sécurisé").
        label      : Étiquette badge centré (défaut "Visible et Conforme").
        output_path: Chemin de sauvegarde.
    """
    img  = make_radial_gradient(FEED_W, FEED_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    # ── Texte principal en haut ─────────────────────────────────────────────
    font_main = load_font(FONT_BOLD, 56)
    draw_multiline_centered(
        draw, main_text, font_main, BRAND_BLUE,
        70, 42, FEED_W - 70, 282,
        line_spacing=1.38,
    )

    # ── Badge label centré ──────────────────────────────────────────────────
    font_lbl = load_font(FONT_BOLD, 34)
    lbl_w    = int(draw.textlength(label, font=font_lbl)) + 64
    lbl_h    = 58
    lbl_x    = (FEED_W - lbl_w) // 2
    lbl_y    = 296
    draw.rounded_rectangle([lbl_x, lbl_y, lbl_x + lbl_w, lbl_y + lbl_h],
                            radius=lbl_h // 2, fill=(255, 255, 255))
    tw = draw.textlength(label, font=font_lbl)
    draw.text((lbl_x + (lbl_w - tw) / 2, lbl_y + (lbl_h - 34) // 2),
              label, font=font_lbl, fill=BRAND_BLUE)

    # ── Pilules jaunes dégradées ────────────────────────────────────────────
    pill_h  = 176
    pill_mx = 58
    pill_x1 = pill_mx
    pill_x2 = FEED_W - pill_mx
    gap     = 22

    if "≠" in pill_text:
        parts = pill_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = pill_text
        line2 = None

    y1_pill1 = 382
    font_p1  = load_font(FONT_BLACK, 82)
    draw_yellow_pill(img, pill_x1, y1_pill1, pill_x2, y1_pill1 + pill_h, line1, font_p1)

    if line2:
        y1_pill2 = y1_pill1 + pill_h + gap
        font_p2  = load_font(FONT_LIGHT_I, 72)
        draw_yellow_pill(img, pill_x1, y1_pill2, pill_x2, y1_pill2 + pill_h, line2, font_p2)

    # ── Badge auteure blanc en bas ──────────────────────────────────────────
    badge_x1 = 58
    badge_x2 = FEED_W - 58
    badge_y  = 822
    badge_h  = 232
    draw.rounded_rectangle([badge_x1, badge_y, badge_x2, badge_y + badge_h],
                            radius=26, fill=(255, 255, 255))

    font_auth = load_font(FONT_LIGHT_I, 38)
    aw = draw.textlength(BRAND_AUTHOR, font=font_auth)
    draw.text(((FEED_W - aw) / 2, badge_y + 28),
              BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE)

    font_tag = load_font(FONT_BOLD, 28)
    draw_multiline_centered(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        badge_x1 + 30, badge_y + 80, badge_x2 - 30, badge_y + badge_h - 14,
        line_spacing=1.28,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)
