"""Weekly Focus Planner: an undated, printable weekly planning pack."""
from __future__ import annotations

from pathlib import Path

from pdfkit import GREEN, GREEN_TINT, INK, INK_SOFT, RULE, SIZES, Doc

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# (page title, what it's for). Also used for the cover's contents list and the website.
PAGES = [
    ("Cover and contents", "What's in the planner."),
    ("How to use and print this planner", "A simple weekly routine, what to print and how many copies, and printing tips."),
    ("Weekly plan", "Your focus, top three outcomes, deadlines and a box for each day of the week."),
    ("Daily priorities and task list", "Three priorities, a task list with checkboxes, an hour-by-hour schedule and an end-of-day note."),
    ("Habit tracker", "Up to 12 habits across a month of 31 days, with a goal and a total for each (landscape page)."),
    ("Weekly review", "What got done, what slipped, wins, lessons, three 1-to-5 ratings and next week's top three."),
    ("Notes", "A dot-grid page for notes, lists or sketches."),
]


def cover(d: Doc, title: str, subtitle: str, pages: list[tuple[str, str]], extra: list[str]) -> None:
    f = d.page()
    d.wordmark(0, 2)
    d.hline(0, 16, f.width, color=GREEN, width=1.2)
    d.text(0, 46, title, font="Title", size=34)
    y = d.wrap(0, 57, f.width * 0.8, subtitle, size=12.5, color=INK_SOFT, leading=6.2)

    y += 10
    d.label(0, y, "What's inside")
    y += 4
    for i, (name, desc) in enumerate(pages, start=1):
        y += 9
        d.text(0, y, f"{i:>2}", font="Body-Bold", size=10, color=GREEN)
        d.text(9, y, name, font="Body-Bold", size=10.5)
        d.text(f.width, y, f"page {i}", size=9, color=INK_SOFT, align="right")
        y = d.wrap(9, y + 4.6, f.width - 30, desc, size=8.8, color=INK_SOFT, leading=4.2) - 2.4
        d.hline(9, y + 2.6, f.width - 9, color=GREEN_TINT, width=0.6)

    y = max(y + 14, f.height - 46)
    d.box(0, y, f.width, 38, fill=GREEN_TINT, stroke=GREEN_TINT)
    yy = y + 7.5
    d.label(5, yy, "About this file")
    yy += 2
    for line in extra:
        yy = d.wrap(5, yy + 4.6, f.width - 10, line, size=9, leading=4.4)


def how_to(d: Doc) -> None:
    f = d.page()
    d.title("How to use and print this planner")
    y = 14
    d.wrap(0, y, f.width, "The planner works on a weekly rhythm. None of the pages are dated, so you can start any week, skip a week, and print only the pages you use.", size=10.5, color=INK_SOFT, leading=5)

    y = 30
    d.label(0, y, "The weekly routine")
    steps = [
        ("Start of the week, about 15 minutes", "Fill in the weekly plan. Write one focus for the week and the three outcomes that would make it a good week. Add deadlines and appointments, then sketch out each day."),
        ("Each morning, about 5 minutes", "Take a daily page. Choose up to three priorities, usually from your weekly plan, then list the smaller tasks. Block time for the priorities in the schedule column."),
        ("End of the week, about 15 minutes", "Complete the weekly review. Note what got done and what slipped, rate the week, and carry anything unfinished into next week's top three."),
        ("Once a month", "Start a fresh habit tracker. Keep it to the few habits you actually want to build; five well-tracked habits beat twelve half-tracked ones."),
    ]
    y += 3
    for head, body in steps:
        y += 7.5
        d.text(0, y, head, font="Body-Bold", size=10)
        y = d.wrap(0, y + 4.8, f.width, body, size=9.6, leading=4.6)

    y += 6
    d.label(0, y, "What to print")
    rows = [("Page", "Copies", "When"), ("Weekly plan (page 3)", "1 per week", "At the start of the week"), ("Daily priorities and task list (page 4)", "5 to 7 per week", "Each working day"), ("Habit tracker (page 5)", "1 per month", "First day of the month"), ("Weekly review (page 6)", "1 per week", "At the end of the week"), ("Notes (page 7)", "As needed", "Any time")]
    y += 3
    col = [0, f.width * 0.52, f.width * 0.74]
    for i, row in enumerate(rows):
        y += 6.4
        for j, cell in enumerate(row):
            d.text(col[j], y, cell, font="Body-Bold" if i == 0 else "Body", size=9.3, color=INK if i else GREEN)
        d.hline(0, y + 2.3, f.width, color=GREEN_TINT if i else RULE, width=0.6)

    y += 11
    d.label(0, y, "Printing tips")
    tips = [
        "Use the file that matches your paper: the A4 file for A4 paper, the US Letter file for Letter paper. Both are included with every purchase.",
        "In the print dialog choose “Actual size” or “Scale 100%”. If your printer can't print close to the edge, “Fit to printable area” shrinks the page very slightly, which is fine.",
        "To print one page several times, enter just that page number (for example “4”) and set the number of copies.",
        "The habit tracker (page 5) is a landscape page. Most printers rotate it automatically; if not, choose landscape for that page.",
        "Printing in black and white works well: every line and box stays visible in greyscale. Paper of 90 to 100 g/m² (24 lb) stops most pens showing through.",
    ]
    y += 2
    for t in tips:
        y += 5.2
        d.text(0, y, "•", font="Body-Bold", size=9.6, color=GREEN)
        y = d.wrap(4, y, f.width - 4, t, size=9.4, leading=4.5) - 4.5 + 1.2

    y += 9
    d.label(0, y, "Using it on a tablet")
    y = d.wrap(0, y + 5.5, f.width, "Import the PDF into any note-taking app that lets you write on PDFs, for example GoodNotes, Notability, Xodo or Adobe Acrobat Reader, and duplicate pages inside the app to reuse them. The pages are flat artwork with no fillable form fields or links.", size=9.4, leading=4.5)
    y += 5
    d.label(0, y, "Need help?")
    d.wrap(0, y + 5.5, f.width, "Email support@evadeclaw.com with your order number if a page won't print or the file won't open. We'll help or send a replacement file.", size=9.4, leading=4.5)


