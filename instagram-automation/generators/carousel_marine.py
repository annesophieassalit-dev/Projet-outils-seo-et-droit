"""
Générateur de carousels — fond rose dégradé radial, texte bleu #1e4e79.
Format 1080×1080.

Structure d'un carousel :
  Slide 0 — Hook     : texte d'accroche centré verticalement sur fond rose (pas de photo)
  Slides 1…N — Content :
    - dict {"type": "bullets", "title": "...", "bullets": [...]}  → titre + cartes blanches
    - dict {"type": "text",    "title": "...", "paragraphs": [...]} → titre + texte centré
    - str  "..."   (compat ancienne version)   → texte centré (sans titre)
  Dernière slide — CTA : petit header blanc + question + signature
"""

import os
from PIL import Image, ImageDraw

from config import (
    FEED_W, FEED_H,
    GRAD_CENTER, GRAD_EDGE,
    BRAND_BLUE,
    YELLOW_RIGHT,
    FONT_BLACK, FONT_BOLD, FONT_LIGHT, FONT_LIGHT_I,
    BRAND_AUTHOR, BRAND_VISIBLE, BRAND_CONFORME,
)
from generators.base import load_font, draw_multiline_centered, make_radial_gradient

# ─── Constantes de mise en page ───────────────────────────────────────────────
_MARGIN_X    = 55      # marge gauche/droite
_CARD_PAD_X  = 32      # padding horizontal intérieur des bulles
_CARD_PAD_Y  = 22      # padding vertical intérieur des bulles
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
    Dessine le texte enveloppé, centré horizontalement dans [x1, x1+max_w].
    Retourne la coordonnée Y après le dernier ligne.
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


# ─── Slide 0 : Accroche texte centré verticalement ──────────────────────────

def generate_marine_hook_slide(
        hook_text: str,
        output_path: str = "output/carousels/c_hook.png",
) -> str:
    """
    Slide d'accroche : texte grand centré verticalement sur fond rose.
    Pas de photo, pas de cadre.
    """
    img, draw = _rose_sq_base()

    font  = load_font(FONT_BOLD, 70)
    max_w = FEED_W - 2 * _MARGIN_X

    draw_multiline_centered(
        draw, hook_text, font, BRAND_BLUE,
        _MARGIN_X, _TOP_Y, FEED_W - _MARGIN_X, _USABLE_Y2,
        line_spacing=1.4,
        top_aligned=False,
    )

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# Alias compat
generate_marine_photo_slide = generate_marine_hook_slide


# ─── Slide bullet : titre + cartes blanches ──────────────────────────────────

def generate_marine_bullet_slide(
        title: str,
        bullets: list,
        output_path: str = "output/carousels/c_bullet.png",
) -> str:
    """
    Slide avec titre + cartes blanches arrondies pour chaque point.
    L'ensemble (titre + cartes) est centré verticalement.
    """
    img, draw = _rose_sq_base()

    font_title = load_font(FONT_BOLD, 56)
    font_item  = load_font(FONT_BOLD, 40)
    max_w      = FEED_W - 2 * _MARGIN_X
    text_w     = max_w - 2 * _CARD_PAD_X

    # Hauteur du titre
    title_h = _block_height(draw, title, font_title, max_w, 1.25)

    # Hauteurs des bulles (dynamique selon contenu)
    item_bbox  = draw.textbbox((0, 0), "Ag", font=font_item)
    item_lh    = (item_bbox[3] - item_bbox[1]) * 1.3
    card_heights = []
    for bullet in bullets:
        lines = _wrap_lines(draw, bullet, font_item, text_w)
        card_heights.append(int(item_lh * len(lines) + 2 * _CARD_PAD_Y))

    TITLE_CARD_GAP = 36
    total_h = (title_h + TITLE_CARD_GAP
               + sum(card_heights)
               + _CARD_GAP * (len(bullets) - 1))

    # Centrage vertical dans la zone utilisable
    usable_h = _USABLE_Y2 - _TOP_Y
    y = _TOP_Y + (usable_h - total_h) / 2

    # Titre
    _draw_lines_centered(draw, title, font_title, BRAND_BLUE,
                         _MARGIN_X, y, max_w, 1.25)
    y += title_h + TITLE_CARD_GAP

    # Bulles
    for card_h, bullet in zip(card_heights, bullets):
        # Fond blanc chaud arrondi
        draw.rounded_rectangle(
            [_MARGIN_X, y, FEED_W - _MARGIN_X, y + card_h],
            radius=_CARD_RADIUS, fill=(252, 248, 244),
        )
        # Texte centré dans la carte
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


