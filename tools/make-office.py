#!/usr/bin/env python3
"""Write the office's settings into the CB, and hold the office to what it and
privacy.html say.

Ryan's brief, 2026-10-20: contacts, grant requests and cases, moved here from
EspoCRM in stages, after its tasks, so EspoCRM can be switched off. His calls
the same evening: directors and administrators only, sealed at rest, nothing
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
    officeAllow is tasksAllow: directors and administrators, claimed.
  · A RECORD WRITTEN IN THE CLEAR. The office's records are written only by
    updateSealed, which seals with AES-256-GCM under CB_OFFICE_KEY and a fresh
    nonce each time; the key is read in one place and never from anywhere but
    the environment, and no file in the repository holds a value for it.
  · AN OPEN OFFICE WITHOUT ITS KEY: the function says it is shut before it
    reads or does anything.
  · AN INTAKE THAT TRUSTS WHAT IT IS SENT: /cb/office/intake checks the
    signature before it reads the body as anything, and is shut without its
    key; the key is read in one place, from the environment.
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
                 "officeCases", "officeCase", "saveCase", "removeCase", "importCases"):
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
    if "return tasksAllow(who)" not in fn(sec, "officeAllow"):
        problems.append(f"{LIB.name}: officeAllow is no longer tasksAllow: directors and administrators, on a claimed username.")
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
    parsed, used = f.find("JSON.parse("), min([i for i in (f.find("officeMailIn("), f.find("mailAddresses("), f.find("officeMailContact(")) if i >= 0] or [-1])
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
        if url not in ("/cb/office", "/cb.css", "/office.css", "/privacy.html"):
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
    at = [page.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "office.js")]
    if min(at) < 0 or at[0] > at[1]:
        problems.append(f"{PAGE.name}: it must load markdown.js, then office.js.")
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
    check_js()
    check_css()
    check_page()
    check_no_key()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("office: the pipelines written into the CB, directors and administrators only, every record sealed, shut without its key, nothing logged, "
          "nothing kept in the browser, and dressed in the CB's own colours.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
