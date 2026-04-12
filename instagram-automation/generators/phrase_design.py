"""
Générateur de posts "phrase design".

Deux designs distincts alternés :

  Design A ("yellow") — 1080 × 1080
    Fond rose radial · badge label · pilules JAUNES INCLINÉES (+3° / -5°)
    · badge auteure blanc centré en bas.

  Design B ("blue")  — 1080 × 1350 portrait
    Fond rose radial · badge label · pilules BLEU-VIOLET DROITES très larges
    (pilule 2 déborde légèrement à gauche) · auteure italic + tagline sur fond
    blanc arrondi en bas.
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


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN A — 1080 × 1080  ·  pilules jaunes inclinées
# ══════════════════════════════════════════════════════════════════════════════

_A_W, _A_H   = FEED_W, FEED_H   # 1080 × 1080

_A_PILL_H    = 180
_A_PILL_MX   = 52     # marge gauche/droite des pilules
_A_PILL_R    = 22     # rayon des coins
_A_OVERLAP   = 22     # chevauchement pilule 2 sous pilule 1

_A_BADGE_H   = 56
_A_BADGE_Y   = 340
_A_P1_Y      = _A_BADGE_Y + _A_BADGE_H + 24       # 420
_A_P2_Y      = _A_P1_Y + _A_PILL_H - _A_OVERLAP   # 578
_A_FOOT_Y    = _A_P2_Y + _A_PILL_H + 60            # 818
_A_FOOT_H    = 128


def _draw_tilted_pill(img: Image.Image,
                      x1: int, y1: int, x2: int, y2: int,
                      text: str, font,
                      color_left: tuple, color_right: tuple, text_color: tuple,
                      angle: float = 0.0,
                      pill_r: int = _A_PILL_R) -> tuple:
    """
    Pilule dégradée inclinée (Design A).
    Retourne (img_résultat, draw).
    """
    w, h = x2 - x1, y2 - y1

    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(color_left[i] * (1 - t) + color_right[i] * t) for i in range(3)]
    pill_img = Image.fromarray(arr, "RGB")

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=pill_r, fill=255)

    pill_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pill_rgba.paste(pill_img, (0, 0))
    pill_rgba.putalpha(mask)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(pill_rgba, (x1, y1), pill_rgba)

    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(text, font=font)
    tx = x1 + (w - tw) / 2
    ty = y1 + (h - font.size) / 2 - 4
    ld.text((tx, ty), text, font=font, fill=(*text_color, 255))

    pcx, pcy = (x1 + x2) // 2, (y1 + y2) // 2
    layer_rot = layer.rotate(angle, center=(pcx, pcy), expand=False, resample=Image.BICUBIC)

    result_rgba = Image.alpha_composite(img.convert("RGBA"), layer_rot)
    result = result_rgba.convert("RGB")
    return result, ImageDraw.Draw(result)


def generate_phrase_design_yellow(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_a.png",
) -> str:
    """
    Design A — 1080 × 1080, pilules jaunes inclinées.
    Badge auteure blanc centré en bas.
    """
    img  = make_radial_gradient(_A_W, _A_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    cl, cr, tc = YELLOW_LEFT, YELLOW_RIGHT, tuple(YELLOW_TEXT)

    # Split sur "≠"
    if "≠" in pill_text:
        parts = pill_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = pill_text
        line2 = None

    # ── Badge label centré ───────────────────────────────────────────────────
    font_lbl = load_font(FONT_BOLD, 34)
    lbl_w    = int(draw.textlength(label, font=font_lbl)) + 54
    lbl_x    = (_A_W - lbl_w) // 2
    draw.rounded_rectangle(
        [lbl_x, _A_BADGE_Y, lbl_x + lbl_w, _A_BADGE_Y + _A_BADGE_H],
        radius=_A_BADGE_H // 2, fill=(255, 255, 255),
    )
    tw = draw.textlength(label, font=font_lbl)
    draw.text(
        (lbl_x + (lbl_w - tw) / 2, _A_BADGE_Y + (_A_BADGE_H - 34) // 2),
        label, font=font_lbl, fill=BRAND_BLUE,
    )

    # ── Pilules (pilule 2 derrière, pilule 1 devant) ─────────────────────────
    px1, px2 = _A_PILL_MX, _A_W - _A_PILL_MX
    font1 = load_font(FONT_BLACK,  110)   # gros bold
    font2 = load_font(FONT_SERIF_I, 86)   # italic élégant

    if line2:                             # pilule 2 EN PREMIER (derrière)
        img, draw = _draw_tilted_pill(
            img, px1, _A_P2_Y, px2, _A_P2_Y + _A_PILL_H,
            line2, font2, cl, cr, tc, angle=-5.0,
        )
    img, draw = _draw_tilted_pill(        # pilule 1 EN SECOND (devant)
        img, px1, _A_P1_Y, px2, _A_P1_Y + _A_PILL_H,
        line1, font1, cl, cr, tc, angle=+3.0,
    )

    # ── Badge auteure blanc centré en bas ────────────────────────────────────
    bx1, bx2 = 58, _A_W - 58
    draw.rounded_rectangle(
        [bx1, _A_FOOT_Y, bx2, _A_FOOT_Y + _A_FOOT_H],
        radius=22, fill=(255, 255, 255),
    )
    font_auth = load_font(FONT_LIGHT_I, 36)
    aw = draw.textlength(BRAND_AUTHOR, font=font_auth)
    draw.text(
        ((_A_W - aw) / 2, _A_FOOT_Y + 18),
        BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE,
    )
    font_tag = load_font(FONT_BOLD, 26)
    draw_multiline_centered(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        bx1 + 26, _A_FOOT_Y + 62, bx2 - 26, _A_FOOT_Y + _A_FOOT_H - 8,
        line_spacing=1.26,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN B — 1080 × 1350 portrait  ·  pilules bleu-violet droites
# ══════════════════════════════════════════════════════════════════════════════

_B_W, _B_H   = 1080, 1350

_B_PILL_H    = 235
_B_PILL_MX   = 45     # marge pour la pilule 1
_B_P2_LEFT   = -22    # pilule 2 déborde de 22 px à gauche du canvas
_B_PILL_R    = 18
_B_OVERLAP   = 23

_B_BADGE_H   = 58
_B_BADGE_Y   = 415
_B_P1_Y      = _B_BADGE_Y + _B_BADGE_H + 22       # 495
_B_P2_Y      = _B_P1_Y + _B_PILL_H - _B_OVERLAP   # 707
_B_AUTH_Y    = 1068
_B_TAG_Y     = 1120
_B_TAG_H     = 158


def _draw_straight_pill(img: Image.Image,
                        x1: int, y1: int, x2: int, y2: int,
                        text: str, font,
                        color_left: tuple, color_right: tuple, text_color: tuple,
                        pill_r: int = _B_PILL_R) -> tuple:
    """
    Pilule dégradée droite (Design B).
    x1 peut être négatif : la pilule déborde alors à gauche du canvas.
    Retourne (img_résultat, draw).
    """
    w, h = x2 - x1, y2 - y1

    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(color_left[i] * (1 - t) + color_right[i] * t) for i in range(3)]
    pill_img = Image.fromarray(arr, "RGB")

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=pill_r, fill=255)

    pill_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pill_rgba.paste(pill_img, (0, 0))
    pill_rgba.putalpha(mask)

    # Couche pleine image
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    if x1 < 0:
        # La pilule dépasse à gauche : on coupe et on colle à x=0
        crop_x = -x1
        cropped = pill_rgba.crop((crop_x, 0, w, h))
        layer.paste(cropped, (0, y1), cropped)
    else:
        layer.paste(pill_rgba, (x1, y1), pill_rgba)

    # Texte centré dans les bornes théoriques (même si x1 < 0)
    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(text, font=font)
    tx = max(8, x1 + (w - tw) / 2)
    ty = y1 + (h - font.size) / 2 - 4
    ld.text((tx, ty), text, font=font, fill=(*text_color, 255))

    result_rgba = Image.alpha_composite(img.convert("RGBA"), layer)
    result = result_rgba.convert("RGB")
    return result, ImageDraw.Draw(result)


def generate_phrase_design_blue(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_b.png",
) -> str:
    """
    Design B — 1080 × 1350 portrait.
    Pilules bleu-violet DROITES très larges (pilule 2 déborde à gauche).
    Auteure italic + tagline sur fond blanc arrondi en bas.
    """
    img  = make_radial_gradient(_B_W, _B_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    cl, cr, tc = PILL_LEFT, PILL_RIGHT, tuple(PILL_TEXT)

    # Split sur "≠"
    if "≠" in pill_text:
        parts = pill_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = pill_text
        line2 = None

    # ── Badge label centré ───────────────────────────────────────────────────
    font_lbl = load_font(FONT_BOLD, 34)
    lbl_w    = int(draw.textlength(label, font=font_lbl)) + 54
    lbl_x    = (_B_W - lbl_w) // 2
    draw.rounded_rectangle(
        [lbl_x, _B_BADGE_Y, lbl_x + lbl_w, _B_BADGE_Y + _B_BADGE_H],
        radius=_B_BADGE_H // 2, fill=(255, 255, 255),
    )
    tw = draw.textlength(label, font=font_lbl)
    draw.text(
        (lbl_x + (lbl_w - tw) / 2, _B_BADGE_Y + (_B_BADGE_H - 34) // 2),
        label, font=font_lbl, fill=BRAND_BLUE,
    )

    # ── Pilules droites (pilule 2 derrière, pilule 1 devant) ─────────────────
    p1x1 = _B_PILL_MX
    p1x2 = _B_W - _B_PILL_MX
    p2x1 = _B_P2_LEFT                  # déborde à gauche
    p2x2 = _B_W - _B_PILL_MX + 10     # légèrement plus large à droite

    font1 = load_font(FONT_BLACK,   120)   # grand bold
    font2 = load_font(FONT_SERIF_I,  96)   # grand italic élégant

    if line2:                              # pilule 2 EN PREMIER (derrière)
        img, draw = _draw_straight_pill(
            img, p2x1, _B_P2_Y, p2x2, _B_P2_Y + _B_PILL_H,
            line2, font2, cl, cr, tc,
        )
    img, draw = _draw_straight_pill(       # pilule 1 EN SECOND (devant)
        img, p1x1, _B_P1_Y, p1x2, _B_P1_Y + _B_PILL_H,
        line1, font1, cl, cr, tc,
    )

    # ── Auteure italic (sans fond) ───────────────────────────────────────────
    font_auth = load_font(FONT_LIGHT_I, 40)
    aw = draw.textlength(BRAND_AUTHOR, font=font_auth)
    draw.text(
        ((_B_W - aw) / 2, _B_AUTH_Y),
        BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE,
    )

    # ── Tagline sur fond blanc arrondi ───────────────────────────────────────
    tx1, tx2 = 58, _B_W - 58
    draw.rounded_rectangle(
        [tx1, _B_TAG_Y, tx2, _B_TAG_Y + _B_TAG_H],
        radius=22, fill=(252, 248, 244),
    )
    font_tag = load_font(FONT_BOLD, 26)
    draw_multiline_centered(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        tx1 + 22, _B_TAG_Y + 12, tx2 - 22, _B_TAG_Y + _B_TAG_H - 12,
        line_spacing=1.35,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DISPATCHER
# ══════════════════════════════════════════════════════════════════════════════

def generate_phrase_design_post(
        label: str,
        pill_text: str,
        variant: str = "yellow",
        output_path: str = None,
) -> str:
    """
    Génère un post phrase design.

    Args:
        label      : Badge label (ex : "SEO conforme").
        pill_text  : Texte des pilules avec "≠" comme séparateur.
        variant    : "yellow" → Design A (1080×1080, incliné)
                     "blue"   → Design B (1080×1350, portrait, droit)
        output_path: Chemin de sauvegarde (auto si None).
    """
    if variant == "blue":
        p = output_path or "output/flash_posts/phrase_b.png"
        return generate_phrase_design_blue(label, pill_text, p)
    else:
        p = output_path or "output/flash_posts/phrase_a.png"
        return generate_phrase_design_yellow(label, pill_text, p)
