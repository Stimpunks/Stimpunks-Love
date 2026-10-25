#!/usr/bin/env python3
"""Write the office's settings into the CB, and hold the office to what it and
privacy.html say.

Ryan's brief, 2026-10-20: contacts, grant requests and cases, moved here from
EspoCRM in stages, after its tasks, so EspoCRM can be switched off. His calls
the same evening: directors, board members and administrators only, sealed at rest, nothing
recording who reads, and stimpunks.org's forms posting here at the cut-over.

WHAT IT WRITES: data/office.json's statuses and grant pipelines, with their
stages, and the cases' types, statuses and priorities, between the office:settings markers in netlify/cb/lib.mjs, which is the
only copy the server reads. Never hand-edit between those markers.

THE OFFICE HOLDS PEOPLE WHO NEVER SIGNED ON TO THE STREET, so it is held more
tightly than anything else on the CB, and this refuses, because a friendly edit
could break each without a test noticing (netlify/cb/lib.test.mjs tests what
the code does):

  · ANYBODY BUT TASKS' PEOPLE. Every exported office function asks officeAllow
    first and refuses everybody else before it reads or does anything, and
    officeAllow is tasksAllow: directors, board members and administrators, claimed.
  · A RECORD WRITTEN IN THE CLEAR. The office's records are written only by
    updateSealed, which seals with AES-256-GCM under CB_OFFICE_KEY and a fresh
    nonce each time; the key is read in one place and never from anywhere but
    the environment, and no file in the repository holds a value for it.
  · AN OPEN OFFICE WITHOUT ITS KEY: the function says it is shut before it
    reads or does anything.
  · AN INTAKE THAT TRUSTS WHAT IT IS SENT: /cb/office/intake checks the
    signature before it reads the body as anything, and is shut without its
    key; the key is read in one place, from the environment.
  · A FORM TYPE NAMING A TASK TEMPLATE THAT IS NOT THERE: an intake type's
    `task` is one of the templates Tasks starts with, in data/tasks.json, and
    it holds nothing the intake does not read.
  · MAIL THAT IS NOT OURS TO KEEP: the mailbox script's endpoint checks its own
    key's signature first, an email that is with nobody in the office is kept
    nowhere, and the script is given keyed hashes of addresses, never addresses.
  · ANYTHING LOGGED. Nothing about a contact, and nothing anybody types, goes
    to the console, in the office's code, its function or its page.
  · MARKUP FROM WHAT SOMEBODY TYPED: office.js builds notes with markdown.js
    and textContent, never innerHTML or its relatives.
  · ANYTHING KEPT IN THE BROWSER, AND A SEARCH IN THE ADDRESS. privacy.html
    says the office keeps nothing in the browser, and that a search is not put
    in the address, because the address goes into the browser's history.
  · ANY PLACE BUT /cb/office: office.js talks to it and to nothing else.
  · A COLOUR OF ITS OWN. office.css wears the CB's seven colours, as tasks do.
  · A CONTACT, A GRANT REQUEST OR A CASE KEPT WITH MORE than privacy.html lists.
  · A PIPELINE THAT IS NOT WHOLE: a stage twice, a stage whose status is not
    a status, or a first stage that is not open, where a new one starts.
  · privacy.html and the CB guide without their office sections, and the page
    without its link to what the office keeps.

NUMBERS ARE FINE HERE. Ryan's call, 2026-10-20, for tasks and backend tools.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "office.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-office.mjs"
INTAKE = ROOT / "netlify" / "functions" / "cb-office-intake.mjs"
MAILFN = ROOT / "netlify" / "functions" / "cb-office-mail.mjs"
DAILY = ROOT / "netlify" / "functions" / "cb-office-daily.mjs"
TRANSMIT = ROOT / "netlify" / "functions" / "cb-transmit.mjs"
QBFN = ROOT / "netlify" / "functions" / "cb-office-qb.mjs"
QB_HOSTS = {"https://appcenter.intuit.com/connect/oauth2", "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
            "https://developer.api.intuit.com/v2/oauth2/tokens/revoke", "https://quickbooks.api.intuit.com/v3/company/"}
JS = ROOT / "office.js"
CSS = ROOT / "office.css"
PAGE = ROOT / "office.html"
PRIVACY = ROOT / "privacy.html"
GUIDE = ROOT / "cb-guide.html"

# What privacy.html#office says a contact keeps, and nothing else.
CONTACT_KEEPS = {"id", "first", "last", "email", "phone", "noEmail", "noCall", "notes", "t", "by",
                 "edited", "editedBy", "espo", "synced"}

CASE_KEEPS = {"id", "number", "name", "type", "status", "priority", "submitted", "closed", "contact", "form", "body", "t", "by",
              "edited", "editedBy", "espo", "synced"}
MAIL_KEEPS = {"id", "thread", "mailbox", "at", "from", "to", "cc", "bcc", "subject", "text", "files", "contacts", "t"}
GRANT_KEEPS = {"id", "name", "pipeline", "stage", "amount", "submitted", "closed", "contact", "form", "body", "t", "by",
               "edited", "editedBy", "espo", "synced"}

BEGIN = "/* office:settings:begin -- written by tools/make-office.py from data/office.json. Do not hand-edit. */"
END = "/* office:settings:end */"

problems = []


def settings(data):
    statuses = data.get("statuses")
    if not isinstance(statuses, list) or "Open" not in statuses or len(set(statuses)) != len(statuses):
        problems.append(f"{DATA.name}: statuses is a list of words, each once, and Open is one of them.")
        return
    pipes = data.get("pipelines")
    if not isinstance(pipes, list) or not pipes or len({p.get("name") for p in pipes}) != len(pipes):
        problems.append(f"{DATA.name}: pipelines is a list, each with a name of its own.")
        return
    for p in pipes:
        st = p.get("stages")
        if not isinstance(st, list) or not st or len({x.get("name") for x in st}) != len(st):
            problems.append(f"{DATA.name}: {p.get('name')} lists its stages, each once.")
        elif any(x.get("status") not in statuses for x in st):
            problems.append(f"{DATA.name}: every stage of {p.get('name')} names one of the statuses.")
        elif st[0].get("status") != "Open":
            problems.append(f"{DATA.name}: a new grant request starts at {p.get('name')}'s first stage, so it must be open.")
    cases = data.get("cases") or {}
    cst = cases.get("statuses")
    if not isinstance(cases.get("types"), list) or not cases["types"] or len(set(cases["types"])) != len(cases["types"]):
        problems.append(f"{DATA.name}: cases.types is a list of words, each once.")
    if not isinstance(cst, list) or not cst or len({x.get("name") for x in cst}) != len(cst) or any(not isinstance(x.get("open"), bool) for x in cst):
        problems.append(f"{DATA.name}: cases.statuses names each status once and says whether a case at it is open.")
    elif not cst[0]["open"]:
        problems.append(f"{DATA.name}: a new case starts at the first status, so it must be open.")
    elif all(x["open"] for x in cst):
        problems.append(f"{DATA.name}: at least one case status must close a case.")
    if not isinstance(cases.get("priorities"), list) or cases.get("default_priority") not in (cases.get("priorities") or []):
        problems.append(f"{DATA.name}: cases.priorities lists the priorities, and default_priority is one of them.")
    intake = data.get("intake")
    seeded = [t.get("id") for t in (json.loads((ROOT / "data" / "tasks.json").read_text()).get("templates") or []) if isinstance(t, dict)]
    if not isinstance(intake, dict) or not intake:
        problems.append(f"{DATA.name}: intake says what each form type makes.")
    else:
        for k, v in intake.items():
            if not re.fullmatch(r"[a-z_]{2,30}", k) or not isinstance(v, dict) or not str(v.get("prefix") or "").strip():
                problems.append(f"{DATA.name}: intake.{k} needs a name made of a-z and _, and a prefix for its records' names.")
            elif v.get("record") == "grant":
                if v.get("pipeline") not in [p.get("name") for p in pipes] or not isinstance(v.get("amount"), int) or v["amount"] < 0:
                    problems.append(f"{DATA.name}: intake.{k} makes a grant request, so it names a pipeline and a whole-dollar amount.")
            elif v.get("record") == "case":
                if v.get("type") not in ((data.get("cases") or {}).get("types") or []):
                    problems.append(f"{DATA.name}: intake.{k} makes a case, so it names one of the case types.")
            else:
                problems.append(f"{DATA.name}: intake.{k} makes a grant request or a case (record: grant or case).")
            # A form type may name the task template its task is made from: one Tasks starts with,
            # in data/tasks.json, so a typo here is caught rather than making no task in silence.
            if isinstance(v, dict) and "task" in v and v["task"] not in seeded:
                problems.append(f"{DATA.name}: intake.{k}'s task names {v['task']!r}, which is not one of the templates in data/tasks.json.")
            # A case's form type may name which of its questions asks for which of our mailing lists,
            # and the tag Givebutter keeps it under: gbJoin sends those tags and nothing else.
            if isinstance(v, dict) and "lists" in v:
                ls = v["lists"]
                ok = v.get("record") == "case" and isinstance(ls, list) and ls and all(
                    isinstance(x, dict) and set(x) == {"asks", "tag"} and isinstance(x["asks"], str) and x["asks"].strip()
                    and isinstance(x["tag"], str) and 0 < len(x["tag"].strip()) <= 64 for x in ls)
                if not ok or len({x["tag"] for x in ls}) != len(ls):
                    problems.append(f"{DATA.name}: intake.{k}'s lists are a case's questions asking for our mailing lists, each its asks and a tag of 64 characters at most, no tag twice.")
            # A case's form type may name stimpunks.org's Members page and the questions asking for its
            # words and website: listingAdd writes that page and nothing else, on stimpunks.org alone.
            if isinstance(v, dict) and "members" in v:
                m = v["members"]
                ok = (v.get("record") == "case" and isinstance(m, dict) and set(m) == {"page", "address", "name", "words", "link"}
                      and isinstance(m["page"], int) and not isinstance(m["page"], bool) and m["page"] > 0
                      and isinstance(m["address"], str) and m["address"].startswith("https://stimpunks.org/")
                      and all(isinstance(m[x], str) and m[x].strip() and "\n" not in m[x] for x in ("name", "words", "link"))
                      and len({m["name"], m["words"], m["link"]}) == 3)
                if not ok:
                    problems.append(f"{DATA.name}: intake.{k}'s members names a page on stimpunks.org (its id and its https://stimpunks.org/ address) and the three questions asking for the name it shows, its words and its link, and nothing else.")
            # And stimpunks.org's Organizations page, its questions for words, website and logo, and the
            # grounds an entry may stand on, each a theme colour's slug and its name in words.
            if isinstance(v, dict) and "organizations" in v:
                o = v["organizations"]
                ok = (v.get("record") == "case" and isinstance(o, dict) and set(o) == {"page", "address", "name", "words", "link", "logo", "grounds"}
                      and isinstance(o["page"], int) and not isinstance(o["page"], bool) and o["page"] > 0
                      and isinstance(o["address"], str) and o["address"].startswith("https://stimpunks.org/")
                      and all(isinstance(o[x], str) and o[x].strip() and "\n" not in o[x] for x in ("name", "words", "link", "logo"))
                      and len({o["name"], o["words"], o["link"], o["logo"]}) == 4
                      and isinstance(o["grounds"], list) and o["grounds"] and all(
                          isinstance(g, list) and len(g) == 2 and isinstance(g[0], str) and re.fullmatch(r"custom-color-\d{1,2}", g[0])
                          and isinstance(g[1], str) and 0 < len(g[1].strip()) <= 40 for g in o["grounds"])
                      and len({g[0] for g in o["grounds"]}) == len(o["grounds"]))
                if not ok:
                    problems.append(f"{DATA.name}: intake.{k}'s organizations names a page on stimpunks.org, the four questions for its name, words, link and logo, and its grounds, each a custom-color slug and its name in words, no slug twice.")
            # Every form type names its form, as stimpunks.org titles it, which the dashboard's
            # Form entries says beside each entry; two types naming one form would be one form twice.
            if isinstance(v, dict) and not (isinstance(v.get("form"), str) and 0 < len(v["form"].strip()) <= 80 and "\n" not in v["form"]):
                problems.append(f"{DATA.name}: intake.{k} names its form, the WPForms form's title on stimpunks.org, in 80 characters at most.")
            if isinstance(v, dict) and set(v) - {"record", "form", "prefix", "pipeline", "amount", "type", "task", "lists", "members", "organizations"}:
                problems.append(f"{DATA.name}: intake.{k} holds {', '.join(sorted(set(v) - {'record', 'form', 'prefix', 'pipeline', 'amount', 'type', 'task', 'lists', 'members', 'organizations'}))}, which the intake does not read.")
        forms = [v.get("form") for v in intake.values() if isinstance(v, dict)]
        if len(set(forms)) != len(forms):
            problems.append(f"{DATA.name}: no two intake types name the same form.")
    cap = (data.get("dashboard") or {}).get("active_cap")
    if not isinstance(cap, int) or isinstance(cap, bool) or cap < 1:
        problems.append(f"{DATA.name}: dashboard.active_cap is a whole number of grant requests, 1 or more.")
    if data.get("currency") != "USD":
        problems.append(f"{DATA.name}: amounts are in US dollars, as EspoCRM held every one; another currency needs its own words.")


def write(lib, data):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    pipes = [{"name": p["name"], "stages": [{"name": x["name"], "status": x["status"]} for x in p["stages"]]} for p in data["pipelines"]]
    block = (BEGIN + "\n"
             + f"export const OFFICE_STATUSES = {j(data['statuses'])};\n"
             + f"export const OFFICE_CURRENCY = {j(data['currency'])};\n"
             + f"export const OFFICE_PIPELINES = {j(pipes)};\n"
             + f"export const OFFICE_CASES = {j({k: data['cases'][k] for k in ('types', 'statuses', 'priorities', 'default_priority')})};\n"
             + f"export const OFFICE_INTAKE = {j(data['intake'])};\n"
             + f"export const OFFICE_DASHBOARD = {j({'active_cap': data['dashboard']['active_cap']})};\n"
             + END)
    pat = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)
    if len(pat.findall(lib)) != 1:
        problems.append(f"{LIB.name}: the office:settings markers must be there exactly once.")
        return lib
    return pat.sub(lambda m: block, lib)


def code_of(text):
    c = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def check_lib(lib):
    start = lib.find("/* ── The office ──")
    if start < 0:
        problems.append(f"{LIB.name}: the office section is missing.")
        return
    nxt = lib.find("\n/* ── ", start + 10)
    sec = lib[start:nxt if nxt > 0 else len(lib)]
    code = code_of(sec)
    if "console." in code:
        problems.append(f"{LIB.name}: the office writes to the console. Nothing about a contact is ever logged.")
    for name in ("officeContacts", "officeContact", "saveContact", "removeContact", "importContacts",
                 "officeGrants", "officeGrant", "saveGrant", "removeGrant", "importGrants",
                 "officeCases", "officeCase", "saveCase", "removeCase", "importCases", "officeFeed"):
        body = fn(sec, name)
        first = re.search(r"\{\n\s*(.*)", body)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif not first or "if (!officeAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody officeAllow does not let in, before it reads or does anything.")
    for name in re.findall(r"export (?:async )?function (\w+)\(who\b", sec):
        body = fn(sec, name)
        first = re.search(r"\{\n\s*(.*)", body)
        if name != "officeAllow" and (not first or "if (!officeAllow(who))" not in first.group(1)):
            problems.append(f"{LIB.name}: {name} takes a reader and does not ask officeAllow first.")
    # Comments are sealed with their record's, kept with the writer's mark, edited only by the writer,
    # deleted by the writer or an administrator, and gone with their record.
    co = fn(sec, "commentOffice")
    if "const c = { id: newCommentId(), by: who.handle, mark: authorMark(who), t: now, body: words };" not in co or "updateSealed(officeCommentsKey(r.id)" not in co:
        problems.append(f"{LIB.name}: an office comment is kept sealed, as its id, writer, the writer's mark, when and its words (commentOffice).")
    if "list[k].mark !== authorMark(who)) { why" not in fn(sec, "editOfficeComment"):
        problems.append(f"{LIB.name}: only whoever wrote a comment edits it (editOfficeComment).")
    if "list[k].mark !== authorMark(who) && !who.roles.has('administrator')" not in fn(sec, "removeOfficeComment"):
        problems.append(f"{LIB.name}: only whoever wrote a comment, or an administrator, deletes it (removeOfficeComment).")
    for name in ("removeContact", "removeGrant", "removeCase", "removeMailing", "removeTemplate", "removeEmail"):
        if "await dropOfficeComments(" not in fn(sec, name):
            problems.append(f"{LIB.name}: {name} must delete the record's comments with it.")
    fcm = (re.search(r"async function forgetContactMail\(.*?\n\}", sec, re.S) or [""])[0]
    if "dropOfficeComments('email-' + x.id, s)" not in fcm:
        problems.append(f"{LIB.name}: an email that goes with its only contact must take its comments with it (forgetContactMail).")
    # An email's comments go by email- and its Gmail id, so a bare Gmail id is never taken for a record.
    cm = (re.search(r"function commentable\(.*?\n\}", sec, re.S) or [""])[0]
    if "id.startsWith('email-') ? mailId(id.slice(6))" not in cm or re.search(r"if \(mailId\(id\)\)", cm):
        problems.append(f"{LIB.name}: an email takes comments by email- and its Gmail id, never by the bare id (commentable).")
    if "async function dropOfficeComments(id, s) { await s.delete(officeCommentsKey(id));" not in sec:
        problems.append("lib.mjs: dropOfficeComments must delete a record's comments, and their links with them.")
    if "readSealed(officeCommentsKey(" not in fn(sec, "officeComments"):
        problems.append(f"{LIB.name}: officeComments must read the comments sealed.")
    # The feed is worked out from the records each time, and keeps nothing of its own.
    if re.search(r"\bupdate(?:List|Map|Sealed)\(|\.set(?:JSON)?\(|\.delete\(", fn(sec, "officeFeed")):
        problems.append(f"{LIB.name}: officeFeed writes something. The feed is worked out from the records and keeps nothing.")
    if "return tasksAllow(who)" not in fn(sec, "officeAllow"):
        problems.append(f"{LIB.name}: officeAllow is no longer tasksAllow: directors, board members and administrators, on a claimed username.")
    # Sealed, with a fresh nonce, under the one key from the environment.
    if lib.count("process.env.CB_OFFICE_KEY") != 1 or "process.env.CB_OFFICE_KEY" not in sec:
        problems.append(f"{LIB.name}: CB_OFFICE_KEY must be read once, in the office's officeKey, and nowhere else.")
    if not re.search(r"k\.length === 32", sec):
        problems.append(f"{LIB.name}: the office's key must be exactly 32 bytes, or the office is shut.")
    seal = fn(sec, "seal")
    if "createCipheriv('aes-256-gcm'" not in seal or "randomBytes(12)" not in seal or "getAuthTag()" not in seal:
        problems.append(f"{LIB.name}: seal must be AES-256-GCM with a fresh 12-byte nonce and its tag.")
    if "setAuthTag(" not in fn(sec, "unseal"):
        problems.append(f"{LIB.name}: unseal must check GCM's tag, so a record changed without the key is refused.")
    writes = re.findall(r"\.set(?:JSON)?\(", code)
    us = re.search(r"async function updateSealed\(.*?\n\}", sec, re.S)
    if not us or len(writes) != 1 or ".setJSON(key, seal(next)" not in us.group(0):
        problems.append(f"{LIB.name}: the office writes something other than through updateSealed, which seals every record.")
    # A contact keeps what privacy.html lists.
    ap = re.search(r"function applyContact\(.*?\n\}", sec, re.S)
    lit = re.search(r"\{ id: newContactId\(\),(.*?)\.\.\.r\.fields \}", ap.group(0) if ap else "", re.S)
    keys = set(re.findall(r"(\w+):", lit.group(1))) | {"id"} if lit else set()
    keys |= set(re.findall(r"next\.(\w+) =", ap.group(0) if ap else ""))
    keys |= set(re.findall(r"out\.(\w+) =|out\[k\]", fn(sec, "contactFields") or (re.search(r"function contactFields\(.*?\n\}", sec, re.S) or [""])[0]))
    keys.discard("")
    if not lit or not keys or keys - CONTACT_KEEPS:
        problems.append(f"{LIB.name}: a contact keeps {', '.join(sorted(keys - CONTACT_KEEPS)) or 'something unreadable'}, which privacy.html#office does not list.")
    ag = re.search(r"function applyGrant\(.*?\n\}", sec, re.S)
    glit = re.search(r"\{ id: newGrantId\(\),(.*?)\.\.\.r\.fields \}", ag.group(0) if ag else "", re.S)
    gkeys = set(re.findall(r"(\w+):", glit.group(1))) | {"id"} if glit else set()
    gkeys |= set(re.findall(r"next\.(\w+) =", ag.group(0) if ag else ""))
    gf = re.search(r"function grantFields\(.*?\n\}", sec, re.S)
    gkeys |= set(re.findall(r"out\.(\w+) =", gf.group(0) if gf else ""))
    ac = re.search(r"function applyCase\(.*?\n\}", sec, re.S)
    clit = re.search(r"\{ id: newCaseId\(\),(.*?)\.\.\.r\.fields \}", ac.group(0) if ac else "", re.S)
    ckeys = set(re.findall(r"(\w+):", clit.group(1))) | {"id"} if clit else set()
    ckeys |= set(re.findall(r"next\.(\w+) =", ac.group(0) if ac else ""))
    cf = re.search(r"function caseFields\(.*?\n\}", sec, re.S)
    ckeys |= set(re.findall(r"out\.(\w+) =", cf.group(0) if cf else ""))
    if not clit or ckeys - CASE_KEEPS:
        problems.append(f"{LIB.name}: a case keeps {', '.join(sorted(ckeys - CASE_KEEPS)) or 'something unreadable'}, which privacy.html#office does not list.")
    if not glit or gkeys - GRANT_KEEPS:
        problems.append(f"{LIB.name}: a grant request keeps {', '.join(sorted(gkeys - GRANT_KEEPS)) or 'something unreadable'}, which privacy.html#office does not list.")


def check_function():
    if not FN.exists():
        problems.append(f"{FN.name}: missing.")
        return
    f = code_of(FN.read_text())
    gate = f.find("if (!officeAllow(who))")
    shut = f.find("if (!officeReady())")
    first = min([i for i in (f.find("view ==="), f.find("b.action ===")) if i >= 0] or [-1])
    if gate < 0 or first < 0 or gate > first:
        problems.append(f"{FN.name}: it must refuse anybody officeAllow does not let in before it reads or does anything.")
    if shut < 0 or first < 0 or shut > first:
        problems.append(f"{FN.name}: it must say the office is shut, when its key is not set, before it reads or does anything.")
    if "'x-robots-tag': 'noindex'" not in f or "'cache-control': 'no-store'" not in f:
        problems.append(f"{FN.name}: its answers must ask search engines not to keep them and be cached nowhere.")
    if "console." in f:
        problems.append(f"{FN.name}: it writes to the console. Nothing about a contact is ever logged.")
    if "path: '/cb/office'" not in f:
        problems.append(f"{FN.name}: it no longer answers at /cb/office, where office.js asks.")


def check_intake(lib):
    if not INTAKE.exists():
        problems.append(f"{INTAKE.name}: missing. stimpunks.org's forms post to it.")
        return
    f = code_of(INTAKE.read_text())
    ready, signed = f.find("if (!intakeReady())"), f.find("if (!intakeSigned(")
    parsed, made = f.find("JSON.parse("), f.find("officeIntake(")
    if min(ready, signed, parsed, made) < 0 or not ready < signed < parsed < made:
        problems.append(f"{INTAKE.name}: it must be shut without its key, and check the signature before it reads the body or makes anything.")
    if "console." in f:
        problems.append(f"{INTAKE.name}: it writes to the console. Nothing about a submission is ever logged.")
    if "path: '/cb/office/intake'" not in f or "method: ['POST']" not in f:
        problems.append(f"{INTAKE.name}: it answers POST at /cb/office/intake, where the plugin posts, and nothing else.")
    for var in ("CB_OFFICE_INTAKE_KEY", "CB_OFFICE_MAIL_KEY"):
        if lib.count(f"process.env.{var}") != 1:
            problems.append(f"{LIB.name}: {var} must be read once, and be at least 32 characters.")
    hs = (re.search(r"function hmacSigned\(.*?\n\}", lib, re.S) or [""])[0]
    if "timingSafeEqual" not in hs or "INTAKE_SKEW" not in hs:
        problems.append(f"{LIB.name}: hmacSigned must compare signatures in constant time and refuse an old one.")
    for name, key in (("intakeSigned", "intakeKey()"), ("mailSigned", "mailKey()")):
        if f"return hmacSigned({key}, header, raw, now)" not in lib:
            problems.append(f"{LIB.name}: {name} must check with hmacSigned under its own key, {key}.")


def check_mail(lib):
    """The mailbox script's way in: signed under its own key before anything is
    read, an email kept with only what privacy.html says, and email that is
    with nobody in the office kept nowhere."""
    if not MAILFN.exists():
        problems.append(f"{MAILFN.name}: missing. The team mailbox's script posts to it.")
        return
    f = code_of(MAILFN.read_text())
    ready, signed = f.find("if (!mailReady())"), f.find("if (!mailSigned(")
    parsed, used = f.find("JSON.parse("), min([i for i in (f.find("officeMailIn("), f.find("mailAddresses("), f.find("officeMailContact("),
                                                     f.find("mailOutbox("), f.find("mailSentFor("), f.find("officeMailCounts(")) if i >= 0] or [-1])
    if min(ready, signed, parsed, used) < 0 or not ready < signed < parsed < used:
        problems.append(f"{MAILFN.name}: it must be shut without its key, and check the signature before it reads the body or answers anything.")
    if "console." in f:
        problems.append(f"{MAILFN.name}: it writes to the console. Nothing about an email is ever logged.")
    if "path: '/cb/office/mail'" not in f or "method: ['POST']" not in f:
        problems.append(f"{MAILFN.name}: it answers POST at /cb/office/mail and nothing else.")
    mi = (re.search(r"export async function officeMailIn\(.*?\n\}", lib, re.S) or [""])[0]
    rec = re.search(r"const record = \{(.*?)\};", mi, re.S)
    flat = rec.group(1) if rec else ""
    for _ in range(4):
        flat = re.sub(r"\([^()]*\)|\{[^{}]*\}|\[[^\[\]]*\]", "", flat)
    keys = {part.split(":")[0].strip() for part in flat.split(",") if part.strip()}
    if not rec or keys - MAIL_KEEPS:
        problems.append(f"{LIB.name}: an email keeps {', '.join(sorted(keys - MAIL_KEEPS)) or 'something unreadable'}, which privacy.html#office does not list.")
    if "if (!contacts.length) return { kept: false };" not in mi or mi.find("if (!contacts.length)") > mi.find("updateSealed("):
        problems.append(f"{LIB.name}: officeMailIn must keep nothing of an email that is with nobody in the office.")
    # The dashboard's newest email keeps Gmail's id, when, the subject, whether we
    # sent it and its contacts, never an address or its text, and forgets an
    # email or a contact the office lets go; the mailbox's counts are numbers.
    if "await noteRecentMail({ id, at, subject: saved.subject, out, contacts: saved.contacts }, s);" not in mi or mi.count("noteRecentMail(") != 1:
        problems.append(f"{LIB.name}: officeMailIn must put on the dashboard's newest email only its id, when, subject, whether we sent it and its contacts.")
    if "dropRecentMail([k], null, s)" not in code_of(fn(lib, "removeEmail")) or "dropRecentMail(gone, cid, s)" not in code_of((re.search(r"async function forgetContactMail\(.*?\n\}", lib, re.S) or [""])[0]):
        problems.append(f"{LIB.name}: an email deleted from the office, or let go with its contact, must leave the dashboard's newest email too.")
    seed = code_of(fn(lib, "seedRecentMail"))
    if "byId[x.id] = { id: x.id, at: x.at, subject: x.subject, out: !!x.out, contacts: [cid] };" not in seed or seed.count("byId[x.id] =") != 1:
        problems.append(f"{LIB.name}: seedRecentMail must put on the dashboard's newest email only its id, when, subject, whether we sent it and its contacts.")
    mcount = code_of(fn(lib, "officeMailCounts"))
    if "updateSealed(MAIL_COUNTS, () => ({ read: now, counts }), s)" not in mcount or re.search(r"counts = \{[^}]*\b(?!mailCount|mailPair)\w+\(c\.", mcount) \
            or re.search(r"\b(?:from|to|subject|text|email|address|mailbox)\b", mcount):
        problems.append(f"{LIB.name}: officeMailCounts keeps the mailbox's counts sealed, as whole numbers and nothing else.")
    if "mailHash(" not in (re.search(r"export async function mailAddresses\(.*?\n\}", lib, re.S) or [""])[0]:
        problems.append(f"{LIB.name}: mailAddresses must answer keyed hashes, never addresses.")
    # A contact from the mailbox is a name and an address off an email, and the
    # answer says only whether one was made: privacy.html says no more is kept.
    mc = (re.search(r"export async function officeMailContact\(.*?\n\}", lib, re.S) or [""])[0]
    if "applyContact(list, { first, last, email }, MAIL_WHO, now)" not in mc or mc.count("applyContact(") != 1:
        problems.append(f"{LIB.name}: officeMailContact must add a contact with only the name and address off the email.")
    if "return { ok: true, made };" not in mc or re.search(r"return \{ (?!error:)[^}]*\b(?:id|contact|first|last|email)\b", mc):
        problems.append(f"{LIB.name}: officeMailContact must answer whether it made a contact, and nothing about them.")
    if "email === mailbox" not in mc:
        problems.append(f"{LIB.name}: officeMailContact must never make the mailbox itself a contact.")
    check_mailings(lib)


def check_mailings(lib):
    """A mailing goes only to somebody who can be emailed, only as the preview
    showed it, and keeps no address or words once an email is sent or stopped;
    the outbox is the one answer that hands the mailbox script an address."""
    sm = (re.search(r"function stageMail\(.*?\n\}", lib, re.S) or [""])[0]
    if "c.noEmail ?" not in sm or "!c.email ?" not in sm:
        problems.append(f"{LIB.name}: stageMail must leave out anybody with no address or who asked not to be emailed.")
    sd = (re.search(r"export async function sendMailing\(.*?\n\}", lib, re.S) or [""])[0]
    if "return { mailing: mailing.id, count: mailing.emails.length };" not in sd:
        problems.append(f"{LIB.name}: sendMailing must answer with the mailing and how many, never its addresses.")
    if "Number(f.stamp)" not in sd or "has changed since the preview" not in sd:
        problems.append(f"{LIB.name}: sendMailing must refuse a template or a stage that has changed since the preview.")
    st = (re.search(r"const settled = \((\{[^)]*\})\) =>", lib) or [None, ""])[1]
    if set(re.findall(r"\w+", st)) != {"id", "grant", "contact", "sent", "failed", "stopped"}:
        problems.append(f"{LIB.name}: an email sent or stopped must keep only whose and when (settled), never its address or words.")
    for name in ("mailSentFor", "stopMailing"):
        if "settled(" not in (re.search(r"export async function " + name + r"\(.*?\n\}", lib, re.S) or [""])[0]:
            problems.append(f"{LIB.name}: {name} must keep an email with settled, which drops its address and words.")
    hands = [m.start() for m in re.finditer(r"\bto: e\.to\b", lib)]
    allowed = [(m.start(), m.end()) for m in re.finditer(r"export async function (?:mailOutbox|previewMailing|sendMailing)\(.*?\n\}", lib, re.S)]
    if any(not any(a <= h < b for a, b in allowed) for h in hands):
        problems.append(f"{LIB.name}: only the outbox and a director's preview hand out a mailing's addresses.")
    js = code_of(JS.read_text()) if JS.exists() else ""
    at = js.find("'mailing-send'")
    if at < 0 or js.rfind("sure(", 0, at) < 0 or at - js.rfind("sure(", 0, at) > 900:
        problems.append(f"{JS.name}: a mailing is sent only from a second press (sure), naming who it goes to.")


def check_nights(lib):
    """What the dashboard keeps rather than works out, because nothing else
    remembers it: a sealed line of counts a night (officeNightly, from
    cb-office-daily.mjs), and the CB's messages a day (countMessage, from every
    transmit), three numbers with no handle, no room and no words."""
    cm = code_of(fn(lib, "countMessage"))
    if "updateMap(DAY_COUNTS" not in cm:
        problems.append(f"{LIB.name}: countMessage must keep the day's numbers with the boards' conditional write.")
    if re.search(r"\b(?:handle|text|who|msg)\b", cm) or len(re.findall(r"\btag\b", cm)) != 4:
        problems.append(f"{LIB.name}: countMessage keeps three numbers a day and nothing else: never a handle, words or the room.")
    if "countMessage(room)" not in code_of(TRANSMIT.read_text()):
        problems.append(f"{TRANSMIT.name}: every message sent on a channel must be counted on its day (countMessage).")
    nn = code_of(fn(lib, "officeNightly"))
    if "updateSealed(OFFICE_NIGHTS" not in nn or "officeReady()" not in nn:
        problems.append(f"{LIB.name}: officeNightly must keep its line sealed, and only while the office is open.")
    if re.search(r"\.(?:contact|email|first|last|body)\b", nn):
        problems.append(f"{LIB.name}: officeNightly keeps counts only, nothing about anybody.")
    daily = code_of(DAILY.read_text()) if DAILY.exists() else ""
    if "officeNightly()" not in daily or "schedule: '50 5 * * *'" not in daily:
        problems.append(f"{DAILY.name}: it is the office's nightly line, scheduled late each evening in Colorado (05:50 UTC).")
    # The newest forum posts are the forums' own Latest for whoever is reading,
    # so a category they cannot read is never on their dashboard.
    dash = code_of(fn(lib, "officeDashboard"))
    if "forumLatest(who, null, s, now)" not in dash or re.search(r"readForumIndex|readTopic|FORUM_CATEGORIES", dash):
        problems.append(f"{LIB.name}: the dashboard's forum posts come from forumLatest for the reader, never read from the forums by any other way.")


def check_quickbooks(lib):
    """QuickBooks is read and never written, from Intuit and nowhere else; the
    state works once; the tokens are sealed and never in an answer; and what a
    transaction keeps is what privacy.html#quickbooks lists."""
    at = lib.find("/* QUICKBOOKS")
    if at < 0:
        problems.append(f"{LIB.name}: the QuickBooks part of the office is missing.")
        return
    end = lib.find("/* GIVEBUTTER", at)
    sec = lib[at:end if end > 0 else len(lib)]
    code = code_of(sec)
    urls = set(re.findall(r"'(https://[^']+)'", code))
    if urls != QB_HOSTS:
        problems.append(f"{LIB.name}: the office asks Intuit at exactly its four addresses and nowhere else ({', '.join(sorted(urls ^ QB_HOSTS)) or 'none'}).")
    if "QB_SCOPE = 'com.intuit.quickbooks.accounting'" not in code or re.search(r"method: '(?:PUT|PATCH|DELETE)'", code):
        problems.append(f"{LIB.name}: the office asks Intuit only for the accounting scope, and writes nothing to our books.")
    posts = re.findall(r"fetchFn\((QB_[A-Z]+)[^)]*method: 'POST'", code)
    if set(posts) - {"QB_TOKEN", "QB_REVOKE"}:
        problems.append(f"{LIB.name}: the office posts to Intuit only for its tokens and to revoke them.")
    if lib.count("process.env.CB_QB_CLIENT_SECRET") != 1 or "process.env.CB_QB_CLIENT_SECRET" not in fn(sec, "qbClient").replace("export ", "") + (re.search(r"function qbClient\(.*?\n\}", sec, re.S) or [""])[0]:
        problems.append(f"{LIB.name}: CB_QB_CLIENT_SECRET is read once, in qbClient, and nowhere else.")
    cb = code_of(fn(sec, "qbCallback"))
    if "kept.hash !== qbHash(state)" not in cb or "QB_STATE_FOR" not in cb or "{ gone: true }" not in cb:
        problems.append(f"{LIB.name}: qbCallback keeps tokens only for the state handed out, fresh, and used once.")
    status = re.search(r"return \{ ready:(.*?)\};", fn(sec, "qbStatus"), re.S)
    if not status or re.search(r"\b(?:realm|access|tokens?)\b|refresh:", status.group(1)):
        problems.append(f"{LIB.name}: qbStatus answers whether, by whom, since when and what was read, never a token or the company's id.")
    row = re.search(r"out\.push\(\{(.*?)\}\)", fn(sec, "qbMoneyIn"), re.S)
    keys = set(re.findall(r"(\w+)(?:[:,]|\s*$)", row.group(1))) if row else set()
    if keys - {"kind", "id", "day", "amount", "moved", "from", "account", "String", "x", "Id"} or not row:
        problems.append(f"{LIB.name}: a transaction keeps its kind, id, day, amount, what it moved, who it was from and its account, and nothing else.")
    if "PrivateNote" in code or "BillEmail" in code or "Memo" in code:
        problems.append(f"{LIB.name}: the office reads a memo or an email off the books, which privacy.html#quickbooks says it never keeps.")
    if "updateSealed(QB_BOOKS" not in fn(sec, "officeQuickBooks"):
        problems.append(f"{LIB.name}: what the office reads from the books is kept sealed.")
    back = code_of(QBFN.read_text()) if QBFN.exists() else ""
    if "qbCallback(url.searchParams, url.origin)" not in back or not re.search(r"location: '/office\.html#/dashboard/quickbooks/' \+ \(ok \? 'connected' : 'not-connected'\),\n", back):
        problems.append(f"{QBFN.name}: Intuit's way back keeps the tokens through qbCallback and sends the person to the dashboard with nothing in the address but whether it worked.")


