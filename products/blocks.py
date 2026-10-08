"""Layout blocks for WorkNest Studio templates.

Every block knows how to draw itself on a PDF page (reportlab) and how to
render an editable equivalent into a Word document (python-docx). Pages are
laid out top to bottom; blocks with a ``flex`` weight grow to fill whatever
vertical space is left, so every printed page is fully used.
"""
import math
import os

from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.table import WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))

# Palette shared with the website.
NAVY_HEX, INK_HEX, MUTED_HEX = "1F2A44", "2B2F36", "6B7280"
RULE_HEX, FAINT_HEX, FILL_HEX, TINT_HEX = "C5CBD4", "E3E6EB", "F4F5F7", "E8ECF3"
NAVY, INK, MUTED = HexColor("#" + NAVY_HEX), HexColor("#" + INK_HEX), HexColor("#" + MUTED_HEX)
RULE, FAINT, FILL, TINT = (HexColor("#" + h) for h in (RULE_HEX, FAINT_HEX, FILL_HEX, TINT_HEX))
WHITE = HexColor("#FFFFFF")

REG, MED, SEMI, BOLD = "Inter", "Inter-Medium", "Inter-SemiBold", "Inter-Bold"
for _name, _file in ((REG, "Regular"), (MED, "Medium"), (SEMI, "SemiBold"), (BOLD, "Bold")):
    pdfmetrics.registerFont(TTFont(_name, os.path.join(HERE, "fonts", f"Inter-{_file}.ttf")))

DOCX_FONT = "Calibri"
CHECKBOX = "☐"
GAP = 14  # vertical gap between blocks (pt)


def sw(text, font, size):
    return pdfmetrics.stringWidth(text, font, size)


def spaced(c, x, y, text, font, size, color, space=0.6):
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(space)
    t.setFillColor(color)
    t.textOut(text)
    t.setCharSpace(0)  # Tc persists in the PDF text state; reset it so later text is not spaced
    c.drawText(t)


def checkbox(c, x, y, size=8.5):
    c.setStrokeColor(MUTED)
    c.setLineWidth(0.7)
    c.roundRect(x, y, size, size, 1.5, stroke=1, fill=0)


def hline(c, x1, x2, y, color=RULE, width=0.6):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def wrap(text, font, size, width):
    out = []
    for para in text.split("\n"):
        out.extend(simpleSplit(para, font, size, width) or [""])
    return out


# --------------------------------------------------------------------------
# python-docx helpers
# --------------------------------------------------------------------------

# Elements that must follow w:tcBorders inside w:tcPr (WordprocessingML schema order). Word is strict
# about child order, so new elements are inserted in place rather than appended.
TCPR_AFTER_BORDERS = ("w:shd", "w:noWrap", "w:tcMar", "w:textDirection", "w:tcFitText", "w:vAlign", "w:hideMark",
                      "w:headers", "w:cellIns", "w:cellDel", "w:cellMerge", "w:tcPrChange")


def _border_el(tag, val="single", sz=4, color=RULE_HEX):
    el = OxmlElement(f"w:{tag}")
    el.set(qn("w:val"), val)
    el.set(qn("w:sz"), str(sz))
    el.set(qn("w:space"), "0")
    el.set(qn("w:color"), color)
    return el


