#!/usr/bin/env python3
"""Render website preview images from the real product PDFs.

    python3 scripts/previews.py

Builds the A4 planner and printables into a temporary folder, renders chosen pages,
and writes WebP previews plus composed product images into src/static/assets/.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "products"))
import planner  # noqa: E402
import printables  # noqa: E402

OUT = ROOT / "src/static/assets"
PAPER_BG = (243, 239, 229)

PREVIEWS = {
    "weekly-focus-planner": [
        ("planner", 3, "Weekly plan: focus, top three outcomes, deadlines and a box for each day"),
        ("planner", 4, "Daily priorities and task list, with an hour-by-hour schedule"),
        ("planner", 5, "Habit tracker for up to 12 habits across a month"),
        ("planner", 6, "Weekly review: what got done, what slipped, ratings and next week's top three"),
        ("planner", 2, "How to use and print the planner"),
    ],
    "project-workflow-bundle": [
        ("printables", 2, "Monthly overview (printable)"),
        ("printables", 3, "12-week project timeline (printable)"),
        ("printables", 4, "Weekly task-management checklist (printable)"),
        ("planner", 3, "Weekly plan from the included Weekly Focus Planner"),
        ("planner", 4, "Daily priorities page from the included Weekly Focus Planner"),
    ],
}


def render(pdf: Path, prefix: Path, dpi: int = 130) -> None:
    subprocess.run(["pdftoppm", "-r", str(dpi), "-png", str(pdf), str(prefix)], check=True)


def page_png(tmp: Path, name: str, page: int) -> Image.Image:
    matches = sorted(tmp.glob(f"{name}-*{page}.png"))
    exact = [m for m in matches if m.stem.split("-")[-1].lstrip("0") == str(page)]
    return Image.open(exact[0]).convert("RGB")


def framed(img: Image.Image, width: int) -> Image.Image:
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    border = Image.new("RGB", (img.width + 2, img.height + 2), (214, 210, 200))
    border.paste(img, (1, 1))
    return border


def shadowed(page: Image.Image, angle: float) -> Image.Image:
    pad = 40
    canvas = Image.new("RGBA", (page.width + pad * 2, page.height + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle([pad + 6, pad + 10, pad + page.width + 6, pad + page.height + 10], fill=(60, 50, 30, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(shadow)
    canvas.paste(page, (pad, pad))
    return canvas.rotate(angle, resample=Image.BICUBIC, expand=True)


def compose(pages: list[tuple[Image.Image, int, float, tuple[int, int]]], size: tuple[int, int]) -> Image.Image:
    bg = Image.new("RGBA", size, PAPER_BG + (255,))
    for img, width, angle, (x, y) in pages:
        p = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
        bg.alpha_composite(shadowed(p, angle), (x, y))
    return bg.convert("RGB")


def main() -> None:
    (OUT / "previews").mkdir(parents=True, exist_ok=True)
    (OUT / "img").mkdir(parents=True, exist_ok=True)
    data = {}
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        a = planner.build(tmp, "A4", 2026)
        b = printables.build_printables(tmp, "A4", 2026)
        render(tmp / a["file"], tmp / "planner")
        render(tmp / b["file"], tmp / "printables")
        data["pages"] = {"weekly-focus-planner": a["pages"], "printables": b["pages"]}
        data["previews"] = {}
        for slug, items in PREVIEWS.items():
            out = []
            for i, (doc, page, caption) in enumerate(items, start=1):
                img = framed(page_png(tmp, doc, page), 900 if page_png(tmp, doc, page).width < page_png(tmp, doc, page).height else 1100)
                name = f"{slug}-{i}.webp"
                img.save(OUT / "previews" / name, "WEBP", quality=82, method=6)
                out.append({"src": f"/assets/previews/{name}", "width": img.width, "height": img.height, "caption": caption})
            data["previews"][slug] = out

        weekly = page_png(tmp, "planner", 3)
        daily = page_png(tmp, "planner", 4)
        review = page_png(tmp, "planner", 6)
        habit = page_png(tmp, "planner", 5)
        month = page_png(tmp, "printables", 2)
        check = page_png(tmp, "printables", 4)
        cover = page_png(tmp, "planner", 1)

        hero = compose([(review, 430, 6, (620, 60)), (daily, 450, -4, (40, 40)), (weekly, 470, 1.5, (300, 20))], (1200, 900))
        hero.save(OUT / "img/hero.webp", "WEBP", quality=80, method=6)
        hero.convert("RGB").save(OUT / "img/og-image.jpg", "JPEG", quality=82, optimize=True)

        card_a = compose([(daily, 380, 4, (400, 40)), (cover, 380, -3, (60, 60)), (weekly, 400, 1, (230, 20))], (1000, 750))
        card_a.save(OUT / "img/weekly-focus-planner.webp", "WEBP", quality=80, method=6)
        card_b = compose([(check, 360, 4, (560, 40)), (weekly, 360, -4, (40, 60)), (month, 560, 1, (200, 120))], (1000, 750))
        card_b.save(OUT / "img/project-workflow-bundle.webp", "WEBP", quality=80, method=6)
        for slug, img in (("weekly-focus-planner", card_a), ("project-workflow-bundle", card_b)):
            og = img.resize((1200, 900), Image.LANCZOS).crop((0, 135, 1200, 765))
            og.save(OUT / f"img/og-{slug}.jpg", "JPEG", quality=82, optimize=True)
        habit_img = framed(habit, 1100)
        habit_img.save(OUT / "previews/habit-wide.webp", "WEBP", quality=82, method=6)

    (ROOT / "src/data/previews.json").write_text(json.dumps(data, indent=2) + "\n")
    print("Wrote previews for", ", ".join(data["previews"]))


if __name__ == "__main__":
    main()
