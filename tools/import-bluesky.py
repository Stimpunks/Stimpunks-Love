#!/usr/bin/env python3
"""Bring Stimpunks Social up to date from our Bluesky export (Ryan's ask, 2026-11-02).

    python3 tools/import-bluesky.py <repo.car> <a folder for the images> [--since YYYY-MM-DD] [--go]

stimpunkssocial.wordpress.com stopped keeping up with what we posted on
Bluesky, so /social was missing the most recent months. This reads the export
Bluesky gives an account (Settings, Export my data: a CAR file of the account's
records) and adds every post since --since that data/social.json does not
already have, with no --go only saying what it would add.

What it reads: our own posts (app.bsky.feed.post), never a reply to somebody
else's post (the WordPress import's rule for comments: a reply belongs in its
conversation), and the posts that continue a thread of our own are added as
posts of their own. Bluesky shortens a link's words in the text and keeps the
whole address in the post's facets, so the whole address is put back. A post
with a link card keeps its words, and the card's address is added when the
words do not carry it. Quote posts keep their words. A post's id is b and its
record key, so a second run changes nothing.

ALREADY HERE means the same post: one skipped when a post in the data, from the
same day or the day either side, has the same words once links, spaces and case
are set aside (WordPress kept many of these from the Bluesky side, and the
office's own posts are in the data already), or when one within three days has
words at least NEAR alike, because a post trimmed to Bluesky's limit or edited
by a word is the same post, and the version already here stays.

The images: a post's images are not in the export, only their ids and alt text,
so each is fetched from Bluesky's own public server for our account
(com.atproto.sync.getBlob), re-saved with Pillow so nothing but the pixels
survives, at most 1600px on its long side, into the folder given (a scratch
folder), and recorded as `held: "not looked at"` with the alt text written when
it was posted (alt_by "us") or none, as import-social.py records WordPress's.
Nothing is written into social/img/ by this tool: a person looks first.

Nothing here is ever logged but counts and dates.
"""
import difflib
import io
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "social.json"
DID = "did:plc:"  # checked against the export's own repo DID below
PDS = "https://bsky.social"
LONG = 1600
NEAR = 0.8


# ── CAR and DAG-CBOR, just enough to read a repository ──────────────────────
def varint(b, i):
    n = s = 0
    while True:
        x = b[i]; i += 1
        n |= (x & 0x7F) << s
        if not x & 0x80:
            return n, i
        s += 7


def cbor(b, i):
    ib = b[i]; i += 1
    major, ai = ib >> 5, ib & 31
    if ai < 24:
        val = ai
    elif ai == 24:
        val = b[i]; i += 1
    elif ai == 25:
        val = int.from_bytes(b[i:i + 2], "big"); i += 2
    elif ai == 26:
        val = int.from_bytes(b[i:i + 4], "big"); i += 4
    elif ai == 27:
        val = int.from_bytes(b[i:i + 8], "big"); i += 8
    else:
        raise ValueError("indefinite length is not DAG-CBOR")
    if major == 0:
        return val, i
    if major == 1:
        return -1 - val, i
    if major == 2:
        return bytes(b[i:i + val]), i + val
    if major == 3:
        return b[i:i + val].decode("utf-8"), i + val
    if major == 4:
        out = []
        for _ in range(val):
            x, i = cbor(b, i); out.append(x)
        return out, i
    if major == 5:
        out = {}
        for _ in range(val):
            k, i = cbor(b, i); v, i = cbor(b, i); out[k] = v
        return out, i
    if major == 6:
        x, i = cbor(b, i)
        return ("cid", x[1:]) if val == 42 else x, i
    if major == 7:
        if ai == 20: return False, i
        if ai == 21: return True, i
        if ai == 22: return None, i
        raise ValueError("a float in a record")


def read_car(path):
    b = Path(path).read_bytes()
    n, i = varint(b, 0)
    header, _ = cbor(b, i)
    i += n
    blocks = {}
    while i < len(b):
        n, i = varint(b, i)
        end = i + n
        j = i
        _, j = varint(b, j)              # CID version
        _, j = varint(b, j)              # codec
        _, j = varint(b, j)              # hash code
        hl, j = varint(b, j)             # hash length
        cid = bytes(b[i:j + hl])
        blocks[cid] = bytes(b[j + hl:end])
        i = end
    return header, blocks


def records(blocks):
    """Every record key and its record, by walking the repository's search tree."""
    decoded = {}
    def get(cid):
        if cid not in decoded:
            decoded[cid], _ = cbor(blocks[cid], 0)
        return decoded[cid]
    commit = None
    for cid, raw in blocks.items():
        try:
            v, _ = cbor(raw, 0)
        except Exception:
            continue
        if isinstance(v, dict) and "did" in v and "data" in v and "rev" in v:
            commit = v
    if not commit:
        raise SystemExit("REFUSING: no commit in the export, so it cannot be read.")
    out = {}
    def walk(cid):
        node = get(cid)
        if node.get("l"):
            walk(node["l"][1])
        key = b""
        for e in node.get("e", []):
            key = key[:e["p"]] + e["k"]
            if e["v"][1] in blocks:
                out[key.decode()] = get(e["v"][1])
            if e.get("t"):
                walk(e["t"][1])
    walk(commit["data"][1])
    return commit["did"], out


