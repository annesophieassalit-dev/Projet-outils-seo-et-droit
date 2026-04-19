"""
Carrousel "blanc" — fond beige clair, titre gradient rose→jaune en Bold Italic,
contenu avec barre gauche bleu marine. Format 1080×1350.

Structure JSON attendue pour chaque slide :
  {
    "title":      "Titre gradient (Bold Italic)",
    "bold":       "Accroche en gras bleu marine",
    "paragraphs": ["Paragraphe 1", "Paragraphe 2"],
    "sources":    "Sources : ... (optionnel, slide finale)",
    "is_last":    true/false  (supprime la flèche sur la dernière slide)
  }
"""

import os
from PIL import Image, ImageDraw

from config import (
    FEED_W,
    FONT_BOLD, FONT_BOLD_I, FONT_REGULAR, FONT_LIGHT_I,
    BRAND_AUTHOR,
)
from generators.base import load_font


# ── Couleurs ──────────────────────────────────────────────────────────────────
_BG        = (238, 234, 228)     # beige très clair
_NAVY      = (28,  56, 108)      # bleu marine — barre, bold, corps, flèche
_GRAD_A    = (232,  77, 115)     # rose vif (gauche du gradient titre)
_GRAD_B    = (245, 193,  42)     # jaune doré (droite du gradient titre)
_BADGE_BG  = (252, 248, 242)     # fond badge footer

# ── Dimensions ────────────────────────────────────────────────────────────────
_W, _H          = FEED_W, 1350
_MARGIN_X       = 80
_TITLE_MARGIN   = 38           # marge titre (plus étroit pour plus de mots/ligne)
_TITLE_TOP      = 78
_TITLE_SIZE     = 108          # titre grand — correspond aux modèles
_BORDER_X       = 98
_BORDER_W       = 4
_TEXT_X         = 146
_TEXT_W         = _W - _TEXT_X - 62
_BOLD_SIZE      = 40
_BODY_SIZE      = 37
_SRC_SIZE       = 28
_BODY_LS        = 1.46
_CONTENT_TOP    = 500    # y minimum de départ du bloc de contenu
_ARROW_X        = _W - 290   # début de la flèche (gauche des points)
_ARROW_CY       = 970        # centre y de la flèche
_FOOTER_Y       = 1268
_FOOTER_H       = 56
_FOOTER_W       = 650


# ── Utilitaires ───────────────────────────────────────────────────────────────

def _wrap(draw: ImageDraw.Draw, text: str, font, max_w: int) -> list:
    lines = []
    for para in text.split("\n"):
        if not para.strip():
            lines.append("")
            continue
        words, cur = para.split(), ""
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


def _lh(draw: ImageDraw.Draw, font, spacing: float = 1.3) -> float:
    bb = draw.textbbox((0, 0), "Ag", font=font)
    return (bb[3] - bb[1]) * spacing


# ── Fond beige ────────────────────────────────────────────────────────────────

def _beige_bg() -> tuple:
    img  = Image.new("RGB", (_W, _H), _BG)
    draw = ImageDraw.Draw(img)
    return img, draw


# ── Titre gradient rose→jaune (Bold Italic, centré) ───────────────────────────

def _draw_gradient_title(draw: ImageDraw.Draw, title: str, y_start: int) -> int:
    """Dessine le titre en Bold Italic avec gradient rose→jaune mot par mot.
    Retourne la coordonnée Y après la dernière ligne."""
    font  = load_font(FONT_BOLD_I, _TITLE_SIZE)
    max_w = _W - 2 * _TITLE_MARGIN
    lines = _wrap(draw, title, font, max_w)
    lh    = _lh(draw, font, 1.18)

    y = float(y_start)
    for line in lines:
        if not line.strip():
            y += lh
            continue
        words    = line.split()
        line_w   = draw.textlength(line, font=font)
        x        = (_W - line_w) / 2
        space_w  = draw.textlength(" ", font=font)

        for i, word in enumerate(words):
            ww = draw.textlength(word, font=font)
            # Interpolate color based on word center horizontal position
            t  = max(0.0, min(1.0, (x + ww / 2) / _W))
            color = (
                int(_GRAD_A[0] * (1 - t) + _GRAD_B[0] * t),
                int(_GRAD_A[1] * (1 - t) + _GRAD_B[1] * t),
                int(_GRAD_A[2] * (1 - t) + _GRAD_B[2] * t),
            )
            draw.text((x, y), word, font=font, fill=color)
            x += ww + (space_w if i < len(words) - 1 else 0)

        y += lh

    return int(y)


# ── Bloc de contenu avec barre gauche ─────────────────────────────────────────

