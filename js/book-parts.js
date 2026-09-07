(function (root) {
    "use strict";

    function driveUrl(id) {
        return "https://drive.google.com/uc?export=download&id=" + id;
    }

    var sets = {
        bukhari: {
            id: "bukhari",
            title: "صحيح البخاري",
            author: "الإمام محمد بن إسماعيل البخاري",
            parts: [
                { title: "صحيح البخاري — الجزء 1 من 7", file: "صحيح البخاري - الجزء 1 من 7.pdf", url: driveUrl("13JvGvE_Z8ChX7X6OmeHzR_52tPPEVobb") },
                { title: "صحيح البخاري — الجزء 2 من 7", file: "صحيح البخاري - الجزء 2 من 7.pdf", url: driveUrl("1sDeRu8N6EtCEr3Nr5_p24qVIAJxTAULF") },
                { title: "صحيح البخاري — الجزء 3 من 7", file: "صحيح البخاري - الجزء 3 من 7.pdf", url: driveUrl("1X9xr-Vewg7bJtnHDoLu3sWnLEhEjcwqC") },
                { title: "صحيح البخاري — الجزء 4 من 7", file: "صحيح البخاري - الجزء 4 من 7.pdf", url: driveUrl("1F1EkBhi2_LJXZMrtf72fGEpHaRd809Bj") },
                { title: "صحيح البخاري — الجزء 5 من 7", file: "صحيح البخاري - الجزء 5 من 7.pdf", url: driveUrl("1AyOeFyMa7Ms0MQkPq1Llh1TlcRWBhixZ") },
                { title: "صحيح البخاري — الجزء 6 من 7", file: "صحيح البخاري - الجزء 6 من 7.pdf", url: driveUrl("1rpAvx1exXnkrKi8-cTedF_07lWBZdU3k") },
                { title: "صحيح البخاري — الجزء 7 من 7", file: "صحيح البخاري - الجزء 7 من 7.pdf", url: driveUrl("1ThwGxU6MjsthtztTnPe9Iov8GMJbx_l2") }
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
