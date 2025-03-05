(function () {
    document.addEventListener("DOMContentLoaded", () => {
        // 🔹 جلب جميع الأزرار التي تحتوي على `featured-btn`
        const buttons = document.querySelectorAll(".featured-btn");

        // 🔹 إضافة حدث النقر لكل زر
        buttons.forEach((button, index) => {
            button.addEventListener("click", () => {
                const pageNumber = index + 1; // 🔹 تحديد رقم الصفحة بناءً على ترتيب الزر
                const page = `Pages/page${pageNumber}.html`; // 🔹 توليد رابط الصفحة

                window.location.href = page; // 🔹 توجيه المستخدم إلى الصفحة المطلوبة
            });
        });
    });
})();

(function () {
    document.addEventListener("DOMContentLoaded", () => {
        // 🔹 جلب جميع الأزرار التي تحتوي على `featured-btn`
        const buttons = document.querySelectorAll(".featured-btn");

        // 🔹 إضافة حدث النقر لكل زر
        buttons.forEach((button, index) => {
            button.addEventListener("click", () => {
                const pageNumber = index + 1; // 🔹 تحديد رقم الصفحة بناءً على ترتيب الزر
                const page = `Moon/moon${pageNumber}.html`; // 🔹 توليد رابط الصفحة

                window.location.href = page; // 🔹 توجيه المستخدم إلى الصفحة المطلوبة
            });
        });
    });
})();


