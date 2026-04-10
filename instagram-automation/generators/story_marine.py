"""
Générateur de stories — fond dégradé linéaire, header blanc, carte blanche.
Dimensions : 1080 × 1920 px (9:16).

Slide 1 — Poll    : gradient rose + header blanc + carte blanche + "?" déco + question bleue
Slide 2 — Info    : gradient rose + header blanc + carte blanche + texte bleu
Slide 3 — Bandeau : gradient bleu-violet + pilules jaunes accolées + glow "VISIBLE ET CONFORME"
"""

import os
from typing import Optional
from PIL import Image, ImageDraw, ImageFilter

from config import (
    STORY_W, STORY_H,
    BRAND_BLUE,
    PILL_LEFT, PILL_RIGHT,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_VISIBLE, BRAND_CONFORME, BRAND_AUTHOR,
)
from generators.base import (
    load_font, draw_multiline_centered,
    make_gradient, draw_header, draw_card,
    draw_yellow_pill,
)

# ─── Pilule moins arrondie (slide 3) ─────────────────────────────────────────
_PILL_RADIUS = 22   # coins plus carrés que le rayon plein (h//2 ≈ 83)


# ─── Signature auteure ────────────────────────────────────────────────────────

def _author_footer(draw: ImageDraw.Draw,
                   y: Optional[int] = None,
                   color: tuple = None) -> None:
    if y is None:
        y = STORY_H - 130
    if color is None:
        color = BRAND_BLUE
    font = load_font(FONT_LIGHT, 40)
    w    = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((STORY_W - w) / 2, y), BRAND_AUTHOR, font=font, fill=color)


# ─── Glow "VISIBLE ET CONFORME" (bas slide 3) ────────────────────────────────

def _draw_brand_glow(img: Image.Image, y_start: int) -> tuple:
    """
    Dessine 'VISIBLE ET / CONFORME' avec halo blanc flou en bas de slide.
    Retourne (img_mis_à_jour, draw_mis_à_jour).
    """
    font_sub  = load_font(FONT_LIGHT_I, 40)
    font_main = load_font(FONT_BLACK,   110)

    temp = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 52

    # Couche RGBA pour le halo flou
    img_rgba = img.convert("RGBA")
    glow     = Image.new("RGBA", img.size, (0, 0, 0, 0))
    g        = ImageDraw.Draw(glow)
    g.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255, 200))
    g.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME, font=font_main, fill=(255, 255, 255, 200))
    glow_blurred = glow.filter(ImageFilter.GaussianBlur(radius=18))
    img_rgba = Image.alpha_composite(img_rgba, glow_blurred)

    # Deuxième passe (halo plus étroit)
    glow2 = Image.new("RGBA", img.size, (0, 0, 0, 0))
    g2    = ImageDraw.Draw(glow2)
    g2.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255, 160))
    g2.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME, font=font_main, fill=(255, 255, 255, 160))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(radius=7))
    img_rgba = Image.alpha_composite(img_rgba, glow2)

    img  = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)

    # Texte net par-dessus le halo
    draw.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255))
    draw.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME, font=font_main, fill=(255, 255, 255))

    return img, draw


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

    # Carte blanche arrondie — légèrement plus compacte
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = y_after + 22
    card_y2 = STORY_H - 268
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

    # ── Points d'interrogation décoratifs "papier collé" ─────────────────────
    font_deco = load_font(FONT_BLACK, 155)
    deco_positions = [
        (card_x1 + 68,  card_y1 + 48),
        (card_x1 + 360, card_y1 + 30),
        (card_x2 - 240, card_y1 + 55),
    ]
    for dx, dy in deco_positions:
        # Ombre portée (effet papier collé)
        draw.text((dx + 4, dy + 4), "?", font=font_deco, fill=(178, 148, 152))
        # Corps de la pastille
        draw.text((dx, dy), "?", font=font_deco, fill=(215, 182, 186))

    # Question en BRAND_BLUE dans la moitié basse de la carte
    font_q  = load_font(FONT_BOLD, 72)
    text_y1 = card_y1 + 360
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
    # Fond dégradé linéaire rose
    img  = make_gradient(STORY_W, STORY_H)
    draw = ImageDraw.Draw(img)

    # En-tête "VISIBLE ET / CONFORME" en blanc
    y_after = draw_header(draw, STORY_W, y_start=110, color=(255, 255, 255))

    # Carte blanche arrondie
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = y_after + 22
    card_y2 = STORY_H - 268
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

    # Texte informatif en BRAND_BLUE, centré dans la carte
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


# ─── Slide 3 : Bandeau bleu-violet + pilules jaunes ──────────────────────────

def generate_marine_banner_slide(
        banner_text: str,
        output_path: str = "output/stories/banner.png",
) -> str:
    """
    Slide bandeau :
    - Fond dégradé bleu-violet (PILL_LEFT → PILL_RIGHT, vertical)
    - Deux pilules jaunes accolées (radius=22, légère ombre entre elles)
    - "VISIBLE ET CONFORME" en glow blanc en bas
    """
    # Fond dégradé bleu → violet
    img  = make_gradient(STORY_W, STORY_H, top=PILL_LEFT, bottom=PILL_RIGHT)
    draw = ImageDraw.Draw(img)

    # "Anne-Sophie Assalit" en haut
    font_top = load_font(FONT_LIGHT_I, 38)
    w_top    = draw.textlength(BRAND_AUTHOR, font=font_top)
    draw.text(((STORY_W - w_top) / 2, 80), BRAND_AUTHOR, font=font_top, fill=(255, 255, 255))

    # ── Pilules ──────────────────────────────────────────────────────────────
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
    total_h = pill_h * n_pills          # Pas d'espace entre les pilules
    y_start = (STORY_H - total_h) // 2

    # Pilule 1
    font1 = load_font(FONT_BLACK, 82)
    draw_yellow_pill(img, pill_x1, y_start, pill_x2, y_start + pill_h,
                     line1, font1, pill_radius=_PILL_RADIUS)

    if line2:
        y2 = y_start + pill_h
        # Ombre fine entre les deux pilules (avant de dessiner la pilule 2)
        draw = ImageDraw.Draw(img)
        draw.rectangle([pill_x1 + 8, y2 - 5, pill_x2 - 8, y2 + 5],
                        fill=(188, 162, 78))
        font2 = load_font(FONT_LIGHT_I, 74)
        draw_yellow_pill(img, pill_x1, y2, pill_x2, y2 + pill_h,
                         line2, font2, pill_radius=_PILL_RADIUS)

    # ── "VISIBLE ET CONFORME" en glow blanc en bas ───────────────────────────
    y_glow = STORY_H - 420
    img, draw = _draw_brand_glow(img, y_glow)

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
