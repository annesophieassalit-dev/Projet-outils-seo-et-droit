"""
Générateur de stories (format 1080×1920).

Chaque story est composée de 3 slides :
  Slide 1 — Question   : en-tête + carte blanche + sticker question + texte
  Slide 2 — Info/Tip   : en-tête + carte blanche + sticker ampoule + texte
  Slide 3 — CTA        : dégradé radial + pilules dégradées + branding bas
"""

import os
from PIL import Image, ImageDraw

from config import STORY_W, STORY_H, GRAD_TOP, GRAD_BOTTOM, CARD_TEXT, FONT_BOLD, FONT_LIGHT_I
from generators.base import (
    make_gradient, make_radial_gradient,
    load_font,
    draw_header, draw_header_bottom, draw_author, draw_author_left,
    draw_card, draw_multiline_centered,
    draw_gradient_pill,
    draw_emoji_row, draw_text_sticker,
)

# ─── Constantes de mise en page ─────────────────────────────────────────────

CARD_MARGIN    = 80     # espace gauche/droite de la carte
CARD_TOP       = 480    # haut de la carte (en px)
CARD_BOTTOM    = STORY_H - 260  # bas de la carte
FOOTER_Y       = STORY_H - 155  # y de la signature
STICKER_CY     = CARD_TOP - 10  # centre vertical du sticker (chevauche le haut de la carte)
STICKER_SIZE   = 120    # taille d'affichage du sticker


def _base_image() -> tuple:
    """Crée l'image de base avec le fond dégradé."""
    img  = make_gradient(STORY_W, STORY_H)
    draw = ImageDraw.Draw(img)
    return img, draw


def _draw_common_header_and_footer(draw: ImageDraw.Draw, width: int) -> None:
    draw_header(draw, width, y_start=110)
    draw_author(draw, width, y=FOOTER_Y)


# ─── Slide 1 : Question ─────────────────────────────────────────────────────

