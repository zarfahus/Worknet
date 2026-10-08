"""Page definitions for every WorkNest Studio template document."""
from blocks import (Checklist, Fields, Grid, InfoBox, Lines, Matrix, Note, Page, Prompts, Row,
                    Scale, Stack, Table)

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


# --------------------------------------------------------------------------
# Weekly Focus Planner
# --------------------------------------------------------------------------

def weekly_focus_planner():
    pages = [
        Page("Weekly Plan",
             "Start each week here. Choose a focus, pick three priorities and note the fixed commitments "
             "you need to plan around.",
             [Fields(["Week of", "Focus theme"]),
              Lines(label="Top 3 priorities this week", lines=3, numbered=True, spacing=22),
              Table([("Day", 1.1), ("Time", 0.9), ("What", 3.2), ("Where / with whom", 2.2), ("Prep needed", 1.8)],
                    label="Appointments & deadlines", min_rows=6, flex=2, docx_rows=8),
              Row([Lines(label="Tasks to schedule", checkbox=True, min_lines=6, docx_lines=8),
                   Lines(label="Notes", min_lines=6, docx_lines=6)])],
             section="Weekly planning page"),
        Page("Priority Tracker",
             "List everything competing for your attention this week, then rank it. Keep each next action "
             "small and specific so it is easy to start.",
             [Fields(["Week of", "Most important outcome this week"]),
              Table([("No.", 0.45), ("Priority", 3), ("Why it matters", 2.6), ("Next action", 2.6),
                     ("Deadline", 1), ("Status", 1.1), ("Done", 0.55, "check")],
                    numbered=True, min_rows=10, docx_rows=12),
              Note("Status ideas: Not started · In progress · Waiting on someone · Done")],
             landscape=True),
    ]
    for day in DAYS:
        pages.append(Page(
            f"Daily Tasks — {day}",
            "Pick no more than three must-do tasks and give them time in your schedule. Capture everything "
            "else in the task list and move unfinished items forward at the end of the day.",
            [Fields(["Date", "Today's focus"]),
             Row([Stack([Lines(label="Must do today", lines=3, checkbox=True, spacing=21),
                         Lines(label="Other tasks", checkbox=True, min_lines=8, docx_lines=8)]),
                  Grid(["Schedule"], 14, row_labels=[f"{h}:00" for h in range(7, 21)], label_w=38,
                       min_row_h=22, half_lines=True, docx_row_h=0.9)],
                 weights=[1.15, 1]),
             Row([Lines(label="Notes", lines=4), Lines(label="Move to tomorrow", lines=4, checkbox=True)])],
            section="Daily task pages (Monday to Sunday)"))
    pages += [
        Page("Weekly Review",
             "Set aside 20 minutes at the end of the week. Look back honestly, then decide what carries forward.",
             [Fields(["Week of", "Date reviewed"]),
              Prompts([("What went well this week?", 3), ("What did I complete?", 3),
                       ("What didn't get done, and why?", 3), ("What did I learn?", 2)], flex=2),
              Row([Lines(label="Carry forward to next week", checkbox=True, min_lines=5, docx_lines=5),
                   Lines(label="Next week's focus", lines=3, numbered=True)]),
              Scale(["Focus", "Energy", "Progress on priorities", "Work–life balance"],
                    label="How did the week feel?")],
             section="Weekly review page"),
        Page("Goal Tracker",
             "Break a goal into milestones, then log your progress each week for up to 12 weeks.",
             [Fields(["Goal", "Why it matters", "Start date", "Target date"]),
              Lines(label="What success looks like", lines=2),
              Table([("Milestone", 4), ("Target date", 1.3), ("Done", 0.6, "check")], label="Milestones", rows=5),
              Table([("Week", 0.8), ("Week of", 1.1), ("Actions taken", 3.5), ("Progress", 0.9),
                     ("Notes / obstacles", 2.6)],
                    label="Weekly progress", row_labels=[f"Week {i}" for i in range(1, 13)]),
              Lines(label="Reflections", min_lines=2, flex=1, docx_lines=3)],
             section="Goal-tracking worksheet"),
    ]
    return pages


