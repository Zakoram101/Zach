#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

DRIVE_ID = "18X7wttZJ4mj27IxpuEjRWuZkGgEH4DeH"
SRC = Path("/tmp/sahih-muslim-original.pdf")
OLD1 = Path("Book/صحيح مسلم_جزء1.pdf")
OLD2 = Path("Book/صحيح مسلم_جزء2.pdf")
PART3 = Path("Book/صحيح مسلم_جزء3.pdf")
JS = Path("js/book-parts.js")
MOON = Path("Moon/moon4.html")


def download_original() -> None:
    cmd = [sys.executable, "-m", "gdown", DRIVE_ID, "-O", str(SRC)]
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
    print("wrote", dest.name, "pages", start + 1, "-", end, "size", dest.stat().st_size)


def patch_catalog() -> None:
    text = JS.read_text(encoding="utf-8")
    old = """                { title: "صحيح مسلم — الجزء الأول", file: "صحيح مسلم_جزء1.pdf" },
                { title: "صحيح مسلم — الجزء الثاني", file: "صحيح مسلم_جزء2.pdf" }"""
    new = """                { title: "صحيح مسلم — الجزء الأول", file: "صحيح مسلم_جزء1.pdf" },
                { title: "صحيح مسلم — الجزء الثاني", file: "صحيح مسلم_جزء2.pdf" },
                { title: "صحيح مسلم — الجزء الثالث", file: "صحيح مسلم_جزء3.pdf" }"""
    if "صحيح مسلم_جزء3.pdf" in text:
        print("catalog already has part 3")
        return
    if old not in text:
        raise SystemExit("muslim catalog block not found")
    JS.write_text(text.replace(old, new, 1), encoding="utf-8")
    print("patched book-parts.js")


def patch_moon4() -> None:
    t = MOON.read_text(encoding="utf-8")
    needle = "'صحيح مسلم_جزء2.pdf': '../Book/' + encodeURIComponent('صحيح مسلم_جزء2.pdf')"
    extra = needle + ",\n            'صحيح مسلم_جزء3.pdf': '../Book/' + encodeURIComponent('صحيح مسلم_جزء3.pdf')"
    if "صحيح مسلم_جزء3.pdf" in t:
        print("moon4 already has part 3 link")
        return
    if needle not in t:
        raise SystemExit("moon4 muslim links not found")
    MOON.write_text(t.replace(needle, extra, 1), encoding="utf-8")
    print("patched moon4.html")


def main() -> None:
    download_original()
    orig_pages = page_count(SRC)
    old1 = page_count(OLD1) if OLD1.exists() else 0
    old2 = page_count(OLD2) if OLD2.exists() else 0
    print("pages original/old1/old2", orig_pages, old1, old2)
    covered = old1 + old2
    if covered < orig_pages:
        write_range(SRC, PART3, covered, orig_pages)
    else:
        start = (orig_pages * 2) // 3
        write_range(SRC, PART3, start, orig_pages)
    if PART3.read_bytes()[:4] != b"%PDF" or PART3.stat().st_size < 100_000:
        raise SystemExit("part 3 invalid")
    patch_catalog()
    patch_moon4()


if __name__ == "__main__":
    main()
