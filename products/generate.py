#!/usr/bin/env python3
"""Generate every DeskNest Studio product file.

Outputs
  products/out/files/*.pdf|docx|xlsx   the files customers download (uploaded to private R2 storage)
  products/out/zips/<product>.zip      one "download all" archive per product
  src/static/assets/previews/*.webp    page previews shown on product pages
  src/static/assets/products/*.webp    product card images (+ .jpg for social sharing)
  src/data/manifest.json               file metadata used by the website and the download API

Usage: python3 products/generate.py
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile

from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import content  # noqa: E402
import render  # noqa: E402
import workbooks  # noqa: E402

OUT = os.path.join(HERE, "out")
FILES_DIR = os.path.join(OUT, "files")
ZIPS_DIR = os.path.join(OUT, "zips")
ASSETS = os.path.join(ROOT, "src", "static", "assets")
PREVIEWS = os.path.join(ASSETS, "previews")
CARDS = os.path.join(ASSETS, "products")
VERSION = "1.0"

with open(os.path.join(ROOT, "src", "data", "site.json")) as fh:
    SITE = json.load(fh)
with open(os.path.join(ROOT, "src", "data", "catalog.json")) as fh:
    CATALOG = {p["slug"]: p for p in json.load(fh)["products"]}
render.SITE.update(SITE)
workbooks.SITE.update(SITE)

CONTENT_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "zip": "application/zip",
}


class Doc:
    def __init__(self, key, slug, title, pages, base, formats, format_labels, all_formats, howto, previews):
        self.key, self.title, self.pages, self.base = key, title, pages, base
        self.subtitle = CATALOG[slug]["description"] if slug else ""
        self.formats, self.format_labels, self.all_formats = formats, format_labels, all_formats
        self.howto, self.previews, self.version = howto, previews, VERSION


DOCS = [
    Doc("wfp", "weekly-focus-planner", "Weekly Focus Planner", content.weekly_focus_planner(),
        "DeskNest-Weekly-Focus-Planner", ["pdf", "docx"], ["Printable PDF (US Letter)", "Editable DOCX"], ["PDF", "DOCX"],
        ["Begin each week with the Weekly Plan page: set a focus, choose three priorities and list fixed "
         "appointments and deadlines.",
         "Use the Priority Tracker to rank everything competing for your time.",
         "Fill in one Daily Tasks page each morning, or the evening before.",
         "Finish the week with the Weekly Review and carry unfinished items forward.",
         "Use the Goal Tracker for a goal that spans several weeks."],
        [1, 3, 5, 12]),
    Doc("mna", "meeting-notes-action-tracker", "Meeting Notes & Action Tracker", content.meeting_notes_action_tracker(),
        "DeskNest-Meeting-Notes-Action-Tracker", ["pdf", "docx"], ["Printable PDF (US Letter)", "Editable DOCX"],
        ["PDF", "DOCX"],
        ["Send the Meeting Agenda to attendees before the meeting.",
         "Take notes on the Meeting Notes page and record decisions and action items as they happen.",
         "Copy decisions into the Decision Tracker and actions into the Action-Item Tracker.",
         "Complete the Meeting Follow-Up page within a day of the meeting."],
        [1, 3, 4, 7]),
    Doc("cpc", "content-planning-calendar", "Content Planning Calendar", content.content_planning_calendar(),
        "DeskNest-Content-Planning-Calendar", ["pdf"], ["Printable PDF (US Letter)", "Companion XLSX workbook"],
        ["PDF", "XLSX"],
        ["Start with the 90-Day Plan Overview: your goal, monthly themes and channels.",
         "Plan week by week on the three 90-Day Calendar pages.",
         "Keep the Content Idea Worksheet nearby and add ideas as they come up.",
         "Track every piece in the Publishing Tracker.",
         "Use one Campaign Planning Sheet per campaign, and the Content Review Worksheet at the end of each "
         "month or cycle.",
         "Prefer working digitally? The XLSX workbook has the same tools with automatic dates."],
        [1, 3, 6, 8]),
    Doc("cpt", "complete-productivity-toolkit", "Productivity Toolkit Planners", content.productivity_toolkit_planners(),
        "DeskNest-Productivity-Toolkit-Planners", ["pdf", "docx"],
        ["Printable PDF (US Letter)", "Editable DOCX", "Companion XLSX workbook"], ["PDF", "DOCX", "XLSX"],
        ["This document holds the toolkit's additional planners. The Weekly Focus Planner and the Meeting Notes "
         "& Action Tracker are included as separate files.",
         "Use the Priority Planner whenever your list feels overwhelming.",
         "Start a project with the Project Overview, then track the work in the Project Task Tracker.",
         "Run the Weekly Review Checklist at the end of each week and add a line to the Weekly Review Log.",
         "Use the Personal Workflow Planner and Ideal Week to design routines that fit how you work.",
         "The XLSX workbook contains spreadsheet versions of the trackers."],
        [1, 3, 5, 6]),
    Doc("sbw", "small-business-workflow-toolkit", "Small Business Workflow Toolkit",
        content.small_business_workflow_toolkit(), "DeskNest-Small-Business-Workflow-Toolkit", ["pdf", "docx"],
        ["Printable PDF (US Letter)", "Editable DOCX", "Companion XLSX workbook"], ["PDF", "DOCX", "XLSX"],
        ["Pick one workflow that repeats often and describe it on the Workflow Planning Sheet.",
         "Turn important workflows into step-by-step instructions with the Process Documentation worksheet.",
         "List routine work in the Recurring Task Tracker and make ownership clear in the Responsibility Tracker.",
         "Plan each week with the Weekly Operations Planner and review completed work with the Task Review Sheet.",
         "The XLSX workbook calculates the next due date of each recurring task automatically."],
        [1, 3, 5, 7]),
    Doc("cpb", "creator-planning-bundle", "Creator Planning Bundle", content.creator_planning_bundle(),
        "DeskNest-Creator-Planning-Bundle", ["pdf", "docx"],
        ["Printable PDF (US Letter)", "Editable DOCX", "Companion XLSX workbook"], ["PDF", "DOCX", "XLSX"],
        ["Plan each month on a Content Calendar page.",
         "Keep the Content Idea Planner as your idea bank.",
         "Use one Production Checklist per piece of content.",
         "Track everything in the Publishing Tracker and plan launches with the Campaign Planner.",
         "Record what you learn on the Content Performance Notes page.",
         "The XLSX workbook includes the same tools with drop-downs and progress tracking."],
        [1, 3, 7, 9]),
]

WORKBOOKS = [
    ("cpc-xlsx", "DeskNest-Content-Planning-Calendar.xlsx", workbooks.content_planning_calendar,
     "Editable spreadsheet: 90-day calendar with automatic dates, idea list, publishing tracker, campaign plan "
     "and review sheet"),
    ("cpt-xlsx", "DeskNest-Productivity-Toolkit-Trackers.xlsx", workbooks.productivity_toolkit_trackers,
     "Editable spreadsheet: priorities, project tasks, action items, decisions, weekly review log and ideal week"),
    ("sbw-xlsx", "DeskNest-Small-Business-Workflow-Trackers.xlsx", workbooks.small_business_workflow_trackers,
     "Editable spreadsheet: workflow steps, recurring tasks with next-due dates, responsibilities, weekly "
     "operations, task review and change log"),
    ("cpb-xlsx", "DeskNest-Creator-Planning-Trackers.xlsx", workbooks.creator_planning_trackers,
     "Editable spreadsheet: content calendar, idea bank, production checklist, publishing tracker, campaigns "
     "and performance log"),
]

PRODUCT_FILES = {
    "weekly-focus-planner": ["wfp-pdf", "wfp-docx"],
    "meeting-notes-action-tracker": ["mna-pdf", "mna-docx"],
    "content-planning-calendar": ["cpc-pdf", "cpc-xlsx"],
    "complete-productivity-toolkit": ["wfp-pdf", "wfp-docx", "mna-pdf", "mna-docx", "cpt-pdf", "cpt-docx", "cpt-xlsx"],
    "small-business-workflow-toolkit": ["sbw-pdf", "sbw-docx", "sbw-xlsx"],
    "creator-planning-bundle": ["cpb-pdf", "cpb-docx", "cpb-xlsx"],
}
PRODUCT_PREVIEW_DOC = {
    "weekly-focus-planner": "wfp", "meeting-notes-action-tracker": "mna", "content-planning-calendar": "cpc",
    "complete-productivity-toolkit": "cpt", "small-business-workflow-toolkit": "sbw", "creator-planning-bundle": "cpb",
}


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def render_page_png(pdf, page, dpi, out_png):
    base = out_png[:-4]
    subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(page), "-l", str(page), "-png", "-singlefile", pdf, base],
                   check=True)
    return out_png


def make_previews(doc, pdf_path, tmp):
    paths = []
    for n in doc.previews:
        png = render_page_png(pdf_path, n, 110, os.path.join(tmp, f"{doc.key}-{n}.png"))
        img = Image.open(png).convert("RGB")
        img.thumbnail((900, 900))
        out = os.path.join(PREVIEWS, f"{doc.key}-p{n}.webp")
        img.save(out, "WEBP", quality=84, method=6)
        paths.append({"src": f"/assets/previews/{doc.key}-p{n}.webp", "width": img.width, "height": img.height,
                      "page": n})
    return paths


def card_image(slug, pages, tmp):
    """Product card: the cover sheet in front of an interior page, on the brand's light background."""
    W, H = 1200, 900
    canvas = Image.new("RGB", (W, H), (235, 231, 223))  # warm paper tone used on the website

    def sheet(png, height):
        im = Image.open(png).convert("RGB")
        ratio = height / im.height
        return im.resize((int(im.width * ratio), height), Image.LANCZOS)

    def place(im, x, y):
        shadow = Image.new("RGBA", (im.width + 80, im.height + 80), (0, 0, 0, 0))
        block = Image.new("RGBA", im.size, (40, 36, 30, 46))
        shadow.paste(block, (40, 50))
        shadow = shadow.filter(ImageFilter.GaussianBlur(22))
        canvas.paste(shadow, (x - 40, y - 40), shadow)
        canvas.paste(im, (x, y))

    back = sheet(pages[1], 760)
    if back.width > back.height:  # landscape interior page
        back = sheet(pages[1], 560)
        place(back, W - back.width - 50, 200)
    else:
        place(back, 560, 90)
    front = sheet(pages[0], 800)
    place(front, 110, 50)
    canvas.save(os.path.join(CARDS, f"{slug}.webp"), "WEBP", quality=86, method=6)
    canvas.save(os.path.join(CARDS, f"{slug}.jpg"), "JPEG", quality=86, optimize=True, progressive=True)