# ─── Slide texte : titre + paragraphes (ou texte simple) ─────────────────────

def generate_marine_text_slide(
        title: str,
        paragraphs: list,
        output_path: str = "output/carousels/c_text.png",
) -> str:
    """
    Slide avec titre optionnel + paragraphes centrés verticalement.
    Si title="", le texte seul est centré (compat ancienne version).
    """
    img, draw = _rose_sq_base()

    font_title = load_font(FONT_BOLD, 56)
    font_body  = load_font(FONT_BOLD, 46)
    max_w      = FEED_W - 2 * _MARGIN_X

    TITLE_BODY_GAP = 44
    PARA_GAP       = 28

    # Hauteur totale du bloc
    title_h   = _block_height(draw, title, font_title, max_w, 1.25) if title else 0
    para_heights = [_block_height(draw, p, font_body, max_w, 1.3) for p in paragraphs]
    total_h = (title_h
               + (TITLE_BODY_GAP if title else 0)
               + sum(para_heights)
               + PARA_GAP * (len(paragraphs) - 1))

    usable_h = _USABLE_Y2 - _TOP_Y
    y = _TOP_Y + (usable_h - total_h) / 2

    if title:
        _draw_lines_centered(draw, title, font_title, BRAND_BLUE,
                             _MARGIN_X, y, max_w, 1.25)
        y += title_h + TITLE_BODY_GAP

    for i, (para, para_h) in enumerate(zip(paragraphs, para_heights)):
        _draw_lines_centered(draw, para, font_body, BRAND_BLUE,
                             _MARGIN_X, y, max_w, 1.3)
        y += para_h + PARA_GAP

    _yellow_arrow(img, draw, FEED_W - 148, FEED_H - 72)
    _author_foot(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# Alias compat
def generate_marine_content_slide(number: int, text: str,
                                   output_path: str = "output/carousels/c_content.png") -> str:
    return generate_marine_text_slide("", [text], output_path=output_path)


# ─── Slide CTA ───────────────────────────────────────────────────────────────

def generate_marine_cta_slide(
        cta_text: str,
        output_path: str = "output/carousels/c_cta.png",
) -> str:
    img, draw = _rose_sq_base()

    # Petit en-tête "VISIBLE ET / CONFORME" en blanc
    font_sub  = load_font(FONT_LIGHT_I, 36)
    font_main = load_font(FONT_BLACK,   80)

    sub_w  = draw.textlength(BRAND_VISIBLE,  font=font_sub)
    main_w = draw.textlength(BRAND_CONFORME, font=font_main)

    draw.text(((FEED_W - sub_w)  / 2, 55), BRAND_VISIBLE,
              font=font_sub,  fill=(255, 255, 255))
    draw.text(((FEED_W - main_w) / 2, 97), BRAND_CONFORME,
              font=font_main, fill=(255, 255, 255))

    # Texte CTA en bleu, centré dans l'espace restant
    font = load_font(FONT_BOLD, 62)
    draw_multiline_centered(
        draw, cta_text, font, BRAND_BLUE,
        _MARGIN_X, 210, FEED_W - _MARGIN_X, _USABLE_Y2,
        line_spacing=1.42,
        top_aligned=False,
    )

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
        "hook_text": "...",            # ou "cover" (alias)
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
            "Texte simple (compat)"    # rendu comme slide texte centré
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
                # type "text" ou inconnu
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

    # Slide CTA
    paths.append(generate_marine_cta_slide(
        cta_text=carousel.get("cta", ""),
        output_path=f"{output_dir}/c_m{cid}_s{len(carousel.get('slides', [])) + 1}.png",
    ))

    return paths
