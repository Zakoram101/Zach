(function (root) {
    "use strict";

    var KEY = "zakbook-favorites";

    var BOOKS = [
        { id: "page1", aliases: ["الداء والدواء", "الداء ودواء"], title: "الداء والدواء", author: "ابن القيم الجوزية", cover: "https://m.media-amazon.com/images/I/81IeD7RL-BL._UF1000,1000_QL80_FMwebp_.jpg", href: "Pages/page1.html" },
        { id: "page2", aliases: ["رياض الصالحين"], title: "رياض الصالحين", author: "يحي بن شرف النووي الدمشقي أبو زكريا", cover: "https://pbs.twimg.com/media/GXc4yy5XsAAT5sn?format=jpg&name=900x900", href: "Pages/page2.html" },
        { id: "page3", aliases: ["إحياء علوم الدين", "احياء علوم الدين", "أحياء علوم الدين"], title: "إحياء علوم الدين", author: "أبو حامد الغزالي", cover: "https://dn790000.ca.archive.org/0/items/WAQ83936/cover.jpg", href: "Pages/page3.html" },
        { id: "page4", aliases: ["البرهان في علوم القرآن"], title: "البرهان في علوم القرآن", author: "محمد بن عبد الله الزركشي بدر الدين", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtclV0Rh3yzZ77NVrUJ08vOPqYw3s4AR13jP-4WdSToA&s=10", href: "Pages/page4.html" },
        { id: "صحيح البخاري", aliases: ["1"], title: "صحيح البخاري", author: "الإمام محمد بن إسماعيل البخاري", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXFLUPh6ITr6QUW6Z9G9os8Es5cMt56zTNMSBjaLWq8aohNYlBJIjF62nb&s=10", href: "books/book5.html" },
        { id: "صحيح مسلم", aliases: ["2"], title: "صحيح مسلم", author: "الإمام مسلم بن الحجاج النيسابوري", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeDvaOMkvW9--RlJS0qYEY1lreLnnFyfGPa6Nv6Jr8FkT3QlNRT6SSgGM&s=10", href: "books/book6.html" },
        { id: "صحيح ابن ماجة", aliases: ["صحيح ابن ماجه"], title: "صحيح ابن ماجة", author: "محمد بن يزيد بن ماجه الربعي القزويني", cover: "https://cdn.salla.sa/onqRgX/5RIp4aFP2TqsWUYfqStQ6XyCpojtuAViCsABzTMh.jpg", href: "books/book7.html" },
        { id: "صحيح ابن حبان", aliases: [], title: "صحيح ابن حبان", author: "محمد بن حبان بن أحمد بن حبان البُستي", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvmp8EM4Cu1xARs3UtuslDZelbtEEBrv0494GpeDywwNQAm9ZVxfqLO6w&s=10", href: "books/book9.html" },
        { id: "سنن أبي داود", aliases: ["3"], title: "سنن أبي داود", author: "أبو داود سليمان بن الأشعث", cover: "Pages/images/abu-dawood.jpg", href: "Pages/book-details.html?id=3" },
        { id: "جامع الترمذي", aliases: ["4"], title: "جامع الترمذي", author: "محمد بن عيسى الترمذي", cover: "Pages/images/tirmidhi.jpg", href: "Pages/book-details.html?id=4" },
        { id: "سنن النسائي", aliases: ["5"], title: "سنن النسائي", author: "أحمد بن شعيب النسائي", cover: "Pages/images/nasai.jpg", href: "Pages/book-details.html?id=5" },
        { id: "سنن ابن ماجه", aliases: ["6"], title: "سنن ابن ماجه", author: "محمد بن يزيد ابن ماجه", cover: "Pages/images/ibn-majah.jpg", href: "Pages/book-details.html?id=6" },
        { id: "الموطأ", aliases: ["7"], title: "الموطأ", author: "الإمام مالك بن أنس", cover: "Pages/images/muwatta.jpg", href: "Pages/book-details.html?id=7" },
        { id: "مسند الإمام أحمد", aliases: ["8"], title: "مسند الإمام أحمد", author: "الإمام أحمد بن حنبل", cover: "Pages/images/musnad-ahmad.jpg", href: "Pages/book-details.html?id=8" },
        { id: "تفسير الطبري", aliases: ["9"], title: "تفسير الطبري", author: "محمد بن جرير الطبري", cover: "Pages/images/tafsir-tabari.jpg", href: "Pages/book-details.html?id=9" },
        { id: "تفسير ابن كثير", aliases: ["10"], title: "تفسير ابن كثير", author: "إسماعيل بن عمر بن كثير", cover: "Pages/images/tafsir-ibn-kathir.jpg", href: "Pages/book-details.html?id=10" },
        { id: "مدارج السالكين", aliases: ["12"], title: "مدارج السالكين", author: "ابن قيم الجوزية", cover: "Pages/images/madarij-al-salikeen.jpg", href: "Pages/book-details.html?id=12" },
        { id: "زاد المعاد", aliases: ["13", "زاد المعاد في هدي خير العباد"], title: "زاد المعاد في هدي خير العباد", author: "ابن قيم الجوزية", cover: "https://m.media-amazon.com/images/I/912cpEQwQiL._UF1000,1000_QL80_.jpg", href: "books/book8.html" },
        { id: "الرحيق المختوم", aliases: ["14"], title: "الرحيق المختوم", author: "صفي الرحمن المباركفوري", cover: "Pages/images/rahiq-makhtum.jpg", href: "Pages/book-details.html?id=14" },
        { id: "فقه السنة", aliases: ["15"], title: "فقه السنة", author: "السيد سابق", cover: "Pages/images/fiqh-al-sunna.jpg", href: "Pages/book-details.html?id=15" },
        { id: "الأدب المفرد", aliases: ["17"], title: "الأدب المفرد", author: "الإمام البخاري", cover: "Pages/images/adab-al-mufrad.jpg", href: "Pages/book-details.html?id=17" },
        { id: "تفسير السعدي", aliases: ["18"], title: "تفسير السعدي", author: "عبد الرحمن بن ناصر السعدي", cover: "Pages/images/tafsir-al-saadi.jpg", href: "Pages/book-details.html?id=18" },
        { id: "الأم", aliases: ["19"], title: "الأم", author: "الإمام الشافعي", cover: "Pages/images/al-umm.jpg", href: "Pages/book-details.html?id=19" },
        { id: "المغني", aliases: ["20"], title: "المغني", author: "ابن قدامة المقدسي", cover: "Pages/images/al-mughni.jpg", href: "Pages/book-details.html?id=20" },
        { id: "المحلى", aliases: ["21"], title: "المحلى", author: "ابن حزم الظاهري", cover: "Pages/images/al-muhalla.jpg", href: "Pages/book-details.html?id=21" },
        { id: "بداية المجتهد", aliases: ["22", "بداية المجتهد ونهاية المقتصد"], title: "بداية المجتهد", author: "ابن رشد", cover: "Pages/images/bidayat-al-mujtahid.jpg", href: "Pages/book-details.html?id=22" },
        { id: "الفتاوى الكبرى", aliases: ["23"], title: "الفتاوى الكبرى", author: "ابن تيمية", cover: "Pages/images/fatawa-kubra.jpg", href: "Pages/book-details.html?id=23" },
        { id: "إعلام الموقعين", aliases: ["24", "إعلام الموقعين عن رب العالمين"], title: "إعلام الموقعين", author: "ابن القيم الجوزية", cover: "Pages/images/ilam-al-muwaqqiin.jpg", href: "Pages/book-details.html?id=24" },
        { id: "الرسالة", aliases: ["25"], title: "الرسالة", author: "الإمام الشافعي", cover: "Pages/images/al-risala.jpg", href: "Pages/book-details.html?id=25" },
        { id: "التمهيد", aliases: ["26", "التمهيد لما في الموطأ من المعاني والأسانيد"], title: "التمهيد", author: "ابن عبد البر", cover: "Pages/images/al-tamhid.jpg", href: "Pages/book-details.html?id=26" },
        { id: "المدونة الكبرى", aliases: ["27"], title: "المدونة الكبرى", author: "سحنون", cover: "Pages/images/al-mudawwana.jpg", href: "Pages/book-details.html?id=27" },
        { id: "الموافقات", aliases: ["28"], title: "الموافقات", author: "الشاطبي", cover: "Pages/images/al-muwafaqat.jpg", href: "Pages/book-details.html?id=28" }
    ];

    var byKey = {};
    BOOKS.forEach(function (book) {
        byKey[book.id] = book;
        (book.aliases || []).forEach(function (alias) {
            byKey[alias] = book;
        });
    });

    function inPagesDir() {
        return (root.location.pathname || "").indexOf("/Pages/") !== -1;
    }

    function resolvePath(path) {
        if (!path) return "#";
        if (/^https?:/i.test(path)) return path;
        if (inPagesDir()) {
            if (path.indexOf("Pages/") === 0) return path.slice("Pages/".length);
            return "../" + path;
        }
        return path;
    }

    function readIds() {
        try {
            var raw = JSON.parse(root.localStorage.getItem(KEY) || "[]");
            if (!Array.isArray(raw)) return [];
            return raw.map(function (item) {
                if (typeof item === "string") return item;
                if (item && typeof item.id === "string") return item.id;
                return "";
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    function writeIds(ids) {
        try {
            root.localStorage.setItem(KEY, JSON.stringify(ids));
        } catch (error) {}
    }

    function canonicalId(id) {
        var book = byKey[id];
        return book ? book.id : id;
    }

    function isFav(id) {
        var target = canonicalId(id);
        return readIds().some(function (saved) {
            return canonicalId(saved) === target;
        });
    }

    function toggle(id) {
        var ids = readIds();
        if (isFav(id)) {
            writeIds(ids.filter(function (saved) {
                return canonicalId(saved) !== canonicalId(id);
            }));
            return false;
        }
        ids.push(id);
        writeIds(ids);
        return true;
    }

    function remove(id) {
        writeIds(readIds().filter(function (saved) {
            return canonicalId(saved) !== canonicalId(id);
        }));
    }

    function listResolved() {
        var seen = {};
        var list = [];
        readIds().forEach(function (id) {
            var book = byKey[id];
            var key = book ? book.id : id;
            if (seen[key]) return;
            seen[key] = true;
            if (book) {
                list.push(book);
            } else {
                list.push({
                    id: id,
                    title: id,
                    author: "",
                    cover: "",
                    href: "Pages/books.html"
                });
            }
        });
        return list;
    }

    root.MishkatFavorites = {
        KEY: KEY,
        isFav: isFav,
        toggle: toggle,
        remove: remove,
        readIds: readIds,
        resolvePath: resolvePath,
        listResolved: listResolved,
        get: function (id) {
            return byKey[id] || null;
        }
    };
})(window);
