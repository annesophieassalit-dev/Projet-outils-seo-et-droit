"""
Générateur de stories — 1080 × 1920 px (9:16).

Fond commun à toutes les slides : dégradé RADIAL rose (blanc → #cf9090).

Slide 1 — Poll    : header glow blanc + carte semi-transparente (42%) +
                    4 stickers « ? » cream style papier collé + question en #1e4e79
Slide 2 — Info    : header glow blanc + carte semi-transparente (42%) + texte #1e4e79
Slide 3 — Bandeau : fond rose + pilules bleu-violet (#94b9ff → #e894ff) +
                    flèche calligraphique courbe papier collé +
                    glow fin « VISIBLE ET CONFORME » + signature #1e4e79 en bas
"""

import os
import math
import numpy as np
from typing import Optional
from PIL import Image, ImageDraw, ImageFilter

from config import (
    STORY_W, STORY_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I,
    FONT_ARIMO, FONT_SERIF_I,
    BRAND_VISIBLE, BRAND_CONFORME, BRAND_AUTHOR,
)
from generators.base import (
    load_font, draw_multiline_centered,
    make_radial_gradient, draw_gradient_pill,
)

# Rayon des pilules slide 3 (moins arrondies qu'une capsule complète)
_PILL_RADIUS = 22


# ─── Fond rose radial (commun) ───────────────────────────────────────────────

def _rose_base() -> tuple:
    img  = make_radial_gradient(STORY_W, STORY_H,
                                center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


# ─── Header glow blanc (slides 1 & 2) ────────────────────────────────────────

def _draw_header_glow(img: Image.Image, y_start: int = 110) -> tuple:
    """
    En-tête « VISIBLE ET / CONFORME » avec halo lumineux blanc.
    3 passes de flou gaussien décroissant + texte net en blanc.
    Retourne (img, draw, y_after).
    """
    font_sub  = load_font(FONT_LIGHT_I, 40)
    font_main = load_font(FONT_BLACK,  108)

    temp   = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 54

    img_rgba = img.convert("RGBA")

    for blur_r, alpha in [(30, 160), (15, 140), (6, 110)]:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d     = ImageDraw.Draw(layer)
        d.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,
               font=font_sub,  fill=(255, 255, 255, alpha))
        d.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME,
               font=font_main, fill=(255, 255, 255, alpha))
        layer    = layer.filter(ImageFilter.GaussianBlur(radius=blur_r))
        img_rgba = Image.alpha_composite(img_rgba, layer)

    img  = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,
              font=font_sub,  fill=(255, 255, 255))
    draw.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME,
              font=font_main, fill=(255, 255, 255))

    y_after = y_main + 130
    return img, draw, y_after


# ─── Carte semi-transparente 42 % (slides 1 & 2) ─────────────────────────────

def _draw_transparent_card(img: Image.Image,
                            x1: int, y1: int, x2: int, y2: int,
                            radius: int = 50) -> tuple:
    """
    Carte blanche à 42 % d'opacité (alpha = 107/255) avec ombre portée douce.
    """
    img_rgba = img.convert("RGBA")

    # Ombre douce
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd     = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([x1 + 10, y1 + 10, x2 + 10, y2 + 10],
                          radius=radius, fill=(180, 155, 155, 80))
    shadow   = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    img_rgba = Image.alpha_composite(img_rgba, shadow)

    # Carte blanche semi-transparente
    card = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cd   = ImageDraw.Draw(card)
    cd.rounded_rectangle([x1, y1, x2, y2],
                          radius=radius, fill=(255, 255, 255, 107))
    img_rgba = Image.alpha_composite(img_rgba, card)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── 4 stickers « ? » cream style papier collé (slide 1) ────────────────────

