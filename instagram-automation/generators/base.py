"""
Utilitaires partagés entre tous les générateurs d'images.
"""

import os
import textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from config import (
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_VISIBLE, BRAND_CONFORME, BRAND_AUTHOR,
    GRAD_TOP, GRAD_BOTTOM, CARD_BG, CARD_TEXT,
    HEADER_COLOR, AUTHOR_COLOR, PILL_LEFT, PILL_RIGHT, PILL_TEXT,
    FLASH_BG, FLASH_TEXT, FLASH_ARROW,
)


# ─── Chargement des polices ─────────────────────────────────────────────────

def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    """Charge une police TrueType ; fallback sur la police système par défaut."""
    try:
        return ImageFont.truetype(path, size)
    except (IOError, OSError):
        print(f"[AVERTISSEMENT] Police introuvable : {path}. Utilisez `python setup.py` pour télécharger les polices.")
        return ImageFont.load_default()


# ─── Fond dégradé ──────────────────────────────────────────────────────────

def make_gradient(width: int, height: int,
                  top: tuple = GRAD_TOP,
                  bottom: tuple = GRAD_BOTTOM) -> Image.Image:
    """Dégradé vertical linéaire top → bottom."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        t = y / (height - 1)
        arr[y] = [
            int(top[i] * (1 - t) + bottom[i] * t)
            for i in range(3)
        ]
    return Image.fromarray(arr, "RGB")


def make_radial_gradient(width: int, height: int,
                          center_color: tuple = (252, 248, 244),
                          edge_color: tuple = GRAD_TOP) -> Image.Image:
    """Dégradé radial, utilisé pour le slide CTA."""
    arr = np.zeros((height, width, 3), dtype=np.uint8)
    cx, cy = width / 2, height / 2
    max_r = ((cx**2 + cy**2) ** 0.5)
    ys, xs = np.mgrid[0:height, 0:width]
    r = ((xs - cx)**2 + (ys - cy)**2) ** 0.5
    t = np.clip(r / max_r, 0, 1)
    for i in range(3):
        arr[:, :, i] = (center_color[i] * (1 - t) + edge_color[i] * t).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


# ─── Texte multi-lignes centré ──────────────────────────────────────────────

def draw_multiline_centered(draw: ImageDraw.ImageDraw,
                             text: str,
                             font: ImageFont.FreeTypeFont,
                             color: tuple,
                             box_x1: int, box_y1: int,
                             box_x2: int, box_y2: int,
                             line_spacing: float = 1.35) -> None:
    """
    Enveloppe et centre le texte verticalement + horizontalement
    dans la boîte (box_x1, box_y1, box_x2, box_y2).
    """
    box_w = box_x2 - box_x1

    # Calculer le nombre de caractères par ligne (binary search)
    max_chars = len(text)
    for chars in range(1, len(text) + 1):
        wrapped = textwrap.fill(text, width=chars)
        lines = wrapped.split("\n")
        widths = [draw.textlength(line, font=font) for line in lines]
        if max(widths) <= box_w:
            max_chars = chars
            break

    wrapped = textwrap.fill(text, width=max_chars)
    lines = wrapped.split("\n")

    # Hauteur de ligne
    bbox_sample = draw.textbbox((0, 0), "Ag", font=font)
    line_h = (bbox_sample[3] - bbox_sample[1]) * line_spacing

    total_h = line_h * len(lines)
    start_y = box_y1 + (box_y2 - box_y1 - total_h) / 2

    for i, line in enumerate(lines):
        line_w = draw.textlength(line, font=font)
        x = box_x1 + (box_w - line_w) / 2
        y = start_y + i * line_h
        draw.text((x, y), line, font=font, fill=color)


# ─── En-tête "VISIBLE ET / CONFORME" ───────────────────────────────────────

def draw_header(draw: ImageDraw.ImageDraw, width: int,
                y_start: int = 110, color: tuple = HEADER_COLOR) -> int:
    """
    Dessine l'en-tête de marque en haut au centre.
    Retourne la coordonnée Y après l'en-tête.
    """
    font_sub  = load_font(FONT_LIGHT_I, 44)
    font_main = load_font(FONT_BLACK,   120)

    # "VISIBLE ET" — sous-titre léger italique
    sub_w = draw.textlength(BRAND_VISIBLE, font=font_sub)
    draw.text(((width - sub_w) / 2, y_start), BRAND_VISIBLE,
              font=font_sub, fill=color)

    # "CONFORME" — titre principal gros et gras
    main_w = draw.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_start + 58
    draw.text(((width - main_w) / 2, y_main), BRAND_CONFORME,
              font=font_main, fill=color)

    return y_main + 130


def draw_header_bottom(draw: ImageDraw.ImageDraw, width: int,
                        y_bottom: int, color: tuple = HEADER_COLOR) -> None:
    """
    Dessine l'en-tête de marque en bas (slide CTA).
    """
    font_sub  = load_font(FONT_LIGHT_I, 40)
    font_main = load_font(FONT_BLACK,   100)
    gap = 10

    main_h = 110
    sub_h  = 50
    total_h = sub_h + gap + main_h

    y_sub  = y_bottom - total_h
    y_main = y_sub + sub_h + gap

    sub_w = draw.textlength(BRAND_VISIBLE, font=font_sub)
    draw.text(((width - sub_w) / 2, y_sub), BRAND_VISIBLE,
              font=font_sub, fill=color)

    main_w = draw.textlength(BRAND_CONFORME, font=font_main)
    draw.text(((width - main_w) / 2, y_main), BRAND_CONFORME,
              font=font_main, fill=color)


# ─── Signature auteure ──────────────────────────────────────────────────────

def draw_author(draw: ImageDraw.ImageDraw, width: int,
                y: int, color: tuple = AUTHOR_COLOR) -> None:
    font = load_font(FONT_LIGHT, 42)
    w = draw.textlength(BRAND_AUTHOR, font=font)
    draw.text(((width - w) / 2, y), BRAND_AUTHOR, font=font, fill=color)


def draw_author_left(draw: ImageDraw.ImageDraw,
                     x: int, y: int, color: tuple = AUTHOR_COLOR) -> None:
    font = load_font(FONT_LIGHT, 32)
    draw.text((x, y), BRAND_AUTHOR, font=font, fill=color)


# ─── Carte blanche arrondie ──────────────────────────────────────────────────

def draw_card(draw: ImageDraw.ImageDraw,
              x1: int, y1: int, x2: int, y2: int,
              radius: int = 40) -> None:
    """Carte blanche avec coins arrondis et légère ombre."""
    # Ombre (décalée de 8px)
    shadow_color = (180, 160, 158, 50)
    draw.rounded_rectangle([x1 + 8, y1 + 8, x2 + 8, y2 + 8],
                            radius=radius, fill=(210, 190, 188))
    # Carte
    draw.rounded_rectangle([x1, y1, x2, y2],
                            radius=radius, fill=CARD_BG)


# ─── Pilule dégradée (slide CTA) ────────────────────────────────────────────

def draw_gradient_pill(img: Image.Image, draw: ImageDraw.ImageDraw,
                       x1: int, y1: int, x2: int, y2: int,
                       text: str, font: ImageFont.FreeTypeFont,
                       italic: bool = False) -> None:
    """Pilule avec dégradé horizontal gauche→droite."""
    w = x2 - x1
    h = y2 - y1

    # Créer le rectangle dégradé
    pill_arr = np.zeros((h, w, 3), dtype=np.uint8)
    for x in range(w):
        t = x / (w - 1)
        pill_arr[:, x] = [
            int(PILL_LEFT[i] * (1 - t) + PILL_RIGHT[i] * t)
            for i in range(3)
        ]
    pill_img = Image.fromarray(pill_arr, "RGB")

    # Masque arrondi
    mask = Image.new("L", (w, h), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = h // 2
    mask_draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)

    # Composite
    img.paste(pill_img, (x1, y1), mask)

    # Texte centré dans la pilule
    text_w = draw.textlength(text, font=font)
    tx = x1 + (w - text_w) / 2
    ty = y1 + (h - font.size) / 2 - 4
    draw.text((tx, ty), text, font=font, fill=PILL_TEXT)


# ─── Emoji / sticker texte ─────────────────────────────────────────────────

def draw_emoji_row(draw: ImageDraw.ImageDraw,
                   emoji_str: str, font_size: int,
                   cx: int, cy: int) -> None:
    """Dessine une rangée d'emojis centrée sur (cx, cy)."""
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
                                  font_size)
    except (IOError, OSError):
        font = load_font(FONT_BOLD, font_size)
    w = draw.textlength(emoji_str, font=font)
    draw.text((cx - w / 2, cy - font_size / 2), emoji_str, font=font, fill=(0, 0, 0))


def draw_text_sticker(draw: ImageDraw.ImageDraw,
                      text: str, font_size: int,
                      cx: int, cy: int,
                      color: tuple = (42, 42, 42)) -> None:
    """Sticker texte centré (fallback si pas d'emoji)."""
    font = load_font(FONT_BOLD, font_size)
    w = draw.textlength(text, font=font)
    draw.text((cx - w / 2, cy - font_size / 2), text, font=font, fill=color)


# ─── Flèche dessinée ────────────────────────────────────────────────────────

def draw_arrow_right(draw: ImageDraw.ImageDraw,
                     x: int, y: int,
                     size: int = 60,
                     color: tuple = FLASH_ARROW) -> None:
    """Dessine une flèche → simple."""
    tip_x = x + size
    tip_y = y
    shaft_w = int(size * 0.65)
    half_h  = int(size * 0.15)
    head_w  = int(size * 0.35)
    head_h  = int(size * 0.38)

    # Tige
    draw.rectangle([x, tip_y - half_h, x + shaft_w, tip_y + half_h], fill=color)
    # Pointe (triangle)
    draw.polygon([
        (x + shaft_w, tip_y - head_h),
        (tip_x,       tip_y),
        (x + shaft_w, tip_y + head_h),
    ], fill=color)
