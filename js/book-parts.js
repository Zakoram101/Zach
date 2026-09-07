(function (root) {
    "use strict";

    var sets = {
        bukhari: {
            id: "bukhari",
            title: "صحيح البخاري",
            author: "الإمام محمد بن إسماعيل البخاري",
            parts: [
                { title: "صحيح البخاري — الجزء 1 من 7", file: "صحيح البخاري - الجزء 1 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 2 من 7", file: "صحيح البخاري - الجزء 2 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 3 من 7", file: "صحيح البخاري - الجزء 3 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 4 من 7", file: "صحيح البخاري - الجزء 4 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 5 من 7", file: "صحيح البخاري - الجزء 5 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 6 من 7", file: "صحيح البخاري - الجزء 6 من 7.pdf" },
                { title: "صحيح البخاري — الجزء 7 من 7", file: "صحيح البخاري - الجزء 7 من 7.pdf" }
            ]
        },
        ihya: {
            id: "ihya",
            title: "إحياء علوم الدين",
            author: "أبو حامد الغزالي",
            parts: [
                { title: "إحياء علوم الدين — الجزء الأول", file: "إحياء_علوم_الدين_جزء1.pdf" },
                { title: "إحياء علوم الدين — الجزء الثاني", file: "إحياء_علوم_الدين_جزء2.pdf" }
            ]
        }
    };

    var extraHidden = [
        "صحيح البخاري_جزء1.pdf",
        "صحيح البخاري_جزء2.pdf"
    ];

    function allPartFiles() {
        var names = {};
        extraHidden.forEach(function (name) { names[name] = true; });
        Object.keys(sets).forEach(function (id) {
            sets[id].parts.forEach(function (part) {
                names[part.file] = true;
            });
        });
        return names;
    }

    function isPartFile(fileName) {
        return !!allPartFiles()[fileName];
    }

    function getSet(id) {
        return sets[id] || null;
    }

    root.MishkatBookParts = {
        sets: sets,
        getSet: getSet,
        isPartFile: isPartFile,
        allPartFiles: allPartFiles
    };
})(window);
