"""
Générateur de carousels (format 1080×1080, plusieurs slides).

Structure d'un carousel :
  Slide 0 — Accroche   : fond rose plat, gros texte foncé
  Slides 1…N — Contenu : fond dégradé, texte numéroté dans carte blanche
  Dernière slide — CTA : branding + appel à l'action
"""

import os
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_TOP, GRAD_BOTTOM,
    FLASH_BG, FLASH_TEXT, FLASH_ARROW,
    CARD_TEXT, FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT,
    HEADER_COLOR, AUTHOR_COLOR,
)
from generators.base import (
    make_gradient,
    load_font,
    draw_header, draw_author, draw_author_left, draw_card,
    draw_multiline_centered, draw_arrow_right,
)

CARD_MARGIN = 70
FOOTER_Y    = FEED_H - 110


def _cover_slide(title: str, output_path: str) -> str:
    """
    Slide de couverture : fond rose plat, gros texte sombre centré,
    flèche → et signature en bas.

    Même style que les "Posts flash".
    """
    img  = Image.new("RGB", (FEED_W, FEED_H), color=FLASH_BG)
    draw = ImageDraw.Draw(img)

    # Texte principal
    font = load_font(FONT_BLACK, 82)
    draw_multiline_centered(
        draw, title, font, FLASH_TEXT,
        80, 120, FEED_W - 80, FEED_H - 200,
        line_spacing=1.3,
    )

    # Flèche →
    draw_arrow_right(draw, x=FEED_W - 160, y=FEED_H - 130, size=80, color=FLASH_ARROW)

    # Signature
    draw_author_left(draw, x=60, y=FEED_H - 80, color=FLASH_TEXT)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


def _content_slide(number: int, text: str, output_path: str) -> str:
    """
    Slide de contenu numérotée : fond dégradé, en-tête branding, carte + texte.
    """
    img  = make_gradient(FEED_W, FEED_H)
    draw = ImageDraw.Draw(img)

    # En-tête compact (version petite pour le format carré)
    font_sub  = load_font(FONT_LIGHT, 28)
    font_main = load_font(FONT_BLACK, 72)

    sub_w = draw.textlength("VISIBLE ET", font=font_sub)
    draw.text(((FEED_W - sub_w) / 2, 50), "VISIBLE ET", font=font_sub, fill=HEADER_COLOR)
    main_w = draw.textlength("CONFORME", font=font_main)
    draw.text(((FEED_W - main_w) / 2, 86), "CONFORME", font=font_main, fill=HEADER_COLOR)

    # Numéro de slide
    font_num = load_font(FONT_BLACK, 100)
    draw.text((CARD_MARGIN + 20, 220), str(number), font=font_num, fill=HEADER_COLOR)

    # Carte
    card_top    = 310
    card_bottom = FEED_H - 150
    draw_card(draw, CARD_MARGIN, card_top, FEED_W - CARD_MARGIN, card_bottom)

    # Texte de contenu dans la carte
    font_text = load_font(FONT_BOLD, 58)
    draw_multiline_centered(
        draw, text, font_text, CARD_TEXT,
        CARD_MARGIN + 50, card_top + 40,
        FEED_W - CARD_MARGIN - 50, card_bottom - 40,
        line_spacing=1.35,
    )

    # Signature
    draw_author(draw, FEED_W, y=FOOTER_Y, color=AUTHOR_COLOR)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


def _cta_slide(cta_text: str, output_path: str) -> str:
    """
    Dernière slide du carousel : fond dégradé, appel à l'action, branding.
    """
    img  = make_gradient(FEED_W, FEED_H)
    draw = ImageDraw.Draw(img)

    # En-tête branding
    draw_header(draw, FEED_W, y_start=60)

    # Texte CTA dans une carte
    card_top    = 370
    card_bottom = FEED_H - 150
    draw_card(draw, CARD_MARGIN, card_top, FEED_W - CARD_MARGIN, card_bottom)

    font_cta = load_font(FONT_BOLD, 58)
    draw_multiline_centered(
        draw, cta_text, font_cta, CARD_TEXT,
        CARD_MARGIN + 50, card_top + 40,
        FEED_W - CARD_MARGIN - 50, card_bottom - 40,
        line_spacing=1.35,
    )

    draw_author(draw, FEED_W, y=FOOTER_Y, color=AUTHOR_COLOR)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


def generate_carousel_set(carousel: dict,
                           output_dir: str = "output/carousels") -> list[str]:
    """
    Génère toutes les slides d'un carousel.

    Exemple de dictionnaire attendu :
    {
        "id": 1,
        "cover": "Vos avis Google. Vous pensez pouvoir en faire ce que vous voulez. Voici ce que la loi dit vraiment.",
        "slides": [
            "La loi vous interdit de supprimer les avis négatifs sauf conditions précises.",
            "Répondre publiquement aux avis est votre meilleur outil.",
            "Un avis diffamatoire peut être signalé à Google et en justice."
        ],
        "cta": "Sauvegardez ce post pour vous en souvenir !"
    }

    Returns:
        Liste des chemins absolus de toutes les slides.
    """
    cid   = carousel.get("id", "x")
    paths = []

    # Slide de couverture
    paths.append(_cover_slide(
        title=carousel["cover"],
        output_path=f"{output_dir}/carousel_{cid}_slide0.png",
    ))

    # Slides de contenu
    for i, text in enumerate(carousel["slides"], start=1):
        paths.append(_content_slide(
            number=i,
            text=text,
            output_path=f"{output_dir}/carousel_{cid}_slide{i}.png",
        ))

    # Slide CTA
    paths.append(_cta_slide(
        cta_text=carousel.get("cta", "Sauvegardez ce post !"),
        output_path=f"{output_dir}/carousel_{cid}_slide{len(carousel['slides']) + 1}.png",
    ))

    return paths
