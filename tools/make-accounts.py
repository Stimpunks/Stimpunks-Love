#!/usr/bin/env python3
"""Hold the CB's accounts, and the invites that make them, to what privacy.html
says about them.

Ryan's calls, 2026-09-30: a Profile button on the CB where you can claim your
username with a password of your own; no email; a recovery code shown once;
moderators can look up one username by name, reset it or delete it, in the
Moderators' room. 2026-10-18: a moderator can clear one person's profile card
there, without deleting their username. And 2026-10-21: the starter password
became invites and was retired the same day, everybody claims a username when
they join (join.html), a pass from a shared password is good only for
claiming, CLAIMED went from the channel because everybody is, and an account
may keep an email address for one thing, a reset code its owner asks for,
sent through the team mailbox. lib.test.mjs tests what the code does. This
checks the promises that are not behaviour, which is where a friendly edit
would break one without any test noticing:

  · NOTHING IS LOGGED. No console call anywhere in netlify/, because the one
    thing worse than keeping a password is printing one while debugging.
  · ONE LIST OF ACCOUNTS, THE MODERATORS', AND IT SAYS ALMOST NOTHING. Ryan's
    ask and call, 2026-10-22, reversing "there is no list of accounts" after
    moderators asked for one for safeguarding: accountDirectory in lib.mjs is
    the one thing that lists the acct/ prefix, for the desk's `directory`
    action and a base pass only. Each name in it is its handle, whether it is a
    moderator's, whether it is barred now, and the rooms it is seen in, which
    come from whoSeen with the moderator's pass (Be seen here's rules), and
    nothing else: never when it was claimed, never an email address. The
    friendly edits now are a "joined" date beside each name, which is the
    member-since ranking the profile cards refuse, and calling everybody not
    seen "offline", which claims what nobody has heard.
  · KICK, TIME OUT AND BAN KEEP UNTIL WHEN AND NOTHING ELSE (the same day). Each
    moves the version, so every device is signed off; a time out and a ban are
    `bar: { until }` on the account, never who or why, because a note of who
    banned whom is a record of moderation kept against a person. readPass
    refuses a barred username's every pass, and signOn and recoverAccount say
    it is barred only after the right password or code, so nobody else can
    learn it at the front desk.
  · CLEARING A CARD IS THE ONE ACTION ADDED SINCE, AND IT KEEPS NOTHING.
    Ryan's call, 2026-10-18: a card that broke the covenant could only go with
    the whole username, its password, pets, avatars, jobs and patches. So the
    list above grew by exactly clearCard, which acts on one username already
    found by name and so enumerates nothing. clearProfile in lib.mjs goes
    through forgetProfile and writes nothing of its own, because the friendly
    edit is a note of who cleared whose card and when, which would be a record
    of moderation kept against a person that privacy.html does not mention.
  · AN EMAIL ADDRESS ONLY SEALED, AND ONLY FOR ITS OWNER. Reversing "no
    email" (Ryan, 2026-10-21): claiming writes the base record and, only if
    one was given, `email` from recoveryBox, which seals it. Nothing reads it
    back (accountEmail) but the owner's own Account, setting it, and the reset
    email; the desk never does, and shapeAccount, which the desk answers with,
    never carries it. The friendly edit is "show moderators the address so
    they can help"; privacy.html says nobody but its owner sees it.
  · INVITES COUNT USES AND NEVER WHO. An invite is exactly its id, code, note,
    maker, when it was made, when it runs out, how many uses it may have and
    how many it has had; a use changes only that count (and when it filled).
    The friendly edit is "invited by" on a profile, Discord's; it is a list of
    who came in through whose invite. /cb/invites lists, makes and deletes and
    does nothing else, for a base pass only.
  · THE STARTER PASSWORD SIGNS NOBODY ON, and a pass from a shared password
    (cb1) is read only by /cb/account, for claiming. The friendly edit is to
    let the old password back in "for people who have not heard yet"; the radio
    asks them to claim instead.
  · THE JOINING PAGE sends to /cb/join and nowhere else, keeps nothing but the
    pass it is given, builds nothing from a string, and its sheet wears the
    CB's seven colours and no literal one.
  · YOU CAN LEAVE. Account (Profile's until 2026-10-19) offers Delete my account, with a second press, and
    the desk asks once more before it deletes, resets or clears a card.
  · CLAIMED IS THE SERVER'S WORD, AND NO LONGER DRAWN. Ryan's call,
    2026-09-30, marked a claimed username on the channel like BASE; since
    2026-10-21 every username is claimed, so the mark is gone from the radio,
    the forums and the profiles, and refused there. The server still keeps the
    field, because Take off and Edit read it, so cb-transmit takes it from
    who.account (what readPass found behind the pass) and never from the
    request body, and shape() never lets a message wear it beside BASE.
  · THE DESK LEAVES A MODERATOR'S USERNAME ALONE. A reset code for one would
    let one moderator become another, with the other's roles. Their card is
    left alone with it.
  · privacy.html has the sections Account, the desk and the joining page point
    at, says nothing records who joined with which invite, and says who sees an
    email address.

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
FORUM = ROOT / "forum.js"
PROFILE = ROOT / "profile.js"
CBCSS = ROOT / "cb.css"
JOIN = ROOT / "join.js"
JOINCSS = ROOT / "join.css"
JOINPAGE = ROOT / "join.html"
INVITES = ROOT / "netlify" / "functions" / "cb-invites.mjs"
FUNCS = ROOT / "netlify" / "functions"
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
        if f == LIB:
            code = re.sub(r"export async function accountDirectory\(.*?\n\}", " ", code, flags=re.S)
        if re.search(r"prefix:\s*['`]acct", code):
            problems.append(f"{f.relative_to(ROOT)}: it lists the accounts. The moderators' directory "
                            "(accountDirectory in lib.mjs) is the one list of usernames.")
    lib = LIB.read_text()
    m = re.search(r"export async function accountDirectory\(.*?\n\}", lib, re.S)
    dirf = m.group(0) if m else ""
    row = re.search(r"return \{ (handle: a\.handle[^}]*?) \};", dirf)
    rkeys = sorted(e.split(":")[0].strip() for e in row.group(1).split(",")) if row else []
    if not dirf or "prefix: 'acct/'" not in dirf or rkeys != ["bar", "handle", "mod", "rooms"]:
        problems.append(f"{LIB.name}: the moderators' directory is missing, or a name in it carries {rkeys}; "
                        "it is the handle, whether it is a moderator's, whether it is barred now and the rooms "
                        "it is seen in, and nothing else: never when it was claimed, never an email address.")
    if dirf and ("whoSeen(who, s, now)" not in dirf or re.search(r"everySeen|since|email|accountEmail", dirf)):
        problems.append(f"{LIB.name}: the directory reads who is seen some other way than whoSeen with the "
                        "moderator's pass, or reads when a username was claimed or its address.")
    m = re.search(r"export async function barAccount\(.*?\n\}", lib, re.S)
    bar = m.group(0) if m else ""
    if not bar or "v: a.v + 1, bar: { until } }" not in bar or re.search(r"bar:\s*\{[^}]*(by|why|t)\b", bar):
        problems.append(f"{LIB.name}: barAccount is missing, does not sign every device off, or keeps more than "
                        "until when: never who timed somebody out or banned them, or why.")
    m = re.search(r"export async function kickAccount\(.*?\n\}", lib, re.S)
    if not m or "({ ...a, v: a.v + 1 })" not in m.group(0):
        problems.append(f"{LIB.name}: kickAccount is missing, or does more than sign every device off.")
    # Read as code: a line commented out still holds the words.
    live = re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", " ", lib, flags=re.S))
    m = re.search(r"export async function readPass\(.*?\n\}", live, re.S)
    if not m or "if (barredNow(acct)) return null;" not in m.group(0):
        problems.append(f"{LIB.name}: readPass lets a timed-out or banned username's pass through.")
    for fn_name, after in (("signOn", "const r = await checkPassword(handle, password, s, now);"),
                           ("recoverAccount", "if (!byReset && !byMail && !byCode)")):
        m = re.search(rf"export async function {fn_name}\(.*?\n\}}", live, re.S)
        body_ = m.group(0) if m else ""
        i, j = body_.find(after), body_.find("barredNow(acct, now)")
        if i < 0 or j < 0 or j < i:
            problems.append(f"{LIB.name}: {fn_name} does not refuse a barred username, or says so before the "
                            "right password or code, which tells anybody who tries the name that it is barred.")
    m = re.search(r"export async function claimAccount\(.*?\n\}", lib, re.S)
    claim = m.group(0) if m else ""
    body = re.search(r"const body = \{ (.*?) \};", claim, re.S)
    # A shorthand property (`handle,`) has no colon, so each entry is read as
    # whatever comes before its colon, or the whole entry when there is none.
    flat = body.group(1) if body else ""
    while re.search(r"\([^()]*\)", flat):
        flat = re.sub(r"\([^()]*\)", "", flat)
    keys = sorted(e.split(":")[0].strip() for e in flat.split(",") if e.strip())
    base = sorted(["handle", "hash", "salt", "rhash", "rsalt", "since", "v", "fails", "lockUntil"])
    if keys != sorted(base + ["..."]) or "...(box ? { email: box.sealed } : {})" not in (body.group(1) if body else ""):
        problems.append(f"{LIB.name}: claiming writes {keys}; an account is the username, two hashes with "
                        "their salts, when it was claimed, a version and its lock, and an email address only "
                        "as recoveryBox sealed it, and nothing else.")
    # TWO-STEP SIGN-IN (Ryan's calls, 2026-10-26): the app's secret only sealed,
    # a passkey only its id, public key, algorithm, counter and name, nothing
    # secret to a page, a wrong step counted as a wrong password, and staff
    # without a step a member from TWOFA_FROM. The friendly edits are an app
    # secret kept in the clear "so it can be shown again", and staff let through
    # without a step "for a few more days".
    def fn_of(name):
        m2 = re.search(r"(?:export )?(?:async )?function " + name + r"\(.*?\n\}", lib, re.S)
        return m2.group(0) if m2 else ""
    if "m.totp = sealJsonWith(k, 'staff', totpName(acct.handle)" not in fn_of("totpConfirm"):
        problems.append(f"{LIB.name}: totpConfirm keeps the authenticator app's secret without sealing it.")
    if "m.keys = [...m.keys, { id, jwk: key.jwk, alg: key.alg, n: ad.count, name: label }]" not in fn_of("passkeyAdd"):
        problems.append(f"{LIB.name}: passkeyAdd keeps more about a passkey than its id, public key, algorithm, counter and name.")
    shape = fn_of("shapeSecond")
    # Only whether the app is on, the passkeys' ids and names, and how many backup codes are left.
    if re.search(r"jwk|totp|csalt|codes|secret", shape.replace("!!m.totp", "").replace("(m.codes || []).length", "").replace("codesLeft", "")):
        problems.append(f"{LIB.name}: shapeSecond sends a page something secret about the second step.")
    if "ACCT_TRIES" not in fn_of("secondCheck"):
        problems.append(f"{LIB.name}: a wrong second step does not count as a wrong password.")
    if "staffNeedsSecond(acct, now)" not in fn_of("readPass") or not re.search(r"export const TWOFA_FROM = Date\.UTC\(", lib):
        problems.append(f"{LIB.name}: readPass no longer holds staff without a second step to a member's pass after TWOFA_FROM.")
    if "if (hasSecond(acct)) return { second: true, acct };" not in fn_of("signOn"):
        problems.append(f"{LIB.name}: signOn gives a pass to an account with a second step on its password alone.")
    if "if (byReset && !byCode && !byMail) delete n.mfa;" not in fn_of("recoverAccount") or "second: hasSecond(next)" not in fn_of("recoverAccount"):
        problems.append(f"{LIB.name}: recovery gets round the second step, or a moderator's reset no longer takes it off.")
    if 'id="two-step"' not in (ROOT / "privacy.html").read_text():
        problems.append("privacy.html has no #two-step saying what two-step sign-in keeps.")
    m = re.search(r"async function recoveryBox\(.*?\n\}", lib, re.S)
    if not m or "seal({ email: to })" not in m.group(0):
        problems.append(f"{LIB.name}: recoveryBox does not seal the address. An email address is kept only sealed.")
    m = re.search(r"export function shapeAccount\(.*?\n", lib)
    if not m or "email" in m.group(0):
        problems.append(f"{LIB.name}: shapeAccount carries an email address, and the desk answers with it.")
    for f in sorted(FUNCS.glob("*.mjs")):
        code = re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)
        if "accountEmail" in code and f.name != "cb-account.mjs":
            problems.append(f"{f.name}: reads somebody's email address. Only its owner's own Account does.")
    m = re.search(r"export async function makeInvite\(.*?\n\}", lib, re.S)
    inv = re.search(r"const inv = \{ (.*?) \};", m.group(0), re.S) if m else None
    flat = inv.group(1) if inv else ""
    while re.search(r"\([^()]*\)", flat):
        flat = re.sub(r"\([^()]*\)", "", flat)
    ikeys = sorted(e.split(":")[0].strip() for e in flat.split(",") if e.strip())
    if ikeys != sorted(["id", "code", "note", "by", "made", "until", "most", "used"]):
        problems.append(f"{LIB.name}: an invite is {ikeys}; it is its id, code, note, maker, when it was made, "
                        "when it runs out, how many uses it may have and how many it has had, and nothing else.")
    # An invite is made at the desk (cb-invites.mjs), or in the office for one person when a director
    # writes to them with {invite} (writeInvite, Ryan's ask, 2026-10-23), and nowhere else; the office's
    # works once, and making it writes down nothing about whom it was for.
    callers = [f.name for f in sorted(FUNCS.glob("*.mjs")) if "makeInvite(" in re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)]
    lib_calls = len(re.findall(r"(?<!function )makeInvite\(", re.sub(r"/\*.*?\*/", " ", lib, flags=re.S)))
    wi = (re.search(r"export async function writeInvite\(.*?\n\}", lib, re.S) or [""])[0]
    if callers != ["cb-invites.mjs"] or lib_calls != 1 or "makeInvite(who, OFFICE_INVITE," not in wi:
        problems.append(f"{LIB.name}: an invite is made at the desk or by writeInvite for one person, and nowhere else.")
    oi = re.search(r"export const OFFICE_INVITE = \{ note: '([^'{}]*)', most: 1, days: (\d+) \};", lib)
    if not oi or int(oi.group(2)) not in (1, 7, 30):
        problems.append(f"{LIB.name}: OFFICE_INVITE is an invite that works once, runs out, and has a note naming nobody.")
    first = re.search(r"\{\n\s*(.*)", wi)
    if not wi or not first or "if (!officeAllow(who))" not in first.group(1) or re.search(r"updateSealed\(|updateList\(|setJSON\(|updateDoc\(", wi):
        problems.append(f"{LIB.name}: writeInvite asks officeAllow first and writes nothing but the invite: not on the contact, not on the join request.")
    m = re.search(r"async function useInvite\(.*?\n\}", lib, re.S)
    use = m.group(0) if m else ""
    if not use or re.search(r"handle|who\b|by:", use) or "{ ...i, used," not in use:
        problems.append(f"{LIB.name}: useInvite is missing or writes something about who used the invite. A use "
                        "changes the count and nothing else.")
    m = re.search(r"export async function joinAccount\(.*?\n\}", lib, re.S)
    join = m.group(0) if m else ""
    if not join or re.search(r"updateInvites\(|\.setJSON\(", join):
        problems.append(f"{LIB.name}: joinAccount writes to the invites itself. It takes a use through useInvite, "
                        "which keeps nothing about who.")
    if "if (all && same(password, all)) return { error: STARTER_GONE };" not in lib:
        problems.append(f"{LIB.name}: signOn lets the retired starter password sign somebody on.")
    if "if (!m || !unclaimed) return null;" not in lib:
        problems.append(f"{LIB.name}: readPass reads a pass from a shared password for more than claiming.")
    for f in sorted(FUNCS.glob("*.mjs")):
        if "unclaimed: true" in f.read_text() and f.name != "cb-account.mjs":
            problems.append(f"{f.name}: reads a pass from a shared password. Only claiming at /cb/account does.")
    icode = re.sub(r"/\*.*?\*/", " ", INVITES.read_text(), flags=re.S) if INVITES.exists() else ""
    asks = sorted(set(re.findall(r"\bb\.(\w+)", icode)))
    if asks != ["delete", "make"] or "who.role !== 'base'" not in icode:
        problems.append(f"{INVITES.name}: the invites' desk takes {asks} or not only from a base pass; it lists, "
                        "makes and deletes, for a moderator, and nothing else.")
    jcode = re.sub(r"/\*.*?\*/", " ", JOIN.read_text(), flags=re.S) if JOIN.exists() else ""
    urls = sorted(set(re.findall(r"fetch\('([^']+)'", jcode)))
    if urls != ["/cb/join"]:
        problems.append(f"{JOIN.name}: the joining page sends to {urls}; it sends to /cb/join and nowhere else.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", jcode):
        problems.append(f"{JOIN.name}: builds markup from a string.")
    stores = sorted(set(re.findall(r"localStorage\.\w+\('([^']+)'", jcode)))
    if re.search(r"sessionStorage|indexedDB|document\.cookie", jcode) or stores != ["love-cb"]:
        problems.append(f"{JOIN.name}: keeps {stores or 'nothing'} or uses other storage; it keeps the pass, in love-cb, and nothing else.")
    jcss = re.sub(r"/\*.*?\*/", " ", JOINCSS.read_text(), flags=re.S) if JOINCSS.exists() else ""
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", jcss):
        problems.append(f"{JOINCSS.name}: a literal colour. The joining desk wears the CB's seven and none of its own.")
    if not JOINPAGE.exists() or "join.js" not in JOINPAGE.read_text() or 'data-cb-guest="off"' not in JOINPAGE.read_text():
        problems.append(f"{JOINPAGE.name}: missing, without join.js, or with the guest bar offering the same door twice.")
    admin = re.sub(r"/\*.*?\*/", " ", ADMIN.read_text(), flags=re.S)
    actions = sorted(set(re.findall(r"b\.action === '(\w+)'", admin)))
    if actions != ["ban", "clearCard", "delete", "directory", "find", "kick", "lift", "reset", "timeout"]:
        problems.append(f"{ADMIN.name}: the desk does {actions}; it lists every username, and finds one, resets "
                        "it, deletes it, clears its profile card, kicks, times out or bans it, or lifts a bar.")
    if "if (!who || who.role !== 'base') return json(403" not in admin:
        problems.append(f"{ADMIN.name}: the desk answers something other than a base pass.")
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
    acts = [admin.find(f"action === '{a}'") for a in ("reset", "delete", "clearCard", "kick", "timeout", "ban", "lift")]
    first = min([i for i in acts if i >= 0] or [-1])
    if guard < 0 or first < 0 or guard > first:
        problems.append(f"{ADMIN.name}: the desk can reach a moderator's username. It must refuse isMod(handle) "
                        "before it resets, deletes or clears anything, or one moderator can sign on as another, roles and all.")
    cb = CB.read_text()
    for want, why in (("'Delete my account'", "Delete my account"), ("'Yes, delete my account'", "the second press before deleting"),
                      ("'Claim ' + h", "the offer to claim"), ("it will not be shown again", "saying the recovery code is shown once"),
                      ("if (/^cb1\\./.test(s.pass || '')) { claimFirst(s); return; }", "claiming first, before any radio, for a pass from a shared password")):
        if want not in cb:
            problems.append(f"{CB.name}: Account has lost {why}.")
    for f in (CB, FORUM, PROFILE, CBCSS):
        if re.search(r"cb-tag--claimed|'CLAIMED'", f.read_text()):
            problems.append(f"{f.name}: draws CLAIMED. Every username is claimed now, so a mark everybody wears says nothing.")
    desk = DESK.read_text()
    if desk.count("confirmThen(") < 7:
        problems.append(f"{DESK.name}: a reset, a delete, clearing a card, a kick, a time out or a ban no longer asks once more.")
    if re.search(r"offline", re.sub(r"/\*.*?\*/", " ", desk, flags=re.S), re.I):
        problems.append(f"{DESK.name}: calls somebody offline. Seen means they pressed Be seen here; everybody "
                        "else may be on the CB too.")
    if 'id="md-desk"' not in MODS.read_text() or "desk.js" not in MODS.read_text():
        problems.append(f"{MODS.name}: the moderators' desk is not in the Moderators' room.")
    priv = PRIVACY.read_text()
    for want in ('id="accounts"', 'id="invites"', 'id="recovery-email"', "Nothing records who joined with which invite", "shown to nobody but you",
                 'id="directory"', 'id="bars"', "nothing records who looked", "not which moderator did it, not why",
                 "it says so only after the right password"):
        if want not in priv:
            problems.append(f"{PRIVACY.name}: the accounts section has lost {want!r}.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("accounts: nothing logged, one list of usernames and only the moderators', bars that keep until when "
          "and nothing more, an email address only sealed and only its owner's, invites that count and never "
          "name, and every account can be deleted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