def _draw_sticker_questions(img: Image.Image,
                             card_x1: int, card_y1: int) -> tuple:
    """
    4 stickers individuels : fond cream arrondi + « ? » FONT_BLACK 72,
    légèrement inclinés, centrés horizontalement au-dessus du bord de la carte.
    """
    stk_w, stk_h = 130, 130
    gap     = 14
    angles  = [-7, 6, -4, 8]   # inclinaisons en degrés
    n       = 4
    total_w = n * stk_w + (n - 1) * gap
    start_x = (STORY_W - total_w) // 2
    center_y = card_y1 - 30    # chevauchement léger sur le bord supérieur de la carte

    cream    = (243, 233, 212, 245)
    dark     = (18, 18, 18)
    font_q   = load_font(FONT_BLACK, 72)
    img_rgba = img.convert("RGBA")

    for i, angle in enumerate(angles):
        sx = start_x + i * (stk_w + gap)
        sy = center_y - stk_h // 2

        stk      = Image.new("RGBA", img.size, (0, 0, 0, 0))
        stk_draw = ImageDraw.Draw(stk)

        # Fond cream arrondi
        stk_draw.rounded_rectangle([sx, sy, sx + stk_w, sy + stk_h],
                                    radius=18, fill=cream)

        # « ? » centré sur le sticker
        qw = stk_draw.textlength("?", font=font_q)
        qx = sx + (stk_w - qw) / 2
        qy = sy + (stk_h - font_q.size) / 2 - 4
        stk_draw.text((qx, qy), "?", font=font_q, fill=dark)

        # Rotation autour du centre du sticker
        cx = sx + stk_w // 2
        cy = sy + stk_h // 2
        stk_rot  = stk.rotate(-angle, center=(cx, cy), expand=False,
                               resample=Image.BICUBIC)
        img_rgba = Image.alpha_composite(img_rgba, stk_rot)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── Flèche calligraphique courbe papier collé (slide 3) ─────────────────────

def _draw_curved_arrow_sticker(img: Image.Image,
                                cx: int, cy: int) -> tuple:
    """
    Flèche courbe style calligraphique sur fond cream, posée comme un sticker.
    (cx, cy) = centre de pose du sticker.
    """
    stk      = 210
    img_rgba = img.convert("RGBA")

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld    = ImageDraw.Draw(layer)

    x0 = cx - stk // 2
    y0 = cy - stk // 2

    # Fond cream arrondi
    ld.rounded_rectangle([x0 + 8, y0 + 8, x0 + stk - 8, y0 + stk - 8],
                          radius=24, fill=(243, 233, 212, 235))

    arrow_col = (60, 40, 30, 235)   # encre brun foncé

    # ── Arc quasi-circulaire (≈ 280° de boucle, ouverture en bas-gauche)
    margin  = 28
    arc_box = [x0 + margin, y0 + margin,
               x0 + stk - margin, y0 + stk - margin]

    # PIL angles : 0 = droite (3h), sens horaire
    # Arc de 60° à 340° (clockwise) ≈ 280° de cercle
    arc_start, arc_end = 60, 340
    ld.arc(arc_box, start=arc_start, end=arc_end, fill=arrow_col, width=9)

    # Centres et rayons de l'arc
    arc_cx = (arc_box[0] + arc_box[2]) / 2
    arc_cy = (arc_box[1] + arc_box[3]) / 2
    arc_rx = (arc_box[2] - arc_box[0]) / 2
    arc_ry = (arc_box[3] - arc_box[1]) / 2

    # ── Queue (petit trait depuis le début de l'arc à 60°)
    t_rad = math.radians(arc_start)
    tail_x = int(arc_cx + arc_rx * math.cos(t_rad))
    tail_y = int(arc_cy + arc_ry * math.sin(t_rad))
    ld.line([(tail_x, tail_y), (tail_x - 20, tail_y + 26)],
            fill=arrow_col, width=9)

    # ── Tête de flèche à la fin de l'arc (340°)
    e_rad  = math.radians(arc_end)
    head_x = int(arc_cx + arc_rx * math.cos(e_rad))
    head_y = int(arc_cy + arc_ry * math.sin(e_rad))
    hw     = 16
    ld.polygon([
        (head_x, head_y),
        (int(head_x + hw * math.cos(math.radians(arc_end + 135))),
         int(head_y + hw * math.sin(math.radians(arc_end + 135)))),
        (int(head_x + hw * math.cos(math.radians(arc_end - 135))),
         int(head_y + hw * math.sin(math.radians(arc_end - 135)))),
    ], fill=arrow_col)

    # Rotation du sticker (-14°)
    layer_rot = layer.rotate(14, center=(cx, cy), expand=False,
                              resample=Image.BICUBIC)
    img_rgba  = Image.alpha_composite(img_rgba, layer_rot)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── Pilule dégradée inclinée (slide 3, pilule 2) ────────────────────────────

