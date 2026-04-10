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

# Police principale — Montserrat
FONT_BLACK   = f"{FONT_DIR}/Montserrat-Black.ttf"
FONT_BOLD    = f"{FONT_DIR}/Montserrat-Bold.ttf"
FONT_REGULAR = f"{FONT_DIR}/Montserrat-Regular.ttf"
FONT_LIGHT   = f"{FONT_DIR}/Montserrat-Light.ttf"
FONT_LIGHT_I = f"{FONT_DIR}/Montserrat-LightItalic.ttf"

# Polices spéciales (bandeau slide 3)
FONT_ARIMO   = f"{FONT_DIR}/Arimo-Regular.ttf"      # haut du bandeau
FONT_SERIF_I = f"{FONT_DIR}/Cormorant-Italic.ttf"   # signature bas bandeau (serif élégant)

# ─── Textes fixes (branding) ───────────────────────────────────────────────────
BRAND_VISIBLE   = "VISIBLE ET"
BRAND_CONFORME  = "CONFORME"
BRAND_AUTHOR    = "Anne-Sophie Assalit"

# ─── Palette exacte (tous les formats) ───────────────────────────────────────
# Fond dégradé radial (centre blanc → bords rose) — utilisé partout
GRAD_CENTER  = (255, 255, 255)      # #ffffff  centre blanc
GRAD_EDGE    = (207, 144, 144)      # #cf9090  bords rose

# Texte principal sur fond rose
BRAND_BLUE   = (30,  78,  121)      # #1e4e79  bleu foncé

# Pilules dégradées (CTA stories, flash posts "phrase design")
PILL_LEFT    = (148, 185, 255)      # #94b9ff  bleu ciel
PILL_RIGHT   = (232, 148, 255)      # #e894ff  violet/lilas

# Bandeau jaune (slide 3 stories, accents carousels)
YELLOW_LEFT  = (255, 255, 218)      # #ffffda  jaune pâle
YELLOW_RIGHT = (255, 250, 120)      # #fffa78  jaune vif
YELLOW_TEXT  = (30,  78,  121)      # #1e4e79  bleu foncé sur jaune

# ─── Calendrier de publication — Planning complet 16 semaines ─────────────────
# Format : (heure, minute)
SCHEDULE_STORY           = (8, 30)   # Lun–Dim (7 semaines, 50 stories)
SCHEDULE_CAROUSEL_SEO    = (9, 0)    # Lun      (semaines 1–8)
SCHEDULE_CAROUSEL_RGPD   = (9, 0)    # Jeu      (semaines 3–16)
SCHEDULE_FLASH           = (10, 0)   # Sam      (semaines 1–16)

# Jours de la semaine APScheduler (0=lun … 6=dim)
STORY_DAYS    = [0, 1, 2, 3, 4, 5, 6]  # Lun–Dim (7j/7)
CAROUSEL_SEO_DAY  = 0                  # Lundi
CAROUSEL_RGPD_DAY = 3                  # Jeudi
FLASH_DAYS    = [5]                     # Samedi

# ─── Tagline auteure ──────────────────────────────────────────────────────────
BRAND_TAGLINE = "L'alliance du SEO local et de la rigueur juridique pour une visibilité conforme et maîtrisée."
