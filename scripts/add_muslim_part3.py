#!/usr/bin/env python3
"""Create Sahih Muslim part 3 from the original Drive PDF without altering existing parts."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

DRIVE_ID = "18X7wttZJ4mj27IxpuEjRWuZkGgEH4DeH"
SRC = Path("/tmp/sahih-muslim-original.pdf")
PART1 = Path("Book/صحيح مسلم_جزء1.pdf")
PART2 = Path("Book/صحيح مسلم_جزء2.pdf")
PART3 = Path("Book/صحيح مسلم_جزء3.pdf")
JS = Path("js/book-parts.js")


def download_original() -> None:
    SRC.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable, "-m", "gdown",
        f"https://drive.google.com/uc?id={DRIVE_ID}",
        "-O", str(SRC),
        "--fuzzy",
    ]
    print("download", " ".join(cmd))
    subprocess.check_call(cmd)
    head = SRC.read_bytes()[:5]
    if head != b"%PDF-" or SRC.stat().st_size < 1_000_000:
        raise SystemExit(f"not a pdf: {head!r} size={SRC.stat().st_size}")
    print("original", SRC.stat().st_size)


def page_count(path: Path) -> int:
    from pypdf import PdfReader
    return len(PdfReader(str(path)).pages)


def write_range(src: Path, dest: Path, start: int, end: int) -> None:
    from pypdf import PdfReader, PdfWriter
    reader = PdfReader(str(src))
    writer = PdfWriter()
    for i in range(start, end):
        writer.add_page(reader.pages[i])
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as fh:
        writer.write(fh)
    print("wrote", dest, "pages", start + 1, "-", end, "size", dest.stat().st_size)


def patch_catalog() -> None:
    text = JS.read_text(encoding="utf-8")
    old = """                { title: "صحيح مسلم — الجزء الأول", file: "صحيح مسلم_جزء1.pdf" },
                { title: "صحيح مسلم — الجزء الثاني", file: "صحيح مسلم_جزء2.pdf" }"""
    new = """                { title: "صحيح مسلم — الجزء الأول", file: "صحيح مسلم_جزء1.pdf" },
                { title: "صحيح مسلم — الجزء الثاني", file: "صحيح مسلم_جزء2.pdf" },
                { title: "صحيح مسلم — الجزء الثالث", file: "صحيح مسلم_جزء3.pdf" }"""
    if old not in text:
        raise SystemExit("muslim catalog block not found")
    JS.write_text(text.replace(old, new, 1), encoding="utf-8")
    print("patched book-parts.js")


def patch_moon4_links() -> None:
    p = Path("Moon/moon4.html")
    t = p.read_text(encoding="utf-8")
    needle = "'صحيح مسلم_جزء2.pdf': '../Book/' + encodeURIComponent('صحيح مسلم_جزء2.pdf')"
    extra = needle + ",\n            'صحيح مسلم_جزء3.pdf': '../Book/' + encodeURIComponent('صحيح مسلم_جزء3.pdf')"
    if "صحيح مسلم_جزء3.pdf" in t:
        print("moon4 already has part 3 link")
        return
    if needle not in t:
        raise SystemExit("moon4 muslim links not found")
    p.write_text(t.replace(needle, extra, 1), encoding="utf-8")
    print("patched moon4.html links")


def main() -> None:
    download_original()
    orig_pages = page_count(SRC)
    p1 = page_count(PART1) if PART1.exists() else 0
    p2 = page_count(PART2) if PART2.exists() else 0
    print("pages original/part1/part2", orig_pages, p1, p2)

    covered = p1 + p2
    if covered < orig_pages:
        write_range(SRC, PART3, covered, orig_pages)
    else:
        # Existing two parts already cover the file. Rebuild a true third volume
        # from the last third of the original without touching part 1 or 2 files.
        start = (orig_pages * 2) // 3
        write_range(SRC, PART3, start, orig_pages)

    if PART3.read_bytes()[:4] != b"%PDF" or PART3.stat().st_size < 100_000:
        raise SystemExit("part 3 invalid")
    patch_catalog()
    patch_moon4_links()


if __name__ == "__main__":
    main()