def _draw_tilted_gradient_pill(img: Image.Image,
                                x1: int, y1: int, x2: int, y2: int,
                                text: str,
                                font,
                                pill_radius: int = _PILL_RADIUS,
                                angle: float = -3.0) -> tuple:
    """
    Pilule dégradée bleu-violet légèrement inclinée (angle en degrés).
    Utilise un layer RGBA plein-format pour la rotation.
    """
    w = x2 - x1
    h = y2 - y1
    r = h // 2 if pill_radius < 0 else pill_radius

    # Dégradé horizontal bleu-violet
    pill_arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        pill_arr[:, px] = [
            int(PILL_LEFT[i] * (1 - t) + PILL_RIGHT[i] * t)
            for i in range(3)
        ]
    pill_img = Image.fromarray(pill_arr, "RGB")

    # Masque arrondi
    mask      = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)

    # Pilule RGBA
    pill_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pill_rgba.paste(pill_img, (0, 0))
    pill_rgba.putalpha(mask)

    # Layer plein-format
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(pill_rgba, (x1, y1), pill_rgba)

    # Texte sur le layer
    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(text, font=font)
    tx = x1 + (w - tw) / 2
    ty = y1 + (h - font.size) / 2 - 4
    ld.text((tx, ty), text, font=font, fill=(*PILL_TEXT, 255))

    # Rotation autour du centre de la pilule
    pcx = (x1 + x2) // 2
    pcy = (y1 + y2) // 2
    layer_rot = layer.rotate(angle, center=(pcx, pcy), expand=False,
                              resample=Image.BICUBIC)

    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, layer_rot)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── Signature auteure ────────────────────────────────────────────────────────

def _author_footer(draw: ImageDraw.ImageDraw,
                   y: Optional[int] = None,
                   color: Optional[tuple] = None) -> None:
    if y is None:
        y = STORY_H - 130
    if color is None:
        color = BRAND_BLUE
    font = load_font(FONT_LIGHT, 40)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((STORY_W - w) / 2, y), BRAND_AUTHOR, font=font, fill=color)


# ─── Glow fin « VISIBLE ET CONFORME » (slide 3) ──────────────────────────────

def _draw_brand_glow(img: Image.Image, y_start: int) -> tuple:
    """
    Effet lumineux « text-shadow blanc » : 3 passes de flou décroissant,
    puis texte net en blanc. Police légère pour un rendu fin et lumineux.
    """
    font_sub  = load_font(FONT_LIGHT_I, 32)
    font_main = load_font(FONT_BOLD,    65)

    temp   = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 44

    img_rgba = img.convert("RGBA")

    for blur_r, alpha in [(28, 155), (14, 130), (6, 100)]:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d     = ImageDraw.Draw(layer)
        d.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,
               font=font_sub,  fill=(255, 255, 255, alpha))
        d.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME,
               font=font_main, fill=(255, 255, 255, alpha))
        layer    = layer.filter(ImageFilter.GaussianBlur(radius=blur_r))
        img_rgba = Image.alpha_composite(img_rgba, layer)

    img  = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,
              font=font_sub,  fill=(255, 255, 255))
    draw.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME,
              font=font_main, fill=(255, 255, 255))

    return img, draw


# ─── Slide 1 : Poll ─────────────────────────────────────────────────────────