def check_invite_fill(lib):
    """{invite} is filled for one person on a director's press (writeInvite), and a
    mailing, which goes to many, refuses a template that has it."""
    mp = (re.search(r"async function mailingParts\(.*?\n\}", lib, re.S) or [""])[0]
    if not re.search(r"if \(/\\\{invite\\\}/\.test\(tmpl\.subject \+ '\\n' \+ tmpl\.body\)\) return \{ error:", mp):
        problems.append(f"{LIB.name}: a mailing must refuse a template with {{invite}} in it; an invite is made for one person at a time.")
    cw = (re.search(r"function contactWrites\(.*?\n\}", lib, re.S) or [""])[0]
    if "makeInvite" in cw or "writeInvite" in cw:
        problems.append(f"{LIB.name}: contactWrites makes an invite; looking at a page must never make one.")


def check_givebutter(lib):
    """Givebutter is read from its own API and nowhere else, with each page asked
    for by number, and a gift keeps nothing about who gave; and it is written in
    one way only (Ryan, 2026-10-23, reversing "never written"): gbJoin, on a
    director's press of the gb-join action, sends a join request's first and
    last name (as a pair, or neither), email, the tags of the lists they said yes to and that they want
    our emails, and nothing else, to POST /v1/contacts."""
    at = lib.find("/* GIVEBUTTER")
    if at < 0:
        problems.append(f"{LIB.name}: the Givebutter part of the office is missing.")
        return
    # Up to the Members page part, which writes to stimpunks.org and is checked by check_members.
    to = lib.find("/* OUR MEMBERS PAGE", at)
    sec = lib[at:to] if to > at else lib[at:]
    code = code_of(sec)
    if set(re.findall(r"'(https://[^']+)'", code)) != {"https://api.givebutter.com/v1/"}:
        problems.append(f"{LIB.name}: the office asks Givebutter's own API and nowhere else.")
    gj = fn(sec, "gbJoin")
    if len(re.findall(r"method:", code)) != 1 or "method: 'POST'" not in gj or "fetchFn(GB_API + 'contacts'" not in gj:
        problems.append(f"{LIB.name}: the office writes to Givebutter in one place only, gbJoin's POST to contacts; everything else is a GET.")
    first = re.search(r"\{\n\s*(.*)", gj)
    if not first or "if (!officeAllow(who))" not in first.group(1):
        problems.append(f"{LIB.name}: gbJoin must refuse anybody the office does not let in, before it reads or sends anything.")
    body = re.search(r"body: JSON\.stringify\(\{ (.*?) \}\)", gj)
    # Every key, written out or shorthand.
    keys = (set(re.findall(r"(\w+):", body.group(1))) | set(re.findall(r"(?:^|, )(\w+)(?=,|$)", body.group(1)))) if body else set()
    if keys != {"first_name", "last_name", "primary_email", "tags", "email_subscription"}:
        problems.append(f"{LIB.name}: gbJoin sends Givebutter a name, an email, the tags of the lists they said yes to and that they want our emails, and nothing else (it sends {', '.join(sorted(keys)) or 'nothing readable'}).")
    if re.search(r"\bk\.body\b|\bc\.notes\b|\bc\.phone\b", gj.replace("caseLists(k)", "")):
        problems.append(f"{LIB.name}: gbJoin reads more of the join request than its answers to the lists' questions.")
    if lib.count("gbJoin(") != 1:
        problems.append(f"{LIB.name}: gbJoin is called from somewhere in lib.mjs; it runs only on a director's press, never when a form arrives.")
    office_fn = (ROOT / "netlify" / "functions" / "cb-office.mjs").read_text()
    if office_fn.count("gbJoin(") != 1 or "b.action === 'gb-join'" not in office_fn:
        problems.append("cb-office.mjs: gbJoin runs from the gb-join action, a director's press, and nowhere else.")
    if 'id="givebutter-lists"' not in (ROOT / "privacy.html").read_text():
        problems.append("privacy.html: the office writes to Givebutter, and the privacy page's section on it (id givebutter-lists) is missing.")
    gl = (re.search(r"async function gbList\(.*?\n\}", sec, re.S) or [""])[0]
    if not gl or "links.next" in gl.replace("!(b.links && b.links.next)", "") or "'page=' + page" not in gl:
        problems.append(f"{LIB.name}: gbList asks for each page by number and never follows a link an answer gives.")
    if lib.count("process.env.CB_GIVEBUTTER_KEY") != 1 or "process.env.CB_GIVEBUTTER_KEY" not in (re.search(r"function gbKey\(.*?\n\}", sec, re.S) or [""])[0]:
        problems.append(f"{LIB.name}: CB_GIVEBUTTER_KEY is read once, in gbKey, and nowhere else.")
    gift = re.search(r"return \{ (id: String\(x\.id\).*?) \};", fn(sec, "gbGift"), re.S)
    keys = set(re.findall(r"(\w+):", gift.group(1))) if gift else set()
    if keys != {"id", "day", "amount", "payout", "campaign", "recurring", "ok"}:
        problems.append(f"{LIB.name}: a gift keeps its day, amount, payout, campaign, whether recurring and whether it went through, and nothing about who gave.")
    if re.search(r"\bx\.(?:first_name|last_name|email|phone|address|giving_space|company|contact_id|dedication)\b", code):
        problems.append(f"{LIB.name}: the Givebutter part reads who gave; the office keeps nobody's name.")
    if "updateSealed(GB_BOOKS" not in fn(sec, "officeGivebutter"):
        problems.append(f"{LIB.name}: what the office reads from Givebutter is kept sealed.")


