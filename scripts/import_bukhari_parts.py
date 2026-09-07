import re
import subprocess
from pathlib import Path

BOOK = Path("Book")
BOOK.mkdir(exist_ok=True)

PARTS = [
    ("13JvGvE_Z8ChX7X6OmeHzR_52tPPEVobb", "صحيح البخاري - الجزء 1 من 7.pdf"),
    ("1sDeRu8N6EtCEr3Nr5_p24qVIAJxTAULF", "صحيح البخاري - الجزء 2 من 7.pdf"),
    ("1X9xr-Vewg7bJtnHDoLu3sWnLEhEjcwqC", "صحيح البخاري - الجزء 3 من 7.pdf"),
    ("1F1EkBhi2_LJXZMrtf72fGEpHaRd809Bj", "صحيح البخاري - الجزء 4 من 7.pdf"),
    ("1AyOeFyMa7Ms0MQkPq1Llh1TlcRWBhixZ", "صحيح البخاري - الجزء 5 من 7.pdf"),
    ("1rpAvx1exXnkrKi8-cTedF_07lWBZdU3k", "صحيح البخاري - الجزء 6 من 7.pdf"),
    ("1ThwGxU6MjsthtztTnPe9Iov8GMJbx_l2", "صحيح البخاري - الجزء 7 من 7.pdf"),
]

COOKIE = Path("/tmp/gdrive.cookies")


def curl(url, dest, extra=None):
    cmd = ["curl", "-L", "--retry", "5", "-c", str(COOKIE), "-b", str(COOKIE), "-o", str(dest)]
    if extra:
        cmd.extend(extra)
    cmd.append(url)
    subprocess.check_call(cmd)


def is_pdf(path):
    return path.exists() and path.stat().st_size > 10000 and path.read_bytes()[:4] == b"%PDF"


def confirm_token(path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r"confirm=([0-9A-Za-z_\-]+)", text)
    if match:
        return match.group(1)
    match = re.search(r"name=\"confirm\"\s+value=\"([^\"]+)\"", text)
    if match:
        return match.group(1)
    match = re.search(r"id=\"download-form\".*?action=\"([^\"]+)\"", text, re.S)
    return None


def download(file_id, dest):
    urls = [
        f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t",
        f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t",
    ]
    for url in urls:
        print("try", url)
        curl(url, dest)
        if is_pdf(dest):
            return
        token = confirm_token(dest)
        if token:
            confirmed = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={token}"
            print("retry with confirm", token)
            curl(confirmed, dest)
            if is_pdf(dest):
                return
            confirmed2 = f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm={token}"
            curl(confirmed2, dest)
            if is_pdf(dest):
                return
    raise SystemExit(f"failed to download pdf: {dest.name} size={dest.stat().st_size if dest.exists() else 0}")


def main():
    for file_id, name in PARTS:
        dest = BOOK / name
        if is_pdf(dest):
            print("skip existing", name, dest.stat().st_size)
            continue
        print("download", name)
        download(file_id, dest)
        print("ok", name, dest.stat().st_size)


if __name__ == "__main__":
    main()
