"""
Planificateur automatique de publications Instagram.

Calendrier :
  • Lun–Sam  08h30 → Story (3 slides)
  • Lun + Jeu 09h00 → Carousel
  • Sam       10h00 → Post flash

Utilise APScheduler avec un job store SQLite pour survivre aux redémarrages.
"""

import json
import logging
import os
import sys
import tempfile
from pathlib import Path

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from dotenv import load_dotenv

from config import (
    SCHEDULE_STORY, SCHEDULE_CAROUSEL, SCHEDULE_FLASH,
    STORY_DAYS, CAROUSEL_DAYS, FLASH_DAYS,
)
from generators.story    import generate_story_set
from generators.carousel import generate_carousel_set
from generators.flash    import generate_flash_post
from api.storage         import upload_image, delete_image
from api.instagram       import publish_story_set, publish_carousel, publish_photo

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("logs/scheduler.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

STATE_FILE    = Path("state.json")
CONTENT_DIR   = Path("content")


# ─── Gestion de l'état (index de rotation du contenu) ──────────────────────

def _read_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"story_index": 0, "carousel_index": 0, "flash_index": 0}


def _write_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


def _next_item(content_list: list, index: int) -> tuple:
    """Retourne (item, next_index) en bouclant sur la liste."""
    item = content_list[index % len(content_list)]
    return item, (index + 1) % len(content_list)


def _load_json(filename: str) -> list:
    path = CONTENT_DIR / filename
    return json.loads(path.read_text(encoding="utf-8"))


# ─── Jobs de publication ────────────────────────────────────────────────────

def job_story() -> None:
    """Génère et publie les 3 slides de la story du jour."""
    log.info("▶ JOB STORY démarré")
    try:
        state    = _read_state()
        stories  = _load_json("stories.json")
        story, next_idx = _next_item(stories, state["story_index"])

        # 1. Générer les images
        slide_paths = generate_story_set(story)
        log.info(f"  ✓ Images générées : {[str(p) for p in slide_paths]}")

        # 2. Uploader vers Cloudinary
        uploaded = []
        for i, path in enumerate(slide_paths):
            pub_id = f"story_{story['id']}_slide{i+1}"
            url = upload_image(path, public_id=pub_id)
            uploaded.append((url, pub_id))
            log.info(f"  ✓ Upload slide {i+1} : {url}")

        # 3. Publier sur Instagram (une story à la fois)
        urls = [u for u, _ in uploaded]
        ids  = publish_story_set(urls)
        log.info(f"  ✓ Stories publiées : {ids}")

        # 4. Nettoyage Cloudinary (optionnel)
        for _, pub_id in uploaded:
            try:
                delete_image(pub_id)
            except Exception:
                pass

        # 5. Mettre à jour l'état
        state["story_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ État mis à jour. Prochain story index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR story : {exc}", exc_info=True)


def job_carousel() -> None:
    """Génère et publie le carousel du jour."""
    log.info("▶ JOB CAROUSEL démarré")
    try:
        state      = _read_state()
        carousels  = _load_json("carousels.json")
        carousel, next_idx = _next_item(carousels, state["carousel_index"])

        # 1. Générer les images
        slide_paths = generate_carousel_set(carousel)
        log.info(f"  ✓ Images générées : {len(slide_paths)} slides")

        # 2. Uploader
        urls = []
        pub_ids = []
        for i, path in enumerate(slide_paths):
            pub_id = f"carousel_{carousel['id']}_slide{i}"
            url = upload_image(path, public_id=pub_id)
            urls.append(url)
            pub_ids.append(pub_id)
            log.info(f"  ✓ Upload slide {i} : {url}")

        # 3. Publier
        post_id = publish_carousel(urls, caption=carousel.get("caption", ""))
        log.info(f"  ✓ Carousel publié : {post_id}")

        # 4. Nettoyage
        for pub_id in pub_ids:
            try:
                delete_image(pub_id)
            except Exception:
                pass

        # 5. État
        state["carousel_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ État mis à jour. Prochain carousel index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR carousel : {exc}", exc_info=True)


def job_flash() -> None:
    """Génère et publie le post flash du samedi."""
    log.info("▶ JOB FLASH démarré")
    try:
        state       = _read_state()
        flash_posts = _load_json("flash_posts.json")
        post, next_idx = _next_item(flash_posts, state["flash_index"])

        # 1. Générer l'image
        path = generate_flash_post(
            text=post["text"],
            output_path=f"output/flash_posts/flash_{post['id']}.png",
        )
        log.info(f"  ✓ Image générée : {path}")

        # 2. Uploader
        pub_id = f"flash_{post['id']}"
        url = upload_image(path, public_id=pub_id)
        log.info(f"  ✓ Upload : {url}")

        # 3. Publier
        post_id = publish_photo(url, caption=post.get("caption", ""))
        log.info(f"  ✓ Post flash publié : {post_id}")

        # 4. Nettoyage
        try:
            delete_image(pub_id)
        except Exception:
            pass

        # 5. État
        state["flash_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ État mis à jour. Prochain flash index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR flash : {exc}", exc_info=True)


# ─── Configuration du scheduler ─────────────────────────────────────────────

def build_scheduler() -> BlockingScheduler:
    jobstores = {
        "default": SQLAlchemyJobStore(url="sqlite:///logs/jobs.db")
    }
    scheduler = BlockingScheduler(jobstores=jobstores, timezone="Europe/Paris")

    story_h, story_m = SCHEDULE_STORY
    # Stories : Lun(0)–Sam(5) — APScheduler utilise 0=lun … 6=dim
    scheduler.add_job(
        job_story,
        trigger="cron",
        day_of_week="mon-sat",
        hour=story_h,
        minute=story_m,
        id="story",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    carousel_h, carousel_m = SCHEDULE_CAROUSEL
    # Carousels : Lun + Jeu
    scheduler.add_job(
        job_carousel,
        trigger="cron",
        day_of_week="mon,thu",
        hour=carousel_h,
        minute=carousel_m,
        id="carousel",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    flash_h, flash_m = SCHEDULE_FLASH
    # Flash : Sam
    scheduler.add_job(
        job_flash,
        trigger="cron",
        day_of_week="sat",
        hour=flash_h,
        minute=flash_m,
        id="flash",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    return scheduler


if __name__ == "__main__":
    log.info("═══════════════════════════════════════")
    log.info("  Instagram Automation — Démarrage")
    log.info("═══════════════════════════════════════")
    scheduler = build_scheduler()
    log.info("Planification active :")
    for job in scheduler.get_jobs():
        log.info(f"  • {job.id} → {job.next_run_time}")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("Scheduler arrêté proprement.")
