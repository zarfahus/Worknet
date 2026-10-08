#!/usr/bin/env python3
"""Generate brand images for the website: favicon.ico and the default social-sharing image."""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "products"))
from render import logo_png  # noqa: E402

STATIC = os.path.join(ROOT, "src", "static")
FONTS = os.path.join(ROOT, "products", "fonts")
tmp = os.path.join(STATIC, "assets", "brand", "_logo.png")
logo_png(tmp, 512)
logo = Image.open(tmp).convert("RGBA")
logo.resize((64, 64), Image.LANCZOS).save(os.path.join(STATIC, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

W, H = 1200, 630
img = Image.new("RGB", (W, H), (238, 241, 246))
d = ImageDraw.Draw(img)
semi = ImageFont.truetype(os.path.join(FONTS, "Inter-SemiBold.ttf"), 64)
med = ImageFont.truetype(os.path.join(FONTS, "Inter-Medium.ttf"), 30)
reg = ImageFont.truetype(os.path.join(FONTS, "Inter-Regular.ttf"), 30)
img.paste(logo.resize((88, 88), Image.LANCZOS), (90, 90), logo.resize((88, 88), Image.LANCZOS))
d.text((198, 112), "WorkNest Studio", font=med, fill=(31, 42, 68))
d.text((90, 250), "Simple templates for", font=semi, fill=(31, 42, 68))
d.text((90, 330), "better organized work.", font=semi, fill=(31, 42, 68))
d.text((90, 450), "Planners · Meeting notes · Content calendars · Workflow toolkits", font=reg, fill=(91, 100, 114))
d.rectangle([0, H - 14, W, H], fill=(31, 42, 68))
img.save(os.path.join(STATIC, "assets", "brand", "og-default.jpg"), "JPEG", quality=88, optimize=True)
os.remove(tmp)
print("brand assets written")


def hero_pages():
    """Hero image: three real template pages, slightly fanned, on a transparent background."""
    from PIL import ImageFilter
    prev = os.path.join(STATIC, "assets", "previews")
    W, H = 1100, 900
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sheets = [("cpc-p3.webp", -7, (40, 120)), ("mna-p4.webp", 2, (300, 60)), ("wfp-p5.webp", 8, (560, 150))]
    for name, angle, (x, y) in sheets:
        page = Image.open(os.path.join(prev, name)).convert("RGBA")
        page = page.resize((int(page.width * 640 / page.height), 640), Image.LANCZOS)
        border = Image.new("RGBA", (page.width + 2, page.height + 2), (214, 210, 202, 255))
        border.paste(page, (1, 1))
        rotated = border.rotate(angle, resample=Image.BICUBIC, expand=True)
        shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
        mask = rotated.split()[3].point(lambda a: 34 if a else 0)
        shadow.paste((40, 38, 34, 255), (0, 0), mask)
        shadow = shadow.filter(ImageFilter.GaussianBlur(26))
        canvas.alpha_composite(shadow, (x + 4, y + 16))
        canvas.alpha_composite(rotated, (x, y))
    canvas.save(os.path.join(STATIC, "assets", "img", "hero-pages.webp"), "WEBP", quality=88, method=6)
    print("hero image written")


def product_cards():
    """Recompose product card images from the page previews (same layout as products/generate.py)."""
    import json
    import generate
    with open(os.path.join(ROOT, "src", "data", "manifest.json")) as fh:
        manifest = json.load(fh)
    for slug, prod in manifest["products"].items():
        pages = [os.path.join(STATIC, p["src"].lstrip("/")) for p in prod["previews"][:2]]
        generate.card_image(slug, pages, None)
    print("product card images written")


hero_pages()
product_cards()
