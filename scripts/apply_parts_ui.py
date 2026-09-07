from pathlib import Path

p = Path("Moon/moon4.html")
t = p.read_text(encoding="utf-8")

old_cards = """            <!-- كتاب 5 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">إحياء علوم الدين جزء الأول</h3>
                    <p class=\"book-author\">أبو حامد الغزالي</p>
                    <button class=\"download-btn\" data-book=\"إحياء علوم الدين جزء الأول\" data-author=\"أبو حامد الغزالي\" data-file=\"إحياء_علوم_الدين_جزء1.pdf\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>

            <!-- كتاب 6 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">إحياء علوم الدين جزء الثاني</h3>
                    <p class=\"book-author\">أبو حامد الغزالي</p>
                    <button class=\"download-btn\" data-book=\"إحياء علوم الدين جزء الثاني\" data-author=\"أبو حامد الغزالي\" data-file=\"إحياء_علوم_الدين_جزء2.pdf\">
                        تحميل مباشر
                    </button>
                </div>    
            </div>"""

new_cards = """            <!-- كتاب 5 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">إحياء علوم الدين</h3>
                    <p class=\"book-author\">أبو حامد الغزالي</p>
                    <button class=\"download-btn\" data-parts=\"ihya\" data-book=\"إحياء علوم الدين\" data-author=\"أبو حامد الغزالي\">
                        تحميل الأجزاء
                    </button>
                </div>    
            </div>

            <!-- كتاب 6 -->
            <div class=\"book-item\">
                <div class=\"book-info\">
                    <h3 class=\"book-title\">صحيح البخاري</h3>
                    <p class=\"book-author\">الإمام محمد بن إسماعيل البخاري</p>
                    <button class=\"download-btn\" data-parts=\"bukhari\" data-book=\"صحيح البخاري\" data-author=\"الإمام محمد بن إسماعيل البخاري\">
                        تحميل الأجزاء
                    </button>
                </div>    
            </div>"""

if old_cards not in t:
    raise SystemExit("ihya cards not found")
t = t.replace(old_cards, new_cards, 1)

if 'src="../js/book-parts.js"' not in t:
    t = t.replace(
        '<script src="../js/book-assets.js"></script>',
        '<script src="../js/book-assets.js"></script>\n    <script src="../js/book-parts.js"></script>',
        1,
    )

old_attach = """        function attachNewBookFile(fileName) {
            if (!fileName || bookLinks[fileName]) return false;
            const placeholder = document.querySelector('.download-btn[data-file="nun"]');
            if (!placeholder) return false;"""

new_attach = """        function attachNewBookFile(fileName) {
            if (!fileName || bookLinks[fileName]) return false;
            if (window.MishkatBookParts && window.MishkatBookParts.isPartFile(fileName)) return false;
            const placeholder = document.querySelector('.download-btn[data-file="nun"]');
            if (!placeholder) return false;"""

if old_attach not in t:
    raise SystemExit("attach function not found")
t = t.replace(old_attach, new_attach, 1)

old_dom = """        document.addEventListener('DOMContentLoaded', function() {
            const downloadButtons = document.querySelectorAll('.download-btn');"""
new_dom = """        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('click', function(event) {
                const partsBtn = event.target.closest('.download-btn[data-parts]');
                if (!partsBtn) return;
                event.preventDefault();
                event.stopPropagation();
                const partsId = partsBtn.getAttribute('data-parts');
                if (partsId) {
                    window.location.href = 'book-parts.html?book=' + encodeURIComponent(partsId);
                }
            }, true);

            const downloadButtons = document.querySelectorAll('.download-btn');"""

if old_dom not in t:
    raise SystemExit("DOMContentLoaded hook not found")
t = t.replace(old_dom, new_dom, 1)

p.write_text(t, encoding="utf-8")
print("patched moon4.html")