def check_members(lib):
    """The Members page is written in one way only (Ryan's ask, 2026-10-23):
    listingAdd, on a director's press of the listing-add action, after a look,
    puts one line built from words alone at the end of stimpunks.org's Members
    page's list, with an application password read once in wpAuth, and asks
    stimpunks.org for that page and its own user's capabilities and nothing else."""
    at = lib.find("/* OUR MEMBERS PAGE")
    to = lib.find("/* OUR ORGANIZATIONS PAGE", at)
    if at < 0 or to < at:
        problems.append(f"{LIB.name}: the Members page part of the office is missing, or the Organizations page part after it.")
        return
    sec = lib[at:to]
    code = code_of(sec)
    if set(re.findall(r"'(https://[^']+)'", code)) != {"https://stimpunks.org"} or "const WP_SITE = 'https://stimpunks.org';" not in code:
        problems.append(f"{LIB.name}: the Members page part asks stimpunks.org and nowhere else.")
    paths = set(re.findall(r"wpAsk\(('[^']*'|`[^`]*`),", code))
    if paths != {"'/wp-json/wp/v2/users/me?context=edit&_fields=capabilities'", "`/wp-json/wp/v2/pages/${page}?context=edit&_fields=content,modified_gmt`",
                 "`/wp-json/wp/v2/pages/${got.page}?context=edit&_fields=content`"}:
        problems.append(f"{LIB.name}: the Members page part asks stimpunks.org for its one page and its own user's capabilities, and nothing else (it asks {', '.join(sorted(paths)) or 'nothing readable'}).")
    if code.count("fetchFn(") != 1 or "fetchFn(WP_SITE + path" not in code:
        problems.append(f"{LIB.name}: the Members page part reaches stimpunks.org only through wpAsk, which adds WP_SITE to every path.")
    add = fn(sec, "listingAdd")
    if len(re.findall(r"method:", code)) != 1 or "method: 'POST'" not in add or "JSON.stringify({ content: next })" not in add:
        problems.append(f"{LIB.name}: the Members page is written in one place only, listingAdd's POST of the page's content; everything else is a GET.")
    for name in ("listingAdd", "listingLook"):
        first = re.search(r"\{\n\s*(.*)", fn(sec, name))
        if not first or "if (!officeAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody the office does not let in, before it reads or sends anything.")
    if "pg.modified !== f.modified" not in add or "await wpCanSave(" not in add:
        problems.append(f"{LIB.name}: listingAdd must refuse a page changed since the look, and a WordPress user who cannot save the page as it is.")
    if not re.search(r"const next = pg\.raw\.slice\(0, list\.at\) \+ '\\n\\n<!-- wp:list-item -->\\n' \+ line\.html \+ '\\n<!-- /wp:list-item -->' \+ pg\.raw\.slice\(list\.at\);", add):
        problems.append(f"{LIB.name}: listingAdd writes the page back as it was, with one line added at the end of its list, and nothing else changed.")
    ln = fn(sec, "listingLine")
    if "htmlText(name)" not in ln or "htmlText(words)" not in ln or "htmlAttr(link)" not in ln or re.search(r"\$\{(?!htmlText\(|htmlAttr\(|who\}|words \?)", ln.split("const who")[1] if "const who" in ln else ln):
        problems.append(f"{LIB.name}: listingLine builds the line from words alone, escaped, so nothing typed becomes markup on stimpunks.org.")
    if re.search(r"\bk\.body\b|\bc\.(?:email|phone|notes)\b", add + fn(sec, "listingLook")):
        problems.append(f"{LIB.name}: the Members page's look or add reads more of the join request than the line.")
    if lib.count("process.env.CB_WP_USER") != 1 or lib.count("process.env.CB_WP_APP_PASSWORD") != 1 or "process.env.CB_WP_APP_PASSWORD" not in (re.search(r"function wpAuth\(.*?\n\}", sec, re.S) or [""])[0]:
        problems.append(f"{LIB.name}: CB_WP_USER and CB_WP_APP_PASSWORD are read once, in wpAuth, and nowhere else.")
    if lib.count("listingAdd(") != 1 or lib.count("listingLook(") != 1:
        problems.append(f"{LIB.name}: listingAdd or listingLook is called from somewhere in lib.mjs; they run only on a director's press, never when a form arrives.")
    office_fn = (ROOT / "netlify" / "functions" / "cb-office.mjs").read_text()
    if (office_fn.count("listingAdd(") != 1 or office_fn.count("listingLook(") != 1 or office_fn.count("b.action === 'listing-add'") != 1
            or "    if (b.action === 'listing-add') {\n      const r = await listingAdd(" not in office_fn):
        problems.append("cb-office.mjs: the Members page is looked at and written from the listing-look and listing-add actions, a director's press, and nowhere else.")
    if 'id="members-page"' not in (ROOT / "privacy.html").read_text():
        problems.append("privacy.html: the office writes to stimpunks.org's Members page, and the privacy page's section on it (id members-page) is missing.")
    js = code_of(JS.read_text()) if JS.exists() else ""
    if "action: 'listing-add'" not in js or not re.search(r"var href = /\^https\?:", js):
        problems.append(f"{JS.name}: the Members page's preview links only to an http or https address, because its link is filled from a public form.")