def weekly_plan(d: Doc) -> None:
    f = d.page()
    d.title("Weekly plan")
    d.field(f.width - 72, 7, "Week of", 72)
    y = 13
    d.box(0, y, f.width, 11)
    d.label(3, y + 4.6, "Focus for the week")
    d.hline(3, y + 9.2, f.width - 6, color=RULE)

    y += 14
    h_top = 37
    w_left = f.width * 0.56
    d.box(0, y, w_left, h_top)
    d.label(3, y + 5.2, "Top 3 outcomes")
    d.check_lines(3, y + 6.5, w_left - 6, 3, gap=9.5, numbered=True)
    d.section(w_left + 4, y, f.width - w_left - 4, h_top, "Deadlines and appointments", gap=7)

    y += h_top + 4
    gap = 3.5
    rows = 4
    box_h = (f.height - y - gap * (rows - 1)) / rows
    w = (f.width - 4) / 2
    names = DAYS[:4] + DAYS[4:] + ["Notes and carry-over"]
    for i, name in enumerate(names):
        col, row = (0, i) if i < 4 else (1, i - 4)
        x = col * (w + 4)
        yy = y + row * (box_h + gap)
        d.box(x, yy, w, box_h, fill=None)
        d.label(x + 3, yy + 5.2, name)
        if name in DAYS:
            d.field(x + w - 26, yy + 5.2, "Date", 23, size=7.5)
        d.lines(x + 3, yy + 7, w - 6, box_h - 8.5, gap=6.6, first=6.6)


