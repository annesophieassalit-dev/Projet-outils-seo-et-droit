"""
Planificateur automatique de publications Instagram — planning 16 semaines.

Calendrier :
  • Lun–Dim  08h30 → Story marine (50 stories, 7 semaines)
  • Lun      09h00 → Carousel SEO sémantique (semaines 1–8)
  • Jeu      09h00 → Carousel RGPD (semaines 3–16)
  • Sam      10h00 → Post phrase design (semaines 1–16)

Utilise APScheduler avec un job store SQLite pour survivre aux redémarrages.
"""

import json
import logging
import os
import sys
from pathlib import Path

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from dotenv import load_dotenv

from config import (
    SCHEDULE_STORY, SCHEDULE_CAROUSEL_SEO, SCHEDULE_CAROUSEL_RGPD, SCHEDULE_FLASH,
    STORY_DAYS, CAROUSEL_SEO_DAY, CAROUSEL_RGPD_DAY, FLASH_DAYS,
)
from generators.story_marine    import generate_marine_story_set
from generators.carousel_marine import generate_marine_carousel_set
from generators.phrase_design   import generate_phrase_design_post
from api.storage                import upload_image, delete_image
from api.instagram              import publish_story_set, publish_carousel, publish_photo

load_dotenv()

os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("logs/scheduler.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

STATE_FILE  = Path("state.json")
CONTENT_DIR = Path("content")


# ─── Gestion de l'état ──────────────────────────────────────────────────────

def _read_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {
        "story_index": 0,
        "carousel_seo_index": 0,
        "carousel_rgpd_index": 0,
        "flash_index": 0,
    }


def _write_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


def _next_item(content_list: list, index: int) -> tuple:
    item = content_list[index % len(content_list)]
    return item, (index + 1) % len(content_list)


def _load_json(filename: str) -> list:
    path = CONTENT_DIR / filename
    return json.loads(path.read_text(encoding="utf-8"))


# ─── Jobs ───────────────────────────────────────────────────────────────────

def job_story() -> None:
    log.info("▶ JOB STORY démarré")
    try:
        state   = _read_state()
        stories = _load_json("stories_marine.json")
        story, next_idx = _next_item(stories, state["story_index"])

        slide_paths = generate_marine_story_set(story)
        log.info(f"  ✓ Images générées : {len(slide_paths)} slides")

        uploaded = []
        for i, path in enumerate(slide_paths):
            pub_id = f"story_{story['id']}_slide{i+1}"
            url = upload_image(path, public_id=pub_id)
            uploaded.append((url, pub_id))
            log.info(f"  ✓ Upload slide {i+1} : {url}")

        urls = [u for u, _ in uploaded]
        ids  = publish_story_set(urls)
        log.info(f"  ✓ Stories publiées : {ids}")

        for _, pub_id in uploaded:
            try:
                delete_image(pub_id)
            except Exception:
                pass

        state["story_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ Prochain story index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR story : {exc}", exc_info=True)


def job_carousel_seo() -> None:
    log.info("▶ JOB CAROUSEL SEO démarré")
    try:
        state     = _read_state()
        carousels = _load_json("carousels_seo.json")
        carousel, next_idx = _next_item(carousels, state["carousel_seo_index"])

        slide_paths = generate_marine_carousel_set(carousel)
        log.info(f"  ✓ Images générées : {len(slide_paths)} slides")

        urls, pub_ids = [], []
        for i, path in enumerate(slide_paths):
            pub_id = f"carousel_seo_{carousel['id']}_slide{i}"
            url = upload_image(path, public_id=pub_id)
            urls.append(url)
            pub_ids.append(pub_id)
            log.info(f"  ✓ Upload slide {i} : {url}")

        post_id = publish_carousel(urls, caption=carousel.get("caption", ""))
        log.info(f"  ✓ Carousel SEO publié : {post_id}")

        for pub_id in pub_ids:
            try:
                delete_image(pub_id)
            except Exception:
                pass

        state["carousel_seo_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ Prochain carousel SEO index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR carousel SEO : {exc}", exc_info=True)


def job_carousel_rgpd() -> None:
    log.info("▶ JOB CAROUSEL RGPD démarré")
    try:
        state     = _read_state()
        carousels = _load_json("carousels_rgpd.json")
        carousel, next_idx = _next_item(carousels, state["carousel_rgpd_index"])

        slide_paths = generate_marine_carousel_set(carousel)
        log.info(f"  ✓ Images générées : {len(slide_paths)} slides")

        urls, pub_ids = [], []
        for i, path in enumerate(slide_paths):
            pub_id = f"carousel_rgpd_{carousel['id']}_slide{i}"
            url = upload_image(path, public_id=pub_id)
            urls.append(url)
            pub_ids.append(pub_id)
            log.info(f"  ✓ Upload slide {i} : {url}")

        post_id = publish_carousel(urls, caption=carousel.get("caption", ""))
        log.info(f"  ✓ Carousel RGPD publié : {post_id}")

        for pub_id in pub_ids:
            try:
                delete_image(pub_id)
            except Exception:
                pass

        state["carousel_rgpd_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ Prochain carousel RGPD index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR carousel RGPD : {exc}", exc_info=True)


def job_flash() -> None:
    log.info("▶ JOB FLASH démarré")
    try:
        state       = _read_state()
        flash_posts = _load_json("flash_posts.json")
        post, next_idx = _next_item(flash_posts, state["flash_index"])

        path = generate_phrase_design_post(
            main_text=post["main_text"],
            pill_text=post["pill_text"],
            label=post.get("label", "Visible et Conforme"),
            output_path=f"output/flash_posts/flash_{post['id']}.png",
        )
        log.info(f"  ✓ Image générée : {path}")

        pub_id = f"flash_{post['id']}"
        url = upload_image(path, public_id=pub_id)
        log.info(f"  ✓ Upload : {url}")

        post_id = publish_photo(url, caption=post.get("caption", ""))
        log.info(f"  ✓ Post flash publié : {post_id}")

        try:
            delete_image(pub_id)
        except Exception:
            pass

        state["flash_index"] = next_idx
        _write_state(state)
        log.info(f"  ✓ Prochain flash index : {next_idx}")

    except Exception as exc:
        log.error(f"  ✗ ERREUR flash : {exc}", exc_info=True)


# ─── Configuration du scheduler ─────────────────────────────────────────────

def build_scheduler() -> BlockingScheduler:
    os.makedirs("logs", exist_ok=True)
    jobstores = {
        "default": SQLAlchemyJobStore(url="sqlite:///logs/jobs.db")
    }
    scheduler = BlockingScheduler(jobstores=jobstores, timezone="Europe/Paris")

    story_h, story_m = SCHEDULE_STORY
    # Stories : Lun–Dim (0–6)
    scheduler.add_job(
        job_story,
        trigger="cron",
        day_of_week="mon-sun",
        hour=story_h,
        minute=story_m,
        id="story",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    seo_h, seo_m = SCHEDULE_CAROUSEL_SEO
    # Carousels SEO : Lundi
    scheduler.add_job(
        job_carousel_seo,
        trigger="cron",
        day_of_week="mon",
        hour=seo_h,
        minute=seo_m,
        id="carousel_seo",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    rgpd_h, rgpd_m = SCHEDULE_CAROUSEL_RGPD
    # Carousels RGPD : Jeudi
    scheduler.add_job(
        job_carousel_rgpd,
        trigger="cron",
        day_of_week="thu",
        hour=rgpd_h,
        minute=rgpd_m,
        id="carousel_rgpd",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    flash_h, flash_m = SCHEDULE_FLASH
    # Flash : Samedi
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