def generate_slide_question(text: str,
                              sticker: str = "❓❓❓❓",
                              output_path: str = "output/stories/slide1.png") -> str:
    """
    Génère la première slide d'une story (slide question).

    Args:
        text        : Texte de la question affiché dans la carte.
        sticker     : Emoji(s) affiché(s) comme sticker en haut de la carte.
        output_path : Chemin de sauvegarde de l'image.

    Returns:
        Le chemin absolu de l'image générée.
    """
    img, draw = _base_image()
    _draw_common_header_and_footer(draw, STORY_W)

    # Carte blanche
    draw_card(draw, CARD_MARGIN, CARD_TOP, STORY_W - CARD_MARGIN, CARD_BOTTOM)

    # Sticker au-dessus / chevauchant le haut de la carte
    draw_emoji_row(draw, sticker, STICKER_SIZE, STORY_W // 2, STICKER_CY)

    # Texte de la question dans la carte
    font = load_font(FONT_BOLD, 68)
    draw_multiline_centered(
        draw, text, font, CARD_TEXT,
        CARD_MARGIN + 50, CARD_TOP + 140,
        STORY_W - CARD_MARGIN - 50, CARD_BOTTOM - 60,
        line_spacing=1.4,
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 2 : Info / Conseil ───────────────────────────────────────────────

def generate_slide_info(text: str,
                         sticker: str = "💡",
                         output_path: str = "output/stories/slide2.png") -> str:
    """
    Génère la deuxième slide d'une story (slide info).

    Args:
        text        : Texte informatif affiché dans la carte.
        sticker     : Emoji affiché comme sticker en haut de la carte.
        output_path : Chemin de sauvegarde.
    """
    img, draw = _base_image()
    _draw_common_header_and_footer(draw, STORY_W)

    # Carte légèrement plus haute pour le texte long
    card_top = CARD_TOP + 30
    draw_card(draw, CARD_MARGIN, card_top, STORY_W - CARD_MARGIN, CARD_BOTTOM)

    # Sticker centré qui dépasse légèrement en haut de la carte
    draw_emoji_row(draw, sticker, STICKER_SIZE + 20, STORY_W // 2, card_top - 20)

    # Texte dans la carte
    font = load_font(FONT_BOLD, 72)
    draw_multiline_centered(
        draw, text, font, CARD_TEXT,
        CARD_MARGIN + 60, card_top + 160,
        STORY_W - CARD_MARGIN - 60, CARD_BOTTOM - 60,
        line_spacing=1.4,
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide 3 : CTA ──────────────────────────────────────────────────────────

def generate_slide_cta(pill1_text: str,
                        pill2_text: str,
                        output_path: str = "output/stories/slide3.png") -> str:
    """
    Génère la troisième slide d'une story (call-to-action avec pilules).

    Args:
        pill1_text  : Texte de la première pilule (ex : "Formulaire").
        pill2_text  : Texte de la deuxième pilule (ex : "# Conformité automatique").
        output_path : Chemin de sauvegarde.
    """
    # Fond radial pour la slide CTA (plus lumineux au centre)
    img  = make_radial_gradient(STORY_W, STORY_H,
                                 center_color=(252, 248, 244),
                                 edge_color=GRAD_TOP)
    draw = ImageDraw.Draw(img)

    # Branding en bas
    draw_header_bottom(draw, STORY_W, y_bottom=STORY_H - 80)
    draw_author(draw, STORY_W, y=STORY_H - 80, color=(42, 42, 42))

    # Flèche décorative (simulée par le texte ↘)
    font_arrow = load_font(FONT_BOLD, 110)
    arrow_sym = "↘"
    draw.text((130, 580), arrow_sym, font=font_arrow, fill=(42, 42, 42))

    # ── Pilule 1 ─────────────────────────────────────────────────────────────
    pill_x1 = 70
    pill_x2 = STORY_W - 70
    pill_h  = 130
    pill1_y1 = 740
    pill1_y2 = pill1_y1 + pill_h

    font_pill1 = load_font(FONT_BOLD, 68)
    draw_gradient_pill(img, draw, pill_x1, pill1_y1, pill_x2, pill1_y2,
                       pill1_text, font_pill1)

    # ── Pilule 2 ─────────────────────────────────────────────────────────────
    pill2_y1 = pill1_y2 + 18
    pill2_y2 = pill2_y1 + pill_h

    font_pill2 = load_font(FONT_LIGHT_I, 60)
    draw_gradient_pill(img, draw, pill_x1, pill2_y1, pill_x2, pill2_y2,
                       pill2_text, font_pill2, italic=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Point d'entrée principal ─────────────────────────────────────────────────

def generate_story_set(story: dict, output_dir: str = "output/stories") -> list[str]:
    """
    Génère les 3 slides d'une story à partir d'un dictionnaire de contenu.

    Exemple de dictionnaire attendu :
    {
        "id": 1,
        "sticker1": "❓❓❓❓",
        "question": "Votre formulaire de contact a-t-il une mention RGPD ?",
        "sticker2": "💡",
        "info": "Un formulaire sans mention RGPD collecte des données personnelles sans base légale.",
        "pill1": "Formulaire",
        "pill2": "# Conformité automatique"
    }

    Returns:
        Liste des chemins absolus des 3 slides générées.
    """
    sid = story.get("id", "x")
    paths = [
        generate_slide_question(
            text=story["question"],
            sticker=story.get("sticker1", "❓❓❓❓"),
            output_path=f"{output_dir}/story_{sid}_slide1.png",
        ),
        generate_slide_info(
            text=story["info"],
            sticker=story.get("sticker2", "💡"),
            output_path=f"{output_dir}/story_{sid}_slide2.png",
        ),
        generate_slide_cta(
            pill1_text=story["pill1"],
            pill2_text=story["pill2"],
            output_path=f"{output_dir}/story_{sid}_slide3.png",
        ),
    ]
    return paths
