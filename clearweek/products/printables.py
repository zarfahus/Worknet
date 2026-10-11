"""Project Workflow Bundle: printable pages (monthly overview, project timeline, task checklist)
and the PDF setup guide that explains every file in the bundle."""
from __future__ import annotations

from pathlib import Path

from pdfkit import GREEN, GREEN_TINT, INK, INK_SOFT, RULE, SIZES, Doc
from planner import cover

PRINTABLE_PAGES = [
    ("Cover and contents", "What's in this file."),
    ("Monthly overview", "An undated month grid with space for projects, key deadlines and notes (landscape)."),
    ("Project timeline (12 weeks)", "Tasks and milestones with owner, start and due dates, and 12 week columns to shade in (landscape)."),
    ("Weekly task-management checklist", "A 15-step weekly routine with tick boxes for six weeks, so one printout lasts six weeks."),
]

CHECKLIST = [
    ("Capture", [
        "Clear your inboxes (email, notes, messages) into one task list",
        "Write down anything you're keeping in your head",
        "Check your calendar for the next two weeks",
    ]),
    ("Clarify", [
        "Decide for each item: do it, schedule it, hand it off or drop it",
        "Rewrite vague items as next actions that start with a verb",
        "Add due dates only where a real deadline exists",
    ]),
    ("Organize", [
        "Update the tracker: status, owner and due date for each task",
        "Mark finished tasks as Done",
        "Check every active project has at least one next action",
    ]),
    ("Plan", [
        "Choose next week's top three outcomes",
        "Block time in your calendar for the most important work",
        "Note anything you're waiting on and when to follow up",
    ]),
    ("Review", [
        "Look at overdue and due-soon tasks and projects",
        "Reschedule or renegotiate what won't happen",
        "Write down one thing to do differently next week",
    ]),
]

GUIDE_SECTIONS = [
    "What's in the bundle",
    "Which app to use",
    "The project tracker, sheet by sheet",
    "The content calendar, sheet by sheet",
    "The printables and the planner",
    "Troubleshooting",
    "License and help",
]


def monthly_overview(d: Doc) -> None:
    f = d.page("landscape")
    d.title("Monthly overview")
    d.field(f.width - 110, 7, "Month", 60)
    d.field(f.width - 44, 7, "Year", 44)
    y = 12
    cal_w = f.width * 0.72
    side_x = cal_w + 5
    side_w = f.width - side_x
    head = 7
    d.box(0, y, cal_w, head, fill=GREEN_TINT, stroke=GREEN_TINT, radius=0.8)
    cw = cal_w / 7
    for i, name in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]):
        d.text(cw * (i + 0.5), y + 4.8, name, font="Body-Bold", size=8.2, color=GREEN, align="center")
    top = y + head + 1.5
    rows = 6
    rh = (f.height - top) / rows
    for r in range(rows):
        for col in range(7):
            x = col * cw
            yy = top + r * rh
            d.box(x + 0.6, yy + 0.6, cw - 1.2, rh - 1.2, radius=1)
            d.box(x + 1.8, yy + 1.8, 7, 5.5, stroke=GREEN_TINT, fill=GREEN_TINT, radius=0.8)
    d.section(side_x, y, side_w, 62, "Projects this month", lines=False)
    d.check_lines(side_x + 3, y + 6.5, side_w - 6, 7, gap=7.4)
    d.section(side_x, y + 66, side_w, 58, "Key deadlines", lines=False)
    d.text(side_x + 3, y + 77, "Date", font="Body-Semi", size=7.2, color=INK_SOFT)
    d.text(side_x + 19, y + 77, "What's due", font="Body-Semi", size=7.2, color=INK_SOFT)
    for i in range(6):
        yy = y + 78 + (i + 1) * 6.6
        d.hline(side_x + 3, yy, 13, color=RULE)
        d.hline(side_x + 19, yy, side_w - 22)
    d.section(side_x, y + 128, side_w, f.height - y - 128, "Notes", gap=6.6)