def readme_text(slug, files):
    p = CATALOG[slug]
    lines = [
        f"{p['name']} — DeskNest Studio", "=" * (len(p["name"]) + 18), "",
        p["description"], "", "Files in this download:",
    ]
    lines += [f"  - {f['filename']}: {f['label']}" for f in files]
    lines += [
        "", "How to open the files:",
        "  - PDF: any PDF reader or browser. Pages are US Letter; choose 'Fit to page' to print on A4.",
        "  - DOCX: Microsoft Word, Google Docs, LibreOffice Writer or Apple Pages.",
        "  - XLSX: Microsoft Excel, Google Sheets, LibreOffice Calc or Apple Numbers.",
        "", "License:",
        "  You may use and edit these templates for your own personal or internal business purposes.",
        "  Please do not resell, share or redistribute the files or publish them as templates.",
        f"  Full terms: {SITE['url']}/terms/",
        "", "Support:",
        f"  If a file will not open, is incomplete or does not match its description, email {SITE['email']}",
        "  with your order reference.",
        "", "These templates are organizational tools, not legal, financial, accounting, tax, investment, medical",
        "or other professional advice.", "", f"(c) {render.YEAR} DeskNest Studio",
    ]
    return "\r\n".join(lines) + "\r\n"


def main():
    for d in (FILES_DIR, ZIPS_DIR, PREVIEWS, CARDS):
        if os.path.isdir(d) and d in (FILES_DIR, ZIPS_DIR, PREVIEWS):
            shutil.rmtree(d)
        os.makedirs(d, exist_ok=True)
    os.makedirs(os.path.join(ASSETS, "brand"), exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="desknest-")
    logo = os.path.join(tmp, "logo.png")
    render.logo_png(logo)
    render.logo_png(os.path.join(ASSETS, "brand", "apple-touch-icon.png"), 180)
    render.logo_png(os.path.join(ASSETS, "brand", "icon-512.png"), 512)

    files, previews, first_pages = {}, {}, {}
    for doc in DOCS:
        for fmt in doc.formats:
            fid = f"{doc.key}-{fmt}"
            filename = f"{doc.base}.{fmt}"
            path = os.path.join(FILES_DIR, filename)
            if fmt == "pdf":
                pages = render.build_pdf(doc, path)
                label = f"Printable PDF, US Letter, {pages} pages"
                previews[doc.key] = make_previews(doc, path, tmp)
                first_pages[doc.key] = [os.path.join(tmp, f"{doc.key}-{doc.previews[0]}.png"),
                                        os.path.join(tmp, f"{doc.key}-{doc.previews[1]}.png")]
            else:
                render.build_docx(doc, path, logo)
                pages = None
                label = "Editable Word document (DOCX)"
            files[fid] = {"filename": filename, "format": fmt.upper(), "label": f"{doc.title}: {label}",
                          "pages": pages}
            print(f"  {filename}  {os.path.getsize(path) / 1024:.0f} KB" + (f", {pages} pages" if pages else ""))
    for fid, filename, fn, label in WORKBOOKS:
        path = os.path.join(FILES_DIR, filename)
        fn(path)
        files[fid] = {"filename": filename, "format": "XLSX", "label": label, "pages": None}
        print(f"  {filename}  {os.path.getsize(path) / 1024:.0f} KB")

    for fid, meta in files.items():
        path = os.path.join(FILES_DIR, meta["filename"])
        ext = meta["filename"].rsplit(".", 1)[1]
        meta.update({"key": f"files/{meta['filename']}", "bytes": os.path.getsize(path),
                     "contentType": CONTENT_TYPES[ext], "sha256": sha256(path)})

    products = {}
    for slug, fids in PRODUCT_FILES.items():
        zip_name = f"DeskNest-{''.join(w.capitalize() for w in slug.split('-'))}.zip"
        zip_path = os.path.join(ZIPS_DIR, zip_name)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            folder = zip_name[:-4]
            for fid in fids:
                zf.write(os.path.join(FILES_DIR, files[fid]["filename"]), f"{folder}/{files[fid]['filename']}")
            zf.writestr(f"{folder}/README.txt", readme_text(slug, [files[f] for f in fids]))
        zid = f"{slug}-zip"
        files[zid] = {"filename": zip_name, "format": "ZIP", "label": "All files for this product in one ZIP archive",
                      "pages": None, "key": f"zips/{zip_name}", "bytes": os.path.getsize(zip_path),
                      "contentType": CONTENT_TYPES["zip"], "sha256": sha256(zip_path)}
        dkey = PRODUCT_PREVIEW_DOC[slug]
        card_image(slug, first_pages[dkey], tmp)
        products[slug] = {"files": fids, "zip": zid, "previews": previews[dkey],
                          "image": f"/assets/products/{slug}.webp", "ogImage": f"/assets/products/{slug}.jpg"}
        print(f"  {zip_name}  {os.path.getsize(zip_path) / 1024:.0f} KB")

    manifest = {"version": VERSION, "files": files, "products": products}
    with open(os.path.join(ROOT, "src", "data", "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)
        fh.write("\n")
    shutil.rmtree(tmp)
    print(f"Wrote {len(files)} files and src/data/manifest.json")


if __name__ == "__main__":
    main()
