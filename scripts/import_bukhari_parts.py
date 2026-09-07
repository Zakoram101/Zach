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


def is_pdf(path):
    return path.exists() and path.stat().st_size > 1_000_000 and path.read_bytes()[:4] == b"%PDF"


def download(file_id, dest):
    if dest.exists():
        dest.unlink()
    url = f"https://drive.google.com/uc?id={file_id}"
    subprocess.check_call(["gdown", url, "-O", str(dest)])
    if not is_pdf(dest):
        if dest.exists():
            dest.unlink()
        raise SystemExit(f"not a pdf after gdown: {dest.name}")


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
