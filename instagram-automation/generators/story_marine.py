"""
Générateur de stories — fond rose dégradé radial, texte bleu #1e4e79.
Dimensions : 1080 × 1920 px (9:16).

Structure d'une story (3 slides) :
  Slide 1 — Poll     : question interactive + boutons Oui / Non
  Slide 2 — Info     : texte informatif bleu sur fond rose dégradé
  Slide 3 — Bandeau  : phrase design sur pilules jaune dégradé (ex : X ≠ Y)
"""

import os
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw

from config import (
    STORY_W, STORY_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    YELLOW_LEFT, YELLOW_RIGHT, YELLOW_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_AUTHOR,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient


# ─── Fond rose dégradé radial ────────────────────────────────────────────────

def _rose_story_base() -> tuple:
    img  = make_radial_gradient(STORY_W, STORY_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


# ─── Éléments communs ────────────────────────────────────────────────────────

def _brand_top(draw: ImageDraw.Draw, y: int = 80) -> None:
    """Signature discrète en haut."""
    font = load_font(FONT_LIGHT_I, 38)
    text = BRAND_AUTHOR
    w    = draw.textlength(text, font=font)
    draw.text(((STORY_W - w) / 2, y), text, font=font, fill=BRAND_BLUE)


def _author_footer(draw: ImageDraw.Draw, y: Optional[int] = None) -> None:
    if y is None:
        y = STORY_H - 130
    font = load_font(FONT_LIGHT, 40)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((STORY_W - w) / 2, y), BRAND_AUTHOR, font=font, fill=BRAND_BLUE)


# ─── Pilule dégradée jaune ───────────────────────────────────────────────────

def _draw_yellow_pill(img: Image.Image,
                      x1: int, y1: int, x2: int, y2: int,
                      text: str, font) -> None:
    w = x2 - x1
    h = y2 - y1

    # Dégradé horizontal YELLOW_LEFT → YELLOW_RIGHT
    pill_arr = np.zeros((h, w, 3), dtype=np.uint8)
    for x in range(w):
        t = x / max(w - 1, 1)
        pill_arr[:, x] = [
            int(YELLOW_LEFT[i] * (1 - t) + YELLOW_RIGHT[i] * t)
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
    draw.text((tx, ty), text, font=font, fill=YELLOW_TEXT)


# ─── Pilule dégradée bleue/violette (CTA) ───────────────────────────────────

def _draw_blue_pill(img: Image.Image,
                    x1: int, y1: int, x2: int, y2: int,
                    text: str, font) -> None:
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


# ─── Slide 1 : Poll ─────────────────────────────────────────────────────────

def generate_marine_poll_slide(
        poll_question: str,
        poll_options: Optional[list] = None,
        output_path: str = "output/stories/poll.png",
) -> str:
    if poll_options is None:
        poll_options = ["Oui", "Non"]

    img, draw = _rose_story_base()
    _brand_top(draw)

    # Question text
    font_q = load_font(FONT_BOLD, 74)
    draw_multiline_centered(
        draw, poll_question, font_q, BRAND_BLUE,
        80, 180, STORY_W - 80, STORY_H - 380,
        line_spacing=1.42,
    )

    # ── Boutons de poll ────────────────────────────────────────────────────
    btn_h   = 122
    btn_gap = 36
    n       = len(poll_options)
    btn_w   = (STORY_W - 160 - btn_gap * (n - 1)) // n
    btn_y   = STORY_H - 330

    for i, option in enumerate(poll_options):
        bx1 = 80 + i * (btn_w + btn_gap)
        bx2 = bx1 + btn_w
        font_b = load_font(FONT_BOLD, 56)

        if i == 0:
            # Premier bouton : pilule jaune dégradée
            _draw_yellow_pill(img, bx1, btn_y, bx2, btn_y + btn_h, option, font_b)
        else:
            # Autres boutons : contour bleu
            draw.rounded_rectangle([bx1, btn_y, bx2, btn_y + btn_h],
                                    radius=btn_h // 2,
                                    outline=BRAND_BLUE, width=3,
                                    fill=(255, 255, 255, 0))
            tw = draw.textlength(option, font=font_b)
            draw.text((bx1 + (btn_w - tw) / 2, btn_y + 30),
                      option, font=font_b, fill=BRAND_BLUE)

    _author_footer(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 2 : Info ─────────────────────────────────────────────────────────

def generate_marine_info_slide(
        info_text: str,
        output_path: str = "output/stories/info.png",
) -> str:
    img, draw = _rose_story_base()
    _brand_top(draw)

    font = load_font(FONT_BOLD, 76)
    draw_multiline_centered(
        draw, info_text, font, BRAND_BLUE,
        80, 180, STORY_W - 80, STORY_H - 200,
        line_spacing=1.45,
    )

    _author_footer(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 3 : Bandeau jaune dégradé ─────────────────────────────────────────

def generate_marine_banner_slide(
        banner_text: str,
        output_path: str = "output/stories/banner.png",
) -> str:
    """
    Génère la slide bandeau jaune dégradé (phrase design X ≠ Y).
    Divise sur le symbole ≠ si présent → deux pilules empilées.
    """
    img, draw = _rose_story_base()
    _brand_top(draw)

    pill_h      = 166
    pill_mx     = 58
    pill_x1     = pill_mx
    pill_x2     = STORY_W - pill_mx
    gap         = 28

    if "≠" in banner_text:
        parts = banner_text.split("≠", 1)
        line1 = parts[0].strip()
        line2 = "≠ " + parts[1].strip()
    else:
        line1 = banner_text
        line2 = None

    n_pills = 2 if line2 else 1
    total_h = pill_h * n_pills + gap * (n_pills - 1)
    y_start = (STORY_H - total_h) // 2

    font1 = load_font(FONT_BLACK, 82)
    _draw_yellow_pill(img, pill_x1, y_start, pill_x2, y_start + pill_h, line1, font1)

    if line2:
        y2 = y_start + pill_h + gap
        font2 = load_font(FONT_LIGHT_I, 74)
        _draw_yellow_pill(img, pill_x1, y2, pill_x2, y2 + pill_h, line2, font2)

    _author_footer(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Point d'entrée ──────────────────────────────────────────────────────────

def generate_marine_story_set(story: dict, output_dir: str = "output/stories") -> list[str]:
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
