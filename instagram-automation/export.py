"""
Export complet — génère toutes les images et les organise dans export/YYYY-MM-DD/

Usage :
  python export.py              → tout générer (carousels + flash + stories)
  python export.py --no-stories → sauter les stories (gain de temps)
  python export.py --stories-n 20 → générer seulement les 20 premières stories

Structure de sortie :
  export/
    2026-04-20/
      carousels/
        blanc_01/  slide_1.png … slide_4.png  caption.txt
        seo_01/    …
        rgpd_01/   …
      flash_posts/
        flash_01_a.png  flash_01_b.png  flash_01_caption.txt
      stories/
        story_001/ slide_1.png slide_2.png slide_3.png
      RESUME.txt   (récapitulatif de ce qui a été généré)
      export.zip   (tout en un seul fichier)
"""

import json
import shutil
import sys
import zipfile
from datetime import date
from pathlib import Path

# ── Imports générateurs ───────────────────────────────────────────────────────
from generators.carousel_blanc  import generate_blanc_carousel_set
from generators.carousel_marine import generate_marine_carousel_set
from generators.story_marine    import generate_marine_story_set
from generators.phrase_design   import generate_phrase_design_post

CONTENT_DIR = Path("content")
EXPORT_ROOT = Path("export")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _write_caption(folder: Path, caption: str) -> None:
    if caption:
        (folder / "caption.txt").write_text(caption, encoding="utf-8")


def _copy_slides(src_paths: list, dest_folder: Path) -> None:
    dest_folder.mkdir(parents=True, exist_ok=True)
    for i, src in enumerate(src_paths, 1):
        shutil.copy2(src, dest_folder / f"slide_{i}.png")


# ── Générateurs par type ──────────────────────────────────────────────────────

def export_carousels_blanc(export_dir: Path) -> int:
    out = export_dir / "carousels"
    data = json.loads((CONTENT_DIR / "carousels_blanc.json").read_text())
    count = 0
    for carousel in data:
        cid = carousel["id"]
        folder = out / f"blanc_{cid:02d}"
        tmp = Path("output/carousels")
        paths = generate_blanc_carousel_set(carousel, str(tmp))
        _copy_slides(paths, folder)
        _write_caption(folder, carousel.get("caption", ""))
        print(f"  ✓ Carousel blanc {cid}  ({len(paths)} slides)")
        count += len(paths)
    return count


def export_carousels_seo(export_dir: Path) -> int:
    out = export_dir / "carousels"
    data = json.loads((CONTENT_DIR / "carousels_seo.json").read_text())
    count = 0
    for carousel in data:
        cid = carousel["id"]
        folder = out / f"seo_{cid:02d}"
        tmp = Path("output/carousels")
        paths = generate_marine_carousel_set(carousel, str(tmp))
        _copy_slides(paths, folder)
        _write_caption(folder, carousel.get("caption", ""))
        print(f"  ✓ Carousel SEO {cid}  ({len(paths)} slides)")
        count += len(paths)
    return count


def export_carousels_rgpd(export_dir: Path) -> int:
    out = export_dir / "carousels"
    data = json.loads((CONTENT_DIR / "carousels_rgpd.json").read_text())
    count = 0
    for carousel in data:
        cid = carousel["id"]
        folder = out / f"rgpd_{cid:02d}"
        tmp = Path("output/carousels")
        paths = generate_marine_carousel_set(carousel, str(tmp))
        _copy_slides(paths, folder)
        _write_caption(folder, carousel.get("caption", ""))
        print(f"  ✓ Carousel RGPD {cid}  ({len(paths)} slides)")
        count += len(paths)
    return count


def export_flash_posts(export_dir: Path) -> int:
    out = export_dir / "flash_posts"
    out.mkdir(parents=True, exist_ok=True)
    data = json.loads((CONTENT_DIR / "flash_posts.json").read_text())
    count = 0
    for post in data:
        pid = post["id"]
        for variant, suffix in (("yellow", "a"), ("blue", "b")):
            src = generate_phrase_design_post(
                label=post.get("label", "Visible et Conforme"),
                pill_text=post["pill_text"],
                variant=variant,
                output_path=f"output/flash_posts/flash_{pid}_{suffix}.png",
            )
            shutil.copy2(src, out / f"flash_{pid:02d}_{suffix}.png")
        _write_caption(out, "")           # on écrit le caption dans un txt nommé
        cap = post.get("caption", "")
        if cap:
            (out / f"flash_{pid:02d}_caption.txt").write_text(cap, encoding="utf-8")
        print(f"  ✓ Flash post {pid}  (2 variants)")
        count += 2
    return count


