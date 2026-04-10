"""
Générateur de stories — 1080 × 1920 px (9:16).

Fond commun à toutes les slides : dégradé RADIAL rose (blanc → #cf9090).

Slide 1 — Poll    : header glow blanc + carte blanche + 4 stickers « ? » + question noire
Slide 2 — Info    : header glow blanc + carte blanche + texte noir
Slide 3 — Bandeau : fond rose + pilules bleu-violet + flèche calligraphique ρ +
                    glow « VISIBLE ET / CONFORME » très grand en bas + signature
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
    CARD_TEXT,
    PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I,
    FONT_ARIMO, FONT_SERIF_I,
    BRAND_VISIBLE, BRAND_CONFORME, BRAND_AUTHOR,
)
from generators.base import (
    load_font, draw_multiline_centered,
    make_radial_gradient, draw_gradient_pill,
)

_PILL_RADIUS = 22
_CARD_TEXT   = (35, 35, 35)    # proche-noir pour texte carte


# ─── Fond rose radial ────────────────────────────────────────────────────────

def _rose_base() -> tuple:
    img  = make_radial_gradient(STORY_W, STORY_H,
                                center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


# ─── Header glow blanc (slides 1 & 2) ────────────────────────────────────────

def _draw_header_glow(img: Image.Image, y_start: int = 110) -> tuple:
    """
    « VISIBLE ET » (thin italic) + « CONFORME » (black bold) avec halo blanc.
    Retourne (img, draw, y_after).
    """
    font_sub  = load_font(FONT_LIGHT_I, 44)
    font_main = load_font(FONT_BLACK,  120)

    temp   = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 58

    img_rgba = img.convert("RGBA")

    for blur_r, alpha in [(34, 170), (17, 145), (7, 115)]:
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

    y_after = y_main + 145
    return img, draw, y_after


# ─── Carte blanche chaude (slides 1 & 2) ─────────────────────────────────────

def _draw_card(img: Image.Image,
               x1: int, y1: int, x2: int, y2: int,
               radius: int = 46) -> tuple:
    """
    Carte blanche chaude légèrement transparente, avec ombre douce.
    """
    img_rgba = img.convert("RGBA")

    # Ombre portée douce
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd     = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([x1 + 12, y1 + 12, x2 + 12, y2 + 12],
                          radius=radius, fill=(180, 145, 145, 70))
    shadow   = shadow.filter(ImageFilter.GaussianBlur(radius=10))
    img_rgba = Image.alpha_composite(img_rgba, shadow)

    # Carte blanc chaud
    card = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cd   = ImageDraw.Draw(card)
    cd.rounded_rectangle([x1, y1, x2, y2],
                          radius=radius, fill=(252, 248, 244, 230))
    img_rgba = Image.alpha_composite(img_rgba, card)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── Stickers « ? » papier collé (slide 1) ───────────────────────────────────

def _draw_sticker_questions(img: Image.Image,
                             card_x1: int, card_y1: int) -> tuple:
    """
    4 stickers cream inclinés avec « ? » en noir, centrés sur le bord haut de la carte.
    """
    stk_w, stk_h = 148, 148
    gap     = 10
    angles  = [-8, 5, -4, 9]
    n       = 4
    total_w = n * stk_w + (n - 1) * gap
    start_x = (STORY_W - total_w) // 2
    center_y = card_y1 - 20    # légèrement au-dessus du bord de la carte

    cream    = (242, 232, 210, 248)
    dark     = (22, 22, 22)
    font_q   = load_font(FONT_BLACK, 80)
    img_rgba = img.convert("RGBA")

    for i, angle in enumerate(angles):
        sx = start_x + i * (stk_w + gap)
        sy = center_y - stk_h // 2

        stk      = Image.new("RGBA", img.size, (0, 0, 0, 0))
        stk_draw = ImageDraw.Draw(stk)

        stk_draw.rounded_rectangle([sx, sy, sx + stk_w, sy + stk_h],
                                    radius=20, fill=cream)

        qw = stk_draw.textlength("?", font=font_q)
        qx = sx + (stk_w - qw) / 2
        qy = sy + (stk_h - font_q.size) / 2 - 6
        stk_draw.text((qx, qy), "?", font=font_q, fill=dark)

        cx = sx + stk_w // 2
        cy = sy + stk_h // 2
        stk_rot  = stk.rotate(-angle, center=(cx, cy), expand=False,
                               resample=Image.BICUBIC)
        img_rgba = Image.alpha_composite(img_rgba, stk_rot)

    img = img_rgba.convert("RGB")
    return img, ImageDraw.Draw(img)


# ─── Flèche calligraphique ρ (slide 3) ────────────────────────────────────────

def _draw_rho_arrow_sticker(img: Image.Image,
                             cx: int, cy: int) -> tuple:
    """
    Flèche style calligraphique ρ (boucle + queue + tête de flèche) sur fond cream.
    (cx, cy) = centre du sticker dans l'image.
    """
    stk      = 180
    img_rgba = img.convert("RGBA")
    layer    = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld       = ImageDraw.Draw(layer)

    x0 = cx - stk // 2
    y0 = cy - stk // 2

    # Fond cream polygonal (forme légèrement irrégulière)
    pts = [
        (x0 + 14, y0 + 10),
        (x0 + stk - 8,  y0 + 4),
        (x0 + stk - 4,  y0 + stk - 12),
        (x0 + 10, y0 + stk - 6),
    ]
    ld.polygon(pts, fill=(241, 228, 205, 240))

    col = (20, 15, 10, 245)   # encre brun quasi-noir

    # ── Boucle (arc ≈ 300°, s'ouvre en bas-droit) ────────────────────────────
    lp_cx = x0 + 82   # centre de la boucle dans le sticker
    lp_cy = y0 + 72
    lp_r  = 46        # rayon

    # Arc : de 110° à 100° en sens horaire (PIL) = 350° de boucle
    lp_box = [lp_cx - lp_r, lp_cy - lp_r, lp_cx + lp_r, lp_cy + lp_r]
    arc_s, arc_e = 110, 100
    ld.arc(lp_box, start=arc_s, end=arc_e, fill=col, width=11)

    # ── Queue : du bas de la boucle vers bas-droit ────────────────────────────
    # Point au bout de l'arc (arc_e = 100° en PIL)
    e_rad = math.radians(arc_e)
    qx0   = int(lp_cx + lp_r * math.cos(e_rad))
    qy0   = int(lp_cy + lp_r * math.sin(e_rad))
    # Destination de la queue
    qx1   = x0 + stk - 28
    qy1   = y0 + stk - 24
    ld.line([(qx0, qy0), (qx1, qy1)], fill=col, width=11)

    # ── Tête de flèche à la fin de la queue ──────────────────────────────────
    dx  = qx1 - qx0
    dy  = qy1 - qy0
    ln  = math.hypot(dx, dy)
    if ln > 0:
        ux, uy = dx / ln, dy / ln   # vecteur unitaire direction
        px, py = -uy, ux             # perpendiculaire
        hw = 14
        ld.polygon([
            (qx1, qy1),
            (int(qx1 - ux * hw * 1.8 + px * hw), int(qy1 - uy * hw * 1.8 + py * hw)),
            (int(qx1 - ux * hw * 1.8 - px * hw), int(qy1 - uy * hw * 1.8 - py * hw)),
        ], fill=col)

    # Légère rotation du sticker entier
    layer_rot = layer.rotate(12, center=(cx, cy), expand=False,
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
    """Pilule dégradée bleu-violet légèrement inclinée."""
    w = x2 - x1
    h = y2 - y1
    r = h // 2 if pill_radius < 0 else pill_radius

    pill_arr = np.zeros((h, w, 3), dtype=np.uint8)
    for px in range(w):
        t = px / max(w - 1, 1)
        pill_arr[:, px] = [
            int(PILL_LEFT[i] * (1 - t) + PILL_RIGHT[i] * t)
            for i in range(3)
        ]
    pill_img = Image.fromarray(pill_arr, "RGB")

    mask      = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)

    pill_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pill_rgba.paste(pill_img, (0, 0))
    pill_rgba.putalpha(mask)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    layer.paste(pill_rgba, (x1, y1), pill_rgba)

    ld = ImageDraw.Draw(layer)
    tw = ld.textlength(text, font=font)
    tx = x1 + (w - tw) / 2
    ty = y1 + (h - font.size) / 2 - 4
    ld.text((tx, ty), text, font=font, fill=(*PILL_TEXT, 255))

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
                   color: Optional[tuple] = None,
                   font_path: Optional[str] = None,
                   size: int = 42) -> None:
    if y is None:
        y = STORY_H - 130
    if color is None:
        color = BRAND_BLUE
    if font_path is None:
        font_path = FONT_LIGHT
    font = load_font(font_path, size)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((STORY_W - w) / 2, y), BRAND_AUTHOR, font=font, fill=color)


# ─── Glow « VISIBLE ET / CONFORME » grand (slide 3 bas) ──────────────────────

def _draw_brand_glow_large(img: Image.Image, y_start: int) -> tuple:
    """
    Version grande : CONFORME en FONT_BLACK 150 pour l'effet très grand en bas
    du bandeau slide 3. Avec halo lumineux multi-passes.
    """
    font_sub  = load_font(FONT_LIGHT_I, 46)
    font_main = load_font(FONT_BLACK,   150)

    temp   = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 58

    img_rgba = img.convert("RGBA")

    for blur_r, alpha in [(40, 185), (20, 155), (8, 120)]:
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

    # Carte blanche chaude
    card_x1, card_x2 = 55, STORY_W - 55
    card_y1, card_y2 = 520, 1590
    img, draw = _draw_card(img, card_x1, card_y1, card_x2, card_y2, radius=46)

    # 4 stickers « ? » papier collé sur le bord haut de la carte
    img, draw = _draw_sticker_questions(img, card_x1, card_y1)

    # Question — noir, regular, grande taille
    font_q  = load_font(FONT_REGULAR, 74)
    text_y1 = card_y1 + 150   # sous les stickers
    text_y2 = card_y2 - 60
    draw_multiline_centered(
        draw, poll_question, font_q, _CARD_TEXT,
        card_x1 + 60, text_y1, card_x2 - 60, text_y2,
        line_spacing=1.42,
    )

    _author_footer(draw, y=STORY_H - 120, color=BRAND_BLUE, font_path=FONT_LIGHT, size=42)

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

    card_x1, card_x2 = 55, STORY_W - 55
    card_y1, card_y2 = 520, 1590
    img, draw = _draw_card(img, card_x1, card_y1, card_x2, card_y2, radius=46)

    # Texte info — noir, regular
    font = load_font(FONT_REGULAR, 76)
    draw_multiline_centered(
        draw, info_text, font, _CARD_TEXT,
        card_x1 + 60, card_y1 + 80, card_x2 - 60, card_y2 - 60,
        line_spacing=1.45,
    )

    _author_footer(draw, y=STORY_H - 120, color=BRAND_BLUE, font_path=FONT_LIGHT, size=42)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 3 : Bandeau bleu-violet sur fond rose ─────────────────────────────

def generate_marine_banner_slide(
        banner_text: str,
        output_path: str = "output/stories/banner.png",
) -> str:
    """
    Fond rose radial + pilules bleu-violet + flèche ρ calligraphique +
    VISIBLE ET / CONFORME grand en bas + signature.
    """
    img, draw = _rose_base()

    # "Anne-Sophie Assalit" en haut — Arimo
    font_top = load_font(FONT_ARIMO, 42)
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
    y_start = (STORY_H - total_h) // 2 - 60   # légèrement au-dessus du centre

    # Flèche calligraphique ρ au-dessus-gauche des pilules
    img, draw = _draw_rho_arrow_sticker(
        img,
        cx=pill_x1 + 138,
        cy=y_start - 130,
    )

    # Pilule 1
    font1 = load_font(FONT_BLACK, 82)
    draw_gradient_pill(img, draw,
                       pill_x1, y_start, pill_x2, y_start + pill_h,
                       line1, font1, pill_radius=_PILL_RADIUS)

    if line2:
        y2 = y_start + pill_h
        draw = ImageDraw.Draw(img)
        draw.rectangle([pill_x1 + 10, y2 - 4, pill_x2 - 10, y2 + 4],
                        fill=(110, 90, 155))
        font2 = load_font(FONT_LIGHT_I, 62)
        img, draw = _draw_tilted_gradient_pill(
            img, pill_x1, y2, pill_x2, y2 + pill_h,
            line2, font2, pill_radius=_PILL_RADIUS, angle=-3.0,
        )

    # ── « VISIBLE ET / CONFORME » grand avec glow ────────────────────────────
    y_glow = STORY_H - 500    # ≈ 1420
    img, draw = _draw_brand_glow_large(img, y_glow)

    # "Anne-Sophie Assalit" en bas — Cormorant Italic
    _author_footer(draw,
                   y=STORY_H - 100,
                   color=(255, 255, 255),
                   font_path=FONT_SERIF_I,
                   size=46)

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
        "banner_text": "Site visible ≠ Site conforme"
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
