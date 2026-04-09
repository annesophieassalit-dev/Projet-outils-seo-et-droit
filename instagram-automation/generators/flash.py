"""
Générateur de posts flash (format 1080×1080, slide unique).

Design : fond rose plat, gros texte marine foncé centré, flèche → et signature.
"""

import os
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    FLASH_BG, FLASH_TEXT, FLASH_ARROW,
    FONT_BLACK, FONT_LIGHT,
)
from generators.base import (
    load_font,
    draw_multiline_centered, draw_arrow_right, draw_author_left,
)


def generate_flash_post(text: str,
                         output_path: str = "output/flash_posts/flash.png") -> str:
    """
    Génère un post flash.

    Args:
        text        : Texte accrocheur à afficher (ex: "Vos avis Google…")
        output_path : Chemin de sauvegarde.

    Returns:
        Le chemin absolu de l'image générée.
    """
    img  = Image.new("RGB", (FEED_W, FEED_H), color=FLASH_BG)
    draw = ImageDraw.Draw(img)

    # Texte principal — centré verticalement et horizontalement
    font = load_font(FONT_BLACK, 88)
    draw_multiline_centered(
        draw, text, font, FLASH_TEXT,
        80, 100, FEED_W - 80, FEED_H - 220,
        line_spacing=1.3,
    )

    # Flèche → en bas à droite
    draw_arrow_right(draw, x=FEED_W - 170, y=FEED_H - 135, size=85, color=FLASH_ARROW)

    # Signature en bas à gauche
    font_author = load_font(FONT_LIGHT, 34)
    draw.text((60, FEED_H - 80), "Anne-Sophie Assalit",
              font=font_author, fill=FLASH_TEXT)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)
