"""
Générateur de carousels — fond rose dégradé radial, texte bleu #1e4e79.
Format 1080×1080.

Structure d'un carousel :
  Slide 0 — Hook     : titre bold (1re ligne) + sous-titre regular (reste), centré
  Slides 1…N — Content :
    - dict {"type": "bullets", "title": "...", "bullets": [...]}  → titre serif + cartes blanches
    - dict {"type": "text",    "title": "...", "paragraphs": [...]} → titre + texte centré
    - str  "..."   (compat ancienne version) → texte centré sans titre
  Dernière slide — CTA : header "VISIBLE ET / CONFORME" avec glow + question + signature
"""

import os
from PIL import Image, ImageDraw, ImageFilter

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    YELLOW_RIGHT,
    FONT_BLACK, FONT_BOLD, FONT_REGULAR, FONT_LIGHT, FONT_LIGHT_I, FONT_SERIF_I,
    BRAND_AUTHOR, BRAND_VISIBLE, BRAND_CONFORME,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient

# ─── Constantes de mise en page ───────────────────────────────────────────────
_MARGIN_X    = 55      # marge gauche/droite
_CARD_PAD_X  = 32      # padding horizontal intérieur des bulles
_CARD_PAD_Y  = 24      # padding vertical intérieur des bulles
_CARD_RADIUS = 28      # rayon des coins des bulles
_CARD_GAP    = 20      # espace vertical entre bulles
_TOP_Y       = 60      # espace réservé en haut
_FOOTER_H    = 90      # espace réservé en bas (signature + flèche)
_USABLE_Y2   = FEED_H - _FOOTER_H   # bord bas de la zone de contenu


# ─── Fond rose radial ────────────────────────────────────────────────────────

def _rose_sq_base() -> tuple:
    img  = make_radial_gradient(FEED_W, FEED_H, center_color=GRAD_CENTER, edge_color=GRAD_EDGE)
    draw = ImageDraw.Draw(img)
    return img, draw


# ─── Flèche jaune bas-droite ─────────────────────────────────────────────────

def _yellow_arrow(img: Image.Image, draw: ImageDraw.Draw,
                  x: int, y: int, size: int = 58) -> None:
    tip_x  = x + size
    shaft  = int(size * 0.62)
    half_h = int(size * 0.14)
    head_h = int(size * 0.36)
    draw.rectangle([x, y - half_h, x + shaft, y + half_h], fill=YELLOW_RIGHT)
    draw.polygon([
        (x + shaft, y - head_h),
        (tip_x,     y),
        (x + shaft, y + head_h),
    ], fill=YELLOW_RIGHT)


# ─── Signature auteure alignée à gauche, bleu #1e4e79 ───────────────────────

def _author_foot(draw: ImageDraw.Draw) -> None:
    font = load_font(FONT_LIGHT, 32)
    draw.text((_MARGIN_X, FEED_H - 52), BRAND_AUTHOR, font=font, fill=BRAND_BLUE)


# ─── Header "VISIBLE ET / CONFORME" avec glow (slide CTA) ───────────────────

def _draw_cta_header_glow(img: Image.Image, draw: ImageDraw.Draw,
                           y_sub: int = 48) -> tuple:
    """Dessine 'VISIBLE ET / CONFORME' en blanc avec halo lumineux."""
    font_sub  = load_font(FONT_LIGHT_I, 34)
    font_main = load_font(FONT_BLACK,   76)

    sub_w  = draw.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = draw.textlength(BRAND_CONFORME, font=font_main)
    y_main = y_sub + 46

    img_rgba = img.convert("RGBA")
    for blur_r, alpha in [(24, 175), (12, 148), (5, 115)]:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d     = ImageDraw.Draw(layer)
        d.text(((FEED_W - sub_w)  / 2, y_sub),  BRAND_VISIBLE,
               font=font_sub,  fill=(255, 255, 255, alpha))
        d.text(((FEED_W - main_w) / 2, y_main), BRAND_CONFORME,
               font=font_main, fill=(255, 255, 255, alpha))
        layer    = layer.filter(ImageFilter.GaussianBlur(radius=blur_r))
        img_rgba = Image.alpha_composite(img_rgba, layer)

    img  = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.text(((FEED_W - sub_w)  / 2, y_sub),  BRAND_VISIBLE,
              font=font_sub,  fill=(255, 255, 255))
    draw.text(((FEED_W - main_w) / 2, y_main), BRAND_CONFORME,
              font=font_main, fill=(255, 255, 255))
    return img, draw, y_main + 95   # y après le header