def timeline(d: Doc) -> None:
    f = d.page("landscape")
    d.title("Project timeline (12 weeks)")
    d.field(f.width - 160, 7, "Project", 90)
    d.field(f.width - 64, 7, "Owner", 64)
    y = 13
    d.wrap(0, y + 2, f.width, "List the tasks and milestones in order. Write the start date of each week in the top row, then shade the weeks each task runs. Mark milestones with a diamond and tick the last column when a task is done.", size=8.6, color=INK_SOFT, leading=4.2)
    y = 24
    cols = [("#", 7), ("Task or milestone", 62), ("Owner", 22), ("Start", 16), ("Due", 16)]
    fixed = sum(w for _, w in cols)
    done_w = 10
    week_w = (f.width - fixed - done_w) / 12
    hh = 11
    d.box(0, y, f.width, hh, fill=GREEN_TINT, stroke=GREEN_TINT, radius=0.8)
    x = 0
    for name, w in cols:
        d.text(x + 2, y + 6.8, name, font="Body-Bold", size=7.8, color=GREEN)
        x += w
    for i in range(12):
        cx = fixed + i * week_w
        d.text(cx + week_w / 2, y + 4.4, f"Wk {i + 1}", font="Body-Bold", size=7.2, color=GREEN, align="center")
        d.hline(cx + 1.6, y + 9.2, week_w - 3.2, color=RULE)
    d.text(f.width - done_w / 2, y + 6.8, "Done", font="Body-Bold", size=7.2, color=GREEN, align="center")
    y += hh
    rows = int((f.height - y) // 8.6)
    rh = (f.height - y) / rows
    for r in range(rows):
        yy = y + r * rh
        d.hline(0, yy + rh, f.width, color=RULE)
        d.text(2, yy + rh - 2.8, str(r + 1), font="Body-Semi", size=7.5, color=INK_SOFT)
        d.checkbox(f.width - done_w / 2 - 1.7, yy + rh / 2 - 1.7)
    x = 0
    for _, w in cols:
        x += w
        d.vline(x, y - hh, rows * rh + hh)
    for i in range(1, 13):
        d.vline(fixed + i * week_w, y - hh, rows * rh + hh, color=GREEN_TINT if i < 12 else RULE)


def checklist(d: Doc) -> None:
    f = d.page()
    d.title("Weekly task-management checklist")
    y = d.wrap(0, 14, f.width, "Run through this once a week, ideally at the same time. Write the date at the top of a column and tick each step as you do it. One sheet covers six weeks; print a new one when it's full, or put it in a sheet protector and use a dry-erase pen.", size=9.4, color=INK_SOFT, leading=4.5)
    y += 4
    text_w = f.width - 6 * 13
    hh = 12
    d.box(0, y, f.width, hh, fill=GREEN_TINT, stroke=GREEN_TINT, radius=0.8)
    d.text(3, y + 7.6, "Step", font="Body-Bold", size=8.5, color=GREEN)
    for i in range(6):
        cx = text_w + i * 13
        d.text(cx + 6.5, y + 4.6, "Week of", font="Body-Semi", size=6.2, color=GREEN, align="center")
        d.hline(cx + 1.8, y + 9.6, 9.4, color=RULE)
    y += hh
    body_top = y - hh
    n = 1
    for group, items in CHECKLIST:
        y += 8.5
        d.label(3, y, group)
        y += 1.5
        for item in items:
            rh = 9.2
            d.text(3, y + 6, f"{n}.", font="Body-Bold", size=9, color=GREEN)
            d.wrap(10, y + 6, text_w - 12, item, size=9.3, leading=4.2)
            for i in range(6):
                d.checkbox(text_w + i * 13 + 4.8, y + 3)
            d.hline(0, y + rh, f.width, color=GREEN_TINT, width=0.6)
            y += rh
            n += 1
    for i in range(7):
        d.vline(text_w + i * 13, body_top, y - body_top, color=GREEN_TINT)
    y += 8
    if y < f.height - 30:
        d.section(0, y, f.width, f.height - y, "Notes for next week", gap=7)


def build_printables(out_dir: Path, paper: str, year: int) -> dict:
    name = f"ClearWeek-Project-Printables-{SIZES[paper]['suffix']}.pdf"
    d = Doc(out_dir / name, paper, "Project Workflow Printables", "Project Workflow Printables", year)
    other = "US Letter" if paper == "A4" else "A4"
    cover(
        d,
        "Project Workflow Printables",
        "Paper versions of the bundle's planning tools: a monthly overview, a 12-week project timeline and a reusable weekly checklist for managing tasks.",
        PRINTABLE_PAGES,
        [
            f"This is the {SIZES[paper]['label']} version. The {other} version is included in the same download.",
            "Pages 2 and 3 are landscape. Print at “Actual size” or “Scale 100%”. Licensed for personal use and your own internal work; full license at evadeclaw.com/terms",
        ],
    )
    monthly_overview(d)
    timeline(d)
    checklist(d)
    return {"file": name, "pages": d.save(), "paper": paper}


# ---------------------------------------------------------------------------------------
# Setup guide: text pages laid out with a small flowing-text helper.


class Flow:
    def __init__(self, d: Doc):
        self.d = d
        self.f = d.page()
        self.y = 4

    def need(self, h: float) -> None:
        if self.y + h > self.f.height:
            self.f = self.d.page()
            self.y = 4

    def h1(self, s: str) -> None:
        self.need(22)
        self.y += 6
        self.d.text(0, self.y, s, font="Title", size=17)
        self.y += 4
        self.d.hline(0, self.y, self.f.width, color=GREEN_TINT, width=0.8)
        self.y += 3

    def h2(self, s: str) -> None:
        self.need(16)
        self.y += 7.5
        self.d.text(0, self.y, s, font="Body-Bold", size=10.6, color=GREEN)
        self.y += 1

    def p(self, s: str, size: float = 9.6, color=INK, indent: float = 0) -> None:
        lines = max(1, int(self.d.width_of(s, "Body", size) // (self.f.width - indent)) + 1)
        self.need(lines * 4.7 + 3)
        self.y = self.d.wrap(indent, self.y + 5.2, self.f.width - indent, s, size=size, color=color, leading=4.7) - 4.7 + 1.6

    def bullets(self, items: list[str]) -> None:
        for s in items:
            self.need(10)
            self.d.text(1, self.y + 5.2, "•", font="Body-Bold", size=9.6, color=GREEN)
            self.p(s, indent=5)

    def table(self, header: list[str], rows: list[list[str]], widths: list[float]) -> None:
        total = sum(widths)
        ws = [w / total * self.f.width for w in widths]
        size = 8.6

        def row_height(cells, font):
            h = 0
            for cell, w in zip(cells, ws):
                n = 1
                line = ""
                for word in cell.split():
                    trial = f"{line} {word}".strip()
                    if self.d.width_of(trial, font, size) > w - 4 and line:
                        n += 1
                        line = word
                    else:
                        line = trial
                h = max(h, n)
            return h * 4.1 + 3.4

        def draw_row(cells, font, fill=None, color=INK):
            h = row_height(cells, font)
            self.need(h)
            if fill is not None:
                self.d.box(0, self.y, self.f.width, h, fill=fill, stroke=fill, radius=0.6)
            x = 0
            for cell, w in zip(cells, ws):
                self.d.wrap(x + 2, self.y + 4.8, w - 4, cell, font=font, size=size, color=color, leading=4.1)
                x += w
            self.y += h
            self.d.hline(0, self.y, self.f.width, color=GREEN_TINT, width=0.6)

        self.y += 3
        draw_row(header, "Body-Bold", fill=GREEN_TINT, color=GREEN)
        for r in rows:
            draw_row(r, "Body")
        self.y += 1


def build_guide(out_dir: Path, paper: str, year: int, files: list[dict]) -> dict:
    name = f"ClearWeek-Bundle-Setup-Guide-{SIZES[paper]['suffix']}.pdf"
    d = Doc(out_dir / name, paper, "Project Workflow Bundle: Setup Guide", "Project Workflow Bundle setup guide", year)
    fl = Flow(d)
    d.wordmark(0, 0)
    fl.y = 26
    d.text(0, fl.y, "Project Workflow Bundle", font="Title", size=26)
    fl.y += 9
    d.text(0, fl.y, "Setup guide", font="Title-Italic", size=16, color=INK_SOFT)
    fl.y += 4
    fl.p("This guide explains each file in the bundle, which apps open them, and how the spreadsheets work. It takes about ten minutes to read. You don't need to read it all before you start: open the project tracker, read its Start here sheet, and come back to this guide when you have a question.", color=INK_SOFT)

    fl.h1("1. What's in the bundle")
    fl.table(["File", "What it is"], [[f["filename"], f["label"]] for f in files], [1.2, 2])
    fl.p("Every PDF comes in two paper sizes. Use the A4 files on A4 paper and the US Letter files on Letter paper. The spreadsheets work with any paper size.")

    fl.h1("2. Which app to use")
    fl.p("The spreadsheets are standard Excel workbooks (.xlsx). They contain no macros, scripts or add-ins, and they use only common functions such as IF, COUNTIFS, INDEX, MATCH, WEEKDAY and EOMONTH. Color highlights and the timeline bars use conditional formatting rules.")
    fl.table(
        ["App", "Editing and formulas", "Drop-down lists", "Highlights and timeline bars"],
        [
            ["Microsoft Excel 2016 or later, Microsoft 365 (Windows and Mac)", "Yes", "Yes", "Yes"],
            ["Excel for the web", "Yes", "Yes", "Yes"],
            ["Google Sheets", "Yes, after File › Save as Google Sheets", "Yes", "Yes"],
            ["LibreOffice Calc 7 or later", "Yes", "Yes", "Yes"],
            ["Apple Numbers", "Yes", "May need to be recreated as pop-up menus", "Not supported: the rules are dropped when Numbers imports the file"],
            ["Phone and tablet apps", "Yes, but small screens make the timeline and month views hard to use", "Usually", "Usually"],
        ],
        [2.2, 1.6, 1.4, 1.8],
    )
    fl.p("If you use Apple Numbers, everything still calculates, but overdue and due-soon colors and the timeline bars won't appear. Excel, Google Sheets or LibreOffice (free) will show them.")
    fl.p("Dates follow your computer's regional settings, so they appear as day/month or month/day depending on where you are. Type dates the way your computer expects them.")

    fl.h1("3. The project tracker, sheet by sheet")
    fl.p("File: ClearWeek-Project-Tracker.xlsx. White cells are for you to fill in. Cells with a grey background calculate automatically, so please don't type over them.")
    for head, body in [
        ("Start here", "A short version of these instructions, kept inside the file."),
        ("Lists", "The choices that appear in the drop-down lists: statuses, priorities and people. Add your team's names in the People column. You can rename statuses, but keep one called Done, because the tracker uses it to count finished work."),
        ("Projects", "One row per project (up to 30): name, owner, status, priority, start and due dates. The grey columns count each project's tasks, show the share that's done, the days left, and a health flag: On track, Due soon (7 days or less), Overdue or Done."),
        ("Tasks", "One row per task (up to 300). Choose the project from the drop-down list so the task counts towards it. When you finish a task, set its status to Done and type the date in Done on (Ctrl + ; enters today's date in Excel and LibreOffice). The Flag column shows Overdue or Due soon (2 days or less)."),
        ("Timeline", "A 26-week bar chart of your projects, built from their start and due dates on the Projects sheet. It starts on the Monday of the current week. To pin it to a fixed date, type a Monday's date over the formula in the yellow cell. The current week is shaded."),
        ("Monthly overview", "A calendar for any month. Type a date in the yellow cell to choose the month. Each day shows how many open tasks are due and the first project due that day. The panel on the right counts projects due, tasks due, tasks completed and tasks overdue."),
        ("Weekly checklist", "The 15-step weekly routine from the printables, with a column for each week. Choose ✓ from the drop-down list as you complete each step."),
    ]:
        fl.h2(head)
        fl.p(body)

    fl.h1("4. The content calendar, sheet by sheet")
    fl.p("File: ClearWeek-Content-Calendar.xlsx. Use it to plan what you'll publish, where and when, whether that's a blog, a newsletter or social media posts.")
    for head, body in [
        ("Calendar", "One row per piece of content (up to 400): publish date, channel, title or topic, format, status, owner, the date the draft is due, and a link to the draft or file. Day and Week fill in from the date. The Flag column warns about past dates that aren't published yet, late drafts, and anything due in the next 3 days. Published rows turn green and scheduled rows turn blue."),
        ("Month view", "A calendar for any month. Each day shows the first planned item and how many more are planned. Type a date in the yellow cell to change the month."),
        ("Ideas", "A place to collect ideas before they have a date. When an idea gets scheduled, copy it to the Calendar sheet and mark it Used."),
        ("Lists", "Channels, formats, statuses and people for the drop-down lists. Edit them to match the places you publish."),
    ]:
        fl.h2(head)
        fl.p(body)

    fl.h1("5. The printables and the planner")
    fl.p("The bundle includes the complete Weekly Focus Planner and the Project Workflow Printables, each in A4 and US Letter. A simple way to use everything together:")
    fl.bullets([
        "Once a month: print the monthly overview. Copy in the project due dates from the tracker's Monthly overview sheet.",
        "At the start of a project: print a project timeline and list its main tasks and milestones. Add the same tasks to the Tasks sheet.",
        "Once a week: work through the task-management checklist, update the tracker, then fill in the planner's weekly plan.",
        "Every day: use the planner's daily page for your top three priorities.",
        "At the end of the week: complete the weekly review.",
    ])

    fl.h1("6. Troubleshooting")
    fl.table(
        ["What you see", "What to do"],
        [
            ["##### in a cell", "The column is too narrow for the date or number. Drag the column edge to widen it."],
            ["A date shows as a number such as 46320", "Format the cell as a date (in Excel: Home › Number format › Short date)."],
            ["A project is missing from the Tasks drop-down list", "Check it's typed on the Projects sheet. The list includes the first 30 project rows."],
            ["The timeline shows no bar", "The project needs both a start date and a due date on the Projects sheet."],
            ["No colors or timeline bars", "Your app doesn't support conditional formatting rules (for example Apple Numbers). Open the file in Excel, Google Sheets or LibreOffice."],
            ["Formulas show as text in Google Sheets", "Open the file, then choose File › Save as Google Sheets and work in the converted copy."],
            ["A file won't open or looks damaged", "Download it again from your download link. If that doesn't help, email us and we'll send a new copy."],
        ],
        [1.3, 2.4],
    )

    fl.h1("7. License and help")
    fl.p("Your purchase lets you use these files for your own personal use and for internal work within your own business or organization, including by the people who work there. You can edit them, print them and save as many copies as you need for that use. Please don't share the files outside your organization, resell them, publish them, or include them in products or templates you sell or give away. The full license is in our Terms and Conditions at evadeclaw.com/terms.")
    fl.p("Questions or problems: email support@evadeclaw.com and include your order number. If a file is faulty or doesn't match its description, we'll fix it, replace it or refund you; see evadeclaw.com/refund-policy.")
    return {"file": name, "pages": d.save(), "paper": paper}