def cell_borders(cell, **edges):
    """edges: top/bottom/left/right = (val, sz, color) or None for 'nil'."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = tcPr.find(qn("w:tcBorders"))
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tcPr.insert_element_before(borders, *TCPR_AFTER_BORDERS)
    for edge in ("top", "left", "bottom", "right"):
        if edge in edges:
            spec = edges[edge]
            old = borders.find(qn(f"w:{edge}"))
            if old is not None:
                borders.remove(old)
            borders.append(_border_el(edge, "nil") if spec is None else _border_el(edge, *spec))


def table_borders(table, outer=("single", 4, RULE_HEX), inner_h=("single", 4, RULE_HEX),
                  inner_v=("single", 4, FAINT_HEX)):
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge, spec in (("top", outer), ("left", outer), ("bottom", outer), ("right", outer),
                       ("insideH", inner_h), ("insideV", inner_v)):
        borders.append(_border_el(edge, "nil") if spec is None else _border_el(edge, *spec))
    old = tblPr.find(qn("w:tblBorders"))
    if old is not None:
        tblPr.remove(old)
    tblPr.insert_element_before(borders, "w:shd", "w:tblLayout", "w:tblCellMar", "w:tblLook", "w:tblCaption",
                                "w:tblDescription", "w:tblPrChange")


def shade(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.insert_element_before(shd, *TCPR_AFTER_BORDERS[1:])


def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    trPr.insert_element_before(el, "w:tblCellSpacing", "w:jc", "w:hidden", "w:ins", "w:del", "w:trPrChange")


def row_height(row, cm):
    row.height = Cm(cm)
    row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST


def col_widths(table, widths_cm):
    """Set widths on the grid (used by LibreOffice/Google Docs) and on every cell (used by Word)."""
    table.autofit = False
    for gc, w in zip(table._tbl.tblGrid.findall(qn("w:gridCol")), widths_cm):
        gc.set(qn("w:w"), str(int(Cm(w).twips)))
    for row in table.rows:
        for idx, w in enumerate(widths_cm):
            row.cells[idx].width = Cm(w)


def cell_text(cell, text, size=9, bold=False, color=INK_HEX, align=None, font=None):
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(1)
    if align:
        p.alignment = align
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    if font:
        run.font.name = font
        run._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    return run


class Ctx:
    """Where DOCX content goes: the document body or a layout-table cell, plus its usable width (cm).

    Document and table cells share add_paragraph(text, style) and add_table(rows, cols), so blocks render
    the same way into either."""

    def __init__(self, container, width):
        self.container, self.width = container, width

    def __getattr__(self, name):
        return getattr(self.container, name)


def body_ctx(doc):
    s = doc.sections[-1]
    return Ctx(doc, (s.page_width - s.left_margin - s.right_margin) / 360000)  # EMU -> cm


def label_paragraph(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text.upper())
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor.from_string(NAVY_HEX)
    rPr = r._element.get_or_add_rPr()
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:val"), "12")
    rPr.insert_element_before(spacing, "w:w", "w:kern", "w:position", "w:sz", "w:szCs", "w:highlight", "w:u",
                              "w:effect", "w:bdr", "w:shd", "w:fitText", "w:vertAlign", "w:rtl", "w:cs", "w:em",
                              "w:lang", "w:eastAsianLayout", "w:specVanish", "w:oMath")
    return p


def small_gap(doc, pts=2):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = Pt(pts)


def ruled_table(doc, n, width, height_cm=0.75, prefix=None, numbered=False):
    """A single-column table whose rows look like ruled writing lines."""
    cols = 2 if (prefix or numbered) else 1
    t = doc.add_table(n, cols)
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    table_borders(t, outer=None, inner_h=None, inner_v=None)
    for i, row in enumerate(t.rows):
        row_height(row, height_cm)
        for cell in row.cells:
            cell_borders(cell, bottom=("single", 4, RULE_HEX))
        if cols == 2:
            mark = f"{i + 1}." if numbered else prefix
            cell_text(row.cells[0], mark, size=10 if prefix == CHECKBOX else 9, color=MUTED_HEX,
                      font="Segoe UI Symbol" if prefix == CHECKBOX else None)
    col_widths(t, [0.7, width - 0.7] if cols == 2 else [width])
    return t


# --------------------------------------------------------------------------
# Blocks
# --------------------------------------------------------------------------

class Block:
    flex = 0
    label = None
    LABEL_H = 17

    def label_h(self):
        return self.LABEL_H if self.label else 0

    def min_h(self, w):
        raise NotImplementedError

    def draw(self, c, x, top, w, h):
        if self.label:
            spaced(c, x, top - 9, self.label.upper(), SEMI, 7.5, NAVY)
        self.body(c, x, top - self.label_h(), w, h - self.label_h())

    def body(self, c, x, top, w, h):
        raise NotImplementedError

    def docx(self, doc):
        if self.label:
            label_paragraph(doc, self.label)
        self.docx_body(doc, doc.width)

    def docx_body(self, doc, width):
        raise NotImplementedError


class Fields(Block):
    """Label + write-in line pairs laid out in a grid."""

    def __init__(self, labels, cols=2, row_h=22, label=None):
        self.labels, self.cols, self.row_h, self.label = labels, cols, row_h, label

    def rows(self):
        return math.ceil(len(self.labels) / self.cols)

    def min_h(self, w):
        return self.label_h() + self.rows() * self.row_h

    def body(self, c, x, top, w, h):
        gap = 18
        colw = (w - (self.cols - 1) * gap) / self.cols
        for i, lab in enumerate(self.labels):
            r, ci = divmod(i, self.cols)
            cx = x + ci * (colw + gap)
            base = top - (r + 1) * self.row_h + 5
            c.setFont(MED, 8)
            c.setFillColor(MUTED)
            c.drawString(cx, base + 3, lab)
            hline(c, cx + sw(lab, MED, 8) + 6, cx + colw, base)

    def docx_body(self, doc, width):
        cols = self.cols * 2
        t = doc.add_table(self.rows(), cols)
        table_borders(t, outer=None, inner_h=None, inner_v=None)
        label_w = min(4.2, max(2.2, max(len(l) for l in self.labels) * 0.2))
        value_w = width / self.cols - label_w
        for i, lab in enumerate(self.labels):
            r, ci = divmod(i, self.cols)
            row = t.rows[r]
            row_height(row, 0.8)
            cell_text(row.cells[ci * 2], lab, size=9, bold=True, color=MUTED_HEX)
            cell_borders(row.cells[ci * 2 + 1], bottom=("single", 4, RULE_HEX))
        col_widths(t, [label_w, value_w] * self.cols)


class Lines(Block):
    """Ruled writing lines, optionally numbered or with checkboxes."""

    def __init__(self, label=None, lines=None, min_lines=2, flex=1, spacing=20, numbered=False,
                 checkbox=False, docx_lines=None):
        self.label, self.lines, self.min_lines = label, lines, min_lines
        self.flex = 0 if lines else flex
        self.spacing, self.numbered, self.checkbox = spacing, numbered, checkbox
        self.docx_lines = docx_lines or lines or max(min_lines, 4)

    def min_h(self, w):
        return self.label_h() + (self.lines or self.min_lines) * self.spacing

    def body(self, c, x, top, w, h):
        n = self.lines or int(h // self.spacing)
        indent = 16 if (self.numbered or self.checkbox) else 0
        for i in range(n):
            y = top - (i + 1) * self.spacing + 4
            if self.numbered:
                c.setFont(MED, 8)
                c.setFillColor(MUTED)
                c.drawString(x, y + 3, f"{i + 1}.")
            elif self.checkbox:
                checkbox(c, x, y + 1.5)
            hline(c, x + indent, x + w, y)

    def docx_body(self, doc, width):
        ruled_table(doc, self.docx_lines, width, numbered=self.numbered,
                    prefix=CHECKBOX if self.checkbox else None)


class Checklist(Block):
    """Pre-written checklist items (fixed) arranged in one or more columns."""

    def __init__(self, items, label=None, cols=1, spacing=19):
        self.items, self.label, self.cols, self.spacing = items, label, cols, spacing

    def _layout(self, w):
        gap = 18
        colw = (w - (self.cols - 1) * gap) / self.cols
        per_col = math.ceil(len(self.items) / self.cols)
        rows = []
        for ci in range(self.cols):
            col_items = self.items[ci * per_col:(ci + 1) * per_col]
            heights = [len(wrap(it, REG, 8.5, colw - 16)) for it in col_items]
            rows.append((col_items, heights))
        return colw, gap, rows

    def min_h(self, w):
        _, _, rows = self._layout(w)
        tallest = max(sum(self.spacing + (n - 1) * 10.5 for n in hs) for _, hs in rows)
        return self.label_h() + tallest

    def body(self, c, x, top, w, h):
        colw, gap, rows = self._layout(w)
        for ci, (items, _) in enumerate(rows):
            cx = x + ci * (colw + gap)
            y = top
            for it in items:
                lines = wrap(it, REG, 8.5, colw - 16)
                checkbox(c, cx, y - 12.5)
                c.setFont(REG, 8.5)
                c.setFillColor(INK)
                for li, ln in enumerate(lines):
                    c.drawString(cx + 15, y - 11.5 - li * 10.5, ln)
                y -= self.spacing + (len(lines) - 1) * 10.5

    def docx_body(self, doc, width):
        t = doc.add_table(len(self.items), 2)
        table_borders(t, outer=None, inner_h=None, inner_v=None)
        for row, it in zip(t.rows, self.items):
            cell_text(row.cells[0], CHECKBOX, size=10, color=MUTED_HEX, font="Segoe UI Symbol")
            cell_text(row.cells[1], it, size=9.5)
        col_widths(t, [0.7, width - 0.7])


class Table(Block):
    """A writable table with a shaded header row.

    columns: list of (title, weight) or (title, weight, kind); kind is
    "text" (default) or "check" (a centred tick box in every row).
    """

    def __init__(self, columns, label=None, rows=None, min_rows=3, flex=1, row_h=21,
                 row_labels=None, docx_rows=None, numbered=False):
        self.columns = [col if len(col) == 3 else (col[0], col[1], "text") for col in columns]
        self.label, self.rows, self.min_rows = label, rows, min_rows
        self.row_labels = row_labels
        if row_labels:
            self.rows = len(row_labels)
        self.flex = 0 if self.rows else flex
        self.row_h, self.numbered = row_h, numbered
        self.docx_rows = docx_rows or self.rows or 10

    def _widths(self, w):
        total = sum(col[1] for col in self.columns)
        return [w * col[1] / total for col in self.columns]

    def _header_h(self, w):
        lines = max(len(wrap(col[0], SEMI, 7.5, cw - 8)) for col, cw in zip(self.columns, self._widths(w)))
        return 9 + lines * 9

    def min_h(self, w):
        return self.label_h() + self._header_h(w) + (self.rows or self.min_rows) * self.row_h

    def body(self, c, x, top, w, h):
        widths = self._widths(w)
        hh = self._header_h(w)
        n = self.rows or int((h - hh) // self.row_h)
        row_h = self.row_h if self.rows else (h - hh) / n  # flexible tables stretch rows to fill
        table_h = hh + n * row_h
        # header
        c.setFillColor(TINT)
        c.rect(x, top - hh, w, hh, stroke=0, fill=1)
        cx = x
        for (title, _, kind), cw in zip(self.columns, widths):
            lines = wrap(title, SEMI, 7.5, cw - 8)
            c.setFont(SEMI, 7.5)
            c.setFillColor(NAVY)
            ty = top - hh / 2 + (len(lines) - 1) * 4.5 - 2.6
            for ln in lines:
                if kind == "check":
                    c.drawCentredString(cx + cw / 2, ty, ln)
                else:
                    c.drawString(cx + 5, ty, ln)
                ty -= 9
            cx += cw
        # rows
        for r in range(n):
            y = top - hh - (r + 1) * row_h
            hline(c, x, x + w, y, RULE, 0.5)
            cx = x
            for ci, ((title, _, kind), cw) in enumerate(zip(self.columns, widths)):
                if kind == "check":
                    checkbox(c, cx + cw / 2 - 4.25, y + row_h / 2 - 4.25)
                if ci == 0 and self.row_labels:
                    c.setFont(MED, 8)
                    c.setFillColor(INK)
                    ly = y + row_h / 2 - 3 if row_h <= 30 else y + row_h - 13
                    c.drawString(cx + 5, ly, self.row_labels[r])
                elif ci == 0 and self.numbered:
                    c.setFont(MED, 7.5)
                    c.setFillColor(MUTED)
                    c.drawString(cx + 5, y + row_h / 2 - 3, str(r + 1))
                cx += cw
        # vertical separators + frame
        c.setStrokeColor(FAINT)
        c.setLineWidth(0.5)
        cx = x
        for cw in widths[:-1]:
            cx += cw
            c.line(cx, top, cx, top - table_h)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.rect(x, top - table_h, w, table_h, stroke=1, fill=0)

    def docx_body(self, doc, width):
        n = self.docx_rows
        t = doc.add_table(n + 1, len(self.columns))
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        table_borders(t)
        hdr = t.rows[0]
        repeat_header(hdr)
        for cell, (title, _, kind) in zip(hdr.cells, self.columns):
            shade(cell, TINT_HEX)
            cell_text(cell, title, size=8.5, bold=True, color=NAVY_HEX,
                      align=WD_ALIGN_PARAGRAPH.CENTER if kind == "check" else None)
        for r in range(n):
            row = t.rows[r + 1]
            row_height(row, 0.75)
            for ci, (cell, (_, _, kind)) in enumerate(zip(row.cells, self.columns)):
                if kind == "check":
                    cell_text(cell, CHECKBOX, size=10, color=MUTED_HEX, align=WD_ALIGN_PARAGRAPH.CENTER,
                              font="Segoe UI Symbol")
                elif ci == 0 and self.row_labels:
                    cell_text(cell, self.row_labels[r], size=9, bold=True)
                elif ci == 0 and self.numbered:
                    cell_text(cell, str(r + 1), size=9, color=MUTED_HEX)
        total = sum(col[1] for col in self.columns)
        col_widths(t, [width * col[1] / total for col in self.columns])


class Prompts(Block):
    """Questions, each followed by ruled lines. Extra space adds lines evenly."""

    def __init__(self, items, label=None, spacing=18, flex=1):
        self.items, self.label, self.spacing, self.flex = items, label, spacing, flex

    Q_H = 15

    def min_h(self, w):
        return self.label_h() + sum(self.Q_H + n * self.spacing + 8 for _, n in self.items)

    def body(self, c, x, top, w, h):
        extra = max(0, int((h - (self.min_h(w) - self.label_h())) // self.spacing))
        counts = [n for _, n in self.items]
        i = 0
        while extra > 0:
            counts[i % len(counts)] += 1
            extra -= 1
            i += 1
        y = top
        for (q, _), n in zip(self.items, counts):
            c.setFont(SEMI, 8.5)
            c.setFillColor(INK)
            c.drawString(x, y - 10, q)
            y -= self.Q_H
            for _ in range(n):
                y -= self.spacing
                hline(c, x, x + w, y + 4)
            y -= 8

    def docx_body(self, doc, width):
        for q, n in self.items:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(q)
            r.bold = True
            r.font.size = Pt(9.5)
            ruled_table(doc, max(n, 2), width)


class Box(Block):
    """An open bordered area for free-form notes (optionally lined)."""

    def __init__(self, label=None, flex=1, min_h=60, lined=True, spacing=20, docx_lines=5):
        self.label, self.flex, self._min, self.lined, self.spacing = label, flex, min_h, lined, spacing
        self.docx_lines = docx_lines

    def min_h(self, w):
        return self.label_h() + self._min

    def body(self, c, x, top, w, h):
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.roundRect(x, top - h, w, h, 4, stroke=1, fill=0)
        if self.lined:
            y = top - self.spacing
            while y > top - h + 8:
                hline(c, x + 10, x + w - 10, y, FAINT, 0.5)
                y -= self.spacing

    def docx_body(self, doc, width):
        t = doc.add_table(1, 1)
        table_borders(t, inner_h=None, inner_v=None)
        cell = t.rows[0].cells[0]
        for _ in range(self.docx_lines - 1):
            cell.add_paragraph()
        col_widths(t, [width])


class Matrix(Block):
    """2x2 grid of titled boxes (e.g. an urgent / important matrix)."""

    def __init__(self, quads, label=None, flex=1, axis=None):
        self.quads, self.label, self.flex, self.axis = quads, label, flex, axis

    def min_h(self, w):
        return self.label_h() + 2 * 110 + 10

    def body(self, c, x, top, w, h):
        gap = 10
        bw, bh = (w - gap) / 2, (h - gap) / 2
        for i, (title, sub) in enumerate(self.quads):
            r, ci = divmod(i, 2)
            bx, by = x + ci * (bw + gap), top - (r + 1) * bh - r * gap
            c.setFillColor(FILL)
            c.setStrokeColor(RULE)
            c.setLineWidth(0.7)
            c.roundRect(bx, by, bw, bh, 5, stroke=1, fill=1)
            c.setFont(SEMI, 9.5)
            c.setFillColor(NAVY)
            c.drawString(bx + 10, by + bh - 16, title)
            c.setFont(REG, 7.5)
            c.setFillColor(MUTED)
            c.drawString(bx + 10, by + bh - 27, sub)
            y = by + bh - 46
            while y > by + 10:
                hline(c, bx + 10, bx + bw - 10, y, RULE, 0.5)
                y -= 19

    def docx_body(self, doc, width):
        t = doc.add_table(2, 2)
        table_borders(t, inner_h=("single", 4, RULE_HEX), inner_v=("single", 4, RULE_HEX))
        for i, (title, sub) in enumerate(self.quads):
            cell = t.rows[i // 2].cells[i % 2]
            shade(cell, FILL_HEX)
            cell_text(cell, title, size=10, bold=True, color=NAVY_HEX)
            p = cell.add_paragraph()
            r = p.add_run(sub)
            r.font.size = Pt(8)
            r.font.color.rgb = RGBColor.from_string(MUTED_HEX)
            for _ in range(6):
                cell.add_paragraph()
        col_widths(t, [width / 2, width / 2])


class Scale(Block):
    """Self-rating rows: an item name followed by numbered circles."""

    def __init__(self, items, points=5, label=None, row_h=20):
        self.items, self.points, self.label, self.row_h = items, points, label, row_h

    def min_h(self, w):
        return self.label_h() + len(self.items) * self.row_h

    def body(self, c, x, top, w, h):
        name_w = 110
        step = min(30, (w - name_w) / self.points)
        for i, item in enumerate(self.items):
            y = top - (i + 1) * self.row_h + 6
            c.setFont(MED, 8.5)
            c.setFillColor(INK)
            c.drawString(x, y, item)
            for p in range(self.points):
                cx = x + name_w + p * step + 8
                c.setStrokeColor(MUTED)
                c.setLineWidth(0.7)
                c.circle(cx, y + 3, 7, stroke=1, fill=0)
                c.setFont(MED, 7)
                c.setFillColor(MUTED)
                c.drawCentredString(cx, y + 0.6, str(p + 1))

    def docx_body(self, doc, width):
        t = doc.add_table(len(self.items) + 1, self.points + 1)
        table_borders(t)
        shade(t.rows[0].cells[0], TINT_HEX)
        cell_text(t.rows[0].cells[0], "Rate 1 (low) to 5 (high)", size=8.5, bold=True, color=NAVY_HEX)
        for p in range(self.points):
            shade(t.rows[0].cells[p + 1], TINT_HEX)
            cell_text(t.rows[0].cells[p + 1], str(p + 1), size=8.5, bold=True, color=NAVY_HEX,
                      align=WD_ALIGN_PARAGRAPH.CENTER)
        for r, item in enumerate(self.items):
            row = t.rows[r + 1]
            cell_text(row.cells[0], item, size=9.5)
            for p in range(self.points):
                cell_text(row.cells[p + 1], CHECKBOX, size=10, color=MUTED_HEX,
                          align=WD_ALIGN_PARAGRAPH.CENTER, font="Segoe UI Symbol")
        first = min(6.0, width * 0.4)
        col_widths(t, [first] + [(width - first) / self.points] * self.points)


class Grid(Block):
    """Calendar-style grid: column headers, optional row labels, write-in cells.

    Used for week-by-week calendars, monthly calendars and time-block grids.
    """

    def __init__(self, columns, rows, row_labels=None, row_sublabel=None, label=None, flex=1,
                 date_box=False, label_w=58, min_row_h=28, docx_row_h=1.6, half_lines=False):
        self.columns, self.n, self.row_labels = columns, rows, row_labels
        self.row_sublabel, self.label, self.flex = row_sublabel, label, flex
        self.date_box, self.label_w, self.min_row_h = date_box, label_w, min_row_h
        self.docx_row_h, self.half_lines = docx_row_h, half_lines

    HEADER_H = 18

    def min_h(self, w):
        return self.label_h() + self.HEADER_H + self.n * self.min_row_h

    def body(self, c, x, top, w, h):
        lw = self.label_w if self.row_labels else 0
        cw = (w - lw) / len(self.columns)
        rh = (h - self.HEADER_H) / self.n
        c.setFillColor(TINT)
        c.rect(x, top - self.HEADER_H, w, self.HEADER_H, stroke=0, fill=1)
        c.setFont(SEMI, 7.5)
        c.setFillColor(NAVY)
        for i, col in enumerate(self.columns):
            c.drawCentredString(x + lw + i * cw + cw / 2, top - 12, col)
        for r in range(self.n):
            ry = top - self.HEADER_H - (r + 1) * rh
            hline(c, x, x + w, ry, RULE, 0.6)
            if self.half_lines:
                c.setDash(1, 2)
                hline(c, x + lw, x + w, ry + rh / 2, FAINT, 0.5)
                c.setDash()
            if self.row_labels:
                c.setFont(SEMI, 8)
                c.setFillColor(INK)
                c.drawString(x + 5, ry + rh - 12, self.row_labels[r])
                if self.row_sublabel:
                    c.setFont(REG, 6.5)
                    c.setFillColor(MUTED)
                    c.drawString(x + 5, ry + rh - 22, self.row_sublabel)
                    hline(c, x + 5, x + lw - 6, ry + rh - 32, RULE, 0.5)
            if self.date_box:
                for i in range(len(self.columns)):
                    bx = x + lw + i * cw + 4
                    c.setStrokeColor(FAINT)
                    c.setLineWidth(0.6)
                    c.rect(bx, ry + rh - 15, 18, 11, stroke=1, fill=0)
        c.setStrokeColor(FAINT)
        c.setLineWidth(0.5)
        for i in range(len(self.columns) + (1 if self.row_labels else 0)):
            vx = x + lw + i * cw
            if vx > x:
                c.line(vx, top, vx, top - h)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.rect(x, top - h, w, h, stroke=1, fill=0)

    def docx_body(self, doc, width):
        has_label = bool(self.row_labels)
        t = doc.add_table(self.n + 1, len(self.columns) + (1 if has_label else 0))
        table_borders(t)
        hdr = t.rows[0]
        repeat_header(hdr)
        off = 1 if has_label else 0
        if has_label:
            shade(hdr.cells[0], TINT_HEX)
        for i, col in enumerate(self.columns):
            shade(hdr.cells[i + off], TINT_HEX)
            cell_text(hdr.cells[i + off], col, size=8.5, bold=True, color=NAVY_HEX, align=WD_ALIGN_PARAGRAPH.CENTER)
        for r in range(self.n):
            row = t.rows[r + 1]
            row_height(row, self.docx_row_h)
            if has_label:
                cell_text(row.cells[0], self.row_labels[r], size=9, bold=True)
                if self.row_sublabel:
                    p = row.cells[0].add_paragraph()
                    run = p.add_run(self.row_sublabel + " ____")
                    run.font.size = Pt(7.5)
                    run.font.color.rgb = RGBColor.from_string(MUTED_HEX)
        lw = 2.4 if has_label else 0
        col_widths(t, ([lw] if has_label else []) + [(width - lw) / len(self.columns)] * len(self.columns))


class Note(Block):
    """A short paragraph of guidance text."""

    def __init__(self, text, size=8.5, color=None, label=None):
        self.text, self.size, self.color, self.label = text, size, color or MUTED, label

    def min_h(self, w):
        return self.label_h() + len(wrap(self.text, REG, self.size, w)) * (self.size + 3.5)

    def body(self, c, x, top, w, h):
        c.setFont(REG, self.size)
        c.setFillColor(self.color)
        for i, ln in enumerate(wrap(self.text, REG, self.size, w)):
            c.drawString(x, top - self.size - i * (self.size + 3.5), ln)

    def docx_body(self, doc, width):
        for para in self.text.split("\n"):
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(3)
            r = p.add_run(para)
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor.from_string(MUTED_HEX if self.color == MUTED else INK_HEX)


class InfoBox(Block):
    """Shaded panel with a title and bullet points (static guidance)."""

    def __init__(self, title, bullets, cols=1, label=None):
        self.title, self.bullets, self.cols, self.label = title, bullets, cols, label

    def _cols(self, w):
        colw = (w - 24 - (self.cols - 1) * 16) / self.cols
        per = math.ceil(len(self.bullets) / self.cols)
        groups = [self.bullets[i * per:(i + 1) * per] for i in range(self.cols)]
        return colw, groups

    def min_h(self, w):
        colw, groups = self._cols(w)
        tallest = max(sum(len(wrap(b, REG, 8.2, colw - 10)) * 11 + 3 for b in g) for g in groups)
        return self.label_h() + 32 + tallest + 4

    def body(self, c, x, top, w, h):
        c.setFillColor(FILL)
        c.setStrokeColor(FAINT)
        c.roundRect(x, top - h, w, h, 5, stroke=1, fill=1)
        c.setFont(SEMI, 9)
        c.setFillColor(NAVY)
        c.drawString(x + 12, top - 18, self.title)
        colw, groups = self._cols(w)
        for gi, g in enumerate(groups):
            cx = x + 12 + gi * (colw + 16)
            y = top - 34
            for b in g:
                c.setFillColor(NAVY)
                c.circle(cx + 2, y + 2.6, 1.3, stroke=0, fill=1)
                c.setFont(REG, 8.2)
                c.setFillColor(INK)
                for ln in wrap(b, REG, 8.2, colw - 10):
                    c.drawString(cx + 9, y, ln)
                    y -= 11
                y -= 3

    def docx_body(self, doc, width):
        t = doc.add_table(1, 1)
        table_borders(t, outer=("single", 4, FAINT_HEX), inner_h=None, inner_v=None)
        cell = t.rows[0].cells[0]
        shade(cell, FILL_HEX)
        cell_text(cell, self.title, size=10, bold=True, color=NAVY_HEX)
        for b in self.bullets:
            p = cell.add_paragraph()
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run("•  " + b)
            r.font.size = Pt(9)
        col_widths(t, [width])


class Row(Block):
    """Places blocks side by side; all children share the row height."""

    def __init__(self, children, weights=None, gap=18):
        self.children, self.gap = children, gap
        self.weights = weights or [1] * len(children)
        self.flex = max(ch.flex for ch in children)

    def _widths(self, w):
        avail = w - self.gap * (len(self.children) - 1)
        total = sum(self.weights)
        return [avail * wt / total for wt in self.weights]

    def min_h(self, w):
        return max(ch.min_h(cw) for ch, cw in zip(self.children, self._widths(w)))

    def draw(self, c, x, top, w, h):
        cx = x
        for ch, cw in zip(self.children, self._widths(w)):
            ch_h = h if ch.flex or isinstance(ch, (Box, Grid)) else ch.min_h(cw)
            ch.draw(c, cx, top, cw, ch_h)
            cx += cw + self.gap

    def docx(self, doc):
        """Side by side in a borderless layout table, like the printed page."""
        t = doc.add_table(1, len(self.children))
        table_borders(t, outer=None, inner_h=None, inner_v=None)
        widths = [doc.width * wt / sum(self.weights) for wt in self.weights]
        col_widths(t, widths)
        for cell, ch, w in zip(t.rows[0].cells, self.children, widths):
            ch.docx(Ctx(cell, w - 0.4))
            first = cell.paragraphs[0]
            if not first.text and len(cell._tc) > 2:  # drop the cell's initial empty paragraph
                cell._tc.remove(first._p)


class Stack(Block):
    """Stacks blocks vertically inside a single slot (e.g. one column of a Row)."""

    def __init__(self, children):
        self.children = children
        self.flex = max(ch.flex for ch in children)

    def min_h(self, w):
        return sum(ch.min_h(w) for ch in self.children) + GAP * (len(self.children) - 1)

    def draw(self, c, x, top, w, h):
        y = top
        for ch, ch_h in zip(self.children, layout(self.children, w, h)):
            ch.draw(c, x, y, w, ch_h)
            y -= ch_h + GAP

    def docx(self, doc):
        for i, ch in enumerate(self.children):
            if i:
                small_gap(doc, 6)
            ch.docx(doc)


class Spacer(Block):
    def __init__(self, h=6):
        self.h = h

    def min_h(self, w):
        return self.h

    def draw(self, c, x, top, w, h):
        pass

    def docx(self, doc):
        small_gap(doc, 4)


class Page:
    """One template page: title, short instructions and a stack of blocks."""

    def __init__(self, title, intro=None, blocks=(), landscape=False, section=None):
        self.title, self.intro, self.blocks = title, intro, list(blocks)
        self.landscape, self.section = landscape, section or title


def layout(blocks, w, avail):
    """Return block heights that fill ``avail`` points, growing flex blocks."""
    mins = [b.min_h(w) for b in blocks]
    gaps = GAP * (len(blocks) - 1)
    extra = avail - sum(mins) - gaps
    if extra < -0.5:
        raise ValueError(f"page overflows by {-extra:.0f}pt")
    total_flex = sum(b.flex for b in blocks)
    return [m + (extra * b.flex / total_flex if total_flex else 0) for b, m in zip(blocks, mins)]


def docx_new_page(doc, landscape, first=False):
    """Start a new page, switching orientation with a new section if needed."""
    current = doc.sections[-1]
    is_land = current.orientation == WD_ORIENT.LANDSCAPE
    if landscape == is_land:
        if not first:
            doc.add_page_break()
        return
    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    w, h = current.page_width, current.page_height
    sec.orientation = WD_ORIENT.LANDSCAPE if landscape else WD_ORIENT.PORTRAIT
    long_side, short_side = max(w, h), min(w, h)
    sec.page_width, sec.page_height = (long_side, short_side) if landscape else (short_side, long_side)