# ─── Utilitaires texte ────────────────────────────────────────────────────────

def _wrap_lines(draw: ImageDraw.Draw, text: str, font, max_w: int) -> list:
    """Découpe le texte en lignes ne dépassant pas max_w pixels."""
    lines = []
    for para in text.split("\n"):
        if not para.strip():
            lines.append("")
            continue
        words = para.split()
        cur = ""
        for word in words:
            test = (cur + " " + word).strip()
            if draw.textlength(test, font=font) <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
    return lines


def _block_height(draw: ImageDraw.Draw, text: str, font,
                  max_w: int, line_spacing: float = 1.3) -> int:
    """Hauteur totale (en px) d'un bloc de texte enveloppé."""
    lines = _wrap_lines(draw, text, font, max_w)
    bbox  = draw.textbbox((0, 0), "Ag", font=font)
    lh    = (bbox[3] - bbox[1]) * line_spacing
    return int(lh * max(len(lines), 1))


def _draw_lines_centered(draw: ImageDraw.Draw, text: str, font, color: tuple,
                         x1: int, y: float, max_w: int,
                         line_spacing: float = 1.3) -> float:
    """
    Dessine le texte enveloppé centré horizontalement dans [x1, x1+max_w].
    Retourne la coordonnée Y après la dernière ligne.
    """
    lines = _wrap_lines(draw, text, font, max_w)
    bbox  = draw.textbbox((0, 0), "Ag", font=font)
    lh    = (bbox[3] - bbox[1]) * line_spacing
    for i, line in enumerate(lines):
        if not line:
            continue
        lw = draw.textlength(line, font=font)
        draw.text((x1 + (max_w - lw) / 2, y + i * lh), line, font=font, fill=color)
    return y + lh * len(lines)


def _draw_bubble(draw: ImageDraw.Draw, x1: int, y: int, x2: int, h: int) -> None:
    """Dessine une carte blanche avec légère ombre portée."""
    # Ombre douce (décalage +4px, couleur rosée)
    draw.rounded_rectangle(
        [x1 + 4, y + 4, x2 + 4, y + h + 4],
        radius=_CARD_RADIUS, fill=(195, 168, 165),
    )
    # Carte blanc chaud
    draw.rounded_rectangle(
        [x1, y, x2, y + h],
        radius=_CARD_RADIUS, fill=(252, 248, 244),
    )


# ─── Slide 0 : Accroche — titre bold + sous-titre regular ───────────────────

def generate_marine_hook_slide(
        hook_text: str,
        output_path: str = "output/carousels/c_hook.png",
) -> str:
    """
    Slide d'accroche : 1re ligne = titre bold (grand), reste = sous-titre regular.
    Tout est centré verticalement sur fond rose. Pas de photo, pas de cadre.
    Si le texte n'a pas de saut de ligne, tout est rendu en titre bold.
    """
    img, draw = _rose_sq_base()

    max_w = FEED_W - 2 * _MARGIN_X

    if "\n" in hook_text:
        title, subtitle = hook_text.split("\n", 1)
        title    = title.strip()
        subtitle = subtitle.strip()
    else:
        title    = hook_text.strip()
        subtitle = ""

    font_title = load_font(FONT_BOLD,    82)
    font_sub   = load_font(FONT_REGULAR, 52)

    title_h = _block_height(draw, title, font_title, max_w, 1.25)
    sub_h   = _block_height(draw, subtitle, font_sub, max_w, 1.4) if subtitle else 0
    gap     = 30 if subtitle else 0
    total_h = title_h + gap + sub_h

    usable_h = _USABLE_Y2 - _TOP_Y
    y = _TOP_Y + (usable_h - total_h) / 2

    _draw_lines_centered(draw, title, font_title, BRAND_BLUE,
                         _MARGIN_X, y, max_w, 1.25)
    y += title_h + gap

    if subtitle:
        _draw_lines_centered(draw, subtitle, font_sub, BRAND_BLUE,
                             _MARGIN_X, y, max_w, 1.4)

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# Alias compat
generate_marine_photo_slide = generate_marine_hook_slide