def _draw_content_block(draw: ImageDraw.Draw, y: int,
                        bold_text: str, paragraphs: list,
                        sources: str = None) -> int:
    """
    Dessine :
      │  BOLD TEXT en bleu marine
      │
      │  Paragraphes en bleu moyen
      │  (+ sources en italic si présent)
    Retourne y après le bloc.
    """
    f_bold = load_font(FONT_BOLD,    _BOLD_SIZE)
    f_body = load_font(FONT_REGULAR, _BODY_SIZE)
    f_src  = load_font(FONT_LIGHT_I, _SRC_SIZE)

    bold_lh = _lh(draw, f_bold, 1.32)
    body_lh = _lh(draw, f_body, _BODY_LS)
    src_lh  = _lh(draw, f_src,  1.4)

    bold_lines = _wrap(draw, bold_text, f_bold, _TEXT_W)
    bold_h     = len(bold_lines) * bold_lh

    # Pré-calcul paragraphes
    para_blocks = []
    for p in paragraphs:
        pl = _wrap(draw, p, f_body, _TEXT_W)
        para_blocks.append(pl)

    body_h = sum(len(pl) * body_lh + 22 for pl in para_blocks) - 22

    src_lines = _wrap(draw, sources, f_src, _TEXT_W) if sources else []
    src_h = (len(src_lines) * src_lh + 28) if src_lines else 0

    BOLD_BODY_GAP = 30
    total_h = int(bold_h + BOLD_BODY_GAP + body_h + src_h)

    # Barre gauche
    draw.rectangle(
        [_BORDER_X, y, _BORDER_X + _BORDER_W, y + total_h],
        fill=_NAVY,
    )

    # Texte bold
    ty = float(y)
    for line in bold_lines:
        draw.text((_TEXT_X, ty), line, font=f_bold, fill=_NAVY)
        ty += bold_lh
    ty += BOLD_BODY_GAP

    # Paragraphes
    for idx, pl in enumerate(para_blocks):
        for line in pl:
            draw.text((_TEXT_X, ty), line, font=f_body, fill=_NAVY)
            ty += body_lh
        if idx < len(para_blocks) - 1:
            ty += 22

    # Sources
    if src_lines:
        ty += 28
        for line in src_lines:
            draw.text((_TEXT_X, ty), line, font=f_src, fill=_NAVY)
            ty += src_lh

    return int(ty)


# ── Flèche de navigation ·· → ─────────────────────────────────────────────────

def _draw_nav_arrow(draw: ImageDraw.Draw) -> None:
    x, cy = _ARROW_X, _ARROW_CY

    # Deux points ronds
    r = 8
    draw.ellipse([x,      cy - r, x + 2*r,      cy + r], fill=_NAVY)
    draw.ellipse([x + 26, cy - r, x + 26 + 2*r, cy + r], fill=_NAVY)

    # Flèche (tige + pointe)
    ax = x + 58
    draw.rectangle([ax, cy - 6, ax + 48, cy + 6], fill=_NAVY)
    draw.polygon([
        (ax + 48, cy - 22),
        (ax + 90, cy),
        (ax + 48, cy + 22),
    ], fill=_NAVY)


# ── Badge footer ──────────────────────────────────────────────────────────────

def _draw_footer_badge(draw: ImageDraw.Draw) -> None:
    font = load_font(FONT_LIGHT_I, 28)
    text = f"{BRAND_AUTHOR} | Juriste & SEO local"
    tw   = draw.textlength(text, font=font)

    bw  = max(int(tw) + 64, _FOOTER_W)
    x0  = (_W - bw) // 2
    draw.rounded_rectangle(
        [x0, _FOOTER_Y, x0 + bw, _FOOTER_Y + _FOOTER_H],
        radius=_FOOTER_H // 2,
        fill=_BADGE_BG,
        outline=_NAVY,
        width=2,
    )
    bb  = draw.textbbox((0, 0), "Ag", font=font)
    fh  = bb[3] - bb[1]
    ty  = _FOOTER_Y + (_FOOTER_H - fh) // 2 - 1
    draw.text((_W / 2 - tw / 2, ty), text, font=font, fill=_NAVY)


# ── Générateur d'une slide ─────────────────────────────────────────────────────

def generate_blanc_slide(
        title: str,
        bold: str,
        paragraphs: list,
        sources: str = None,
        is_last: bool = False,
        output_path: str = "output/carousels/blanc_slide.png",
) -> str:
    """
    Génère une slide de carrousel "blanc" :
      • Titre gradient rose→jaune en haut
      • Bloc de contenu avec barre bleue gauche
      • Flèche ·· → en bas-droite (sauf is_last)
      • Badge auteure en pied
    """
    img, draw = _beige_bg()

    # Titre
    title_bottom = _draw_gradient_title(draw, title, _TITLE_TOP)

    # Contenu : démarre après le titre avec au moins 80px d'espace
    content_y = max(title_bottom + 80, _CONTENT_TOP)
    _draw_content_block(draw, content_y, bold, paragraphs, sources)

    # Navigation
    if not is_last:
        _draw_nav_arrow(draw)

    # Footer
    _draw_footer_badge(draw)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    img.save(output_path, "PNG", optimize=True)
    return os.path.abspath(output_path)


# ── Point d'entrée carousel complet ──────────────────────────────────────────

def generate_blanc_carousel_set(
        carousel: dict,
        output_dir: str = "output/carousels",
) -> list:
    """
    Génère toutes les slides d'un carousel "blanc".

    Format attendu :
    {
        "id": 1,
        "style": "blanc",
        "slides": [
            {
                "title": "...",
                "bold": "...",
                "paragraphs": ["...", "..."],
                "sources": "...",   # optionnel
                "is_last": false    # optionnel, true sur la dernière slide
            }
        ],
        "caption": "..."
    }
    """
    cid    = carousel.get("id", "x")
    slides = carousel.get("slides", [])
    paths  = []

    for i, slide in enumerate(slides):
        is_last = slide.get("is_last", False)
        path    = f"{output_dir}/c_b{cid}_s{i}.png"
        paths.append(generate_blanc_slide(
            title      = slide.get("title", ""),
            bold       = slide.get("bold",  ""),
            paragraphs = slide.get("paragraphs", []),
            sources    = slide.get("sources"),
            is_last    = is_last,
            output_path= path,
        ))

    return paths
