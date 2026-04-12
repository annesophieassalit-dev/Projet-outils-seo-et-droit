"""
Phrase design posts — 2 designs alternés, 1080 × 1350 (portrait 4:5).

Design A ("yellow") : fond rose radial · pilules jaune pâle→jaune vif · texte bleu foncé
Design B ("blue")   : fond rose radial · pilules bleu→violet dégradé  · texte blanc + glow

Les deux pilules sont inclinées dans le même sens (légèrement horaire)
et se croisent : P1 en avant, P2 passe derrière.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from config import (
    FEED_W,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT_I, FONT_SERIF_I,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    PILL_LEFT, PILL_RIGHT,
    BRAND_AUTHOR, BRAND_TAGLINE, BRAND_VISIBLE, BRAND_CONFORME,
)
from generators.base import load_font, make_radial_gradient


# ══════════════════════════════════════════════════════════════════════════════
#  DIMENSIONS — 1080 × 1350 portrait 4:5
# ══════════════════════════════════════════════════════════════════════════════

_W, _H   = FEED_W, 1350    # 1080 × 1350

# ── Pilules ──────────────────────────────────────────────────────────────────
_PILL_W  = _W - 80          # 1000 px (40 px marge de chaque côté)
_PILL_H  = 152              # hauteur des pilules (réduite)
_PILL_R  = 16               # rayon des coins
_TILT1   = 0.0              # P1 — droite (horizontale)
_TILT2   = +3.5             # P2 — penchée dans l'autre sens (anti-horaire visuellement)
_OVERLAP = 30               # px que P2 passe derrière P1

# ── Positions verticales ─────────────────────────────────────────────────────
_LBL_Y   = 440              # badge label y
_LBL_H   = 46

_P1_CY   = 610              # centre y pilule 1
_P2_CY   = _P1_CY + _PILL_H - _OVERLAP   # 610 + 152 - 30 = 732

_FOOT_Y  = 1090             # badge auteure
_FOOT_H  = 160


# ══════════════════════════════════════════════════════════════════════════════
#  UTILITAIRES
# ══════════════════════════════════════════════════════════════════════════════

def _draw_brand_glow(img: Image.Image) -> tuple:
    """Header 'VISIBLE ET / CONFORME' avec halo lumineux (identique carousel CTA)."""
    W, H      = img.size
    font_sub  = load_font(FONT_LIGHT_I, 34)
    font_main = load_font(FONT_BLACK,   76)

    tmp    = ImageDraw.Draw(img)
    sub_w  = tmp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = tmp.textlength(BRAND_CONFORME, font=font_main)
    y_sub  = 48
    y_main = y_sub + 46
    sx     = (W - sub_w)  / 2
    mx     = (W - main_w) / 2

    rgba = img.convert("RGBA")
    for blur_r, alpha in [(24, 175), (12, 148), (5, 115)]:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d     = ImageDraw.Draw(layer)
        d.text((sx, y_sub),  BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255, alpha))
        d.text((mx, y_main), BRAND_CONFORME, font=font_main, fill=(255, 255, 255, alpha))
        layer = layer.filter(ImageFilter.GaussianBlur(blur_r))
        rgba  = Image.alpha_composite(rgba, layer)

    img  = rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.text((sx, y_sub),  BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255))
    draw.text((mx, y_main), BRAND_CONFORME, font=font_main, fill=(255, 255, 255))
    return img, draw


def _label_badge(draw: ImageDraw.Draw, label: str, font, size: int, y: int, h: int) -> None:
    """Badge label blanc centré."""
    lbl_w = int(draw.textlength(label, font=font)) + 52
    x0    = (_W - lbl_w) // 2
    draw.rounded_rectangle([x0, y, x0 + lbl_w, y + h], radius=h // 2, fill=(255, 255, 255))
    tw = draw.textlength(label, font=font)
    draw.text((_W / 2 - tw / 2, y + (h - size) // 2), label, font=font, fill=BRAND_BLUE)


def _make_pill_plain(w: int, h: int, cl, cr, radius: int,
                     text: str, font, tc: tuple) -> Image.Image:
    """Pilule dégradée, texte coloré sans glow — Design A (jaune)."""
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(cl[i] * (1 - t) + cr[i] * t) for i in range(3)]
    bg = Image.fromarray(arr, "RGB").convert("RGBA")

    d  = ImageDraw.Draw(bg)
    bb = d.textbbox((0, 0), text, font=font)
    tx = (w - (bb[2] - bb[0])) / 2 - bb[0]
    ty = (h - (bb[3] - bb[1])) / 2 - bb[1]
    d.text((tx, ty), text, font=font, fill=(*tc, 255))

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(bg, (0, 0))
    out.putalpha(mask)
    return out


def _make_pill_glow(w: int, h: int, cl, cr, radius: int,
                    text: str, font) -> Image.Image:
    """Pilule dégradée, texte blanc avec halo lumineux — Design B (bleu-rose)."""
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(cl[i] * (1 - t) + cr[i] * t) for i in range(3)]
    bg = Image.fromarray(arr, "RGB").convert("RGBA")

    d  = ImageDraw.Draw(bg)
    bb = d.textbbox((0, 0), text, font=font)
    tx = (w - (bb[2] - bb[0])) / 2 - bb[0]
    ty = (h - (bb[3] - bb[1])) / 2 - bb[1]

    for blur_r, alpha in [(28, 100), (14, 140), (6, 175), (2, 210)]:
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(glow).text((tx, ty), text, font=font, fill=(255, 255, 255, alpha))
        glow = glow.filter(ImageFilter.GaussianBlur(blur_r))
        bg   = Image.alpha_composite(bg, glow)
    ImageDraw.Draw(bg).text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(bg, (0, 0))
    out.putalpha(mask)
    return out


def _paste_pill_tilted(img: Image.Image, pill: Image.Image,
                       angle: float, cy: int) -> tuple:
    """Colle une pilule inclinée, centrée horizontalement, centrée verticalement sur cy."""
    W, H    = img.size
    rotated = pill.rotate(angle, expand=True, resample=Image.BICUBIC)
    rw, rh  = rotated.size
    x       = (W - rw) // 2      # centrage horizontal
    y       = cy - rh // 2       # centrage vertical

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(rotated, (x, y), rotated)
    out = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    return out, ImageDraw.Draw(out)


def _footer_badge(draw: ImageDraw.Draw) -> None:
    """Badge auteure blanc en bas, texte left-aligné."""
    bx1, bx2 = 46, _W - 46
    draw.rounded_rectangle([bx1, _FOOT_Y, bx2, _FOOT_Y + _FOOT_H],
                            radius=18, fill=(255, 255, 255))
    pad = 24
    draw.text((bx1 + pad, _FOOT_Y + 16), BRAND_AUTHOR,
              font=load_font(FONT_LIGHT_I, 32), fill=BRAND_BLUE)

    font_tag = load_font(FONT_BOLD, 24)
    words    = BRAND_TAGLINE.split()
    lines, cur = [], ""
    max_w = bx2 - bx1 - 2 * pad
    for word in words:
        test = (cur + " " + word).strip()
        if draw.textlength(test, font=font_tag) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    bb = draw.textbbox((0, 0), "Ag", font=font_tag)
    lh = (bb[3] - bb[1]) * 1.28
    y  = _FOOT_Y + 58
    for line in lines:
        draw.text((bx1 + pad, y), line, font=font_tag, fill=BRAND_BLUE)
        y += lh


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN A — pilules JAUNES
# ══════════════════════════════════════════════════════════════════════════════

def generate_phrase_design_yellow(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_a.png",
) -> str:
    """Design A — 1080×1350, pilules jaunes inclinées, texte bleu foncé."""
    img = make_radial_gradient(_W, _H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    img, draw = _draw_brand_glow(img)
    _label_badge(draw, label, load_font(FONT_REGULAR, 30), 30, _LBL_Y, _LBL_H)

    if "≠" in pill_text:
        p = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    cl, cr, tc = YELLOW_LEFT, YELLOW_RIGHT, tuple(YELLOW_TEXT)
    font1 = load_font(FONT_BOLD,    76)
    font2 = load_font(FONT_SERIF_I, 64)

    # P2 d'abord (derrière), P1 ensuite (devant)
    if line2:
        pill2 = _make_pill_plain(_PILL_W, _PILL_H, cl, cr, _PILL_R, line2, font2, tc)
        img, draw = _paste_pill_tilted(img, pill2, _TILT2, _P2_CY)

    pill1 = _make_pill_plain(_PILL_W, _PILL_H, cl, cr, _PILL_R, line1, font1, tc)
    img, draw = _paste_pill_tilted(img, pill1, _TILT1, _P1_CY)

    _footer_badge(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN B — pilules BLEU-ROSE dégradé + glow blanc
# ══════════════════════════════════════════════════════════════════════════════

def generate_phrase_design_blue(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_b.png",
) -> str:
    """Design B — 1080×1350, pilules bleu-rose inclinées, texte blanc + glow."""
    img = make_radial_gradient(_W, _H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    img, draw = _draw_brand_glow(img)
    _label_badge(draw, label, load_font(FONT_REGULAR, 30), 30, _LBL_Y, _LBL_H)

    if "≠" in pill_text:
        p = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    cl, cr = PILL_LEFT, PILL_RIGHT
    font1 = load_font(FONT_BOLD,    76)
    font2 = load_font(FONT_SERIF_I, 64)

    # P2 d'abord (derrière), P1 ensuite (devant)
    if line2:
        pill2 = _make_pill_glow(_PILL_W, _PILL_H, cl, cr, _PILL_R, line2, font2)
        img, draw = _paste_pill_tilted(img, pill2, _TILT2, _P2_CY)

    pill1 = _make_pill_glow(_PILL_W, _PILL_H, cl, cr, _PILL_R, line1, font1)
    img, draw = _paste_pill_tilted(img, pill1, _TILT1, _P1_CY)

    _footer_badge(draw)

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
    Args:
        label      : Badge label (ex : "SEO conforme").
        pill_text  : Texte avec "≠" comme séparateur des 2 pilules.
        variant    : "yellow" → Design A (jaune) | "blue" → Design B (bleu-rose)
        output_path: Chemin de sauvegarde (auto si None).
    """
    if variant == "blue":
        return generate_phrase_design_blue(
            label, pill_text,
            output_path or "output/flash_posts/phrase_b.png",
        )
    return generate_phrase_design_yellow(
        label, pill_text,
        output_path or "output/flash_posts/phrase_a.png",
    )