# ─── Slide bullet : titre serif italic + cartes blanches ─────────────────────

def generate_marine_bullet_slide(
        title: str,
        bullets: list,
        output_path: str = "output/carousels/c_bullet.png",
) -> str:
    """
    Slide avec titre en serif italique + cartes blanches arrondies par point.
    L'ensemble (titre + cartes) est centré verticalement.
    """
    img, draw = _rose_sq_base()

    font_title = load_font(FONT_SERIF_I, 72)   # Cormorant Italic — élégant, style Playfair
    font_item  = load_font(FONT_BOLD,    38)
    max_w      = FEED_W - 2 * _MARGIN_X
    text_w     = max_w - 2 * _CARD_PAD_X

    # Hauteur du titre (espace-ligne condensé pour serif)
    title_h = _block_height(draw, title, font_title, max_w, 1.2)

    # Hauteurs des bulles
    item_bbox = draw.textbbox((0, 0), "Ag", font=font_item)
    item_lh   = (item_bbox[3] - item_bbox[1]) * 1.3
    card_heights = []
    for bullet in bullets:
        lines = _wrap_lines(draw, bullet, font_item, text_w)
        card_heights.append(int(item_lh * len(lines) + 2 * _CARD_PAD_Y))

    TITLE_CARD_GAP = 40
    total_h = (title_h + TITLE_CARD_GAP
               + sum(card_heights)
               + _CARD_GAP * (len(bullets) - 1))

    usable_h = _USABLE_Y2 - _TOP_Y
    y = _TOP_Y + (usable_h - total_h) / 2

    # Titre en serif italic
    _draw_lines_centered(draw, title, font_title, BRAND_BLUE,
                         _MARGIN_X, y, max_w, 1.2)
    y += title_h + TITLE_CARD_GAP

    # Bulles avec ombre
    for card_h, bullet in zip(card_heights, bullets):
        _draw_bubble(draw, _MARGIN_X, int(y), FEED_W - _MARGIN_X, card_h)

        lines        = _wrap_lines(draw, bullet, font_item, text_w)
        text_block_h = int(item_lh * len(lines))
        text_y       = y + (card_h - text_block_h) / 2
        for j, line in enumerate(lines):
            lw = draw.textlength(line, font=font_item)
            draw.text(
                (_MARGIN_X + (max_w - lw) / 2, text_y + j * item_lh),
                line, font=font_item, fill=BRAND_BLUE,
            )
        y += card_h + _CARD_GAP

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Slide texte : grande carte blanche + titre + paragraphes ────────────────

def generate_marine_text_slide(
        title: str,
        paragraphs: list,
        output_path: str = "output/carousels/c_text.png",
) -> str:
    """
    Slide avec UNE grande carte blanche arrondie (+ ombre) centrée verticalement.
    Le titre (optionnel) et les paragraphes sont dessinés à l'intérieur.
    La taille de police du corps s'adapte pour que tout rentre dans la carte.
    """
    img, draw = _rose_sq_base()

    card_x1 = _MARGIN_X
    card_x2 = FEED_W - _MARGIN_X
    card_w  = card_x2 - card_x1

    _TEXT_PAD_X = _CARD_PAD_X       # 32 px padding horizontal intérieur
    _TEXT_PAD_Y = 38                 # padding vertical intérieur (plus grand que les bulles)
    max_text_w  = card_w - 2 * _TEXT_PAD_X

    font_title = load_font(FONT_BOLD, 50) if title else None
    usable_h   = _USABLE_Y2 - _TOP_Y

    TITLE_BODY_GAP = 28
    PARA_GAP       = 18

    # Taille de police adaptive — on réduit jusqu'à ce que tout rentre
    for body_size in (42, 38, 34, 30, 26):
        font_body    = load_font(FONT_BOLD, body_size)
        title_h      = _block_height(draw, title, font_title, max_text_w, 1.25) if title else 0
        para_heights = [_block_height(draw, p, font_body, max_text_w, 1.35)
                        for p in paragraphs]
        content_h = (title_h
                     + (TITLE_BODY_GAP if title else 0)
                     + sum(para_heights)
                     + PARA_GAP * max(len(paragraphs) - 1, 0))
        card_h = content_h + 2 * _TEXT_PAD_Y
        if card_h <= usable_h - 20:
            break

    # Centrage vertical de la carte
    card_y = int(_TOP_Y + (usable_h - card_h) / 2)

    # Carte blanche avec ombre
    _draw_bubble(draw, card_x1, card_y, card_x2, int(card_h))

    # Contenu à l'intérieur de la carte
    y    = card_y + _TEXT_PAD_Y
    tx1  = card_x1 + _TEXT_PAD_X

    if title:
        _draw_lines_centered(draw, title, font_title, BRAND_BLUE,
                             tx1, y, max_text_w, 1.25)
        y += title_h + TITLE_BODY_GAP

    for para, ph in zip(paragraphs, para_heights):
        _draw_lines_centered(draw, para, font_body, BRAND_BLUE,
                             tx1, y, max_text_w, 1.35)
        y += ph + PARA_GAP

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# Alias compat
def generate_marine_content_slide(number: int, text: str,
                                   output_path: str = "output/carousels/c_content.png") -> str:
    return generate_marine_text_slide("", [text], output_path=output_path)


