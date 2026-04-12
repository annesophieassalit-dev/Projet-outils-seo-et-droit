"""
Générateur de posts "phrase design".

Design A ("yellow") — 1080 × 1080  ·  pilules BLEU-VIOLET inclinées (-2° / +2°)
Design B ("blue")   — 1080 × 1350  ·  pilules BLEU-VIOLET droites, P2 déborde à gauche

Les deux partagent :
  · fond rose radial
  · header "VISIBLE ET / CONFORME" avec glow (identique aux slides CTA des carousels)
  · badge label centré
  · pilules dégradées #94b9ff → #e894ff, texte blanc + glow
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT_I, FONT_SERIF_I,
    PILL_LEFT, PILL_RIGHT,
    BRAND_AUTHOR, BRAND_TAGLINE, BRAND_VISIBLE, BRAND_CONFORME,
)
from generators.base import load_font, make_radial_gradient


# ══════════════════════════════════════════════════════════════════════════════
#  UTILITAIRES PARTAGÉS
# ══════════════════════════════════════════════════════════════════════════════

def _draw_brand_glow(img: Image.Image) -> tuple:
    """
    Dessine "VISIBLE ET / CONFORME" avec halo lumineux en haut de l'image.
    Identique à _draw_cta_header_glow() dans carousel_marine.py.
    Retourne (img, draw, y_après_header).
    """
    W, H = img.size
    font_sub  = load_font(FONT_LIGHT_I, 34)
    font_main = load_font(FONT_BLACK,   76)

    tmp      = ImageDraw.Draw(img)
    sub_w    = tmp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w   = tmp.textlength(BRAND_CONFORME, font=font_main)
    y_sub    = 48
    y_main   = y_sub + 46          # 94
    sub_x    = (W - sub_w)  / 2
    main_x   = (W - main_w) / 2

    img_rgba = img.convert("RGBA")
    for blur_r, alpha in [(24, 175), (12, 148), (5, 115)]:
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d     = ImageDraw.Draw(layer)
        d.text((sub_x,  y_sub),  BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255, alpha))
        d.text((main_x, y_main), BRAND_CONFORME, font=font_main, fill=(255, 255, 255, alpha))
        layer    = layer.filter(ImageFilter.GaussianBlur(radius=blur_r))
        img_rgba = Image.alpha_composite(img_rgba, layer)

    img  = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.text((sub_x,  y_sub),  BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255))
    draw.text((main_x, y_main), BRAND_CONFORME, font=font_main, fill=(255, 255, 255))
    return img, draw, y_main + 95   # y_after ≈ 189


def _label_badge(draw: ImageDraw.Draw, label: str, font, size: int,
                 cx: int, y: int, h: int, radius: int = 20,
                 shadow: bool = False) -> None:
    """Badge label blanc centré (avec ombre optionnelle)."""
    lbl_w = int(draw.textlength(label, font=font)) + 48
    x0    = cx - lbl_w // 2
    if shadow:
        draw.rounded_rectangle([x0 + 3, y + 4, x0 + lbl_w + 3, y + h + 4],
                                radius=radius, fill=(200, 165, 165))
    draw.rounded_rectangle([x0, y, x0 + lbl_w, y + h],
                            radius=radius, fill=(255, 255, 255))
    tw = draw.textlength(label, font=font)
    draw.text((cx - tw / 2, y + (h - size) // 2), label, font=font, fill=BRAND_BLUE)


def _pill_glow_rgba(w: int, h: int, cl: tuple, cr: tuple,
                    radius: int, text: str, font) -> Image.Image:
    """
    Pilule dégradée RGBA avec texte blanc + halo lumineux.
    Le glow est masqué par les bords arrondis de la pilule.
    """
    arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        arr[:, px] = [int(cl[i] * (1 - t) + cr[i] * t) for i in range(3)]
    bg = Image.fromarray(arr, "RGB").convert("RGBA")

    # Centrage précis du texte
    d    = ImageDraw.Draw(bg)
    bb   = d.textbbox((0, 0), text, font=font)
    tx   = (w - (bb[2] - bb[0])) / 2 - bb[0]
    ty   = (h - (bb[3] - bb[1])) / 2 - bb[1]

    # Glow multi-passes
    for blur_r, alpha in [(28, 100), (14, 140), (6, 175), (2, 210)]:
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(glow).text((tx, ty), text, font=font, fill=(255, 255, 255, alpha))
        glow = glow.filter(ImageFilter.GaussianBlur(blur_r))
        bg   = Image.alpha_composite(bg, glow)

    ImageDraw.Draw(bg).text((tx, ty), text, font=font, fill=(255, 255, 255, 255))

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out  = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(bg, (0, 0))
    out.putalpha(mask)
    return out


def _paste(img: Image.Image, pill: Image.Image,
           x1: int, y1: int) -> tuple:
    """Colle une pilule RGBA sur img (x1 peut être négatif). Retourne (img, draw)."""
    W, H  = img.size
    w, h  = pill.size
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if x1 < 0:
        layer.paste(pill.crop((-x1, 0, w, h)), (0, y1), pill.crop((-x1, 0, w, h)))
    else:
        layer.paste(pill, (x1, y1), pill)
    out = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    return out, ImageDraw.Draw(out)


def _left_text(draw: ImageDraw.Draw, text: str, font, color: tuple,
               x: int, y: int, max_w: int, line_spacing: float = 1.3) -> None:
    """Texte multi-lignes left-aligné dans max_w pixels."""
    words   = text.split()
    lines, cur = [], ""
    for word in words:
        test = (cur + " " + word).strip()
        if draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    bb = draw.textbbox((0, 0), "Ag", font=font)
    lh = (bb[3] - bb[1]) * line_spacing
    for i, line in enumerate(lines):
        draw.text((x, y + i * lh), line, font=font, fill=color)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN A — 1080 × 1080  ·  pilules bleu-violet inclinées
# ══════════════════════════════════════════════════════════════════════════════

_A_W, _A_H  = FEED_W, FEED_H   # 1080 × 1080

# Pilules réduites
_A_PILL_H   = 100
_A_PILL_MX  = 46
_A_PILL_R   = 13
_A_OVERLAP  = 10

# y_after brand glow ≈ 189  →  badge ici :
_A_LBL_Y    = 204   # badge label
_A_LBL_H    = 40
_A_P1_Y     = 264   # = 204 + 40 + 20
_A_P2_Y     = _A_P1_Y + _A_PILL_H - _A_OVERLAP   # 354
_A_FOOT_Y   = 720   # signature — poussée vers le bas
_A_FOOT_H   = 128


def generate_phrase_design_yellow(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_a.png",
) -> str:
    """Design A — 1080 × 1080 · pilules bleu-violet inclinées (-2° / +2°)."""
    img = make_radial_gradient(_A_W, _A_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    # ── Header glow ──────────────────────────────────────────────────────────
    img, draw, _ = _draw_brand_glow(img)

    # ── Badge label ──────────────────────────────────────────────────────────
    font_lbl = load_font(FONT_REGULAR, 28)
    _label_badge(draw, label, font_lbl, 28, _A_W // 2, _A_LBL_Y, _A_LBL_H, radius=20)

    # ── Découpage ≠ ──────────────────────────────────────────────────────────
    if "≠" in pill_text:
        p     = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    # ── Pilules inclinées (P2 derrière → P1 devant) ──────────────────────────
    px1, px2 = _A_PILL_MX, _A_W - _A_PILL_MX
    font1    = load_font(FONT_BOLD,    68)
    font2    = load_font(FONT_SERIF_I, 60)
    cl, cr   = PILL_LEFT, PILL_RIGHT

    def _tilted(img, x1, y1, x2, y2, text, font, angle):
        w, h  = x2 - x1, y2 - y1
        pill  = _pill_glow_rgba(w, h, cl, cr, _A_PILL_R, text, font)
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        layer.paste(pill, (x1, y1), pill)
        cx, cy    = (x1 + x2) // 2, (y1 + y2) // 2
        layer_rot = layer.rotate(angle, center=(cx, cy),
                                  expand=False, resample=Image.BICUBIC)
        out = Image.alpha_composite(img.convert("RGBA"), layer_rot).convert("RGB")
        return out, ImageDraw.Draw(out)

    if line2:
        img, draw = _tilted(img, px1, _A_P2_Y, px2, _A_P2_Y + _A_PILL_H,
                             line2, font2, angle=+2.0)   # P2 → derrière
    img, draw = _tilted(img, px1, _A_P1_Y, px2, _A_P1_Y + _A_PILL_H,
                         line1, font1, angle=-2.0)        # P1 → devant

    # ── Badge auteure blanc, texte left-aligné ───────────────────────────────
    bx1, bx2 = 46, _A_W - 46
    draw.rounded_rectangle([bx1, _A_FOOT_Y, bx2, _A_FOOT_Y + _A_FOOT_H],
                            radius=18, fill=(255, 255, 255))
    pad = 22
    draw.text((bx1 + pad, _A_FOOT_Y + 14),
              BRAND_AUTHOR, font=load_font(FONT_LIGHT_I, 30), fill=BRAND_BLUE)
    _left_text(draw, BRAND_TAGLINE, load_font(FONT_BOLD, 22), BRAND_BLUE,
               bx1 + pad, _A_FOOT_Y + 54, bx2 - bx1 - 2 * pad, line_spacing=1.28)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ══════════════════════════════════════════════════════════════════════════════
#  DESIGN B — 1080 × 1350 portrait  ·  pilules droites, P2 déborde à gauche
# ══════════════════════════════════════════════════════════════════════════════

_B_W, _B_H  = 1080, 1350

# Pilules réduites
_B_PILL_H   = 190
_B_PILL_R   = 16
_B_OVERLAP  = 8
_B_P1_MX    = 46     # marge P1 (symétrique)
_B_P2_LEFT  = -18   # P2 déborde à gauche

# y_after brand glow ≈ 189
_B_LBL_Y    = 204   # badge label
_B_LBL_H    = 58    # + ombre
_B_P1_Y     = 282   # = 204 + 58 + 20
_B_P2_Y     = _B_P1_Y + _B_PILL_H - _B_OVERLAP   # 464
_B_AUTH_Y   = 860   # auteure — poussée vers le bas
_B_TAG_Y    = 910
_B_TAG_H    = 165


def generate_phrase_design_blue(
        label: str,
        pill_text: str,
        output_path: str = "output/flash_posts/phrase_b.png",
) -> str:
    """Design B — 1080 × 1350 portrait · pilules droites avec glow, P2 déborde."""
    img = make_radial_gradient(_B_W, _B_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)

    # ── Header glow ──────────────────────────────────────────────────────────
    img, draw, _ = _draw_brand_glow(img)

    # ── Badge label avec ombre ───────────────────────────────────────────────
    font_lbl = load_font(FONT_REGULAR, 30)
    _label_badge(draw, label, font_lbl, 30, _B_W // 2, _B_LBL_Y, _B_LBL_H,
                 radius=_B_LBL_H // 2, shadow=True)

    # ── Découpage ≠ ──────────────────────────────────────────────────────────
    if "≠" in pill_text:
        p     = pill_text.split("≠", 1)
        line1, line2 = p[0].strip(), "≠ " + p[1].strip()
    else:
        line1, line2 = pill_text, None

    # ── Pilules droites (P2 derrière → P1 devant) ────────────────────────────
    cl, cr  = PILL_LEFT, PILL_RIGHT
    font1   = load_font(FONT_BOLD,    96)
    font2   = load_font(FONT_SERIF_I, 80)

    p1x1, p1x2 = _B_P1_MX, _B_W - _B_P1_MX
    p2x1, p2x2 = _B_P2_LEFT, _B_W - _B_P1_MX + 10

    if line2:
        pill2 = _pill_glow_rgba(p2x2 - p2x1, _B_PILL_H, cl, cr, _B_PILL_R, line2, font2)
        img, draw = _paste(img, pill2, p2x1, _B_P2_Y)

    pill1 = _pill_glow_rgba(p1x2 - p1x1, _B_PILL_H, cl, cr, _B_PILL_R, line1, font1)
    img, draw = _paste(img, pill1, p1x1, _B_P1_Y)

    # ── Auteure italic, left-aligné ──────────────────────────────────────────
    draw.text((58, _B_AUTH_Y), BRAND_AUTHOR,
              font=load_font(FONT_LIGHT_I, 36), fill=BRAND_BLUE)

    # ── Tagline sur fond blanc arrondi, left-aligné ──────────────────────────
    tx1, tx2 = 46, _B_W - 185      # ≈ 895 px, pas pleine largeur
    draw.rounded_rectangle([tx1, _B_TAG_Y, tx2, _B_TAG_Y + _B_TAG_H],
                            radius=22, fill=(252, 248, 244))
    _left_text(draw, BRAND_TAGLINE, load_font(FONT_BOLD, 24), BRAND_BLUE,
               tx1 + 20, _B_TAG_Y + 14, tx2 - tx1 - 28, line_spacing=1.38)

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
        variant    : "yellow" → Design A (1080×1080, incliné)
                     "blue"   → Design B (1080×1350, droit portrait)
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