# --------------------------------------------------------------------------
# Meeting Notes & Action Tracker
# --------------------------------------------------------------------------

def meeting_notes_action_tracker():
    return [
        Page("Meeting Agenda",
             "Share the agenda before the meeting so everyone knows the purpose, the topics and what needs "
             "to be decided.",
             [Fields(["Meeting title", "Date", "Time", "Location / link", "Facilitator", "Note taker"]),
              Lines(label="Purpose of the meeting", lines=2),
              Lines(label="Desired outcomes", lines=3, checkbox=True),
              Table([("Time", 0.8), ("Topic", 3.2), ("Lead", 1.2), ("Type", 1.2), ("Minutes", 0.8)],
                    label="Agenda", min_rows=7, flex=2, docx_rows=8),
              Note("Type: Inform · Discuss · Decide"),
              Row([Table([("Name", 2.2), ("Role", 1.6), ("Present", 0.8, "check")], label="Attendees", rows=5),
                   Lines(label="Preparation / pre-reading", lines=5)])],
             section="Agenda template"),
        Page("Meeting Notes",
             "Capture the discussion by topic. Record decisions and action items as they happen so nothing "
             "is lost after the meeting.",
             [Fields(["Meeting", "Date", "Attendees", "Note taker"]),
              Table([("Topic", 1.2), ("Notes", 4)], label="Discussion notes", min_rows=10, flex=3, docx_rows=12),
              Lines(label="Decisions made", lines=3, numbered=True),
              Table([("Action", 3.2), ("Owner", 1.2), ("Due", 0.9), ("Done", 0.5, "check")],
                    label="Action items", rows=5),
              Lines(label="Parking lot — topics for another time", lines=2)],
             section="Meeting notes template"),
        Page("Meeting Notes — Continued",
             "Use this page when the discussion needs more space.",
             [Fields(["Meeting", "Date", "Page"], cols=3),
              Table([("Topic", 1.2), ("Notes", 4)], min_rows=16, docx_rows=18),
              Table([("Action", 3.2), ("Owner", 1.2), ("Due", 0.9), ("Done", 0.5, "check")],
                    label="Additional action items", rows=4)],
             section="Meeting notes template"),
        Page("Decision Tracker",
             "Keep one running log of decisions so everyone can see what was decided, why, and when it "
             "should be revisited.",
             [Table([("No.", 0.45), ("Date", 0.9), ("Decision", 3), ("Context & options considered", 3),
                     ("Decided by", 1.3), ("Who is affected", 1.4), ("Review date", 1)],
                    numbered=True, min_rows=12, docx_rows=14)],
             landscape=True),
        Page("Action-Item Tracker",
             "Collect the action items from every meeting in one place. Review open items at the start of "
             "each meeting.",
             [Table([("No.", 0.45), ("Action item", 3.6), ("Owner", 1.3), ("From meeting", 1.3), ("Due date", 1),
                     ("Status", 1.2), ("Notes", 2), ("Done", 0.55, "check")],
                    numbered=True, min_rows=12, docx_rows=14),
              Note("Status ideas: Open · In progress · Blocked · Done")],
             landscape=True),
        Page("Meeting Follow-Up",
             "Use within a day of the meeting to confirm outcomes, share action items and set up the next "
             "conversation.",
             [Fields(["Meeting", "Meeting date", "Follow-up owner", "Completed on"]),
              Checklist(["Summary sent to attendees", "Action items confirmed with each owner",
                         "Decisions added to the decision tracker", "Documents, files and links shared",
                         "Calendar invites sent for follow-up work", "Next meeting scheduled"],
                        label="Follow-up checklist", cols=2),
              Table([("Question", 3.2), ("Who will answer", 1.4), ("By when", 1)], label="Open questions", rows=4),
              Table([("Name", 1.6), ("What they need to know", 3.5), ("Done", 0.6, "check")],
                    label="People to update", rows=4),
              Lines(label="Summary message draft", min_lines=4, flex=1, docx_lines=6),
              Fields(["Next meeting date", "Time", "Topics to carry over"], cols=3)],
             section="Follow-up page"),
    ]


