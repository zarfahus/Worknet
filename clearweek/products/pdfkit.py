"""Drawing helpers shared by the ClearWeek Studio PDF products.

Everything is drawn in millimetres from the top-left of the content frame, which keeps
the same layout working on A4 (210 x 297 mm) and US Letter (215.9 x 279.4 mm) paper.
Colours are kept light so pages print well on home printers and stay legible in greyscale.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A4, LETTER, landscape
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

FONT_DIR = Path(__file__).parent / "fonts"

INK = Color(0.12, 0.15, 0.13)
INK_SOFT = Color(0.33, 0.37, 0.35)
GREEN = Color(0.18, 0.353, 0.267)  # #2E5A44
GREEN_TINT = Color(0.89, 0.925, 0.895)
RULE = Color(0.62, 0.65, 0.63)  # box outlines
WRITE = Color(0.78, 0.8, 0.79)  # writing lines
DOT = Color(0.6, 0.63, 0.61)

SIZES = {
    "A4": {"size": A4, "label": "A4 (210 × 297 mm)", "suffix": "A4"},
    "Letter": {"size": LETTER, "label": "US Letter (8.5 × 11 in)", "suffix": "US-Letter"},
}

_registered = False


def register_fonts() -> None:
    global _registered
    if _registered:
        return
    for name, file in {
        "Body": "Atkinson-Regular.ttf",
        "Body-Italic": "Atkinson-Italic.ttf",
        "Body-Semi": "Atkinson-SemiBold.ttf",
        "Body-Bold": "Atkinson-Bold.ttf",
        "Title": "Fraunces-SemiBold.ttf",
        "Title-Italic": "Fraunces-Italic.ttf",
    }.items():
        pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body-Italic", boldItalic="Body-Bold")
    _registered = True


@dataclass
class Frame:
    """Content area of the current page, in mm. (0, 0) is the top-left corner of the frame."""

    width: float
    height: float


class Doc:
    MARGIN_X = 14
    MARGIN_TOP = 13
    MARGIN_BOTTOM = 15

    def __init__(self, path: Path, paper: str, title: str, product: str, year: int):
        register_fonts()
        self.paper = paper
        self.page_size = SIZES[paper]["size"]
        self.c = canvas.Canvas(str(path), pagesize=self.page_size, pageCompression=1, invariant=1)
        self.c.setTitle(title)
        self.c.setAuthor("ClearWeek Studio")
        self.c.setSubject(f"{product} ({SIZES[paper]['label']})")
        self.c.setCreator("ClearWeek Studio")
        self.c.setKeywords("ClearWeek Studio, printable, planner, template")
        self.product = product
        self.year = year
        self.page_no = 0
        self.landscape = False
        self._open = False

    # -- pages ---------------------------------------------------------------------------
    def page(self, orientation: str = "portrait", footer: str | None = None) -> Frame:
        if self._open:
            self._finish_page()
        self.page_no += 1
        self.landscape = orientation == "landscape"
        size = landscape(self.page_size) if self.landscape else self.page_size
        self.c.setPageSize(size)
        self.pw, self.ph = size[0] / mm, size[1] / mm
        self.footer_text = footer
        self._open = True
        return Frame(self.pw - 2 * self.MARGIN_X, self.ph - self.MARGIN_TOP - self.MARGIN_BOTTOM)

    def _finish_page(self) -> None:
        c = self.c
        y = self.MARGIN_BOTTOM - 7
        c.setFont("Body", 7)
        c.setFillColor(INK_SOFT)
        c.drawString(self.MARGIN_X * mm, y * mm, f"© {self.year} ClearWeek Studio · {self.product} · For personal and internal use, see evadeclaw.com/terms")
        right = self.footer_text or f"Page {self.page_no}"
        c.drawRightString((self.pw - self.MARGIN_X) * mm, y * mm, right)
        c.showPage()
        self._open = False

    def save(self) -> int:
        if self._open:
            self._finish_page()
        self.c.save()
        return self.page_no

    # -- coordinates -----------------------------------------------------------------------
    def X(self, x: float) -> float:
        return (self.MARGIN_X + x) * mm

    def Y(self, y: float) -> float:
        """Frame y (mm from the top of the frame, growing downwards) to PDF points."""
        return (self.ph - self.MARGIN_TOP - y) * mm

    # -- text ------------------------------------------------------------------------------
    def text(self, x, y, s, font="Body", size=9.5, color=INK, align="left"):
        c = self.c
        c.setFont(font, size)
        c.setFillColor(color)
        if align == "right":
            c.drawRightString(self.X(x), self.Y(y), s)
        elif align == "center":
            c.drawCentredString(self.X(x), self.Y(y), s)
        else:
            c.drawString(self.X(x), self.Y(y), s)

    def width_of(self, s, font="Body", size=9.5) -> float:
        return pdfmetrics.stringWidth(s, font, size) / mm

    def title(self, s: str, size: float = 21, y: float = 7) -> None:
        self.text(0, y, s, font="Title", size=size, color=INK)

    def label(self, x, y, s, color=GREEN, size=7.6):
        """Small spaced capitals used for section labels."""
        c = self.c
        # Character spacing is part of the PDF graphics state, so keep it inside save/restore.
        c.saveState()
        t = c.beginText()
        t.setTextOrigin(self.X(x), self.Y(y))
        t.setFont("Body-Bold", size)
        t.setCharSpace(0.6)
        t.setFillColor(color)
        t.textLine(s.upper())
        c.drawText(t)
        c.restoreState()

    def wrap(self, x, y, w, s, font="Body", size=9.5, leading=None, color=INK) -> float:
        """Draw wrapped text; returns the y (mm) below the last line."""
        leading = leading or size * 0.36 * 1.45
        words = s.split()
        line = ""
        for word in words:
            trial = f"{line} {word}".strip()
            if self.width_of(trial, font, size) > w and line:
                self.text(x, y, line, font, size, color)
                y += leading
                line = word
            else:
                line = trial
        if line:
            self.text(x, y, line, font, size, color)
            y += leading
        return y

    # -- shapes ----------------------------------------------------------------------------
    def box(self, x, y, w, h, stroke=RULE, fill=None, radius=1.6, width=0.6):
        c = self.c
        c.setLineWidth(width)
        c.setStrokeColor(stroke)
        if fill is not None:
            c.setFillColor(fill)
        c.roundRect(self.X(x), self.Y(y + h), w * mm, h * mm, radius * mm, stroke=1, fill=1 if fill is not None else 0)

    def hline(self, x, y, w, color=WRITE, width=0.45, dash=None):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(width)
        c.setDash(*dash) if dash else c.setDash()
        c.line(self.X(x), self.Y(y), self.X(x + w), self.Y(y))
        c.setDash()

    def vline(self, x, y, h, color=RULE, width=0.45):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(width)
        c.line(self.X(x), self.Y(y), self.X(x), self.Y(y + h))

    def lines(self, x, y, w, h, gap=7.0, first=None):
        """Writing lines filling a w x h area. Returns the number of lines drawn."""
        yy = y + (first if first is not None else gap)
        n = 0
        while yy <= y + h + 0.01:
            self.hline(x, yy, w)
            yy += gap
            n += 1
        return n

    def checkbox(self, x, y, s=3.4, color=RULE):
        """Checkbox with its top-left corner at (x, y)."""
        self.box(x, y, s, s, stroke=color, radius=0.6, width=0.6)

    def circle(self, x, y, r=1.9, color=RULE):
        c = self.c
        c.setStrokeColor(color)
        c.setLineWidth(0.6)
        c.circle(self.X(x), self.Y(y), r * mm, stroke=1, fill=0)

    def check_lines(self, x, y, w, count, gap=7.0, numbered=False):
        """Lines with a checkbox at the start of each: for task lists."""
        for i in range(count):
            base = y + gap * (i + 1)
            if numbered:
                self.text(x, base - 1.3, f"{i + 1}", font="Body-Bold", size=9, color=GREEN)
                self.checkbox(x + 4.5, base - 4.2)
                self.hline(x + 10, base, w - 10)
            else:
                self.checkbox(x, base - 4.2)
                self.hline(x + 5.8, base, w - 5.8)
        return y + gap * count

    def field(self, x, y, label, w, size=8.5):
        """'Label ________' write-in field; y is the baseline."""
        self.text(x, y, label, font="Body-Semi", size=size, color=INK_SOFT)
        lw = self.width_of(label, "Body-Semi", size) + 2
        self.hline(x + lw, y + 0.8, w - lw, color=RULE)

    def dot_grid(self, x, y, w, h, step=5.0):
        c = self.c
        c.setFillColor(DOT)
        cols = int(w // step)
        rows = int(h // step)
        ox = x + (w - cols * step) / 2
        oy = y + (h - rows * step) / 2
        for i in range(cols + 1):
            for j in range(rows + 1):
                c.circle(self.X(ox + i * step), self.Y(oy + j * step), 0.22 * mm, stroke=0, fill=1)

    def section(self, x, y, w, h, title, lines=True, gap=7.0, fill=None):
        """Outlined box with a small label at the top and optional writing lines inside."""
        self.box(x, y, w, h, fill=fill)
        self.label(x + 3, y + 5.2, title)
        if lines:
            self.lines(x + 3, y + 7.5, w - 6, h - 9.5, gap=gap, first=gap)

    def logo(self, x, y, size=7.5):
        """ClearWeek mark: a page with a header bar and three rows, the last one ticked."""
        c = self.c
        s = size
        self.box(x, y, s, s, stroke=GREEN, fill=GREEN, radius=1.4, width=0.1)
        c.setStrokeColorRGB(1, 1, 1)
        c.setLineWidth(0.55)
        c.setLineCap(1)
        for i, ww in enumerate((0.55, 0.42, 0.3)):
            yy = y + s * (0.36 + i * 0.2)
            c.line(self.X(x + s * 0.22), self.Y(yy), self.X(x + s * (0.22 + ww)), self.Y(yy))
        # tick
        p = c.beginPath()
        p.moveTo(self.X(x + s * 0.6), self.Y(y + s * 0.74))
        p.lineTo(self.X(x + s * 0.68), self.Y(y + s * 0.82))
        p.lineTo(self.X(x + s * 0.82), self.Y(y + s * 0.64))
        c.drawPath(p, stroke=1, fill=0)
        c.setLineCap(0)

    def wordmark(self, x, y, size=7.5):
        self.logo(x, y, size)
        self.text(x + size + 2.2, y + size * 0.7, "ClearWeek Studio", font="Title", size=size * 1.45, color=INK)
