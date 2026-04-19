"""
Point d'entrée principal.

Usage :
  python main.py                        → Lance le scheduler (mode production)
  python main.py --test story           → Génère une story sans publier
  python main.py --test carousel-seo    → Génère un carousel SEO sans publier
  python main.py --test carousel-rgpd   → Génère un carousel RGPD sans publier
  python main.py --test carousel-blanc  → Génère un carousel blanc sans publier
  python main.py --test flash           → Génère un post flash sans publier
  python main.py --publish story        → Publie immédiatement une story
  python main.py --publish carousel-seo → Publie immédiatement un carousel SEO
  python main.py --publish carousel-rgpd→ Publie immédiatement un carousel RGPD
  python main.py --publish flash        → Publie immédiatement un flash
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
    """Génère les images sans les publier."""
    from generators.story_marine    import generate_marine_story_set
    from generators.carousel_marine import generate_marine_carousel_set
    from generators.phrase_design   import generate_phrase_design_post

    content_dir = Path("content")

    if content_type == "story":
        stories = json.loads((content_dir / "stories_marine.json").read_text())
        story   = stories[0]
        paths   = generate_marine_story_set(story)
        log.info(f"✓ Story générée ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "carousel-seo":
        carousels = json.loads((content_dir / "carousels_seo.json").read_text())
        carousel  = carousels[0]
        paths     = generate_marine_carousel_set(carousel)
        log.info(f"✓ Carousel SEO généré ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "carousel-rgpd":
        carousels = json.loads((content_dir / "carousels_rgpd.json").read_text())
        carousel  = carousels[0]
        paths     = generate_marine_carousel_set(carousel)
        log.info(f"✓ Carousel RGPD généré ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "carousel-blanc":
        carousels = json.loads((content_dir / "carousels_blanc.json").read_text())
        carousel  = carousels[0]
        paths     = generate_marine_carousel_set(carousel)
        log.info(f"✓ Carousel blanc généré ({len(paths)} slides) :")
        for p in paths:
            log.info(f"    {p}")

    elif content_type == "flash":
        posts = json.loads((content_dir / "flash_posts.json").read_text())
        post  = posts[0]
        for variant in ("yellow", "blue"):
            suffix = "a" if variant == "yellow" else "b"
            path = generate_phrase_design_post(
                label=post.get("label", "Visible et Conforme"),
                pill_text=post["pill_text"],
                variant=variant,
                output_path=f"output/flash_posts/phrase_{suffix}.png",
            )
            log.info(f"✓ Flash post {variant} généré : {path}")

    else:
        log.error(f"Type inconnu : {content_type}. Choisissez : story, carousel-seo, carousel-rgpd, carousel-blanc, flash")
        sys.exit(1)


def cmd_publish(content_type: str) -> None:
    """Publication immédiate (sans attendre le scheduler)."""
    from scheduler import job_story, job_carousel_seo, job_carousel_rgpd, job_flash

    if content_type == "story":
        job_story()
    elif content_type == "carousel-seo":
        job_carousel_seo()
    elif content_type == "carousel-rgpd":
        job_carousel_rgpd()
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