# --------------------------------------------------------------------------
# Content Planning Calendar
# --------------------------------------------------------------------------

def _week_grid_page(first, last, section="90-day calendar"):
    weeks = list(range(first, last + 1))
    return Page(f"90-Day Calendar — Weeks {first}–{last}",
                "Write the start date of each week and the date in each small box. Plan each piece of content "
                "with its channel and working title.",
                [Grid(DAYS_SHORT, len(weeks), row_labels=[f"Week {w}" for w in weeks],
                      row_sublabel="Week starting", date_box=True, label_w=64, docx_row_h=2.2),
                 Note("Tip: mark each item with a status letter — I (idea), D (drafting), S (scheduled), "
                      "P (published).")],
                landscape=True, section=section)


def content_planning_calendar():
    return [
        Page("90-Day Plan Overview",
             "Set the direction for the next 90 days before filling in the calendar. Keep themes broad and "
             "only plan for channels you can maintain.",
             [Fields(["Start date", "End date", "Prepared by", "Last updated"]),
              Lines(label="Main goal for these 90 days", lines=2),
              Table([("Period", 1), ("Theme", 2), ("Key topics", 3), ("Important dates", 2)],
                    label="Monthly themes", row_labels=["Days 1–30", "Days 31–60", "Days 61–90"], row_h=40),
              Table([("Channel", 1.8), ("Content type", 2), ("How often", 1.3), ("Owner", 1.3)],
                    label="Channels", rows=5),
              Prompts([("Who is the content for?", 2), ("What should readers or viewers do next?", 2)], flex=1)],
             section="90-day plan overview"),
        _week_grid_page(1, 4), _week_grid_page(5, 8), _week_grid_page(9, 13),
        Page("Content Idea Worksheet",
             "Collect ideas whenever they come up, then review this list each time you plan the next block "
             "of the calendar.",
             [InfoBox("Idea starters", ["Questions customers or readers often ask",
                                        "Common mistakes and how to avoid them", "Step-by-step how-tos",
                                        "Behind the scenes of how you work",
                                        "Checklists and resources you rely on", "Seasonal topics and upcoming dates",
                                        "Lessons from recent projects", "Myths in your field, explained"], cols=4),
              Table([("Idea / working title", 3), ("Who it's for", 1.6), ("Format", 1.1), ("Channel", 1.1),
                     ("Priority", 0.9), ("Notes", 2)], min_rows=8, docx_rows=14),
              Note("Priority: H (high) · M (medium) · L (low)")],
             landscape=True),
        Page("Publishing Tracker",
             "Track each piece from draft to published and update the status as the work moves forward.",
             [Table([("Title", 3), ("Channel", 1.2), ("Format", 1), ("Owner", 1), ("Draft due", 0.95),
                     ("Publish date", 0.95), ("Status", 1.1), ("Link / location", 1.8)],
                    min_rows=13, docx_rows=16),
              Note("Status ideas: Idea · Drafting · Review · Scheduled · Published")],
             landscape=True),
        Page("Campaign Planning Sheet",
             "Use one sheet per campaign: a focused group of content and tasks working toward one goal over "
             "a set period.",
             [Fields(["Campaign name", "Owner", "Start date", "End date"]),
              Prompts([("Objective — what should this campaign achieve?", 2), ("Audience — who is it for?", 1),
                       ("Key message", 1), ("Call to action", 1)], flex=0),
              Table([("Deliverable", 2.6), ("Channel", 1.3), ("Owner", 1.1), ("Due", 0.9), ("Status", 1)],
                    label="Deliverables", rows=6),
              Row([Lines(label="Tasks", checkbox=True, min_lines=4, docx_lines=6),
                   Lines(label="Resources needed", min_lines=4, docx_lines=4)]),
              Lines(label="How will you review the results?", lines=2)]),
        Page("Content Review Worksheet",
             "Review what you published at the end of each month or 90-day cycle. Note the measures you "
             "track and decide what to keep, change or stop.",
             [Fields(["Period reviewed", "Date of review"]),
              Table([("Content", 2.6), ("Date", 0.9), ("Channel", 1.1), ("Results noted", 2),
                     ("Keep / change / stop", 1.4)], label="Published content", min_rows=8, docx_rows=10),
              Prompts([("What worked well, and why?", 2), ("What should change next time?", 2),
                       ("Ideas worth repeating or expanding", 2), ("Focus for the next 90 days", 2)])]),
    ]


