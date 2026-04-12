"""
Générateur de posts "phrase design" — 2 designs alternés, même layout 1080×1080.

Design A ("yellow") :
  Fond rose radial · header VISIBLE ET/CONFORME glow · badge label ·
  pilules JAUNES droites centrées · badge auteure blanc en bas.

Design B ("blue") :
  Même layout exact · pilules BLEU-ROSE dégradé (#94b9ff→#e894ff) ·
  texte blanc avec glow lumineux.

Les deux PNG s'alternent semaine par semaine.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT_I, FONT_SERIF_I,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    PILL_LEFT, PILL_RIGHT,
    BRAND_AUTHOR, BRAND_TAGLINE, BRAND_VISIBLE, BRAND_CONFORME,
)
from generators.base import load_font, make_radial_gradient


# ══════════════════════════════════════════════════════════════════════════════
#  LAYOUT PARTAGÉ — 1080 × 1080 (identique pour A et B)
# ══════════════════════════════════════════════════════════════════════════════

_W, _H      = FEED_W, FEED_H   # 1080 × 1080

_PILL_H     = 112     # hauteur des pilules
_PILL_MX    = 46      # marge gauche/droite
_PILL_R     = 14      # rayon des coins
_OVERLAP    = 12      # chevauchement P2 sous P1

# Positions verticales (y_after header glow ≈ 189)
_LBL_Y      = 206     # badge label
_LBL_H      = 42      # hauteur badge
_P1_Y       = 268     # = 206 + 42 + 20
_P2_Y       = _P1_Y + _PILL_H - _OVERLAP   # 368
_FOOT_Y     = 700     # badge auteure (signature basse)
_FOOT_H     = 132


# ══════════════════════════════════════════════════════════════════════════════
#  UTILITAIRES
# ══════════════════════════════════════════════════════════════════════════════

def _draw_brand_glow(img: Image.Image) -> tuple:
    """Header 'VISIBLE ET / CONFORME' avec halo lumineux (même que carousel CTA)."""
    W, H     = img.size
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
    return img, draw, y_main + 95   # ≈ 189


def _label_badge(draw: ImageDraw.Draw, label: str, font, size: int, y: int, h: int) -> None:
    """Badge label blanc centré."""
    lbl_w = int(draw.textlength(label, font=font)) + 48
    x0    = (_W - lbl_w) // 2
    draw.rounded_rectangle([x0, y, x0 + lbl_w, y + h], radius=h // 2, fill=(255, 255, 255))
    tw = draw.textlength(label, font=font)
    draw.text((_W / 2 - tw / 2, y + (h - size) // 2), label, font=font, fill=BRAND_BLUE)


def _straight_pill_plain(w: int, h: int, cl, cr, radius: int,
                          text: str, font, tc: tuple) -> Image.Image:
    """Pilule dégradée droite, texte coloré (sans glow) — Design A jaune."""
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


def _straight_pill_glow(w: int, h: int, cl, cr, radius: int,
                         text: str, font) -> Image.Image:
    """Pilule dégradée droite, texte blanc avec halo lumineux — Design B bleu."""
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


def _paste_pill(img: Image.Image, pill: Image.Image, x: int, y: int) -> tuple:
    """Colle une pilule RGBA sur img. Retourne (img, draw)."""
    W, H  = img.size
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(pill, (x, y), pill)
    out = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    return out, ImageDraw.Draw(out)


def _footer_badge(draw: ImageDraw.Draw) -> None:
    """Badge auteure blanc en bas, texte left-aligné."""
    bx1, bx2 = 46, _W - 46
    draw.rounded_rectangle([bx1, _FOOT_Y, bx2, _FOOT_Y + _FOOT_H],
                            radius=18, fill=(255, 255, 255))
    pad = 22
    draw.text((bx1 + pad, _FOOT_Y + 14), BRAND_AUTHOR,
              font=load_font(FONT_LIGHT_I, 30), fill=BRAND_BLUE)

    font_tag = load_font(FONT_BOLD, 22)
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
    y  = _FOOT_Y + 54
    for line in lines:
        draw.text((bx1 + pad, y), line, font=font_tag, fill=BRAND_BLUE)
        y += lh


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN A — pilules JAUNES droites
# ══════════════════════════════════════════════════════════════════════════════

def generate_phrase_design_yellow(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_a.png",
) -> str:
    """Design A — 1080×1080, pilules jaunes droites centrées."""
    img = make_radial_gradient(_W, _H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    # Header glow
    img, draw, _ = _draw_brand_glow(img)

    # Badge label
    _label_badge(draw, label, load_font(FONT_REGULAR, 28), 28, _LBL_Y, _LBL_H)

    # Découpage ≠
    if "≠" in pill_text:
        p           = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    px1 = _PILL_MX
    pw  = _W - 2 * _PILL_MX
    cl, cr, tc = YELLOW_LEFT, YELLOW_RIGHT, tuple(YELLOW_TEXT)

    font1 = load_font(FONT_BOLD,    74)
    font2 = load_font(FONT_SERIF_I, 66)

    # P2 en premier (derrière), P1 en second (devant)
    if line2:
        pill2 = _straight_pill_plain(pw, _PILL_H, cl, cr, _PILL_R, line2, font2, tc)
        img, draw = _paste_pill(img, pill2, px1, _P2_Y)

    pill1 = _straight_pill_plain(pw, _PILL_H, cl, cr, _PILL_R, line1, font1, tc)
    img, draw = _paste_pill(img, pill1, px1, _P1_Y)

    # Badge auteure
    _footer_badge(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN B — même layout, pilules BLEU-ROSE dégradé + glow blanc
# ══════════════════════════════════════════════════════════════════════════════

def generate_phrase_design_blue(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_b.png",
) -> str:
    """Design B — 1080×1080, même layout que A, pilules bleu-rose avec glow."""
    img = make_radial_gradient(_W, _H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    # Header glow
    img, draw, _ = _draw_brand_glow(img)

    # Badge label
    _label_badge(draw, label, load_font(FONT_REGULAR, 28), 28, _LBL_Y, _LBL_H)

    # Découpage ≠
    if "≠" in pill_text:
        p           = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    px1 = _PILL_MX
    pw  = _W - 2 * _PILL_MX
    cl, cr = PILL_LEFT, PILL_RIGHT

    font1 = load_font(FONT_BOLD,    74)
    font2 = load_font(FONT_SERIF_I, 66)

    # P2 en premier (derrière), P1 en second (devant)
    if line2:
        pill2 = _straight_pill_glow(pw, _PILL_H, cl, cr, _PILL_R, line2, font2)
        img, draw = _paste_pill(img, pill2, px1, _P2_Y)

    pill1 = _straight_pill_glow(pw, _PILL_H, cl, cr, _PILL_R, line1, font1)
    img, draw = _paste_pill(img, pill1, px1, _P1_Y)

    # Badge auteure
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
