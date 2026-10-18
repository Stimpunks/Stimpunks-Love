#!/usr/bin/env python3
"""Write the lists a CB profile chooses from into netlify/cb/lib.mjs, and refuse
anything on them the radio could not draw.

Ryan, 2026-10-17, after requests for profiles more like Discord's: a theme and
a banner, a decoration round the avatar you wear, your name in a face of your
choosing, a nameplate on Who's online, your pronouns, a bio, links elsewhere and
a favourite room. profile.js draws them; the server keeps them, and checks every
choice against PROFILE_KEYS, which this writes between the profile:keys markers
out of the files that draw them:

  · the themes are call.js's SCHEMES, less Match my device, which is a rule and
    not a theme;
  · the banners and nameplates are cb-themes.js's drawings, each drawn on its
    own theme's case;
  · the decorations and the faces are profile.js's.

So a theme added to the radio is a theme for a profile on the next run, and a
choice the radio cannot draw is never one the server keeps.

WHAT IT REFUSES, and why each one is here:

  · A THEME WHOSE SEVEN COLOURS love.css DOES NOT DECLARE, and Amber's names
    gone. profile.js lays a theme on a card as --cb-<theme>-<part>, and a var()
    that names nothing paints nothing, without a word (the dead var() Covenstead's
    repaint left behind). Amber's seven are --cb-amber-<part>, which name the
    radio's own as :root has them, because on the radio's host the bare names
    are the viewer's own theme.
  · A DRAWING THAT IS NOT A THEME, a decoration with no drawing, two decorations
    or two faces with one name, and a face love.css does not declare: a browser
    answers a face it has not got with another and says nothing.
  · A DATE OR A COUNT IN profile.js, or a time kept in the profile's part of
    lib.mjs. Ryan's call: no profile says when anybody claimed or joined, because
    a date beside a name invites ranking who has been here longest.
  · profile.js FETCHING, STORING OR WRITING MARKUP FROM A STRING. It draws what
    cb.js hands it and nothing else; everything typed reaches it as text.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALL = ROOT / "call.js"
ART = ROOT / "cb-themes.js"
PROFILE = ROOT / "profile.js"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
PARTS = ["case", "bar", "steel", "steel-2", "lcd", "amber", "amber-2"]

problems = []


def refuse(msg):
    problems.append(msg)


def between(src, begin, end, where):
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {where} has no {begin} / {end} markers. Put them back rather than letting this tool go quiet.")
    return src[src.index(begin) + len(begin):src.index(end)]


def write_block(path, begin, end, block):
    src = path.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {path.name} has no {begin} / {end} markers, so there is nowhere to write.")
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m: begin + "\n" + block + "\n" + end, src, flags=re.S)
    if new != src:
        path.write_text(new)


def themes():
    src = CALL.read_text()
    body = src[src.index("var SCHEMES = ["):src.index("];", src.index("var SCHEMES = ["))]
    keys = re.findall(r"\['([a-z0-9]+)', '", body)
    if len(keys) != len(set(keys)):
        refuse("call.js's SCHEMES has a key twice.")
    return [k for k in keys if k != "auto"]


def drawings():
    return re.findall(r"^\s*T\.([a-z0-9]+) = ", ART.read_text(), flags=re.M)


def main():
    keys = themes()
    if "amber" not in keys:
        refuse("Amber is not among call.js's SCHEMES, and a profile with no theme chosen wears it.")
    art = drawings()
    css = CSS.read_text()
    root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
    declared = set(re.findall(r"(--[a-z0-9-]+)\s*:", root))
    for k in keys:
        for p in PARTS:
            name = f"--cb-{k}-{p}"
            if name not in declared:
                refuse(f"theme {k!r} has no {name} in love.css's :root, so a card wearing it would paint nothing there.")
    for p in PARTS:
        if not re.search(rf"--cb-amber-{re.escape(p)}\s*:\s*var\(--cb-{re.escape(p)}\)", root):
            refuse(f"--cb-amber-{p} in love.css's :root must be var(--cb-{p}): it is how a card wears Amber on a radio that wears something else.")
    banners = [k for k in art if k in keys]
    for k in art:
        if k not in keys:
            refuse(f"cb-themes.js draws {k!r}, which is not a theme in call.js.")

    src = PROFILE.read_text()
    faces_src = between(src, "/* profile:faces:begin */", "/* profile:faces:end */", "profile.js")
    decos_src = between(src, "/* profile:decorations:begin */", "/* profile:decorations:end */", "profile.js")
    faces = re.findall(r"\['([^']+)', [0-9.]+, [0-9.]+, '(?:none|uppercase|lowercase)', [0-9]{3}\]", faces_src)
    if len(faces) != len(re.findall(r"\[", faces_src)) - 1:
        refuse("profile.js's FACES has an entry this tool cannot read: each is ['Face', scale, tracking, 'case', weight].")
    if len(faces) != len(set(faces)):
        refuse("profile.js's FACES names a face twice.")
    families = set(re.findall(r"@font-face\s*\{\s*font-family:\s*'([^']+)'", css))
    for fc in faces:
        if fc not in families:
            refuse(f"profile.js offers the face {fc!r}, which love.css declares no @font-face for.")
    decos = re.findall(r"\['([a-z]+)', '([^']+)'\]", decos_src)
    keys_d = [k for k, _ in decos]
    names_d = [n for _, n in decos]
    if len(keys_d) != len(set(keys_d)) or len(names_d) != len(set(names_d)):
        refuse("profile.js's DECORATIONS has a key or a name twice.")
    for k in keys_d:
        if not re.search(rf"^\s*D\.{k} = function", src, flags=re.M):
            refuse(f"the decoration {k!r} has no drawing (D.{k}) in profile.js.")
    for k in re.findall(r"^\s*D\.([a-z]+) = function", src, flags=re.M):
        if k not in keys_d:
            refuse(f"profile.js draws a decoration {k!r} that DECORATIONS does not offer.")

    code = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    code = re.sub(r"(?m)^\s*//.*$", "", code)
    for pat, why in [
        (r"\bsince\b|\bmember\b|new Date|Date\.now", "a date: no profile says when anybody claimed or joined"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser", "markup written from a string"),
        (r"localStorage|sessionStorage|indexedDB|document\.cookie", "storage: profile.js keeps nothing"),
        (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "a request: profile.js sends nothing"),
        (r"\.length\s*\+\s*' |\bcount\b|\btotal\b", "a count"),
    ]:
        m = re.search(pat, code)
        if m:
            refuse(f"profile.js has {m.group(0)!r}, {why}.")

    lib = LIB.read_text()
    part = lib[lib.index("/* ── Profiles"):lib.index("/* ── The Slake")]
    part_code = re.sub(r"/\*.*?\*/", "", part, flags=re.S)
    if re.search(r"Date\.now|\bnow\b|\bsince\b|\bt:\s", part_code):
        refuse("the profile's part of lib.mjs keeps a time: a profile holds the choices and the words and nothing about when.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    data = {"themes": keys, "banners": banners, "decorations": keys_d, "faces": faces}
    write_block(LIB, "/* profile:keys:begin */", "/* profile:keys:end */",
                "export const PROFILE_KEYS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";")
    print("profiles: the themes, drawings, decorations and faces written into lib.mjs")


if __name__ == "__main__":
    main()