# --------------------------------------------------------------------------
# Complete Productivity Toolkit — additional planners
# --------------------------------------------------------------------------

def productivity_toolkit_planners():
    return [
        Page("Priority Planner",
             "Empty your head first, then sort each item by urgency and importance. Commit to the few "
             "things that matter most.",
             [Row([Lines(label="Brain dump", lines=5), Lines(label="Brain dump (continued)", lines=5)]),
              Matrix([("Important & urgent", "Do these first"),
                      ("Important, not urgent", "Schedule time for these"),
                      ("Urgent, less important", "Delegate, batch or keep short"),
                      ("Neither urgent nor important", "Drop or park for later")]),
              Table([("Rank", 0.5), ("Priority", 3), ("First step", 2.6), ("When", 1)],
                    label="Top priorities", rows=5, numbered=True)],
             section="Priority planner"),
        Page("Project Overview",
             "Agree on what the project is for and what is in and out of scope before breaking it into tasks.",
             [Fields(["Project", "Project owner", "Start date", "Deadline"]),
              Lines(label="Goal — what will be different when this is done?", lines=2),
              Row([Lines(label="In scope", lines=3), Lines(label="Out of scope", lines=3)]),
              Table([("Milestone", 3.5), ("Target date", 1.2), ("Owner", 1.3), ("Done", 0.6, "check")],
                    label="Milestones", rows=5),
              Table([("Risk or dependency", 3), ("Impact", 1), ("What we'll do about it", 3)],
                    label="Risks & dependencies", rows=4),
              Table([("Person", 1.6), ("Role", 1.6), ("Keep informed about", 3)], label="People involved",
                    min_rows=3, docx_rows=4)],
             section="Project task tracker"),
        Page("Project Task Tracker",
             "Break the project into tasks. Give each one an owner and a due date, and update the status as "
             "you go.",
             [Fields(["Project", "Owner", "Goal", "Deadline"], cols=4),
              Table([("No.", 0.45), ("Task", 3.4), ("Owner", 1.2), ("Start", 0.9), ("Due", 0.9), ("Priority", 0.9),
                     ("Status", 1.1), ("Notes", 2.2), ("Done", 0.55, "check")],
                    numbered=True, min_rows=11, docx_rows=15),
              Note("Priority: H · M · L      Status ideas: Not started · In progress · Waiting · Done")],
             landscape=True, section="Project task tracker"),
        Page("Weekly Review Checklist",
             "A repeatable routine for closing one week and setting up the next. Work through the three "
             "stages in order; plan for 30 to 45 minutes.",
             [Fields(["Week of", "Review date"]),
              Checklist(["Collect loose notes and papers into one place",
                         "Process your email inbox down to a short list",
                         "Clear your desktop and downloads folder",
                         "Write down anything still on your mind"], label="1 · Clear", cols=2),
              Checklist(["Look back at last week's calendar for follow-ups",
                         "Look ahead at the next two weeks of your calendar",
                         "Review each active project and its next action",
                         "Check open items in your action-item tracker",
                         "Check items you are waiting on from others",
                         "Review your goals and milestone progress"], label="2 · Review", cols=2),
              Checklist(["Choose next week's top three priorities", "Block focus time for each priority",
                         "Confirm deadlines and appointments", "Prepare what you need for Monday morning"],
                        label="3 · Plan", cols=2),
              Prompts([("Notes from this review", 4)]),
              Scale(["Focus", "Energy", "Progress"], label="Rate the week")],
             section="Weekly review system"),
        Page("Weekly Review Log",
             "Record a one-line summary after each weekly review. Over time the log shows what helps you "
             "make progress.",
             [Table([("Week of", 1), ("Top 3 done?", 0.9), ("Biggest win", 2.2), ("Main obstacle", 2.2),
                     ("Score 1–5", 0.8), ("Change for next week", 2.2)], rows=12, row_h=34),
              Prompts([("Patterns I notice after 12 weeks", 3)])],
             section="Weekly review system"),
        Page("Personal Workflow Planner",
             "Map how you actually work: when you focus best, which routines keep things running and where "
             "your information lives.",
             [Fields(["Best focus hours", "Lowest-energy hours", "Planning day", "Weekly review time"]),
              Table([("When", 1), ("Routine steps", 4), ("Time needed", 1)], label="Daily routines",
                    row_labels=["Start of day", "Midday", "End of day"], row_h=38),
              Table([("Task", 3), ("Frequency", 1.2), ("Day / time", 1.2), ("Time needed", 1)],
                    label="Recurring tasks", rows=6),
              Table([("Type of information", 2), ("Where it is kept", 3)], label="Where things live",
                    row_labels=["Tasks & to-dos", "Calendar & appointments", "Notes & ideas",
                                "Files & documents", "Contacts", "Reference material"]),
              Lines(label="One change to try this month", lines=2)],
             section="Personal workflow planner"),
        Page("Ideal Week",
             "Sketch a realistic week. Block focus time first, then meetings, admin and breaks. Use it as a "
             "guide, not a rule.",
             [Grid(DAYS_SHORT, 15, row_labels=[f"{h}:00" for h in range(7, 22)], label_w=40, min_row_h=22,
                   half_lines=True, docx_row_h=0.9),
              Note("Suggested symbols: F = focus work · M = meetings · A = admin · P = personal · B = break")],
             landscape=True, section="Personal workflow planner"),
    ]


