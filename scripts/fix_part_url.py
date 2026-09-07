from pathlib import Path
p = Path("Moon/book-parts.html")
t = p.read_text(encoding="utf-8")
old = 'bookLinks[part.file] = "../Book/" + encodeURIComponent(part.file);'
new = 'bookLinks[part.file] = window.MishkatBookParts.partUrl(part);'
if old not in t:
    raise SystemExit("line not found")
p.write_text(t.replace(old, new, 1), encoding="utf-8")
print("ok")
