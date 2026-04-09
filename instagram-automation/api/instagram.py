"""
Client Instagram Graph API.

Flux de publication :
  - Post photo unique  : create_media_container → publish_media
  - Carousel           : create_media_container (chaque image) → create_carousel_container → publish_media
  - Story              : create_media_container (media_type=STORIES) → publish_media

Documentation : https://developers.facebook.com/docs/instagram-api/reference/ig-user/media
"""

import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://graph.facebook.com/v19.0"


def _ig_user_id() -> str:
    return os.environ["INSTAGRAM_ACCOUNT_ID"]


def _token() -> str:
    return os.environ["INSTAGRAM_ACCESS_TOKEN"]


def _post(endpoint: str, data: dict) -> dict:
    """POST vers l'API Graph et lève une exception en cas d'erreur."""
    url = f"{BASE_URL}/{endpoint}"
    data["access_token"] = _token()
    resp = requests.post(url, data=data, timeout=30)
    body = resp.json()
    if "error" in body:
        raise RuntimeError(f"Instagram API error: {body['error']}")
    return body


def _wait_for_media(creation_id: str, max_attempts: int = 10) -> None:
    """Attend que le conteneur média soit prêt (status = FINISHED)."""
    for attempt in range(max_attempts):
        url = f"{BASE_URL}/{creation_id}"
        resp = requests.get(url, params={
            "fields": "status_code",
            "access_token": _token(),
        }, timeout=15)
        status = resp.json().get("status_code", "")
        if status == "FINISHED":
            return
        if status == "ERROR":
            raise RuntimeError(f"Média {creation_id} en erreur.")
        time.sleep(3 + attempt * 2)
    raise TimeoutError(f"Délai dépassé pour le média {creation_id}.")


# ─── Publication d'un post photo unique ─────────────────────────────────────

def publish_photo(image_url: str, caption: str) -> str:
    """
    Publie une photo sur le feed Instagram.

    Args:
        image_url : URL publique de l'image (Cloudinary).
        caption   : Légende du post.

    Returns:
        ID du post publié.
    """
    uid = _ig_user_id()

    # Étape 1 : créer le conteneur
    container = _post(f"{uid}/media", {
        "image_url": image_url,
        "caption": caption,
    })
    creation_id = container["id"]

    # Attendre que l'image soit traitée
    _wait_for_media(creation_id)

    # Étape 2 : publier
    result = _post(f"{uid}/media_publish", {"creation_id": creation_id})
    return result["id"]


# ─── Publication d'une story ─────────────────────────────────────────────────

def publish_story(image_url: str) -> str:
    """
    Publie une image en story Instagram.

    Args:
        image_url : URL publique de l'image.

    Returns:
        ID de la story publiée.
    """
    uid = _ig_user_id()

    # Story = photo avec media_type STORIES
    container = _post(f"{uid}/media", {
        "image_url": image_url,
        "media_type": "STORIES",
    })
    creation_id = container["id"]
    _wait_for_media(creation_id)

    result = _post(f"{uid}/media_publish", {"creation_id": creation_id})
    return result["id"]


# ─── Publication d'un carousel ───────────────────────────────────────────────

def publish_carousel(image_urls: list[str], caption: str) -> str:
    """
    Publie un carousel Instagram.

    Args:
        image_urls : Liste d'URL publiques des slides (max 10).
        caption    : Légende du carousel.

    Returns:
        ID du carousel publié.
    """
    uid = _ig_user_id()

    # Étape 1 : créer un conteneur pour chaque image
    children_ids = []
    for url in image_urls:
        item = _post(f"{uid}/media", {
            "image_url": url,
            "is_carousel_item": "true",
        })
        _wait_for_media(item["id"])
        children_ids.append(item["id"])

    # Étape 2 : créer le conteneur carousel
    carousel = _post(f"{uid}/media", {
        "media_type": "CAROUSEL",
        "children": ",".join(children_ids),
        "caption": caption,
    })
    creation_id = carousel["id"]
    _wait_for_media(creation_id)

    # Étape 3 : publier
    result = _post(f"{uid}/media_publish", {"creation_id": creation_id})
    return result["id"]


# ─── Publication des stories (série de 3 slides) ────────────────────────────

def publish_story_set(image_urls: list[str]) -> list[str]:
    """
    Publie une série de slides en stories (une par une, Instagram ne supporte
    pas les carousel stories via l'API).

    Returns:
        Liste des IDs publiés.
    """
    ids = []
    for url in image_urls:
        story_id = publish_story(url)
        ids.append(story_id)
        time.sleep(2)  # légère pause entre les stories
    return ids
