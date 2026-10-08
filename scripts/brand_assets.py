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