def daily(d: Doc) -> None:
    f = d.page()
    d.title("Daily priorities and task list")
    y = 14
    d.field(0, y + 3, "Date", 48)
    x = f.width - 7 * 6.2
    d.text(x - 2.5, y + 3, "Day", font="Body-Semi", size=8.5, color=INK_SOFT, align="right")
    for i, letter in enumerate("MTWTFSS"):
        d.circle(x + i * 6.2 + 2.6, y + 2, r=2.5)
        d.text(x + i * 6.2 + 2.6, y + 3.1, letter, font="Body-Semi", size=7.5, color=INK_SOFT, align="center")

    y += 9
    left_w = f.width * 0.6
    right_x = left_w + 4
    right_w = f.width - right_x

    # Left column: priorities, tasks, notes
    d.box(0, y, left_w, 40, fill=None)
    d.label(3, y + 5.2, "Top 3 priorities")
    d.check_lines(3, y + 6.5, left_w - 6, 3, gap=10.5, numbered=True)

    ty = y + 44
    bottom_h = 38
    task_h = f.height - ty - bottom_h - 4
    d.box(0, ty, left_w, task_h)
    d.label(3, ty + 5.2, "Tasks")
    n = int((task_h - 9) // 7)
    d.check_lines(3, ty + 6.5, left_w - 6, n, gap=7)
    d.section(0, f.height - bottom_h, left_w, bottom_h, "End of day: what moved forward? what carries over?", gap=7)

    # Right column: schedule
    d.box(right_x, y, right_w, f.height - y)
    d.label(right_x + 3, y + 5.2, "Schedule")
    hours = list(range(6, 22))
    top = y + 9
    slot = (f.height - top - 3) / len(hours)
    for i, hr in enumerate(hours):
        yy = top + i * slot
        d.hline(right_x + 3, yy, right_w - 6, color=RULE)
        d.hline(right_x + 12, yy + slot / 2, right_w - 15, dash=(1, 1.6))
        label = f"{hr % 12 or 12}{'am' if hr < 12 else 'pm'}"
        d.text(right_x + 3, yy + 3.6, label, font="Body-Semi", size=7.3, color=INK_SOFT)
    d.hline(right_x + 3, top + len(hours) * slot, right_w - 6, color=RULE)


def habit_tracker(d: Doc) -> None:
    f = d.page("landscape")
    d.title("Habit tracker")
    d.field(f.width - 62, 7, "Month", 62)
    y = 12
    d.wrap(0, y + 2, f.width * 0.7, "Write a habit and a realistic goal (for example “5 a week”) on each row. Tick or fill a box on each day you do it, then count the ticks at the end of the month.", size=8.8, color=INK_SOFT, leading=4.2)

    y = 25
    name_w, goal_w, total_w = 52, 18, 13
    days_w = f.width - name_w - goal_w - total_w
    cell = days_w / 31
    row_h = 9.4
    rows = 12
    # header
    d.box(0, y, f.width, 7, fill=GREEN_TINT, stroke=GREEN_TINT, radius=0.8)
    d.text(2.5, y + 4.8, "Habit", font="Body-Bold", size=8, color=GREEN)
    d.text(name_w + goal_w / 2, y + 4.8, "Goal", font="Body-Bold", size=8, color=GREEN, align="center")
    for i in range(31):
        d.text(name_w + goal_w + cell * (i + 0.5), y + 4.8, str(i + 1), font="Body-Semi", size=6.8, color=GREEN, align="center")
    d.text(f.width - total_w / 2, y + 4.8, "Total", font="Body-Bold", size=8, color=GREEN, align="center")
    y += 7
    for r in range(rows):
        yy = y + r * row_h
        d.hline(0, yy + row_h, f.width, color=RULE)
        # day cells
        for i in range(31):
            cx = name_w + goal_w + cell * i
            d.box(cx + 0.7, yy + 1.9, cell - 1.4, row_h - 3.8, radius=0.5, width=0.45)
    for x in (name_w, name_w + goal_w, f.width - total_w):
        d.vline(x, y, rows * row_h)

    y += rows * row_h + 6
    h = f.height - y
    w = (f.width - 8) / 3
    for i, t in enumerate(["Easiest habit this month", "Hardest habit, and a smaller version to try", "Keep, change or drop next month?"]):
        d.section(i * (w + 4), y, w, h, t, gap=6.8)


def weekly_review(d: Doc) -> None:
    f = d.page()
    d.title("Weekly review")
    d.field(f.width - 72, 7, "Week of", 72)
    y = 13
    w = (f.width - 4) / 2
    # The four reflection boxes take whatever height is left after the fixed-size sections below.
    h = (f.height - y - 8 - 31 - 36 - 42) / 2
    for r, (a, b) in enumerate([("What got done", "What slipped, and why"), ("Wins worth noting", "What I learned")]):
        yy = y + r * (h + 4)
        d.section(0, yy, w, h, a)
        d.section(w + 4, yy, w, h, b)

    y += 2 * (h + 4)
    d.box(0, y, f.width, 27)
    d.label(3, y + 5.2, "Rate the week (circle one)")
    scales = [("Focus", "scattered", "focused"), ("Energy", "drained", "energized"), ("Workload", "too light", "too heavy")]
    sw = (f.width - 6) / 3
    for i, (name, lo, hi) in enumerate(scales):
        x = 3 + i * sw
        d.text(x, y + 13, name, font="Body-Bold", size=9.5)
        for k in range(5):
            cx = x + 3 + k * 9
            d.circle(cx, y + 18.5, r=3)
            d.text(cx, y + 19.6, str(k + 1), font="Body-Semi", size=8, color=INK_SOFT, align="center")
        d.text(x, y + 25, f"1 = {lo}, 5 = {hi}", size=7.2, color=INK_SOFT)

    y += 31
    w3 = (f.width - 8) / 3
    for i, t in enumerate(["Keep doing", "Stop doing", "Start doing"]):
        d.section(i * (w3 + 4), y, w3, 32, t)

    y += 36
    h = f.height - y
    d.box(0, y, f.width, h)
    d.label(3, y + 5.2, "Next week's top 3")
    gap = min(10.5, (h - 9) / 3)
    d.check_lines(3, y + 6, f.width - 6, 3, gap=gap, numbered=True)


def notes(d: Doc) -> None:
    f = d.page()
    d.title("Notes")
    d.field(f.width - 60, 7, "Date", 60)
    d.box(0, 12, f.width, f.height - 12)
    d.dot_grid(2, 14, f.width - 4, f.height - 16)


def build(out_dir: Path, paper: str, year: int) -> dict:
    name = f"ClearWeek-Weekly-Focus-Planner-{SIZES[paper]['suffix']}.pdf"
    d = Doc(out_dir / name, paper, "Weekly Focus Planner", "Weekly Focus Planner", year)
    other = "US Letter" if paper == "A4" else "A4"
    cover(
        d,
        "Weekly Focus Planner",
        "An undated printable pack for planning your week, choosing daily priorities, tracking habits and reviewing your progress.",
        PAGES,
        [
            f"This is the {SIZES[paper]['label']} version. The {other} version is included in the same download.",
            "Undated: print pages as often as you need them for your own use. Licensed for personal use and your own internal work; please don't share or resell the file. Full license: evadeclaw.com/terms",
        ],
    )
    how_to(d)
    weekly_plan(d)
    daily(d)
    habit_tracker(d)
    weekly_review(d)
    notes(d)
    pages = d.save()
    return {"file": name, "pages": pages, "paper": paper}