def generate_marine_poll_slide(
        poll_question: str,
        poll_options: Optional[list] = None,
        output_path: str = "output/stories/poll.png",
) -> str:
    if poll_options is None:
        poll_options = ["Oui", "Non"]

    img, draw = _rose_base()

    # En-tête "VISIBLE ET / CONFORME" avec halo lumineux
    img, draw, y_after = _draw_header_glow(img, y_start=110)

    # Carte semi-transparente centrée (42%)
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = 560
    card_y2 = 1580
    img, draw = _draw_transparent_card(img, card_x1, card_y1, card_x2, card_y2, radius=50)

    # 4 stickers « ? » papier collé au-dessus / sur le bord de la carte
    img, draw = _draw_sticker_questions(img, card_x1, card_y1)

    # Question en BRAND_BLUE dans la partie basse de la carte
    font_q  = load_font(FONT_BOLD, 72)
    text_y1 = card_y1 + 120    # sous le chevauchement des stickers
    text_y2 = card_y2 - 65
    draw_multiline_centered(
        draw, poll_question, font_q, BRAND_BLUE,
        card_x1 + 55, text_y1, card_x2 - 55, text_y2,
        line_spacing=1.42,
    )

    _author_footer(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 2 : Info ─────────────────────────────────────────────────────────

def generate_marine_info_slide(
        info_text: str,
        output_path: str = "output/stories/info.png",
) -> str:
    img, draw = _rose_base()

    img, draw, y_after = _draw_header_glow(img, y_start=110)

    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = 560
    card_y2 = 1580
    img, draw = _draw_transparent_card(img, card_x1, card_y1, card_x2, card_y2, radius=50)

    font = load_font(FONT_BOLD, 76)
    draw_multiline_centered(
        draw, info_text, font, BRAND_BLUE,
        card_x1 + 55, card_y1 + 70, card_x2 - 55, card_y2 - 70,
        line_spacing=1.45,
    )

    _author_footer(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 3 : Bandeau bleu-violet sur fond rose ─────────────────────────────

def generate_marine_banner_slide(
        banner_text: str,
        output_path: str = "output/stories/banner.png",
) -> str:
    """
    Fond rose radial + pilules bleu-violet (#94b9ff → #e894ff) +
    flèche calligraphique courbe papier collé + glow « VISIBLE ET CONFORME » +
    signature bleue. La 2ème pilule est légèrement inclinée (-3°).
    """
    img, draw = _rose_base()

    # "Anne-Sophie Assalit" en haut — Arimo (#1e4e79)
    font_top = load_font(FONT_ARIMO, 40)
    w_top    = draw.textlength(BRAND_AUTHOR, font=font_top)
    draw.text(((STORY_W - w_top) / 2, 80), BRAND_AUTHOR,
              font=font_top, fill=BRAND_BLUE)

    # ── Pilules bleu-violet ───────────────────────────────────────────────────
    pill_h  = 166
    pill_mx = 58
    pill_x1 = pill_mx
    pill_x2 = STORY_W - pill_mx

    if "≠" in banner_text:
        parts = banner_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = banner_text
        line2 = None

    n_pills = 2 if line2 else 1
    total_h = pill_h * n_pills
    y_start = (STORY_H - total_h) // 2   # pilules centrées verticalement

    # Flèche calligraphique courbe au-dessus à gauche des pilules
    img, draw = _draw_curved_arrow_sticker(
        img,
        cx=pill_x1 + 148,
        cy=y_start - 140,
    )

    # Pilule 1
    font1 = load_font(FONT_BLACK, 82)
    draw_gradient_pill(img, draw,
                       pill_x1, y_start, pill_x2, y_start + pill_h,
                       line1, font1, pill_radius=_PILL_RADIUS)

    if line2:
        y2 = y_start + pill_h

        # Ombre fine à la jonction des deux pilules
        draw = ImageDraw.Draw(img)
        draw.rectangle([pill_x1 + 10, y2 - 5, pill_x2 - 10, y2 + 5],
                        fill=(120, 100, 160))

        # Pilule 2 légèrement inclinée (-3°)
        font2 = load_font(FONT_LIGHT_I, 74)
        img, draw = _draw_tilted_gradient_pill(
            img,
            pill_x1, y2, pill_x2, y2 + pill_h,
            line2, font2,
            pill_radius=_PILL_RADIUS,
            angle=-3.0,
        )

    # ── "VISIBLE ET CONFORME" glow fin et lumineux ───────────────────────────
    y_glow = STORY_H - 430
    img, draw = _draw_brand_glow(img, y_glow)

    # "Anne-Sophie Assalit" en bas — serif italique (#1e4e79)
    font_bot = load_font(FONT_SERIF_I, 42)
    w_bot    = draw.textlength(BRAND_AUTHOR, font=font_bot)
    draw.text(((STORY_W - w_bot) / 2, STORY_H - 145), BRAND_AUTHOR,
              font=font_bot, fill=BRAND_BLUE)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Point d'entrée ──────────────────────────────────────────────────────────

def generate_marine_story_set(story: dict, output_dir: str = "output/stories") -> list:
    """
    Génère les 3 slides d'une story.

    Format du dictionnaire attendu :
    {
        "id": 1,
        "poll_question": "...",
        "poll_options": ["Oui", "Non"],
        "info_text": "...",
        "banner_text": "Site ancien ≠ Site conforme"
    }
    """
    sid = story.get("id", "x")
    return [
        generate_marine_poll_slide(
            poll_question=story["poll_question"],
            poll_options=story.get("poll_options", ["Oui", "Non"]),
            output_path=f"{output_dir}/story_m{sid}_s1.png",
        ),
        generate_marine_info_slide(
            info_text=story["info_text"],
            output_path=f"{output_dir}/story_m{sid}_s2.png",
        ),
        generate_marine_banner_slide(
            banner_text=story["banner_text"],
            output_path=f"{output_dir}/story_m{sid}_s3.png",
        ),
    ]
