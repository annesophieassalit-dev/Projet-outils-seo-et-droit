"""
Upload d'images vers Cloudinary pour obtenir une URL publique temporaire.
L'Instagram Graph API nécessite une URL publique pour chaque image.

Prérequis :
    pip install cloudinary
    Variables d'environnement : CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
"""

import os
from typing import Optional
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

_configured = False


def _configure() -> None:
    global _configured
    if _configured:
        return
    cloudinary.config(
        cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
        api_key=os.environ["CLOUDINARY_API_KEY"],
        api_secret=os.environ["CLOUDINARY_API_SECRET"],
        secure=True,
    )
    _configured = True


def upload_image(local_path: str, public_id: Optional[str] = None) -> str:
    """
    Upload une image locale vers Cloudinary.

    Args:
        local_path : Chemin local vers l'image .png
        public_id  : Identifiant public Cloudinary (optionnel, auto-généré sinon)

    Returns:
        URL publique sécurisée de l'image.
    """
    _configure()
    result = cloudinary.uploader.upload(
        local_path,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        folder="instagram-automation",
    )
    return result["secure_url"]


def delete_image(public_id: str) -> None:
    """Supprime une image Cloudinary après publication (optionnel, pour garder le quota propre)."""
    _configure()
    cloudinary.uploader.destroy(f"instagram-automation/{public_id}")
