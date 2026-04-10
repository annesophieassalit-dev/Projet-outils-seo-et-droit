"""
Générateur de stories — 1080 × 1920 px (9:16).

Fond commun à toutes les slides : dégradé RADIAL rose (blanc → #cf9090).

Slide 1 — Poll    : header blanc + carte blanche centrée (réduite) + cluster « ? »
                    de style papier collé + question en #1e4e79
Slide 2 — Info    : header blanc + carte blanche centrée (réduite) + texte #1e4e79
Slide 3 — Bandeau : fond rose + pilules bleu-violet (#94b9ff → #e894ff) +
                    flèche ↙ papier collé + glow fin « VISIBLE ET CONFORME »
                    + signature #1e4e79 en bas
"""

import os
from typing import Optional
from PIL import Image, ImageDraw, ImageFilter

from config import (
    STORY_W, STORY_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_VISIBLE, BRAND_CONFORME, BRAND_AUTHOR,
)
from generators.base import (
    load_font, draw_multiline_centered,
    make_radial_gradient, draw_header, draw_card,
    draw_gradient_pill,
)

# Rayon des pilules slide 3 (moins arrondies qu'une capsule complète)
_PILL_RADIUS = 22


# ─── Fond rose radial (commun) ───────────────────────────────────────────────

def _rose_base() -> tuple:
    img  = make_radial_gradient(STORY_W, STORY_H,
                                center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


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


# ─── Cluster de « ? » style papier collé (slide 1) ──────────────────────────

def _draw_question_cluster(draw: ImageDraw.Draw,
                            card_x1: int, card_y1: int) -> None:
    """
    5 points d'interrogation de tailles variées, serrés ensemble,
    avec ombre portée pour l'effet papier collé/froissé.
    """
    items = [
        # (offset_x, offset_y, font_size, rose_color)
        (60,  52, 140, (205, 172, 176)),
        (198, 44, 102, (218, 190, 193)),
        (328, 66, 132, (208, 176, 180)),
        (496, 46, 100, (215, 185, 188)),
        (654, 56, 118, (210, 180, 184)),
    ]
    shadow = (168, 134, 140)
    for ox, oy, size, color in items:
        font_d = load_font(FONT_BLACK, size)
        x, y   = card_x1 + ox, card_y1 + oy
        # Ombre portée (sticker effect)
        draw.text((x + 4, y + 4), "?", font=font_d, fill=shadow)
        # Corps rose
        draw.text((x, y), "?", font=font_d, fill=color)


# ─── Flèche ↙ papier collé (slide 3) ────────────────────────────────────────

def _draw_collage_arrow(draw: ImageDraw.Draw,
                         tip_x: int, tip_y: int,
                         size: int = 72) -> None:
    """
    Flèche diagonale ↙ dessinée géométriquement, style sticker.
    (tip_x, tip_y) = coin supérieur-droit de la flèche.
    """
    ex = tip_x - size     # extrémité basse-gauche du shaft
    ey = tip_y + size
    hw = size // 3        # largeur de la tête de flèche

    # Ombre portée
    for off in [(4, 4)]:
        ox, oy = off
        draw.line([(tip_x + ox, tip_y + oy), (ex + ox, ey + oy)],
                  fill=(100, 75, 80), width=10)
        draw.polygon([
            (ex + ox,      ey + oy),
            (ex + ox + hw, ey + oy),
            (ex + ox,      ey + oy - hw),
        ], fill=(100, 75, 80))

    # Trait principal (blanc)
    draw.line([(tip_x, tip_y), (ex, ey)], fill=(255, 255, 255), width=10)
    draw.polygon([
        (ex,      ey),
        (ex + hw, ey),
        (ex,      ey - hw),
    ], fill=(255, 255, 255))


# ─── Glow fin « VISIBLE ET CONFORME » (slide 3) ──────────────────────────────

def _draw_brand_glow(img: Image.Image, y_start: int) -> tuple:
    """
    Effet lumineux « text-shadow blanc » : 3 passes de flou décroissant,
    puis texte net en blanc. Police légère (pas FONT_BLACK) pour un rendu fin.
    """
    font_sub  = load_font(FONT_LIGHT_I, 32)
    font_main = load_font(FONT_BOLD,    65)   # Bold (pas Black) = fin et lisible

    temp   = ImageDraw.Draw(img)
    sub_w  = temp.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = temp.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 44

    img_rgba = img.convert("RGBA")

    # Trois passes de glow de plus en plus serrées
    for blur_r, alpha in [(28, 155), (14, 130), (6, 100)]:
        layer  = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d      = ImageDraw.Draw(layer)
        d.text(((STORY_W - sub_w)  / 2, y_start), BRAND_VISIBLE,  font=font_sub,  fill=(255, 255, 255, alpha))
        d.text(((STORY_W - main_w) / 2, y_main),  BRAND_CONFORME, font=font_main, fill=(255, 255, 255, alpha))
        layer  = layer.filter(ImageFilter.GaussianBlur(radius=blur_r))
        img_rgba = Image.alpha_composite(img_rgba, layer)

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

    img, draw = _rose_base()

    # En-tête "VISIBLE ET / CONFORME" en blanc
    y_after = draw_header(draw, STORY_W, y_start=110, color=(255, 255, 255))

    # Carte blanche centrée — plus petite que la hauteur totale
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = 540          # espace rose visible entre header et carte
    card_y2 = STORY_H - 390  # = 1530  espace rose visible sous la carte
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

    # Cluster « ? » papier collé dans la partie haute de la carte
    _draw_question_cluster(draw, card_x1, card_y1)

    # Question en BRAND_BLUE dans la partie basse de la carte
    font_q  = load_font(FONT_BOLD, 72)
    text_y1 = card_y1 + 270    # sous les « ? »
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

    y_after = draw_header(draw, STORY_W, y_start=110, color=(255, 255, 255))

    # Même carte centrée, sans cluster « ? »
    card_x1 = 55
    card_x2 = STORY_W - 55
    card_y1 = 540
    card_y2 = STORY_H - 390   # = 1530
    draw_card(draw, card_x1, card_y1, card_x2, card_y2, radius=50)

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
    flèche ↙ papier collé + glow « VISIBLE ET CONFORME » + signature bleue.
    """
    img, draw = _rose_base()

    # "Anne-Sophie Assalit" en haut (#1e4e79)
    font_top = load_font(FONT_LIGHT_I, 38)
    w_top    = draw.textlength(BRAND_AUTHOR, font=font_top)
    draw.text(((STORY_W - w_top) / 2, 80), BRAND_AUTHOR, font=font_top, fill=BRAND_BLUE)

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

    # Flèche ↙ papier collé au-dessus à gauche des pilules
    _draw_collage_arrow(draw,
                        tip_x=pill_x1 + 130,
                        tip_y=y_start  - 118,
                        size=72)

    # Pilule 1 (bleu-violet, coins peu arrondis)
    font1 = load_font(FONT_BLACK, 82)
    draw_gradient_pill(img, draw,
                       pill_x1, y_start, pill_x2, y_start + pill_h,
                       line1, font1, pill_radius=_PILL_RADIUS)

    if line2:
        y2 = y_start + pill_h
        # Ombre fine à la jonction des deux pilules
        draw = ImageDraw.Draw(img)
        draw.rectangle([pill_x1 + 10, y2 - 5, pill_x2 - 10, y2 + 5],
                        fill=(120, 100, 160))   # mauve foncé entre les pilules
        # Pilule 2 accolée
        font2 = load_font(FONT_LIGHT_I, 74)
        draw_gradient_pill(img, draw,
                           pill_x1, y2, pill_x2, y2 + pill_h,
                           line2, font2, pill_radius=_PILL_RADIUS)

    # ── "VISIBLE ET CONFORME" glow fin et lumineux ───────────────────────────
    y_glow = STORY_H - 430   # = 1490
    img, draw = _draw_brand_glow(img, y_glow)

    # "Anne-Sophie Assalit" en bas (#1e4e79)
    _author_footer(draw, y=STORY_H - 145, color=BRAND_BLUE)

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
