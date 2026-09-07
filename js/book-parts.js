(function (root) {
    "use strict";

    var sets = {
        bukhari: {
            id: "bukhari",
            title: "صحيح البخاري",
            author: "الإمام محمد بن إسماعيل البخاري",
            parts: [
                { title: "صحيح البخاري — الجزء الأول", file: "صحيح البخاري_جزء1.pdf" },
                { title: "صحيح البخاري — الجزء الثاني", file: "صحيح البخاري_جزء2.pdf" }
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
        },
        muslim: {
            id: "muslim",
            title: "صحيح مسلم",
            author: "الإمام مسلم بن الحجاج النيسابوري",
            parts: [
                { title: "صحيح مسلم — الجزء الأول", file: "صحيح مسلم_جزء1.pdf" },
                { title: "صحيح مسلم — الجزء الثاني", file: "صحيح مسلم_جزء2.pdf" },
                { title: "صحيح مسلم — الجزء الثالث", file: "صحيح مسلم_جزء3.pdf" }
            ]
        }
    };

    function allPartFiles() {
        var names = {};
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

    function partUrl(part) {
        if (part && part.url) return part.url;
        return "../Book/" + encodeURIComponent(part.file);
    }

    root.MishkatBookParts = {
        sets: sets,
        getSet: getSet,
        isPartFile: isPartFile,
        allPartFiles: allPartFiles,
        partUrl: partUrl
    };
})(window);
