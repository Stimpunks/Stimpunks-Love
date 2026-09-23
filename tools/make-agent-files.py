#!/usr/bin/env python3
"""Write /.well-known/api-catalog and /.well-known/agent-skills/index.json.

TWO SMALL FILES THAT ARE ONLY WORTH HAVING IF THEY ARE TRUE, and both have one
way of going quietly wrong. That is why they are generated rather than kept.

  · THE CATALOGUE (RFC 9727, as an RFC 9264 Linkset) is an index of every
    machine-readable thing on the site. The spec's own warning is that a
    drifted catalogue is worse than none, so this REFUSES an entry that points
    at a file which is not on disk.
  · THE SKILLS INDEX (the Cloudflare-led discovery draft, v0.2.0) names each
    SKILL.md and carries a sha256 of its bytes. A digest that has drifted from
    its file makes the skill unverifiable and a compliant client refuses it --
    so the digest is computed here, from the file, every run, and never typed.

RELATIONS ARE ONLY ONES THE IANA REGISTRY HOLDS: describedby, alternate,
license. Star Stuff read that registry on 2026-09-10 and found that neither
`sitemap` nor `security` is in it; it published a correction for having used
them. So the sitemap is not in this catalogue under a relation it does not
have -- robots.txt's Sitemap: line is the mechanism crawlers actually read --
and `agent-skills` is not advertised in the Link header either, for the same
reason. The well-known paths are the discovery.

THE SKILL ITSELF IS WRITTEN BY HAND, at
.well-known/agent-skills/stimpunks-love/SKILL.md, because it is prose about how
to read this site. This checks its frontmatter against the format's own rules
and refuses a skill whose name does not match its directory.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://stimpunks.love"
WELL = ROOT / ".well-known"
SKILLS = WELL / "agent-skills"
SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json"

CATALOGUE = {
    "describedby": [
        ("/llms.txt", "text/markdown", "Every page on the street, for language models"),
    ],
    "alternate": [
        ("/feed.xml", "application/rss+xml", "What changed on the street"),
    ],
}
LICENCE = ("https://creativecommons.org/licenses/by-sa/4.0/", "CC BY-SA 4.0")


def skill_entries():
    out = []
    for d in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        f = d / "SKILL.md"
        if not f.exists():
            raise SystemExit(f"REFUSING: {d.relative_to(ROOT)} has no SKILL.md.")
        raw = f.read_bytes()
        m = re.match(r"---\n(.*?)\n---\n", raw.decode("utf-8"), re.S)
        if not m:
            raise SystemExit(f"REFUSING: {f.relative_to(ROOT)} has no YAML frontmatter.")
        meta = dict(re.findall(r"^([a-z]+):\s*(.+)$", m.group(1), re.M))
        name, desc = meta.get("name", ""), meta.get("description", "")
        if name != d.name:
            raise SystemExit(f"REFUSING: the skill in {d.name}/ is named {name!r}. The name "
                             "and the directory must be the same word.")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name) or len(name) > 64:
            raise SystemExit(f"REFUSING: skill name {name!r} is not lowercase-and-hyphens, 1-64.")
        if not desc or len(desc) > 1024:
            raise SystemExit(f"REFUSING: {name}'s description is {len(desc)} characters; the "
                             "format allows 1 to 1024, and it is the only part most agents read.")
        out.append({
            "name": name,
            "type": "skill-md",
            "description": desc,
            "url": f"{SITE}/.well-known/agent-skills/{name}/SKILL.md",
            "digest": "sha256:" + hashlib.sha256(raw).hexdigest(),
        })
    if not out:
        raise SystemExit("REFUSING: no skills to index. Delete the index instead of publishing "
                         "an empty one.")
    return out


def main():
    anchor = {"anchor": SITE + "/"}
    for rel, items in CATALOGUE.items():
        entries = []
        for path, kind, title in items:
            if not (ROOT / path.lstrip("/")).exists():
                raise SystemExit(f"REFUSING: the catalogue would point {rel} at {path}, which is "
                                 "not on disk. A catalogue that names a missing file is worse "
                                 "than no catalogue.")
            entries.append({"href": SITE + path, "type": kind, "title": title})
        anchor[rel] = entries
    anchor["license"] = [{"href": LICENCE[0], "title": LICENCE[1]}]
    (WELL / "api-catalog").write_text(json.dumps({"linkset": [anchor]}, indent=2,
                                                  ensure_ascii=False) + "\n")

    skills = skill_entries()
    (SKILLS / "index.json").write_text(json.dumps({"$schema": SCHEMA, "skills": skills},
                                                   indent=2, ensure_ascii=False) + "\n")
    print(f"api-catalog: {sum(len(v) for v in CATALOGUE.values()) + 1} links; "
          f"agent-skills: " + ", ".join(f"{s['name']} {s['digest'][:19]}…" for s in skills))
    return 0


if __name__ == "__main__":
    sys.exit(main())
