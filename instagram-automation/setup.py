"""
Script d'installation initiale.

Lance une seule fois avant le premier démarrage :
    python setup.py

Ce script :
  1. Crée les dossiers nécessaires
  2. Télécharge les polices Poppins depuis Google Fonts (GitHub)
  3. Vérifie que le fichier .env existe
  4. Affiche la liste des prochaines étapes
"""

import os
import sys
import urllib.request
from pathlib import Path

FONTS_DIR = Path("assets/fonts")
FONTS = {
    "Poppins-Black.ttf":
        "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Black.ttf",
    "Poppins-Bold.ttf":
        "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
    "Poppins-Regular.ttf":
        "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
    "Poppins-Light.ttf":
        "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Light.ttf",
    "Poppins-LightItalic.ttf":
        "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-LightItalic.ttf",
}

DIRS = [
    "assets/fonts",
    "assets/stickers",
    "output/stories",
    "output/carousels",
    "output/flash_posts",
    "logs",
    "content",
]


def create_dirs() -> None:
    print("1. Création des dossiers…")
    for d in DIRS:
        Path(d).mkdir(parents=True, exist_ok=True)
        print(f"   ✓ {d}")


def download_fonts() -> None:
    print("\n2. Téléchargement des polices Poppins…")
    for filename, url in FONTS.items():
        dest = FONTS_DIR / filename
        if dest.exists():
            print(f"   ✓ {filename} (déjà présent)")
            continue
        print(f"   ↓ {filename}…", end=" ", flush=True)
        try:
            urllib.request.urlretrieve(url, dest)
            print("OK")
        except Exception as e:
            print(f"ERREUR ({e})")
            print(f"     → Téléchargez manuellement depuis : {url}")


def check_env() -> None:
    print("\n3. Vérification du fichier .env…")
    env_path = Path(".env")
    example  = Path(".env.example")

    if env_path.exists():
        print("   ✓ .env présent")
    else:
        if example.exists():
            import shutil
            shutil.copy(example, env_path)
            print("   ✓ .env créé depuis .env.example — remplissez les valeurs !")
        else:
            print("   ✗ .env manquant — créez-le en vous basant sur .env.example")


def print_next_steps() -> None:
    print("""
╔══════════════════════════════════════════════════════════════╗
║                    PROCHAINES ÉTAPES                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Remplissez le fichier .env avec vos identifiants :       ║
║     • INSTAGRAM_ACCESS_TOKEN                                 ║
║     • INSTAGRAM_ACCOUNT_ID                                   ║
║     • CLOUDINARY_CLOUD_NAME                                  ║
║     • CLOUDINARY_API_KEY                                     ║
║     • CLOUDINARY_API_SECRET                                  ║
║                                                              ║
║  2. Lisez SETUP_META_API.md pour obtenir les tokens Meta     ║
║                                                              ║
║  3. Testez la génération d'images :                          ║
║     python main.py --test story                              ║
║     python main.py --test carousel                           ║
║     python main.py --test flash                              ║
║                                                              ║
║  4. Testez la publication (optionnel) :                      ║
║     python main.py --publish story                           ║
║                                                              ║
║  5. Lancez le scheduler en production :                      ║
║     python main.py                                           ║
║     (ou : nohup python main.py > logs/run.log 2>&1 &)        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")


if __name__ == "__main__":
    print("══════════════════════════════════════════")
    print("  Instagram Automation — Installation")
    print("══════════════════════════════════════════\n")
    create_dirs()
    download_fonts()
    check_env()
    print_next_steps()
    print("Installation terminée ✓")
