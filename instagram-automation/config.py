"""
Configuration centrale — couleurs, dimensions, typographie.
Modifiez ces valeurs pour ajuster le design global.
"""

# ─── Dimensions ────────────────────────────────────────────────────────────────
STORY_W, STORY_H = 1080, 1920      # Stories (9:16)
FEED_W, FEED_H   = 1080, 1080      # Posts carré (1:1)

# ─── Palette de couleurs ───────────────────────────────────────────────────────
# Fond dégradé stories (rose poudré → blush clair)
GRAD_TOP    = (211, 148, 154)       # #D3949A  haut
GRAD_BOTTOM = (237, 210, 208)       # #EDD2D0  bas

# Carte blanche dans les stories
CARD_BG      = (252, 248, 244)      # #FCF8F4  blanc chaud
CARD_TEXT    = (42,  42,  42)       # #2A2A2A  quasi-noir
CARD_SHADOW  = (200, 180, 178, 60)  # ombre légère (RGBA)

# En-tête "VISIBLE ET CONFORME"
HEADER_COLOR = (255, 255, 255)      # blanc

# Signature "Anne-Sophie Assalit"
AUTHOR_COLOR = (42, 42, 42)         # quasi-noir

# Pilules dégradées (slide CTA)
PILL_LEFT    = (130, 196, 226)      # #82C4E2  bleu ciel
PILL_RIGHT   = (192, 152, 224)      # #C098E0  lavande
PILL_TEXT    = (255, 255, 255)      # blanc

# Flash posts (fond plat)
FLASH_BG     = (229, 178, 182)      # #E5B2B6  rose doux
FLASH_TEXT   = (22,  22,  58)       # #16163A  bleu marine foncé
FLASH_ARROW  = (160, 118,  8)       # #A07608  doré

# ─── Typographie ──────────────────────────────────────────────────────────────
FONT_DIR = "assets/fonts"

FONT_BLACK   = f"{FONT_DIR}/Poppins-Black.ttf"
FONT_BOLD    = f"{FONT_DIR}/Poppins-Bold.ttf"
FONT_REGULAR = f"{FONT_DIR}/Poppins-Regular.ttf"
FONT_LIGHT   = f"{FONT_DIR}/Poppins-Light.ttf"
FONT_LIGHT_I = f"{FONT_DIR}/Poppins-LightItalic.ttf"

# ─── Textes fixes (branding) ───────────────────────────────────────────────────
BRAND_VISIBLE   = "VISIBLE ET"
BRAND_CONFORME  = "CONFORME"
BRAND_AUTHOR    = "Anne-Sophie Assalit"

# ─── Calendrier de publication ─────────────────────────────────────────────────
# Format : (heure, minute)
SCHEDULE_STORY    = (8, 30)    # Lun–Sam
SCHEDULE_CAROUSEL = (9, 0)     # Lun + Jeu
SCHEDULE_FLASH    = (10, 0)    # Sam

# Jours de la semaine (0=lun … 6=dim)
STORY_DAYS    = [0, 1, 2, 3, 4, 5]   # Lun–Sam
CAROUSEL_DAYS = [0, 3]               # Lun + Jeu
FLASH_DAYS    = [5]                  # Sam
