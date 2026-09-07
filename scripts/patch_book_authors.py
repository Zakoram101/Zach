from pathlib import Path

p = Path("Moon/moon4.html")
t = p.read_text(encoding="utf-8")

old = """        function attachNewBookFile(fileName) {
            if (!fileName || bookLinks[fileName]) return false;
            const placeholder = document.querySelector('.download-btn[data-file=\"nun\"]');
            if (!placeholder) return false;

            bookLinks[fileName] = \"../Book/\" + encodeURIComponent(fileName);
            placeholder.setAttribute(\"data-book\", titleFromFileName(fileName));
            placeholder.setAttribute(\"data-author\", \"\");
            placeholder.setAttribute(\"data-file\", fileName);

            const item = placeholder.closest(\".book-item\");
            if (item) {
                const titleEl = item.querySelector(\".book-title\");
                const authorEl = item.querySelector(\".book-author\");
                if (titleEl) titleEl.textContent = titleFromFileName(fileName);
                if (authorEl) authorEl.textContent = \"\\u00a0\";
            }
            return true;
        }"""

# The source file uses normal JS quotes; rebuild old from the live file markers.
start = t.find("        function attachNewBookFile(fileName) {")
end = t.find("        if (window.MishkatBooks) {")
if start < 0 or end < 0:
    raise SystemExit("attachNewBookFile not found")

new = '''        const bookAuthors = {
            "أثر اعتبار المصالح والمفاسد في الفتوى.pdf": "فارس فالح الخزرجي",
            "الأربعون النووية وتتمتها.pdf": "الإمام النووي وابن رجب",
            "الزهري.pdf": "ابن عساكر",
            "العقيدة الواسطية.pdf": "شيخ الإسلام ابن تيمية",
            "الملخص في شرح كتاب التوحيد.pdf": "صالح بن فوزان الفوزان",
            "بلوغ المرام من أدلة الأحكام.pdf": "ابن حجر العسقلاني",
            "ثلاثة الأصول وأدلتها.pdf": "محمد بن عبد الوهاب",
            "زاد المعاد في هدي خير العباد.pdf": "ابن قيم الجوزية",
            "صحيح ابن حبان.pdf": "الإمام ابن حبان البستي",
            "صحيح سنن ابن ماجة.pdf": "ابن ماجه والألباني",
            "صحيح البخاري_جزء1.pdf": "الإمام محمد بن إسماعيل البخاري",
            "صحيح البخاري_جزء2.pdf": "الإمام محمد بن إسماعيل البخاري",
            "صحيح مسلم_جزء1.pdf": "الإمام مسلم بن الحجاج النيسابوري",
            "صحيح مسلم_جزء2.pdf": "الإمام مسلم بن الحجاج النيسابوري"
        };

        function attachNewBookFile(fileName) {
            if (!fileName || bookLinks[fileName]) return false;
            const placeholder = document.querySelector('.download-btn[data-file="nun"]');
            if (!placeholder) return false;

            const author = bookAuthors[fileName] || "";
            bookLinks[fileName] = "../Book/" + encodeURIComponent(fileName);
            placeholder.setAttribute("data-book", titleFromFileName(fileName));
            placeholder.setAttribute("data-author", author);
            placeholder.setAttribute("data-file", fileName);

            const item = placeholder.closest(".book-item");
            if (item) {
                const titleEl = item.querySelector(".book-title");
                const authorEl = item.querySelector(".book-author");
                if (titleEl) titleEl.textContent = titleFromFileName(fileName);
                if (authorEl) authorEl.textContent = author || "\\u00a0";
            }
            return true;
        }

'''

p.write_text(t[:start] + new + t[end:], encoding="utf-8")
print("patched", p)