def check_orgs(lib):
    """The Organizations page is written in two steps on one press and nowhere else
    (Ryan's ask, 2026-10-23): orgAdd puts the logo the Join form kept, fetched from
    WPForms' uploads on stimpunks.org and with its camera data off, into the media
    library, and writes one group block built from words alone after the page's
    last organization. orgLook only reads. Both go through wpAsk, listingAdd's."""
    at = lib.find("/* OUR ORGANIZATIONS PAGE")
    to = lib.find("/* ── Links and backlinks", at)
    if at < 0 or to < at:
        problems.append(f"{LIB.name}: the Organizations page part of the office is missing.")
        return
    sec = lib[at:to]
    code = code_of(sec)
    if re.findall(r"['`\"](https?://[^'`\"]*)['`\"]", code):
        problems.append(f"{LIB.name}: the Organizations page part names an address of its own; it asks stimpunks.org through wpAsk and fetches a logo only where ORG_LOGO allows.")
    if r"const ORG_LOGO = /^https:\/\/stimpunks\.org\/wp-content\/uploads\/wpforms\/" not in code:
        problems.append(f"{LIB.name}: a logo is fetched from WPForms' own uploads on stimpunks.org and nowhere else (ORG_LOGO).")
    if code.count("fetchFn(") != 1 or "fetchFn(url, { redirect: 'error' })" not in fn_any(sec, "orgLogo") or "if (!ORG_LOGO.test(url))" not in fn_any(sec, "orgLogo"):
        problems.append(f"{LIB.name}: the Organizations page part fetches only a logo ORG_LOGO allows, following no redirect, and asks everything else through wpAsk.")
    paths = set(re.findall(r"wpAsk\(('[^']*'|`[^`]*`),", code))
    if paths != {"`/wp-json/wp/v2/media?${new URLSearchParams({ title: x.name + ' logo', alt_text: x.alt })}`", "`/wp-json/wp/v2/pages/${got.page}?context=edit&_fields=content`"}:
        problems.append(f"{LIB.name}: the Organizations page part writes a logo into the media library and the page, and nothing else (it asks {', '.join(sorted(paths)) or 'nothing readable'}).")
    add = fn(sec, "orgAdd")
    if len(re.findall(r"method:", code)) != 2 or add.count("method: 'POST'") != 2:
        problems.append(f"{LIB.name}: the Organizations page is written in orgAdd only: one POST of the logo and one of the page.")
    for name in ("orgAdd", "orgLook"):
        first = re.search(r"\{\n\s*(.*)", fn(sec, name))
        if not first or "if (!officeAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody the office does not let in, before it reads or sends anything.")
    if "pg.modified !== f.modified" not in add or "await wpCanSave(" not in add or "await orgLogo(got.logos[x.logo], fetchFn)" not in add:
        problems.append(f"{LIB.name}: orgAdd must refuse a page changed since the look and a user who cannot save it, and fetch the chosen logo itself rather than take one from the page.")
    if not re.search(r"const next = pg\.raw\.slice\(0, list\.at\) \+ '\\n\\n' \+ orgHtml\(x, media\) \+ pg\.raw\.slice\(list\.at\);", add):
        problems.append(f"{LIB.name}: orgAdd writes the page back as it was, with one entry added after its last organization, and nothing else changed.")
    oh = fn(sec, "orgHtml")
    for need in ("htmlText(x.name)", "htmlAttr(x.link)", "<p>${i ? htmlText(p) : who + (p ? ' - ' + htmlText(p) : '')}</p>", "htmlAttr(media.src)", "htmlAttr(x.alt)"):
        if need not in oh:
            problems.append(f"{LIB.name}: orgHtml builds the entry from words alone, escaped ({need} is missing).")
    if re.search(r"\$\{(?!htmlText\(|htmlAttr\(|who\b|x\.ground\}|media\.id\}|ORG_STYLE\}|ORG_CSS\}|img\}|ps\.join|i \?)", oh):
        problems.append(f"{LIB.name}: orgHtml puts something into the page that is not escaped words, a ground from the data, or the media library's number.")
    of = fn(sec, "orgFields")
    if "const ground = grounds.find((g) => g[0] === f.ground);" not in of:
        problems.append(f"{LIB.name}: an entry's ground is one of the grounds in data/office.json and nothing typed.")
    lg = fn_any(sec, "orgLogo")
    if "carriesMetadata(bare, kind)" not in lg or "bareImage(bytes, kind)" not in lg:
        problems.append(f"{LIB.name}: a logo goes nowhere until bareImage has taken its camera data off and carriesMetadata finds none left.")
    if re.search(r"\bk\.body\b|\bc\.(?:email|phone|notes)\b", add + fn(sec, "orgLook")):
        problems.append(f"{LIB.name}: the Organizations page's look or add reads more of the join request than the entry and its logo.")
    if lib.count("orgAdd(") != 1 or lib.count("orgLook(") != 1:
        problems.append(f"{LIB.name}: orgAdd or orgLook is called from somewhere in lib.mjs; they run only on a director's press, never when a form arrives.")
    office_fn = (ROOT / "netlify" / "functions" / "cb-office.mjs").read_text()
    if (office_fn.count("orgAdd(") != 1 or office_fn.count("orgLook(") != 1 or office_fn.count("b.action === 'org-add'") != 1
            or "    if (b.action === 'org-add') {\n      const r = await orgAdd(" not in office_fn):
        problems.append("cb-office.mjs: the Organizations page is looked at and written from the org-look and org-add actions, a director's press, and nowhere else.")
    if 'id="organizations-page"' not in (ROOT / "privacy.html").read_text():
        problems.append("privacy.html: the office writes to stimpunks.org's Organizations page and media library, and the privacy page's section on it (id organizations-page) is missing.")
    js = code_of(JS.read_text()) if JS.exists() else ""
    if "action: 'org-add'" not in js or js.count("var href = /^https?:") < 2:
        problems.append(f"{JS.name}: the Organizations page's preview links only to an http or https address, because its link is filled from a public form.")