def export_stories(export_dir: Path, limit: int = None) -> int:
    out = export_dir / "stories"
    data = json.loads((CONTENT_DIR / "stories_marine.json").read_text())
    if limit:
        data = data[:limit]
    count = 0
    for story in data:
        sid = story["id"]
        folder = out / f"story_{sid:03d}"
        folder.mkdir(parents=True, exist_ok=True)
        tmp_dir = Path("output/stories")
        paths = generate_marine_story_set(story, str(tmp_dir))
        for i, src in enumerate(paths, 1):
            shutil.copy2(src, folder / f"slide_{i}.png")
        # Résumé du contenu en caption
        caption_lines = []
        if story.get("poll_question"):
            caption_lines.append(f"Question : {story['poll_question']}")
        if story.get("info_text"):
            caption_lines.append(f"Info : {story['info_text']}")
        if story.get("banner_text"):
            caption_lines.append(f"Bandeau : {story['banner_text']}")
        if caption_lines:
            (folder / "caption.txt").write_text("\n".join(caption_lines), encoding="utf-8")
        if sid % 10 == 0:
            print(f"  ✓ Stories {sid}/{len(data)}…")
        count += len(paths)
    print(f"  ✓ {len(data)} stories générées")
    return count


def write_resume(export_dir: Path, stats: dict) -> None:
    lines = [
        "═══════════════════════════════════════════════",
        f"  EXPORT INSTAGRAM — {date.today().isoformat()}",
        "═══════════════════════════════════════════════",
        "",
        "CONTENU GÉNÉRÉ :",
    ]
    total = 0
    for label, n in stats.items():
        lines.append(f"  • {label:<30} {n:>4} images")
        total += n
    lines += [
        "",
        f"  TOTAL                              {total:>4} images",
        "",
        "COMMENT UTILISER :",
        "  1. Ouvre le dossier export/<date>/ sur ton ordi",
        "  2. Chaque sous-dossier = 1 publication Instagram",
        "  3. Le fichier caption.txt = le texte à copier-coller",
        "  4. Pour un carrousel : importe les slides dans l'ordre",
        "  5. Pour une story : publie chaque slide séparément",
        "     (ou utilise les 3 slides comme série de stories liées)",
        "",
        "ORDRE DE PUBLICATION SUGGÉRÉ (semaine type) :",
        "  Lundi 09h    → carousel/seo_01/",
        "  Lundi 08h30  → stories/story_001/ à story_007/",
        "  Jeudi 09h    → carousel/rgpd_01/",
        "  Samedi 10h   → flash_posts/flash_01_a.png (ou _b)",
        "",
        "═══════════════════════════════════════════════",
    ]
    (export_dir / "RESUME.txt").write_text("\n".join(lines), encoding="utf-8")


def create_zip(export_dir: Path) -> Path:
    zip_path = export_dir / "export.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in export_dir.rglob("*"):
            if f == zip_path or not f.is_file():
                continue
            zf.write(f, f.relative_to(export_dir))
    return zip_path


# ── Point d'entrée ────────────────────────────────────────────────────────────

def main() -> None:
    args = sys.argv[1:]
    skip_stories = "--no-stories" in args
    stories_n = None
    if "--stories-n" in args:
        idx = args.index("--stories-n")
        stories_n = int(args[idx + 1])

    export_dir = EXPORT_ROOT / date.today().isoformat()
    export_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n══════════════════════════════════════════")
    print(f"  Export Instagram → {export_dir}")
    print(f"══════════════════════════════════════════\n")

    stats = {}

    print("▶ Carousels BLANC…")
    stats["Carousels blanc (3)"] = export_carousels_blanc(export_dir)

    print("\n▶ Carousels SEO…")
    stats["Carousels SEO (8)"] = export_carousels_seo(export_dir)

    print("\n▶ Carousels RGPD…")
    stats["Carousels RGPD (14)"] = export_carousels_rgpd(export_dir)

    print("\n▶ Flash posts…")
    stats["Flash posts (16)"] = export_flash_posts(export_dir)

    if not skip_stories:
        label = f"Stories ({stories_n or 180})"
        print(f"\n▶ Stories… ({stories_n or 180} — peut prendre quelques minutes)")
        stats[label] = export_stories(export_dir, limit=stories_n)
    else:
        print("\n⊘ Stories ignorées (--no-stories)")

    print("\n▶ Écriture du résumé…")
    write_resume(export_dir, stats)

    print("▶ Création du ZIP…")
    zip_path = create_zip(export_dir)
    zip_mb = zip_path.stat().st_size / 1_048_576

    total = sum(stats.values())
    print(f"""
══════════════════════════════════════════
  ✓ Export terminé !
  Dossier : {export_dir}/
  ZIP     : {zip_path}  ({zip_mb:.1f} Mo)
  Total   : {total} images générées
══════════════════════════════════════════
""")


if __name__ == "__main__":
    main()
