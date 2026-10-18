#!/usr/bin/env python3
"""Hold the CB's accounts to what privacy.html says about them.

Ryan's calls, 2026-09-30: a Profile button on the CB where you can claim your
username with a password of your own; no email; a recovery code shown once;
moderators can look up one username by name, reset it or delete it, in the
Moderators' room. And 2026-10-18: a moderator can clear one person's profile
card there, without deleting their username. lib.test.mjs tests what the code does. This checks the
promises that are not behaviour, which is where a friendly edit would break
one without any test noticing:

  · NOTHING IS LOGGED. No console call anywhere in netlify/, because the one
    thing worse than keeping a password is printing one while debugging.
  · THERE IS NO LIST OF ACCOUNTS. Nothing lists the acct/ prefix, and the
    moderators' desk takes find, reset, delete and clearCard and nothing that
    enumerates. The friendly edit is "a table of users for the admins"; it
    would be a register of who is in our community, which privacy.html says
    does not exist.
  · CLEARING A CARD IS THE ONE ACTION ADDED SINCE, AND IT KEEPS NOTHING.
    Ryan's call, 2026-10-18: a card that broke the covenant could only go with
    the whole username, its password, pets, avatars, jobs and patches. So the
    list above grew by exactly clearCard, which acts on one username already
    found by name and so enumerates nothing. clearProfile in lib.mjs goes
    through forgetProfile and writes nothing of its own, because the friendly
    edit is a note of who cleared whose card and when, which would be a record
    of moderation kept against a person that privacy.html does not mention.
  · NO EMAIL. The account record has no field for one and the word does not
    appear in what claiming writes.
  · YOU CAN LEAVE. Profile offers Delete my account, with a second press, and
    the desk asks once more before it deletes, resets or clears a card.
  · CLAIMED IS THE SERVER'S WORD. Ryan's call, 2026-09-30: a claimed username
    is marked on the channel like BASE. The mark means something only because
    the sender cannot set it, so cb-transmit takes it from who.account (what
    readPass found behind the pass) and never from the request body, and
    shape() never lets a message wear it beside BASE. The friendly edit is a
    "verified" checkbox somebody ticks for themselves.
  · THE DESK LEAVES A MODERATOR'S USERNAME ALONE. A reset code for one would
    let one moderator become another, with the other's roles. Their card is
    left alone with it.
  · privacy.html has the section the Profile and the desk point at, and says
    there is no email.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
ADMIN = ROOT / "netlify" / "functions" / "cb-account-admin.mjs"
TRANSMIT = ROOT / "netlify" / "functions" / "cb-transmit.mjs"
CB = ROOT / "cb.js"
DESK = ROOT / "desk.js"
PRIVACY = ROOT / "privacy.html"
MODS = ROOT / "town-hall-moderators.html"

problems = []


def main():
    for f in sorted((ROOT / "netlify").rglob("*.mjs")):
        code = re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)
        if re.search(r"\bconsole\.\w+\(", code):
            problems.append(f"{f.relative_to(ROOT)}: a console call. Nothing a person types is ever logged, "
                            "passwords above all, and a log line is where that promise breaks.")
        if re.search(r"prefix:\s*['`]acct", code):
            problems.append(f"{f.relative_to(ROOT)}: it lists the accounts. There is no list of everybody.")
    lib = LIB.read_text()
    m = re.search(r"export async function claimAccount\(.*?\n\}", lib, re.S)
    claim = m.group(0) if m else ""
    body = re.search(r"const body = \{ (.*?) \};", claim, re.S)
    # A shorthand property (`handle,`) has no colon, so each entry is read as
    # whatever comes before its colon, or the whole entry when there is none.
    flat = body.group(1) if body else ""
    while re.search(r"\([^()]*\)", flat):
        flat = re.sub(r"\([^()]*\)", "", flat)
    keys = sorted(e.split(":")[0].strip() for e in flat.split(",") if e.strip())
    if keys != sorted(["handle", "hash", "salt", "rhash", "rsalt", "since", "v", "fails", "lockUntil"]):
        problems.append(f"{LIB.name}: claiming writes {keys}; an account is the username, two hashes with "
                        "their salts, when it was claimed, a version and its lock, and nothing else.")
    if re.search(r"e-?mail", claim, re.I):
        problems.append(f"{LIB.name}: claiming mentions email. There is no email.")
    admin = re.sub(r"/\*.*?\*/", " ", ADMIN.read_text(), flags=re.S)
    actions = sorted(set(re.findall(r"b\.action === '(\w+)'", admin)))
    if actions != ["clearCard", "delete", "find", "reset"]:
        problems.append(f"{ADMIN.name}: the desk does {actions}; it finds one username, resets it, deletes it "
                        "or clears its profile card.")
    m = re.search(r"export async function clearProfile\(.*?\n\}", lib, re.S)
    clear = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S) if m else ""
    if "forgetProfile(" not in clear or re.search(r"\.set(JSON)?\(|update\w*\(", clear):
        problems.append(f"{LIB.name}: clearProfile is missing, does not go through forgetProfile, or writes "
                        "something. Clearing a card keeps nothing: not who cleared it, not when.")
    tx = re.sub(r"//[^\n]*", " ", re.sub(r"/\*.*?\*/", " ", TRANSMIT.read_text(), flags=re.S))
    marks = [x.strip() for x in re.findall(r"claimed:\s*([^,}\n]+)", tx)]
    if marks != ["!!who.account"]:
        problems.append(f"{TRANSMIT.name}: a message's CLAIMED comes from {marks or 'nowhere'}; it is "
                        "!!who.account, read off the pass, and nothing the sender sends.")
    if not re.search(r"claimed:\s*!!m\.claimed && !m\.base", lib):
        problems.append(f"{LIB.name}: shape() no longer keeps CLAIMED off a BASE message, or drops it.")
    guard = admin.find("if (isMod(handle)) return json(403")
    acts = [admin.find(f"action === '{a}'") for a in ("reset", "delete", "clearCard")]
    first = min([i for i in acts if i >= 0] or [-1])
    if guard < 0 or first < 0 or guard > first:
        problems.append(f"{ADMIN.name}: the desk can reach a moderator's username. It must refuse isMod(handle) "
                        "before it resets, deletes or clears anything, or one moderator can sign on as another, roles and all.")
    cb = CB.read_text()
    for want, why in (("'Delete my account'", "Delete my account"), ("'Yes, delete my account'", "the second press before deleting"),
                      ("'Claim ' + h", "the offer to claim"), ("it will not be shown again", "saying the recovery code is shown once"),
                      ("'CLAIMED'", "the CLAIMED mark on the channel")):
        if want not in cb:
            problems.append(f"{CB.name}: Profile has lost {why}.")
    desk = DESK.read_text()
    if desk.count("confirmThen(") < 4:
        problems.append(f"{DESK.name}: a reset, a delete or clearing a card no longer asks once more.")
    if 'id="md-desk"' not in MODS.read_text() or "desk.js" not in MODS.read_text():
        problems.append(f"{MODS.name}: the moderators' desk is not in the Moderators' room.")
    priv = PRIVACY.read_text()
    if 'id="accounts"' not in priv or "No email" not in priv:
        problems.append(f"{PRIVACY.name}: no accounts section saying there is no email.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("accounts: nothing logged, no list of everybody, no email, and every account can be deleted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