def fn_any(src, name):
    m = re.search(rf"(?:export )?(?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def check_js():
    if not JS.exists():
        problems.append(f"{JS.name}: missing.")
        return
    js = code_of(JS.read_text())
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The office is built from nodes with textContent, never as HTML.")
    if "window.loveMarkdown.blocks" not in js:
        problems.append(f"{JS.name}: it builds notes some way other than markdown.js, the street's one builder.")
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", js):
        problems.append(f"{JS.name}: it keeps something in the browser. privacy.html says the office keeps nothing there.")
    if "console." in js:
        problems.append(f"{JS.name}: it writes to the console, where a contact's details would be kept in the browser's log.")
    wq = re.search(r"function writeQuery\(.*?\n  \}", js, re.S)
    if not wq or re.search(r"\bq\b|searched", wq.group(0).replace("f.sort", "").replace("f.dir", "")):
        problems.append(f"{JS.name}: a search must not go into the address, which goes into the browser's history.")
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        # Pages it links to (tasks, the forums' topics, the privacy page, the member map on the
        # Community Center's wall) are not calls.
        if url not in ("/cb/office", "/cb.css", "/office.css", "/privacy.html", "/tasks.html", "/forum.html", "/community-center.html"):
            problems.append(f"{JS.name}: it calls {url}. The office talks to /cb/office and nothing else.")


def check_css():
    if not CSS.exists():
        problems.append(f"{CSS.name}: missing.")
        return
    css = re.sub(r"/\*.*?\*/", " ", CSS.read_text(), flags=re.S)
    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|(?<![-\w])(?:white|black|red|blue|green|yellow|gray|grey)(?![-\w])", css):
        problems.append(f"{CSS.name}: {m.group(0)}. The office wears the CB's seven colours, var(--cb-*), and nothing else.")
    for m in re.finditer(r"var\(--([a-z0-9-]+)", css):
        if not m.group(1).startswith("cb-"):
            problems.append(f"{CSS.name}: var(--{m.group(1)}). The office wears the CB's own tokens and nothing else.")


def check_page():
    if not PAGE.exists():
        problems.append(f"{PAGE.name}: missing.")
        return
    page = PAGE.read_text()
    at = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "links.js", "comments.js", "preview.js", "office.js")]
    if min(at) < 0 or at != sorted(at):
        problems.append(f"{PAGE.name}: it must load markdown.js, then links.js, then comments.js, then preview.js, then office.js.")
    if 'href="privacy.html#office"' not in page:
        problems.append(f"{PAGE.name}: the page must link what the office keeps, privacy.html#office.")
    for doc in (PRIVACY, GUIDE):
        if 'id="office"' not in doc.read_text():
            problems.append(f"{doc.name}: it has no office section (id=\"office\").")


