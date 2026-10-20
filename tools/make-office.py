#!/usr/bin/env python3
"""Write the office's settings into the CB, and hold the office to what it and
privacy.html say.

Ryan's brief, 2026-10-20: contacts, grant requests and cases, moved here from
EspoCRM in stages, after its tasks, so EspoCRM can be switched off. His calls
the same evening: directors and administrators only, sealed at rest, nothing
recording who reads, and stimpunks.org's forms posting here at the cut-over.

WHAT IT WRITES: data/office.json's statuses and grant pipelines, with their
stages, between the office:settings markers in netlify/cb/lib.mjs, which is the
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
  · ANYTHING LOGGED. Nothing about a contact, and nothing anybody types, goes
    to the console, in the office's code, its function or its page.
  · MARKUP FROM WHAT SOMEBODY TYPED: office.js builds notes with markdown.js
    and textContent, never innerHTML or its relatives.
  · ANYTHING KEPT IN THE BROWSER, AND A SEARCH IN THE ADDRESS. privacy.html
    says the office keeps nothing in the browser, and that a search is not put
    in the address, because the address goes into the browser's history.
  · ANY PLACE BUT /cb/office: office.js talks to it and to nothing else.
  · A COLOUR OF ITS OWN. office.css wears the CB's seven colours, as tasks do.
  · A CONTACT OR A GRANT REQUEST KEPT WITH MORE than privacy.html lists.
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
JS = ROOT / "office.js"
CSS = ROOT / "office.css"
PAGE = ROOT / "office.html"
PRIVACY = ROOT / "privacy.html"
GUIDE = ROOT / "cb-guide.html"

# What privacy.html#office says a contact keeps, and nothing else.
CONTACT_KEEPS = {"id", "first", "last", "email", "phone", "noEmail", "noCall", "notes", "t", "by",
                 "edited", "editedBy", "espo", "synced"}

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
    if data.get("currency") != "USD":
        problems.append(f"{DATA.name}: amounts are in US dollars, as EspoCRM held every one; another currency needs its own words.")


def write(lib, data):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    pipes = [{"name": p["name"], "stages": [{"name": x["name"], "status": x["status"]} for x in p["stages"]]} for p in data["pipelines"]]
    block = (BEGIN + "\n"
             + f"export const OFFICE_STATUSES = {j(data['statuses'])};\n"
             + f"export const OFFICE_CURRENCY = {j(data['currency'])};\n"
             + f"export const OFFICE_PIPELINES = {j(pipes)};\n"
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
                 "officeGrants", "officeGrant", "saveGrant", "removeGrant", "importGrants"):
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
