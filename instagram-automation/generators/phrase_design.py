"""
Générateur de posts "phrase design".

Design A ("yellow") — 1080 × 1080
  Fond rose radial · badge label · pilules JAUNES légèrement inclinées
  (P1 descend vers la droite -2°, P2 monte +2°) · badge auteure blanc en bas.

Design B ("blue")  — 1080 × 1350 portrait
  Fond rose radial · badge label avec ombre · pilules BLEU-VIOLET DROITES
  très larges (P2 déborde à gauche) · glow sur le texte des pilules ·
  auteure italic + tagline surligné en bas à gauche.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BOLD, FONT_REGULAR, FONT_LIGHT_I, FONT_SERIF_I,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    PILL_LEFT, PILL_RIGHT,
    BRAND_AUTHOR, BRAND_TAGLINE,
)
from generators.base import load_font, make_radial_gradient


# ══════════════════════════════════════════════════════════════════════════════
#  Utilitaires communs
# ══════════════════════════════════════════════════════════════════════════════

def _draw_left_text(draw, text, font, color, x, y, max_w, line_spacing=1.3):
    """Texte multi-lignes left-aligné dans une largeur max_w."""
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = (current + " " + word).strip()
        if draw.textlength(test, font=font) <= max_w:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    bbox = draw.textbbox((0, 0), "Ag", font=font)
    lh = (bbox[3] - bbox[1]) * line_spacing
    for i, line in enumerate(lines):
        draw.text((x, y + i * lh), line, font=font, fill=color)


def _draw_label_badge(draw, label, font_lbl, font_size, cx, y, radius=22,
                      shadow=False):
    """Badge label blanc centré (avec ombre optionnelle)."""
    lbl_w = int(draw.textlength(label, font=font_lbl)) + 50
    lbl_h = font_size + 20
    x0 = cx - lbl_w // 2
    if shadow:
        draw.rounded_rectangle(
            [x0 + 4, y + 5, x0 + lbl_w + 4, y + lbl_h + 5],
            radius=radius, fill=(200, 165, 165),
        )
    draw.rounded_rectangle(
        [x0, y, x0 + lbl_w, y + lbl_h],
        radius=radius, fill=(255, 255, 255),
    )
    tw = draw.textlength(label, font=font_lbl)
    draw.text(
        (cx - tw / 2, y + (lbl_h - font_size) // 2),
        label, font=font_lbl, fill=BRAND_BLUE,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN A — 1080 × 1080  ·  pilules jaunes légèrement inclinées
# ══════════════════════════════════════════════════════════════════════════════

_A_W, _A_H  = FEED_W, FEED_H   # 1080 × 1080

# Pilules
_A_PILL_H   = 128     # hauteur des pilules
_A_PILL_MX  = 46      # marge gauche/droite
_A_PILL_R   = 13      # rayon des coins (légèrement arrondi, pas capsule)
_A_OVERLAP  = 12      # chevauchement P2 sous P1

# Positions verticales
_A_LBL_Y    = 348     # badge label
_A_P1_Y     = 410     # top pilule 1  (après badge ~42px + gap 20)
_A_P2_Y     = _A_P1_Y + _A_PILL_H - _A_OVERLAP   # 526
_A_FOOT_Y   = _A_P2_Y + _A_PILL_H + 72            # 726
_A_FOOT_H   = 130


def _pill_gradient_rgba(w, h, cl, cr, radius):
    """Pilule dégradée RGBA avec masque arrondi."""
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(cl[i] * (1 - t) + cr[i] * t) for i in range(3)]
    bg = Image.fromarray(arr, "RGB").convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    result = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    result.paste(bg, (0, 0))
    result.putalpha(mask)
    return result


def _draw_tilted_pill_a(img, x1, y1, x2, y2, text, font, cl, cr, tc, angle):
    """Pilule jaune inclinée (Design A). Retourne (img, draw)."""
    w, h = x2 - x1, y2 - y1

    pill = _pill_gradient_rgba(w, h, cl, cr, _A_PILL_R)

    # Texte centré dans la pilule
    tmp = ImageDraw.Draw(pill)
    bb  = tmp.textbbox((0, 0), text, font=font)
    tx  = (w - (bb[2] - bb[0])) / 2 - bb[0]
    ty  = (h - (bb[3] - bb[1])) / 2 - bb[1]
    tmp.text((tx, ty), text, font=font, fill=(*tc, 255))

    # Couche pleine image → rotation
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(pill, (x1, y1), pill)

    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    layer  = layer.rotate(angle, center=(cx, cy), expand=False, resample=Image.BICUBIC)

    out = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    return out, ImageDraw.Draw(out)


def generate_phrase_design_yellow(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_a.png",
) -> str:
    """Design A — 1080 × 1080, pilules jaunes légèrement inclinées."""
    img  = make_radial_gradient(_A_W, _A_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    cl, cr, tc = YELLOW_LEFT, YELLOW_RIGHT, tuple(YELLOW_TEXT)

    # Découpage sur ≠
    if "≠" in pill_text:
        p     = pill_text.split("≠", 1)
        line1 = p[0].strip()
        line2 = "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    # ── Badge label ──────────────────────────────────────────────────────────
    font_lbl = load_font(FONT_REGULAR, 28)
    _draw_label_badge(draw, label, font_lbl, 28, _A_W // 2, _A_LBL_Y, radius=20)

    # ── Pilules ──────────────────────────────────────────────────────────────
    px1   = _A_PILL_MX
    px2   = _A_W - _A_PILL_MX
    font1 = load_font(FONT_BOLD,    82)
    font2 = load_font(FONT_SERIF_I, 72)

    if line2:                          # P2 EN PREMIER → derrière
        img, draw = _draw_tilted_pill_a(
            img, px1, _A_P2_Y, px2, _A_P2_Y + _A_PILL_H,
            line2, font2, cl, cr, tc, angle=+2.0,
        )
    img, draw = _draw_tilted_pill_a(   # P1 EN SECOND → devant
        img, px1, _A_P1_Y, px2, _A_P1_Y + _A_PILL_H,
        line1, font1, cl, cr, tc, angle=-2.0,
    )

    # ── Badge auteure (fond blanc, texte left-aligné) ────────────────────────
    bx1, bx2 = 46, _A_W - 46
    draw.rounded_rectangle(
        [bx1, _A_FOOT_Y, bx2, _A_FOOT_Y + _A_FOOT_H],
        radius=18, fill=(255, 255, 255),
    )
    pad = 22
    font_auth = load_font(FONT_LIGHT_I, 30)
    draw.text((bx1 + pad, _A_FOOT_Y + 16), BRAND_AUTHOR,
              font=font_auth, fill=BRAND_BLUE)

    font_tag = load_font(FONT_BOLD, 23)
    _draw_left_text(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        bx1 + pad, _A_FOOT_Y + 56, bx2 - bx1 - 2 * pad,
        line_spacing=1.30,
    )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN B — 1080 × 1350 portrait  ·  pilules bleu-violet droites + glow
# ══════════════════════════════════════════════════════════════════════════════

_B_W, _B_H  = 1080, 1350

# Pilules
_B_PILL_H   = 218     # hauteur
_B_PILL_R   = 16      # rayon des coins
_B_OVERLAP  = 8       # chevauchement P2 sous P1
_B_P1_MX    = 46      # marge P1 (symétrique)
_B_P2_LEFT  = -18     # P2 déborde à gauche

# Positions verticales
_B_LBL_Y    = 418
_B_P1_Y     = 494     # = _B_LBL_Y + ~56 (badge) + 20
_B_P2_Y     = _B_P1_Y + _B_PILL_H - _B_OVERLAP   # 704
_B_AUTH_Y   = 1058
_B_TAG_Y    = 1108
_B_TAG_H    = 168


def _pill_with_glow(w, h, cl, cr, radius, text, font):
    """
    Pilule RGBA avec texte blanc lumineux (glow multi-passes + texte net).
    Le glow reste masqué dans la pilule.
    """
    # Fond dégradé
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(cl[i] * (1 - t) + cr[i] * t) for i in range(3)]
    bg = Image.fromarray(arr, "RGB").convert("RGBA")

    # Position du texte
    tmp_d = ImageDraw.Draw(bg)
    bb    = tmp_d.textbbox((0, 0), text, font=font)
    tx    = (w - (bb[2] - bb[0])) / 2 - bb[0]
    ty    = (h - (bb[3] - bb[1])) / 2 - bb[1]

    # Glow : plusieurs passes blur → composite
    for blur_r, alpha in [(28, 100), (14, 140), (6, 175), (2, 210)]:
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(glow).text((tx, ty), text, font=font,
                                   fill=(255, 255, 255, alpha))
        glow = glow.filter(ImageFilter.GaussianBlur(blur_r))
        bg   = Image.alpha_composite(bg, glow)

    # Texte net par-dessus
    ImageDraw.Draw(bg).text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    # Masque arrondi
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(bg, (0, 0))
    out.putalpha(mask)
    return out


def _paste_pill(img, pill_rgba, x1, y1):
    """Colle une pilule RGBA (x1 peut être négatif). Retourne (img, draw)."""
    w, h  = pill_rgba.size
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    if x1 < 0:
        cropped = pill_rgba.crop((-x1, 0, w, h))
        layer.paste(cropped, (0, y1), cropped)
    else:
        layer.paste(pill_rgba, (x1, y1), pill_rgba)
    out = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    return out, ImageDraw.Draw(out)


def generate_phrase_design_blue(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_b.png",
) -> str:
    """Design B — 1080 × 1350 portrait, pilules bleu-violet droites avec glow."""
    img  = make_radial_gradient(_B_W, _B_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    cl, cr = PILL_LEFT, PILL_RIGHT

    # Découpage sur ≠
    if "≠" in pill_text:
        p     = pill_text.split("≠", 1)
        line1 = p[0].strip()
        line2 = "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    # ── Badge label avec ombre douce ─────────────────────────────────────────
    font_lbl = load_font(FONT_REGULAR, 30)
    _draw_label_badge(draw, label, font_lbl, 30, _B_W // 2, _B_LBL_Y,
                      radius=27, shadow=True)

    # ── Pilules droites (P2 derrière, P1 devant) ─────────────────────────────
    font1 = load_font(FONT_BOLD,    110)
    font2 = load_font(FONT_SERIF_I,  90)

    p1x1  = _B_P1_MX
    p1x2  = _B_W - _B_P1_MX
    p2x1  = _B_P2_LEFT
    p2x2  = _B_W - _B_P1_MX + 10

    if line2:                          # P2 EN PREMIER → derrière
        pill2 = _pill_with_glow(p2x2 - p2x1, _B_PILL_H, cl, cr, _B_PILL_R,
                                 line2, font2)
        img, draw = _paste_pill(img, pill2, p2x1, _B_P2_Y)

    pill1 = _pill_with_glow(p1x2 - p1x1, _B_PILL_H, cl, cr, _B_PILL_R,
                             line1, font1)
    img, draw = _paste_pill(img, pill1, p1x1, _B_P1_Y)

    # ── Auteure italic, left-aligné ──────────────────────────────────────────
    font_auth = load_font(FONT_LIGHT_I, 36)
    draw.text((58, _B_AUTH_Y), BRAND_AUTHOR, font=font_auth, fill=BRAND_BLUE)

    # ── Tagline : fond blanc arrondi (pas pleine largeur), texte left-aligné ─
    tx1 = 46
    tx2 = _B_W - 190          # ~890 px → laisse de l'air à droite
    draw.rounded_rectangle(
        [tx1, _B_TAG_Y, tx2, _B_TAG_Y + _B_TAG_H],
        radius=22, fill=(252, 248, 244),
    )
    font_tag = load_font(FONT_BOLD, 24)
    _draw_left_text(
        draw, BRAND_TAGLINE, font_tag, BRAND_BLUE,
        tx1 + 20, _B_TAG_Y + 14, tx2 - tx1 - 28,
        line_spacing=1.38,
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
    Args:
        label      : Badge label (ex : "SEO conforme").
        pill_text  : Texte avec "≠" comme séparateur des 2 pilules.
        variant    : "yellow" → Design A (1080×1080)
                     "blue"   → Design B (1080×1350 portrait)
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