# ─── Slide CTA — header glow + question centrée + signature ──────────────────

def generate_marine_cta_slide(
        cta_text: str,
        output_path: str = "output/carousels/c_cta.png",
) -> str:
    """
    Dernière slide : 'VISIBLE ET / CONFORME' avec halo lumineux, puis texte CTA.
    Pas de flèche jaune sur cette slide.
    """
    img, draw = _rose_sq_base()

    # Header avec glow
    img, draw, y_after = _draw_cta_header_glow(img, draw, y_sub=48)

    # Texte CTA en bleu, centré dans l'espace restant
    font = load_font(FONT_BOLD, 60)
    draw_multiline_centered(
        draw, cta_text, font, BRAND_BLUE,
        _MARGIN_X, y_after, FEED_W - _MARGIN_X, _USABLE_Y2,
        line_spacing=1.42,
        top_aligned=False,
    )

    # Pas de flèche sur la dernière slide
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ─── Point d'entrée ──────────────────────────────────────────────────────────

def generate_marine_carousel_set(
        carousel: dict,
        output_dir: str = "output/carousels",
) -> list:
    """
    Génère toutes les slides d'un carousel.

    Format du dictionnaire attendu :
    {
        "id": 1,
        "hook_text": "Titre accroche\nSous-titre explicatif",   # ou "cover" (alias)
        "slides": [
            {
                "type": "bullets",
                "title": "Ce que vous ne pouvez pas faire",
                "bullets": ["...", "...", "..."]
            },
            {
                "type": "text",
                "title": "Sur la reprise d'un avis...",
                "paragraphs": ["...", "...", "..."]
            },
            "Texte simple (compat)"    # rendu comme slide texte centré sans titre
        ],
        "cta": "...",
        "caption": "..."
    }
    """
    cid       = carousel.get("id", "x")
    hook_text = carousel.get("hook_text") or carousel.get("cover", "")
    paths     = []

    # Slide 0 : accroche
    paths.append(generate_marine_hook_slide(
        hook_text=hook_text,
        output_path=f"{output_dir}/c_m{cid}_s0.png",
    ))

    # Slides de contenu
    for i, slide in enumerate(carousel.get("slides", []), start=1):
        out = f"{output_dir}/c_m{cid}_s{i}.png"

        if isinstance(slide, dict):
            stype = slide.get("type", "text")
            if stype == "bullets":
                paths.append(generate_marine_bullet_slide(
                    title=slide.get("title", ""),
                    bullets=slide.get("bullets", []),
                    output_path=out,
                ))
            else:
                paths.append(generate_marine_text_slide(
                    title=slide.get("title", ""),
                    paragraphs=slide.get("paragraphs", [slide.get("text", "")]),
                    output_path=out,
                ))
        else:
            # Chaîne simple (ancienne version) → texte centré sans titre
            paths.append(generate_marine_text_slide(
                title="",
                paragraphs=[slide],
                output_path=out,
            ))

    # Slide CTA (sans flèche)
    paths.append(generate_marine_cta_slide(
        cta_text=carousel.get("cta", ""),
        output_path=f"{output_dir}/c_m{cid}_s{len(carousel.get('slides', [])) + 1}.png",
    ))

    return paths