# --------------------------------------------------------------------------
# Small Business Workflow Toolkit
# --------------------------------------------------------------------------

def small_business_workflow_toolkit():
    steps_cols = [("No.", 0.45), ("Instruction", 4), ("Responsible", 1.2), ("Notes / reference", 1.6)]
    return [
        Page("Workflow Planning Sheet",
             "Describe one recurring workflow from start to finish. Write it so someone else could follow "
             "it without needing to ask you.",
             [Fields(["Workflow name", "Owner", "Version", "Last updated"]),
              Row([Lines(label="Purpose", lines=2), Lines(label="Trigger — what starts it?", lines=2)]),
              Row([Lines(label="Inputs needed", lines=2), Lines(label="Output — what does done look like?", lines=2)]),
              Table([("No.", 0.45), ("Step", 3), ("Who", 1.1), ("Tool / template", 1.4), ("Time", 0.7),
                     ("Notes", 1.6)], label="Steps", numbered=True, min_rows=10, docx_rows=12),
              Lines(label="Handoffs & checkpoints", lines=3)],
             section="Workflow planning sheet"),
        Page("Recurring Task Tracker",
             "List the routine tasks that keep the business running. Tick each week once the task is done.",
             [Fields(["Month", "Updated by"]),
              Table([("Task", 3), ("Frequency", 1.1), ("Owner", 1.1), ("Backup", 1.1), ("Due day / date", 1.1),
                     ("Wk 1", 0.55, "check"), ("Wk 2", 0.55, "check"), ("Wk 3", 0.55, "check"),
                     ("Wk 4", 0.55, "check"), ("Wk 5", 0.55, "check")], min_rows=12, docx_rows=15),
              Note("Frequency ideas: Daily · Weekly · Every 2 weeks · Monthly · Quarterly · Yearly")],
             landscape=True),
        Page("Process Documentation",
             "Document a process so it can be done consistently and handed over when needed. Keep each step "
             "short and start it with a verb.",
             [Fields(["Process name", "Process owner", "Version", "Last reviewed", "Next review due",
                      "Approved by"]),
              Lines(label="Purpose — why this process exists", lines=2),
              Row([Lines(label="In scope", lines=3), Lines(label="Out of scope", lines=3)]),
              Lines(label="Before you start — what is needed?", lines=3, checkbox=True),
              Table(steps_cols, label="Step-by-step instructions", numbered=True, min_rows=8, docx_rows=10)],
             section="Process documentation worksheet"),
        Page("Process Documentation — Continued",
             "Finish the instructions, then record how quality is checked and how the document changes over "
             "time.",
             [Table([("No.", 0.45), ("Instruction", 4), ("Responsible", 1.2), ("Notes / reference", 1.6)],
                    label="Step-by-step instructions (continued)", rows=7),
              Lines(label="Quality checks — how do you know it was done right?", lines=4, checkbox=True),
              Table([("Problem", 1), ("What to do", 1.4)], label="Common problems and fixes", rows=4),
              Lines(label="Related documents & links", lines=2),
              Table([("Version", 0.7), ("Date", 0.9), ("What changed", 3.5), ("Changed by", 1.2)],
                    label="Change log", min_rows=3, docx_rows=4)],
             section="Process documentation worksheet"),
        Page("Responsibility Tracker",
             "Make ownership clear. For each area or task, name who does the work, who owns the result, who "
             "should be consulted and who needs to be kept informed.",
             [Table([("Area or task", 3), ("Responsible (does it)", 1.4), ("Accountable (owns it)", 1.4),
                     ("Consulted", 1.3), ("Informed", 1.3), ("Backup", 1.2), ("Notes", 1.6)],
                    min_rows=12, docx_rows=15),
              Note("Tip: name one accountable person per row. If a row has no responsible person, the work is "
                   "likely to slip.")],
             landscape=True),
        Page("Weekly Operations Planner",
             "Plan the operational week at a glance: what has to happen each day, the deadlines that matter "
             "and who is available.",
             [Fields(["Week of", "Prepared by"]),
              Grid(DAYS[:5], 4, row_labels=["Key tasks", "Deadlines", "Availability", "Notes"], label_w=70,
                   docx_row_h=2.4),
              Row([Lines(label="This week's priorities", lines=3, numbered=True),
                   Lines(label="Issues to resolve", lines=3, checkbox=True)])],
             landscape=True),
        Page("Task Review Sheet",
             "Review completed tasks and recurring work. Note what slowed things down and agree on one "
             "improvement for each issue.",
             [Fields(["Review period", "Reviewed by"]),
              Table([("Task or process", 2.6), ("On time?", 0.8, "check"), ("Time taken", 0.9),
                     ("What went well", 2), ("Issue noticed", 2), ("Improvement", 2), ("Owner", 1)],
                    min_rows=9, docx_rows=12),
              Lines(label="Patterns noticed", lines=2)],
             landscape=True),
    ]