def check_no_key():
    """No file the repository holds carries a value for the office's key."""
    files = subprocess.run(["git", "ls-files", "-co", "--exclude-standard"], cwd=ROOT, capture_output=True, text=True).stdout.split()
    for f in files:
        p = ROOT / f
        if p.suffix in (".png", ".jpg", ".webp", ".woff2", ".mp3", ".m4a", ".mp4", ".ico", ".pdf") or not p.is_file():
            continue
        try:
            text = p.read_text()
        except (UnicodeDecodeError, OSError):
            continue
        if re.search(r"CB_OFFICE_KEY\s*[=:]\s*['\"]?[A-Za-z0-9_-]{40,}", text):
            problems.append(f"{f}: it holds a value for CB_OFFICE_KEY. The key lives in Netlify's settings and nowhere else.")


def main():
    data = json.loads(DATA.read_text())
    lib = LIB.read_text()
    settings(data)
    if not problems:
        new = write(lib, data)
        if new != lib:
            LIB.write_text(new)
            lib = new
    check_lib(lib)
    check_function()
    check_intake(lib)
    check_mail(lib)
    check_nights(lib)
    check_quickbooks(lib)
    check_givebutter(lib)
    check_members(lib)
    check_orgs(lib)
    check_invite_fill(lib)
    check_js()
    check_css()
    check_page()
    check_no_key()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("office: the pipelines written into the CB, directors, board members and administrators only, every record sealed, shut without its key, nothing logged, "
          "nothing kept in the browser, and dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
