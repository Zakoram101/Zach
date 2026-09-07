from pathlib import Path

p = Path("Moon/moon4.html")
t = p.read_text(encoding="utf-8")

old_cards = """            <!-- كتاب 7 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">nun</h3>
                    <p class=\"book-author\">nun</p>
                    <button class=\"download-btn\" data-book=\"nun\" data-author=\"nun\" data-file=\"nun\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>

            <!-- كتاب 8 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">nun</h3>
                    <p class=\"book-author\">nun</p>
                    <button class=\"download-btn\" data-book=\"nun\" data-author=\"nun\" data-file=\"nun\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>"""

new_cards = """            <!-- كتاب 7 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">صحيح ابن ماجة</h3>
                    <p class=\"book-author\">الإمام محمد بن يزيد القزويني</p>
                    <button class=\"download-btn\" data-book=\"صحيح ابن ماجة\" data-author=\"الإمام محمد بن يزيد القزويني\" data-file=\"صحيح سنن ابن ماجة.pdf\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>

            <!-- كتاب 8 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">صحيح ابن حبان</h3>
                    <p class=\"book-author\">الإمام ابن حبان البستي</p>
                    <button class=\"download-btn\" data-book=\"صحيح ابن حبان\" data-author=\"الإمام ابن حبان البستي\" data-file=\"صحيح ابن حبان.pdf\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>"""

if old_cards not in t:
    raise SystemExit("nun cards 7-8 not found")
t = t.replace(old_cards, new_cards, 1)

old_links = """            'إحياء_علوم_الدين_جزء1.pdf': '../Book/' + encodeURIComponent('إحياء_علوم_الدين_جزء1.pdf'),
            'إحياء_علوم_الدين_جزء2.pdf': '../Book/' + encodeURIComponent('إحياء_علوم_الدين_جزء2.pdf')
        };"""

new_links = """            'إحياء_علوم_الدين_جزء1.pdf': '../Book/' + encodeURIComponent('إحياء_علوم_الدين_جزء1.pdf'),
            'إحياء_علوم_الدين_جزء2.pdf': '../Book/' + encodeURIComponent('إحياء_علوم_الدين_جزء2.pdf'),
            'صحيح سنن ابن ماجة.pdf': '../Book/' + encodeURIComponent('صحيح سنن ابن ماجة.pdf'),
            'صحيح ابن حبان.pdf': '../Book/' + encodeURIComponent('صحيح ابن حبان.pdf')
        };"""

if old_links not in t:
    raise SystemExit("bookLinks block not found")
t = t.replace(old_links, new_links, 1)

p.write_text(t, encoding="utf-8")
print("patched moon4.html")
