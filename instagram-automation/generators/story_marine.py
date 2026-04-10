"""
Générateur de stories — fond dégradé linéaire, header blanc, carte blanche.
Dimensions : 1080 × 1920 px (9:16).

Structure d'une story (3 slides) :
  Slide 1 — Poll    : header "VISIBLE ET/CONFORME" + carte blanche + question
  Slide 2 — Info    : header "VISIBLE ET/CONFORME" + carte blanche + texte info
  Slide 3 — Bandeau : fond radial rose + deux pilules jaunes dégradées (X ≠ Y)
"""

import os
from typing import Optional
from PIL import Image, ImageDraw

from config import (
    STORY_W, STORY_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE, CARD_TEXT,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_AUTHOR,
)
from generators.base import (
    load_font, draw_multiline_centered,
    make_gradient, make_radial_gradient,
    draw_header, draw_card,
    draw_yellow_pill,
)


# ─── Signature auteure ────────────────────────────────────────────────────────

def _author_footer(draw: ImageDraw.Draw, y: Optional[int] = None) -> None:
    if y is None:
        y = STORY_H - 130
    font = load_font(FONT_LIGHT, 40)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((STORY_W - w) / 2, y), BRAND_AUTHOR, font=font, fill=BRAND_BLUE)


# ─── Slide 1 : Poll ─────────────────────────────────────────────────────────

def generate_marine_poll_slide(
        poll_question: str,
        poll_options: Optional[list] = None,
        output_path: str = "output/stories/poll.png",
) -> str:
    if poll_options is None:
        poll_options = ["Oui", "Non"]

    # Fond dégradé linéaire rose
    img  = make_gradient(STORY_W, STORY_H)
    draw = ImageDraw.Draw(img)

    # En-tête "VISIBLE ET / CONFORME" en blanc
    y_after = draw_header(draw, STORY_W, y_start=110, color=(255, 255, 255))

    # Carte blanche arrondie
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = y_after + 20
    card_y2 = STORY_H - 220
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

    # Question à l'intérieur de la carte
    font_q = load_font(FONT_BOLD, 72)
    draw_multiline_centered(
        draw, poll_question, font_q, CARD_TEXT,
        card_x1 + 55, card_y1 + 70, card_x2 - 55, card_y2 - 70,
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
    # Fond dégradé linéaire rose
    img  = make_gradient(STORY_W, STORY_H)
    draw = ImageDraw.Draw(img)

    # En-tête "VISIBLE ET / CONFORME" en blanc
    y_after = draw_header(draw, STORY_W, y_start=110, color=(255, 255, 255))

    # Carte blanche arrondie
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = y_after + 20
    card_y2 = STORY_H - 220
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

    # Texte informatif à l'intérieur de la carte
    font = load_font(FONT_BOLD, 76)
    draw_multiline_centered(
        draw, info_text, font, CARD_TEXT,
        card_x1 + 55, card_y1 + 70, card_x2 - 55, card_y2 - 70,
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
    img  = make_radial_gradient(STORY_W, STORY_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)

    # Signature discrète en haut
    font_top = load_font(FONT_LIGHT_I, 38)
    w_top    = draw.textlength(BRAND_AUTHOR, font=font_top)
    draw.text(((STORY_W - w_top) / 2, 80), BRAND_AUTHOR, font=font_top, fill=BRAND_BLUE)

    pill_h  = 166
    pill_mx = 58
    pill_x1 = pill_mx
    pill_x2 = STORY_W - pill_mx
    gap     = 28

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
    draw_yellow_pill(img, pill_x1, y_start, pill_x2, y_start + pill_h, line1, font1)

    if line2:
        y2    = y_start + pill_h + gap
        font2 = load_font(FONT_LIGHT_I, 74)
        draw_yellow_pill(img, pill_x1, y2, pill_x2, y2 + pill_h, line2, font2)

    _author_footer(draw)

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