# --------------------------------------------------------------------------
# Creator Planning Bundle
# --------------------------------------------------------------------------

def _month_page():
    return Page("Content Calendar",
                "Write the month and the date in each small box, then add the platform and working title of "
                "each planned piece.",
                [Fields(["Month", "Monthly focus", "Key dates"], cols=3),
                 Grid(DAYS_SHORT, 5, date_box=True, docx_row_h=2.4),
                 Note("Print or duplicate this page for every month you plan.")],
                landscape=True, section="Content calendar")


def creator_planning_bundle():
    return [
        _month_page(), _month_page(), _month_page(),
        Page("Content Idea Planner",
             "Capture every idea with a hook, so you can pick from a ready list when it's time to create.",
             [InfoBox("Idea prompts", ["Questions your audience asks you most", "A process you can show step by step",
                                       "Something you changed your mind about", "Tools or setups you use every week",
                                       "Mistakes you see beginners make", "A recent project, start to finish",
                                       "Answers to comments or messages", "Seasonal or upcoming events"], cols=4),
              Table([("Idea", 2.8), ("Hook / angle", 2.4), ("Format", 1), ("Platform", 1.1), ("Effort", 0.8),
                     ("Priority", 0.8)], min_rows=9, docx_rows=14),
              Note("Effort: S · M · L      Priority: H · M · L")],
             landscape=True),
        Page("Production Checklist",
             "Use one checklist per piece of content to take it from idea to published without missing a step.",
             [Fields(["Working title", "Platform", "Format", "Planned publish date"]),
              Row([Checklist(["Topic and angle confirmed", "Audience and goal noted", "Outline or script drafted",
                              "Visuals, footage or assets listed", "Equipment and space ready",
                              "Permission for people, music or images checked"], label="Pre-production"),
                   Checklist(["Main content recorded or written", "Extra shots, images or examples captured",
                              "Files backed up in two places", "Raw files named and organised"],
                             label="Production")]),
              Row([Checklist(["Edited for clarity and length", "Captions or subtitles added",
                              "Cover image or thumbnail created", "Alt text written for images",
                              "Spelling and facts checked", "Final version reviewed on a phone screen"],
                             label="Post-production"),
                   Checklist(["Title and description written", "Links tested", "Scheduled or published",
                              "Shared on other channels", "Publishing tracker updated",
                              "Date set to check how it performed"], label="Publishing")]),
              Lines(label="Notes", min_lines=3, flex=1, docx_lines=4)]),
        Page("Publishing Tracker",
             "Track every piece across platforms, from idea to published.",
             [Table([("Title", 3), ("Platform", 1.2), ("Format", 1), ("Status", 1.1), ("Planned date", 1),
                     ("Published date", 1), ("Link", 1.8), ("Notes", 1.6)], min_rows=13, docx_rows=16),
              Note("Status ideas: Idea · Scripting · Producing · Editing · Scheduled · Published")],
             landscape=True),
        Page("Campaign Planner",
             "Plan a launch, series or promotion. Map the content needed before, during and after the main date.",
             [Fields(["Campaign name", "Main date", "Start date", "End date"]),
              Prompts([("Goal", 1), ("Audience", 1), ("Key message", 1), ("Call to action", 1)], flex=0),
              Table([("Phase", 1.2), ("Content pieces", 3), ("Platform", 1.2), ("Due", 0.9)], label="Timeline",
                    row_labels=["Before launch", "Launch week", "After launch"], row_h=46),
              Table([("Name", 1.6), ("Role", 1.6), ("Contact", 2), ("Confirmed", 0.8, "check")],
                    label="Collaborators", rows=3),
              Lines(label="Review notes", min_lines=3, flex=1, docx_lines=4)]),
        Page("Content Performance Notes",
             "Choose two or three measures that matter to you, such as views, saves, replies or sign-ups, and "
             "note them consistently. Write down what you learn, not just the numbers.",
             [Fields(["Measure 1", "Measure 2", "Measure 3"], cols=3),
              Table([("Content", 2.6), ("Platform", 1.1), ("Date", 0.85), ("Measure 1", 0.85), ("Measure 2", 0.85),
                     ("Measure 3", 0.85), ("What worked", 2), ("Try next time", 2)], min_rows=9, docx_rows=12),
              Lines(label="Monthly reflection", lines=2)],
             landscape=True),
    ]
