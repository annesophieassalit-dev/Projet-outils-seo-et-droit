"""
Générateur de posts "phrase design".
Format 1080×1080, fond rose dégradé radial.

Deux variantes alternées :
  - "yellow" : pilules jaune (#ffffda → #fffa78), texte bleu foncé
  - "blue"   : pilules bleu-violet (#94b9ff → #e894ff), texte blanc

Layout :
  Fond rose radial → badge label centré ("SEO conforme") → Pilule 1 (bold,
  légèrement inclinée, au premier plan) → Pilule 2 (italic élégant, inclinée
  dans l'autre sens, légèrement DERRIÈRE Pilule 1) → badge auteure blanc en bas.
"""

import os
import numpy as np
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT_I, FONT_SERIF_I,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    BRAND_AUTHOR, BRAND_TAGLINE,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient

# ─── Constantes de mise en page ──────────────────────────────────────────────
_PILL_H  = 192     # hauteur des pilules
_PILL_MX = 52      # marge gauche/droite
_PILL_R  = 22      # rayon des coins
_OVERLAP = 18      # Pilule 2 commence OVERLAP px avant la fin de Pilule 1

_BADGE_H = 56      # hauteur du badge label
_BADGE_Y = 292     # position Y du badge label

_P1_Y    = _BADGE_Y + _BADGE_H + 22              # y top Pilule 1
_P2_Y    = _P1_Y + _PILL_H - _OVERLAP            # y top Pilule 2 (derrière P1)

_FOOT_Y  = _P2_Y + _PILL_H + 44                  # y top badge auteure
_FOOT_H  = 136                                    # hauteur badge auteure


# ─── Pilule dégradée inclinée ─────────────────────────────────────────────────

def _draw_tilted_pill(img: Image.Image,
                      x1: int, y1: int, x2: int, y2: int,
                      text: str,
                      font,
                      color_left: tuple,
                      color_right: tuple,
                      text_color: tuple,
                      angle: float = 0.0) -> tuple:
    """
    Dessine une pilule dégradée inclinée sur img.
    Retourne (img_résultat, draw).
    """
    w = x2 - x1
    h = y2 - y1

    # Dégradé horizontal
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [
            int(color_left[i] * (1 - t) + color_right[i] * t)
            for i in range(3)
        ]
    pill_img = Image.fromarray(arr, "RGB")

    # Masque arrondi
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, w - 1, h - 1], radius=_PILL_R, fill=255
    )

    # Pilule RGBA
    pill_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pill_rgba.paste(pill_img, (0, 0))
    pill_rgba.putalpha(mask)

    # Layer pleine image + texte
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(pill_rgba, (x1, y1), pill_rgba)

    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(text, font=font)
    tx = x1 + (w - tw) / 2
    ty = y1 + (h - font.size) / 2 - 4
    ld.text((tx, ty), text, font=font, fill=(*text_color, 255))

    # Rotation autour du centre de la pilule
    pcx = (x1 + x2) // 2
    pcy = (y1 + y2) // 2
    layer_rot = layer.rotate(angle, center=(pcx, pcy),
                              expand=False, resample=Image.BICUBIC)

    result_rgba = Image.alpha_composite(img.convert("RGBA"), layer_rot)
    result      = result_rgba.convert("RGB")
    return result, ImageDraw.Draw(result)


# ─── Générateur principal ─────────────────────────────────────────────────────

def generate_phrase_design_post(
        label: str,
        pill_text: str,
        variant: str = "yellow",
        output_path: str = "output/flash_posts/phrase.png",
) -> str:
    """
    Génère un post phrase design.

    Args:
        label      : Badge au-dessus des pilules (ex : "SEO conforme").
        pill_text  : Texte des pilules (ex : "Site visible ≠ Site sécurisé").
        variant    : "yellow" | "blue"
        output_path: Chemin de sauvegarde.
    """
    img  = make_radial_gradient(FEED_W, FEED_H,
                                center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    # ── Couleurs selon la variante ─────────────────────────────────────────────
    if variant == "blue":
        cl, cr, tc = PILL_LEFT, PILL_RIGHT, tuple(PILL_TEXT)
    else:
        cl, cr, tc = YELLOW_LEFT, YELLOW_RIGHT, tuple(YELLOW_TEXT)

    # ── Découpage du texte pilules ─────────────────────────────────────────────
    if "≠" in pill_text:
        parts = pill_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = pill_text
        line2 = None

    # ── Badge label centré ─────────────────────────────────────────────────────
    font_lbl = load_font(FONT_BOLD, 34)
    lbl_w    = int(draw.textlength(label, font=font_lbl)) + 54
    lbl_x    = (FEED_W - lbl_w) // 2
    draw.rounded_rectangle(
        [lbl_x, _BADGE_Y, lbl_x + lbl_w, _BADGE_Y + _BADGE_H],
        radius=_BADGE_H // 2, fill=(255, 255, 255),
    )
    tw = draw.textlength(label, font=font_lbl)
    draw.text(
        (lbl_x + (lbl_w - tw) / 2, _BADGE_Y + (_BADGE_H - 34) // 2),
        label, font=font_lbl, fill=BRAND_BLUE,
    )

    # ── Pilules (Pilule 2 dessinée EN PREMIER = derrière Pilule 1) ────────────
    px1    = _PILL_MX
    px2    = FEED_W - _PILL_MX
    font1  = load_font(FONT_BLACK,   108)   # gros, bold
    font2  = load_font(FONT_SERIF_I,  84)   # élégant, italic

    if line2:
        # Pilule 2 derrière
        img, draw = _draw_tilted_pill(
            img, px1, _P2_Y, px2, _P2_Y + _PILL_H,
            line2, font2, cl, cr, tc, angle=-5.0,
        )

    # Pilule 1 au premier plan
    img, draw = _draw_tilted_pill(
        img, px1, _P1_Y, px2, _P1_Y + _PILL_H,
        line1, font1, cl, cr, tc, angle=+3.0,
    )

    # ── Badge auteure blanc en bas ─────────────────────────────────────────────
    bx1, bx2 = 58, FEED_W - 58
    draw.rounded_rectangle(
        [bx1, _FOOT_Y, bx2, _FOOT_Y + _FOOT_H],
        radius=22, fill=(255, 255, 255),
    )

    # Prénom italic
    font_auth = load_font(FONT_LIGHT_I, 36)
    aw = draw.textlength(BRAND_AUTHOR, font=font_auth)
    draw.text(
        ((FEED_W - aw) / 2, _FOOT_Y + 20),
        BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE,
    )

    # Tagline bold
    font_tag = load_font(FONT_BOLD, 26)
    draw_multiline_centered(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        bx1 + 26, _FOOT_Y + 68, bx2 - 26, _FOOT_Y + _FOOT_H - 10,
        line_spacing=1.26,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)