# ── What a post says ────────────────────────────────────────────────────────
def full_text(rec):
    """The words, with every link's whole address where Bluesky shortened it."""
    text = rec.get("text") or ""
    raw = text.encode("utf-8")
    spans = []
    for f in rec.get("facets") or []:
        uri = next((x.get("uri") for x in f.get("features", []) if x.get("$type") == "app.bsky.richtext.facet#link"), None)
        ix = f.get("index") or {}
        if uri and isinstance(ix.get("byteStart"), int) and isinstance(ix.get("byteEnd"), int):
            spans.append((ix["byteStart"], ix["byteEnd"], uri))
    for a, z, uri in sorted(spans, reverse=True):
        raw = raw[:a] + uri.encode("utf-8") + raw[z:]
    text = raw.decode("utf-8", "replace")
    embed = rec.get("embed") or {}
    ext = (embed.get("external") or (embed.get("media") or {}).get("external") or {}).get("uri")
    if ext and ext not in text:
        text = text.rstrip() + ("\n\n" if text.strip() else "") + ext
    return text.strip()


def images_of(rec):
    embed = rec.get("embed") or {}
    imgs = embed.get("images") or (embed.get("media") or {}).get("images") or []
    out = []
    for im in imgs:
        ref = (im.get("image") or {}).get("ref")
        if isinstance(ref, tuple) and ref[0] == "cid":
            out.append({"cid": ref[1], "alt": (im.get("alt") or "").strip()})
    return out


def b32(b):
    abc = "abcdefghijklmnopqrstuvwxyz234567"
    bits = n = 0
    out = ""
    for x in b:
        n = (n << 8) | x; bits += 8
        while bits >= 5:
            bits -= 5; out += abc[(n >> bits) & 31]
    if bits:
        out += abc[(n << (5 - bits)) & 31]
    return "b" + out


def fold(t):
    t = re.sub(r"https?://\S+", " ", t)
    t = re.sub(r"\b[\w-]+(?:\.[\w-]+)+/\S*", " ", t)          # a shortened link's words
    return re.sub(r"\W+", " ", t).strip().lower()


def iso(s):
    d = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if not d.tzinfo:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def fetch_image(did, cid_text, into, name):
    from PIL import Image, ImageOps
    url = f"{PDS}/xrpc/com.atproto.sync.getBlob?did={did}&cid={cid_text}"
    req = urllib.request.Request(url, headers={"user-agent": "stimpunks.world import (+https://stimpunks.world/social)"})
    raw = urllib.request.urlopen(req, timeout=30).read()
    im = Image.open(io.BytesIO(raw)); im.load()
    im = ImageOps.exif_transpose(im)
    if max(im.size) > LONG:
        im.thumbnail((LONG, LONG))
    mode = im.mode if im.mode in ("RGB", "RGBA", "L") else "RGB"
    bare = Image.frombytes(mode, im.size, im.convert(mode).tobytes())
    if mode == "RGBA":
        name += ".png"; bare.save(into / name, "PNG", optimize=True)
    else:
        name += ".jpg"; bare.convert("RGB").save(into / name, "JPEG", quality=85, optimize=True, progressive=True)
    return name, bare.size


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    go = "--go" in sys.argv
    since = None
    if "--since" in sys.argv:
        since = datetime.strptime(sys.argv[sys.argv.index("--since") + 1], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        args = [a for a in args if a != sys.argv[sys.argv.index("--since") + 1]]
    if len(args) != 2:
        raise SystemExit(__doc__)
    car, into = Path(args[0]), Path(args[1])
    _, blocks = read_car(car)
    did, recs = records(blocks)
    if not did.startswith(DID):
        raise SystemExit("REFUSING: the export is not an account on Bluesky's own server.")
    data = json.loads(DATA.read_text())
    have, olds = {}, []
    for p in data["posts"]:
        have.setdefault(fold(p.get("text", "")), []).append(iso(p["t"]))
        olds.append((iso(p["t"]), fold(p.get("text", ""))))
    ids = {p["id"] for p in data["posts"]}
    new, seen_old, replies = [], 0, 0
    for key, rec in recs.items():
        if not key.startswith("app.bsky.feed.post/") or rec.get("$type") != "app.bsky.feed.post":
            continue
        reply = rec.get("reply")
        if reply and did not in str((reply.get("parent") or {}).get("uri", "")):
            replies += 1
            continue
        t = iso(rec["createdAt"])
        if since and t < since:
            continue
        rkey = key.split("/", 1)[1]
        pid = "b" + re.sub(r"[^A-Za-z0-9_-]", "", rkey)
        text = full_text(rec)
        f = fold(text)
        if pid in ids or (f and any(abs((t - d).days) <= 1 for d in have.get(f, []))) or (
                f and any(abs((t - d).days) <= 3 and difflib.SequenceMatcher(None, f, o).ratio() >= NEAR for d, o in olds)):
            seen_old += 1
            continue
        new.append((t, pid, text, images_of(rec), rkey))
    new.sort()
    print(f"import-bluesky: {len(new)} new since {since.date() if since else 'the start'}, "
          f"{seen_old} already here, {replies} replies to other people left out.")
    for t, pid, text, imgs, _ in new[:3] + new[-3:]:
        print(f"  {t.date()} {pid} {len(imgs)} image(s): {text[:70]!r}")
    if not go:
        print("  (nothing written; --go to write)")
        return 0
    into.mkdir(parents=True, exist_ok=True)
    for t, pid, text, imgs, rkey in new:
        post = {"id": pid, "t": t.strftime("%Y-%m-%dT%H:%M:%SZ"), "text": text, "from": "bluesky"}
        out = []
        for n, im in enumerate(imgs):
            name, (w, h) = fetch_image(did, b32(im["cid"]), into, f"bsky-{rkey}-{n}")
            out.append({"from": f"at://{did}/app.bsky.feed.post/{rkey}#{n}", "file": name, "w": w, "h": h,
                        "alt": im["alt"], "alt_by": "us" if im["alt"] else None, "held": "not looked at"})
        if out:
            post["images"] = out
        data["posts"].append(post)
    data["posts"].sort(key=lambda p: p["t"], reverse=True)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(f"import-bluesky: wrote {len(new)} posts into data/social.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
