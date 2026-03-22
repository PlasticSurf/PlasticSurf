#!/usr/bin/env python3
"""
migrate-lead.py
Verschiebt alle <p class="mb-6">-Absätze VOR dem ersten <h2 ...> aus dem MDX-Body
in das `lead`-Frontmatter-Feld. Setzt `updated` auf 2026-03-17.
Posts, die bereits ein `lead`-Feld haben, werden übersprungen.
"""

import os
import re
import sys

BLOG_DIR = os.path.join(os.path.dirname(__file__), "../src/content/blog")
TODAY = "2026-03-17"

# Passt auf <p class="mb-6">...</p> (einzeilig, wie MDX-Regeln es vorschreiben)
P_PATTERN = re.compile(r'<p class="mb-6">(.*?)</p>', re.DOTALL)
H2_PATTERN = re.compile(r'<h2\b')
FRONTMATTER_PATTERN = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)


def has_lead(frontmatter: str) -> bool:
    return re.search(r'^lead\s*:', frontmatter, re.MULTILINE) is not None


def set_updated(frontmatter: str, today: str) -> str:
    if re.search(r'^updated\s*:', frontmatter, re.MULTILINE):
        return re.sub(r'^(updated\s*:\s*).*$', rf'\g<1>"{today}"', frontmatter, flags=re.MULTILINE)
    # updated nicht vorhanden → nach `date:` einfügen
    return re.sub(r'^(date\s*:.*$)', rf'\1\nupdated: "{today}"', frontmatter, flags=re.MULTILINE, count=1)


def add_lead(frontmatter: str, lead_content: str) -> str:
    """Fügt lead: | Block nach excerpt: ein (oder vor readingTime/featuredImage)."""
    lead_lines = ["lead: |"]
    for para in lead_content:
        lead_lines.append(f"  {para}")
        lead_lines.append("")  # Leerzeile zwischen Absätzen
    # Letzte leere Zeile entfernen
    if lead_lines and lead_lines[-1] == "":
        lead_lines.pop()
    lead_block = "\n".join(lead_lines)

    # Nach excerpt: einfügen
    if re.search(r'^excerpt\s*:', frontmatter, re.MULTILINE):
        # excerpt kann mehrzeilig sein (| Block) – wir suchen das Ende des Blocks
        # Einfacher Ansatz: nach der excerpt-Zeile(n) einfügen, vor dem nächsten Feld
        def insert_after_excerpt(m):
            return m.group(0) + "\n" + lead_block
        # excerpt als einfacher String: `excerpt: "..."`
        result = re.sub(r'^(excerpt\s*:(?:[^\n]*|\s*\|(?:\n  [^\n]*)+))', insert_after_excerpt, frontmatter, flags=re.MULTILINE, count=1)
        if result != frontmatter:
            return result

    # Fallback: vor readingTime einfügen
    if re.search(r'^readingTime\s*:', frontmatter, re.MULTILINE):
        return re.sub(r'^(readingTime\s*:)', lead_block + "\n" + r'\1', frontmatter, flags=re.MULTILINE, count=1)

    # Fallback: ans Ende des Frontmatters
    return frontmatter + "\n" + lead_block


def migrate_file(path: str):
    """Gibt Status zurück: 'skipped', 'migrated', oder Fehlermeldung."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    fm_match = FRONTMATTER_PATTERN.match(content)
    if not fm_match:
        return "kein Frontmatter"

    frontmatter = fm_match.group(1)
    body = content[fm_match.end():]  # Alles nach ---\n

    if has_lead(frontmatter):
        return "skipped (lead vorhanden)"

    # Finde Position des ersten <h2
    h2_match = H2_PATTERN.search(body)
    if not h2_match:
        return "skipped (kein <h2> gefunden)"

    pre_h2 = body[:h2_match.start()]
    post_h2 = body[h2_match.start():]

    # Extrahiere alle <p class="mb-6">...</p> aus pre_h2
    paragraphs = []
    for m in P_PATTERN.finditer(pre_h2):
        inner = m.group(1).strip()
        # Überspringe leere, reine Markdown-Heading-Reste (##### ...) und sehr kurze Strings
        if not inner:
            continue
        if re.match(r'^#{1,6}\s', inner):
            continue
        # Überspringe reine Kommentar-Platzhalter
        if inner.startswith("{/*") or inner.startswith("<!--"):
            continue
        paragraphs.append(inner)

    if not paragraphs:
        return "skipped (keine Absätze vor <h2>)"

    # Bereinige pre_h2: entferne <p>-Absätze und Leerzeilen (imports + whitespace bleiben)
    cleaned_pre = P_PATTERN.sub("", pre_h2)
    # Mehrfache Leerzeilen normalisieren
    cleaned_pre = re.sub(r'\n{3,}', '\n\n', cleaned_pre)

    # Frontmatter aktualisieren
    new_frontmatter = set_updated(frontmatter, TODAY)
    new_frontmatter = add_lead(new_frontmatter, paragraphs)

    new_content = f"---\n{new_frontmatter}\n---\n{cleaned_pre}{post_h2}"

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    return f"migriert ({len(paragraphs)} Absatz/Absätze)"


def main():
    files = sorted(f for f in os.listdir(BLOG_DIR) if f.endswith(".mdx"))
    print(f"Gefunden: {len(files)} MDX-Dateien\n")
    results = {"migriert": 0, "skipped": 0, "fehler": 0}

    for fname in files:
        path = os.path.join(BLOG_DIR, fname)
        status = migrate_file(path)
        icon = "✅" if "migriert" in status else ("⏭️ " if "skipped" in status else "❌")
        print(f"  {icon} {fname}: {status}")
        if "migriert" in status:
            results["migriert"] += 1
        elif "skipped" in status:
            results["skipped"] += 1
        else:
            results["fehler"] += 1

    print(f"\nFertig: {results['migriert']} migriert · {results['skipped']} übersprungen · {results['fehler']} Fehler")


if __name__ == "__main__":
    main()
