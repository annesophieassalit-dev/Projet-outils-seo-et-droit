"""
Point d'entrée principal.

Usage :
  python main.py                   → Lance le scheduler (mode production)
  python main.py --test story      → Génère et affiche une story sans publier
  python main.py --test carousel   → Génère et affiche un carousel sans publier
  python main.py --test flash      → Génère et affiche un flash sans publier
  python main.py --publish story   → Publie immédiatement une story
  python main.py --publish carousel→ Publie immédiatement un carousel
  python main.py --publish flash   → Publie immédiatement un flash
"""

import sys
import json
import logging
import os
from pathlib import Path

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


def cmd_test(content_type: str) -> None:
    """Génère les images sans les publier et ouvre la première."""
    from generators.story    import generate_story_set
    from generators.carousel import generate_carousel_set
    from generators.flash    import generate_flash_post

    content_dir = Path("content")

    if content_type == "story":
        stories = json.loads((content_dir / "stories.json").read_text())
        story   = stories[0]
        paths   = generate_story_set(story)
        log.info(f"✓ Story générée ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "carousel":
        carousels = json.loads((content_dir / "carousels.json").read_text())
        carousel  = carousels[0]
        paths     = generate_carousel_set(carousel)
        log.info(f"✓ Carousel généré ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "flash":
        posts = json.loads((content_dir / "flash_posts.json").read_text())
        post  = posts[0]
        path  = generate_flash_post(post["text"])
        log.info(f"✓ Flash post généré : {path}")

    else:
        log.error(f"Type inconnu : {content_type}. Choisissez : story, carousel, flash")
        sys.exit(1)


def cmd_publish(content_type: str) -> None:
    """Publication immédiate (sans attendre le scheduler)."""
    from scheduler import job_story, job_carousel, job_flash

    if content_type == "story":
        job_story()
    elif content_type == "carousel":
        job_carousel()
    elif content_type == "flash":
        job_flash()
    else:
        log.error(f"Type inconnu : {content_type}.")
        sys.exit(1)


def cmd_run() -> None:
    """Lance le scheduler en mode bloquant (production)."""
    from scheduler import build_scheduler
    log.info("Démarrage du scheduler en mode production…")
    scheduler = build_scheduler()
    scheduler.start()


if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        cmd_run()

    elif len(args) == 2 and args[0] == "--test":
        cmd_test(args[1])

    elif len(args) == 2 and args[0] == "--publish":
        cmd_publish(args[1])

    else:
        print(__doc__)
        sys.exit(0)
