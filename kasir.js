"use strict";

/* =========================================================
   GAMEHUB POS
   Rental PS + Mini Cinema + Food
   Pembayaran WAJIB LUNAS sebelum sesi dimulai
========================================================= */


/* =========================
   PAYMENT METHODS
========================= */

const PAYMENT_METHODS = [
    "Cash",
    "QRIS",

    "Bank Transfer - BCA",
    "Bank Transfer - BRI",
    "Bank Transfer - BNI",
    "Bank Transfer - Mandiri",
    "Bank Transfer - BSI",
    "Bank Transfer - CIMB Niaga",
    "Bank Transfer - Permata",
    "Bank Transfer - BTN",
    "Bank Transfer - Danamon",
    "Bank Transfer - OCBC",
    "Bank Transfer - Bank Mega",
    "Bank Transfer - Bank DKI",
    "Bank Transfer - BJB",

    "GoPay",
    "OVO",
    "DANA",
    "ShopeePay",
    "LinkAja",

    "Debit Card",
    "Credit Card"
];


/* =========================
   DEFAULT DATA
========================= */

const DEFAULT_DATA = {

    settings: {
        ps3Price: 5000,
        ps4Price: 9000
    },

    transactions: [],

    sessions: [],

    foods: [
        {
            id: 1,
            name: "Air Mineral",
            category: "Minuman",
            price: 5000,
            stock: 30,
            sold: 0
        },
        {
            id: 2,
            name: "Teh Botol",
            category: "Minuman",
            price: 7000,
            stock: 20,
            sold: 0
        },
        {
            id: 3,
            name: "Kopi",
            category: "Minuman",
            price: 8000,
            stock: 20,
            sold: 0
        },
        {
            id: 4,
            name: "Mie Instan",
            category: "Makanan",
            price: 10000,
            stock: 20,
            sold: 0
        },
        {
            id: 5,
            name: "Kentang Goreng",
            category: "Snack",
            price: 12000,
            stock: 15,
            sold: 0
        },
        {
            id: 6,
            name: "Popcorn",
            category: "Snack",
            price: 15000,
            stock: 15,
            sold: 0
        }
    ]

};


/* =========================
   LOAD DATA
========================= */

let data = loadData();

function loadData() {

    try {

        const saved = localStorage.getItem("gamehub_pos_data");

        if (!saved) {
            return structuredClone(DEFAULT_DATA);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_DATA),
            ...parsed,
            settings: {
                ...DEFAULT_DATA.settings,
                ...(parsed.settings || {})
            },
            transactions: Array.isArray(parsed.transactions)
                ? parsed.transactions
                : [],
            sessions: Array.isArray(parsed.sessions)
                ? parsed.sessions
                : [],
            foods: Array.isArray(parsed.foods)
                ? parsed.foods
                : structuredClone(DEFAULT_DATA.foods)
        };

    } catch (error) {

        console.error("Gagal membaca data:", error);

        return structuredClone(DEFAULT_DATA);
    }
}


function saveData() {

    localStorage.setItem(
        "gamehub_pos_data",
        JSON.stringify(data)
    );
}


/* =========================
   HELPERS
========================= */

function rupiah(value) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

}


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


function createId(prefix = "ID") {

    return prefix + "_" + Date.now() + "_" +
        Math.random().toString(36).substring(2, 8);

}


function getToday() {

    const now = new Date();

    return now.toISOString().slice(0, 10);
}


function formatDate(value) {

    if (!value) return "-";

    const date = new Date(value);

    return date.toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short"
    });

}


/* =========================
   PAYMENT OPTIONS
========================= */

function createPaymentOptions() {

    return PAYMENT_METHODS
        .map(method => {
            return `<option value="${escapeHTML(method)}">
                        ${escapeHTML(method)}
                    </option>`;
        })
        .join("");
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   NAVIGATION
========================= */

const navButtons =
    document.querySelectorAll(".nav-btn");

const pages =
    document.querySelectorAll(".page");

const pageTitle =
    document.getElementById("pageTitle");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        pages.forEach(section => {
            section.classList.remove("active");
        });

        document
            .getElementById(page)
            .classList.add("active");

        pageTitle.textContent =
            button.textContent.trim();

        renderAll();

    });

});


/* =========================
   CLOCK
========================= */

function updateClock() {

    const now = new Date();

    document.getElementById("clock")
        .textContent =
        now.toLocaleTimeString("id-ID");

    document.getElementById("currentDate")
        .textContent =
        now.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

}


setInterval(updateClock, 1000);

updateClock();


/* =========================
   RENTAL PAYMENT
========================= */

const rentalType =
    document.getElementById("rentalType");

const rentalHours =
    document.getElementById("rentalHours");

const rentalPaid =
    document.getElementById("rentalPaid");

const rentalStart =
    document.getElementById("rentalStart");

const rentalEnd =
    document.getElementById("rentalEnd");


document.getElementById("rentalPayment").innerHTML =
    createPaymentOptions();


function getRentalTotal() {

    const type = rentalType.value;

    const hours =
        Math.max(
            1,
            Number(rentalHours.value) || 1
        );

    const price =
        type === "PS 3"
            ? data.settings.ps3Price
            : data.settings.ps4Price;

    return price * hours;
}


function updateRentalCalculation() {

    const total = getRentalTotal();

    const paid =
        Number(rentalPaid.value) || 0;

    const change =
        Math.max(0, paid - total);

    document.getElementById("rentalTotal")
        .textContent = rupiah(total);

    document.getElementById("rentalChange")
        .value = rupiah(change);

    const status =
        document.getElementById("rentalPaymentStatus");

    if (paid >= total && total > 0) {

        status.textContent = "LUNAS";

        status.classList.remove("unpaid");
        status.classList.add("paid");

    } else {

        status.textContent = "BELUM LUNAS";

        status.classList.remove("paid");
        status.classList.add("unpaid");
    }

    updateRentalEndTime();

}


function updateRentalEndTime() {

    if (!rentalStart.value) return;

    const start =
        new Date(rentalStart.value);

    const hours =
        Math.max(
            1,
            Number(rentalHours.value) || 1
        );

    const end =
        new Date(
            start.getTime() +
            hours * 60 * 60 * 1000
        );

    const local =
        new Date(
            end.getTime() -
            end.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);

    rentalEnd.value = local;
}


rentalType.addEventListener(
    "change",
    updateRentalCalculation
);

rentalHours.addEventListener(
    "input",
    updateRentalCalculation
);

rentalPaid.addEventListener(
    "input",
    updateRentalCalculation
);

rentalStart.addEventListener(
    "change",
    updateRentalCalculation
);


/* =========================
   RENTAL SUBMIT
========================= */

document
    .getElementById("rentalForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const customer =
            document.getElementById("rentalCustomer")
                .value.trim();

        const whatsapp =
            document.getElementById("rentalWhatsapp")
                .value.trim();

        const type =
            rentalType.value;

        const hours =
            Math.max(
                1,
                Number(rentalHours.value) || 1
            );

        const start =
            rentalStart.value;

        const payment =
            document.getElementById("rentalPayment")
                .value;

        const total =
            getRentalTotal();

        const paid =
            Number(rentalPaid.value) || 0;


        /* WAJIB LUNAS */

        if (paid < total) {

            showToast(
                "❌ Rental tidak bisa dimulai. Pembayaran harus lunas terlebih dahulu."
            );

            return;
        }


        if (!start) {

            showToast(
                "Pilih waktu mulai rental."
            );

            return;
        }


        const startDate =
            new Date(start);

        const endDate =
            new Date(
                startDate.getTime() +
                hours * 60 * 60 * 1000
            );


        /* SIMPAN TRANSAKSI */

        addTransaction({

            type: "Rental PS",

            customer,

            whatsapp,

            total,

            payment,

            paid,

            change: paid - total,

            items: [
                {
                    name: type,
                    qty: hours
                }
            ]

        });


        /* SIMPAN SESI */

        data.sessions.push({

            id: createId("RENTAL"),

            kind: "rental",

            title: type,

            customer,

            whatsapp,

            start: startDate.toISOString(),

            end: endDate.toISOString(),

            total,

            payment,

            status: "active"

        });


        saveData();

        this.reset();

        rentalHours.value = 1;

        setDefaultDateTime();

        updateRentalCalculation();

        renderAll();

        showToast(
            "✅ Pembayaran berhasil. Rental sudah dimulai."
        );

    });


/* =========================
   CINEMA
========================= */

document.getElementById("cinemaPayment").innerHTML =
    createPaymentOptions();


const cinemaPeople =
    document.getElementById("cinemaPeople");

const cinemaPrice =
    document.getElementById("cinemaPrice");

const cinemaDuration =
    document.getElementById("cinemaDuration");

const cinemaPaid =
    document.getElementById("cinemaPaid");

const cinemaStart =
    document.getElementById("cinemaStart");


function getCinemaTotal() {

    const people =
        Math.max(
            1,
            Number(cinemaPeople.value) || 1
        );

    const price =
        Math.max(
            0,
            Number(cinemaPrice.value) || 0
        );

    return people * price;
}


function updateCinemaCalculation() {

    const total =
        getCinemaTotal();

    const paid =
        Number(cinemaPaid.value) || 0;

    const change =
        Math.max(
            0,
            paid - total
        );

    document.getElementById("cinemaTotal")
        .textContent = rupiah(total);

    document.getElementById("cinemaChange")
        .value = rupiah(change);

    const status =
        document.getElementById(
            "cinemaPaymentStatus"
        );

    if (paid >= total && total > 0) {

        status.textContent = "LUNAS";

        status.classList.remove("unpaid");
        status.classList.add("paid");

    } else {

        status.textContent = "BELUM LUNAS";

        status.classList.remove("paid");
        status.classList.add("unpaid");

    }

    updateCinemaEndTime();

}


function updateCinemaEndTime() {

    if (!cinemaStart.value) return;

    const start =
        new Date(cinemaStart.value);

    const duration =
        Math.max(
            1,
            Number(cinemaDuration.value) || 1
        );

    const end =
        new Date(
            start.getTime() +
            duration * 60 * 1000
        );

    const local =
        new Date(
            end.getTime() -
            end.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);

    document.getElementById(
        "cinemaEnd"
    ).value = local;

}


[
    cinemaPeople,
    cinemaPrice,
    cinemaDuration,
    cinemaPaid,
    cinemaStart
].forEach(element => {

    element.addEventListener(
        "input",
        updateCinemaCalculation
    );

    element.addEventListener(
        "change",
        updateCinemaCalculation
    );

});


/* CINEMA SUBMIT */

document
    .getElementById("cinemaForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const customer =
            document.getElementById("cinemaCustomer")
                .value.trim();

        const whatsapp =
            document.getElementById("cinemaWhatsapp")
                .value.trim();

        const movie =
            document.getElementById("cinemaMovie")
                .value.trim();

        const duration =
            Math.max(
                1,
                Number(cinemaDuration.value) || 1
            );

        const people =
            Math.max(
                1,
                Number(cinemaPeople.value) || 1
            );

        const start =
            cinemaStart.value;

        const payment =
            document.getElementById(
                "cinemaPayment"
            ).value;

        const total =
            getCinemaTotal();

        const paid =
            Number(cinemaPaid.value) || 0;


        if (paid < total) {

            showToast(
                "❌ Cinema tidak bisa dimulai. Pembayaran harus lunas terlebih dahulu."
            );

            return;
        }


        if (!start) {

            showToast(
                "Pilih waktu mulai cinema."
            );

            return;
        }


        const startDate =
            new Date(start);

        const endDate =
            new Date(
                startDate.getTime() +
                duration * 60 * 1000
            );


        addTransaction({

            type: "Mini Cinema",

            customer,

            whatsapp,

            total,

            payment,

            paid,

            change: paid - total,

            items: [
                {
                    name: movie,
                    qty: people
                }
            ]

        });


        data.sessions.push({

            id: createId("CINEMA"),

            kind: "cinema",

            title: movie,

            customer,

            whatsapp,

            start: startDate.toISOString(),

            end: endDate.toISOString(),

            total,

            payment,

            status: "active"

        });


        saveData();

        this.reset();

        cinemaPeople.value = 1;
        cinemaDuration.value = 120;
        cinemaPrice.value = 25000;

        setDefaultDateTime();

        updateCinemaCalculation();

        renderAll();

        showToast(
            "🎬 Pembayaran berhasil. Cinema sudah dimulai."
        );

    });


/* =========================
   TRANSACTION
========================= */

function addTransaction(transaction) {

    data.transactions.unshift({

        id: createId("TRX"),

        date: new Date().toISOString(),

        status: "paid",

        ...transaction

    });

    saveData();
}


/* =========================
   END SESSION
========================= */

function finishSession(id) {

    const session =
        data.sessions.find(
            item => item.id === id
        );

    if (!session) return;

    session.status = "finished";

    session.finishedAt =
        new Date().toISOString();

    saveData();

    renderAll();

    showToast(
        "Sesi berhasil diselesaikan."
    );
}


/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

    const today =
        getToday();

    const todayTransactions =
        data.transactions.filter(
            item =>
                item.date.slice(0, 10) === today
        );

    const income =
        todayTransactions.reduce(
            (sum, item) =>
                sum + Number(item.total || 0),
            0
        );

    const active =
        data.sessions.filter(
            item =>
                item.status === "active"
        );

    const rentalActive =
        active.filter(
            item =>
                item.kind === "rental"
        ).length;

    const cinemaActive =
        active.filter(
            item =>
                item.kind === "cinema"
        ).length;


    document.getElementById(
        "todayIncome"
    ).textContent = rupiah(income);

    document.getElementById(
        "todayTransactions"
    ).textContent =
        todayTransactions.length;

    document.getElementById(
        "activeRental"
    ).textContent =
        rentalActive;

    document.getElementById(
        "activeCinema"
    ).textContent =
        cinemaActive;


    const activeContainer =
        document.getElementById(
            "activeSessions"
        );

    if (!active.length) {

        activeContainer.innerHTML =
            `<div class="empty">
                Tidak ada sesi aktif.
             </div>`;

    } else {

        activeContainer.innerHTML =
            active.map(renderSessionHTML)
                .join("");

    }


    const recent =
        data.transactions.slice(0, 8);

    const recentContainer =
        document.getElementById(
            "recentTransactions"
        );

    if (!recent.length) {

        recentContainer.innerHTML =
            `<div class="empty">
                Belum ada transaksi.
             </div>`;

    } else {

        recentContainer.innerHTML =
            recent.map(item => {

                return `
                <div class="transaction-mini">

                    <div>
                        <strong>
                            ${escapeHTML(item.customer)}
                        </strong>

                        <div class="session-meta">
                            ${escapeHTML(item.type)}
                            •
                            ${escapeHTML(item.payment)}
                        </div>
                    </div>

                    <strong>
                        ${rupiah(item.total)}
                    </strong>

                </div>
                `;

            }).join("");

    }

}


/* =========================
   SESSION HTML
========================= */

function renderSessionHTML(session) {

    return `
        <div class="session-card">

            <div class="session-top">

                <div>
                    <div class="session-title">
                        ${escapeHTML(session.title)}
                    </div>

                    <div class="session-meta">
                        👤 ${escapeHTML(session.customer)}
                    </div>

                    <div class="session-meta">
                        💳 ${escapeHTML(session.payment)}
                    </div>
                </div>

                <span class="status-paid">
                    LUNAS
                </span>

            </div>

            <div class="session-meta">
                Mulai: ${formatDate(session.start)}
            </div>

            <div class="session-meta">
                Selesai: ${formatDate(session.end)}
            </div>

            <div
                class="countdown"
                data-countdown="${escapeHTML(session.id)}"
            >
                Menghitung...
            </div>

            <button
                class="end-btn"
                onclick="finishSession('${session.id}')"
            >
                ✓ Selesaikan Sesi
            </button>

        </div>
    `;

}


/* =========================
   RENTAL SESSION
========================= */

function renderRentalSessions() {

    const container =
        document.getElementById(
            "rentalSessions"
        );

    const sessions =
        data.sessions.filter(
            item =>
                item.kind === "rental" &&
                item.status === "active"
        );

    if (!sessions.length) {

        container.innerHTML =
            `<div class="empty">
                Belum ada rental aktif.
             </div>`;

        return;
    }

    container.innerHTML =
        sessions.map(
            renderSessionHTML
        ).join("");

}


/* =========================
   CINEMA SESSION
========================= */

function renderCinemaSessions() {

    const container =
        document.getElementById(
            "cinemaSessions"
        );

    const sessions =
        data.sessions.filter(
            item =>
                item.kind === "cinema" &&
                item.status === "active"
        );

    if (!sessions.length) {

        container.innerHTML =
            `<div class="empty">
                Belum ada cinema aktif.
             </div>`;

        return;
    }

    container.innerHTML =
        sessions.map(
            renderSessionHTML
        ).join("");

}


/* =========================
   COUNTDOWN
========================= */

function updateCountdowns() {

    document
        .querySelectorAll("[data-countdown]")
        .forEach(element => {

            const id =
                element.dataset.countdown;

            const session =
                data.sessions.find(
                    item => item.id === id
                );

            if (!session) return;

            const end =
                new Date(session.end)
                    .getTime();

            const now =
                Date.now();

            let diff =
                end - now;


            if (diff <= 0) {

                element.textContent =
                    "⏰ Waktu selesai";

                element.style.color =
                    "var(--danger)";

                return;
            }


            const hours =
                Math.floor(
                    diff / 3600000
                );

            diff %= 3600000;

            const minutes =
                Math.floor(
                    diff / 60000
                );

            diff %= 60000;

            const seconds =
                Math.floor(
                    diff / 1000
                );


            element.textContent =
                `⏱ ${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`;

        });

}


setInterval(updateCountdowns, 1000);


/* =========================
   FOOD
========================= */

function renderFoods() {

    const grid =
        document.getElementById(
            "foodGrid"
        );

    const search =
        document.getElementById(
            "foodSearch"
        ).value
            .toLowerCase()
            .trim();

    const category =
        document.getElementById(
            "foodCategory"
        ).value;


    const foods =
        data.foods.filter(food => {

            const matchSearch =
                food.name
                    .toLowerCase()
                    .includes(search);

            const matchCategory =
                category === "all" ||
                food.category === category;

            return matchSearch &&
                matchCategory;

        });


    if (!foods.length) {

        grid.innerHTML =
            `<div class="panel">
                Produk tidak ditemukan.
             </div>`;

        return;
    }


    grid.innerHTML =
        foods.map(food => {

            let emoji = "🍴";

            if (food.category === "Minuman")
                emoji = "🥤";

            if (food.category === "Snack")
                emoji = "🍿";


            return `
                <div class="food-card">

                    <div class="food-emoji">
                        ${emoji}
                    </div>

                    <h3>
                        ${escapeHTML(food.name)}
                    </h3>

                    <p>
                        ${escapeHTML(food.category)}
                    </p>

                    <div class="food-price">
                        ${rupiah(food.price)}
                    </div>

                    <div class="stock">
                        Stok: ${food.stock}
                        • Terjual: ${food.sold}
                    </div>

                    <button
                        class="primary-btn"
                        onclick="sellFood('${food.id}')"
                        ${food.stock <= 0 ? "disabled" : ""}
                    >
                        🛒 Jual 1
                    </button>

                </div>
            `;

        }).join("");

}


function sellFood(id) {

    const food =
        data.foods.find(
            item => String(item.id) === String(id)
        );

    if (!food) return;

    if (food.stock <= 0) {

        showToast(
            "Stok produk habis."
        );

        return;
    }


    food.stock--;
    food.sold++;


    addTransaction({

        type: "Food & Drink",

        customer: "Pelanggan",

        whatsapp: "",

        total: food.price,

        payment: "Cash",

        paid: food.price,

        change: 0,

        items: [
            {
                name: food.name,
                qty: 1
            }
        ]

    });


    saveData();

    renderAll();

    showToast(
        `${food.name} berhasil dijual.`
    );

}


/* =========================
   FOOD SEARCH
========================= */

document
    .getElementById("foodSearch")
    .addEventListener(
        "input",
        renderFoods
    );

document
    .getElementById("foodCategory")
    .addEventListener(
        "change",
        renderFoods
    );


/* =========================
   FOOD MODAL
========================= */

const foodModal =
    document.getElementById(
        "foodModal"
    );


document
    .getElementById("addFoodBtn")
    .addEventListener(
        "click",
        () => {
            foodModal.classList.add("show");
        }
    );


document
    .getElementById("closeFoodModal")
    .addEventListener(
        "click",
        () => {
            foodModal.classList.remove("show");
        }
    );


document
    .getElementById("foodForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const food = {

                id: Date.now(),

                name:
                    document
                        .getElementById("foodName")
                        .value
                        .trim(),

                category:
                    document
                        .getElementById("foodCategoryInput")
                        .value,

                price:
                    Number(
                        document
                            .getElementById("foodPrice")
                            .value
                    ) || 0,

                stock:
                    Number(
                        document
                            .getElementById("foodStock")
                            .value
                    ) || 0,

                sold: 0

            };


            if (!food.name) {

                showToast(
                    "Nama produk wajib diisi."
                );

                return;
            }


            data.foods.push(food);

            saveData();

            event.target.reset();

            foodModal.classList.remove(
                "show"
            );

            renderAll();

            showToast(
                "Produk berhasil ditambahkan."
            );

        }
    );


/* =========================
   TRANSACTION TABLE
========================= */

function renderTransactions() {

    const tbody =
        document.getElementById(
            "transactionTable"
        );


    if (!data.transactions.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="8">
                    Belum ada transaksi.
                </td>
             </tr>`;

        return;
    }


    tbody.innerHTML =
        data.transactions.map(item => {

            return `
                <tr>

                    <td>
                        ${formatDate(item.date)}
                    </td>

                    <td>
                        ${escapeHTML(item.type)}
                    </td>

                    <td>
                        ${escapeHTML(item.customer)}
                    </td>

                    <td>
                        <strong>
                            ${rupiah(item.total)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(item.payment)}
                    </td>

                    <td>
                        ${rupiah(item.paid)}
                    </td>

                    <td>
                        ${rupiah(item.change)}
                    </td>

                    <td>
                        <span class="status-paid">
                            LUNAS
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================
   REPORT
========================= */

function renderReports() {

    const transactions =
        data.transactions;


    const total =
        transactions.reduce(
            (sum, item) =>
                sum + Number(item.total || 0),
            0
        );


    const rental =
        transactions
            .filter(
                item =>
                    item.type === "Rental PS"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.total || 0),
                0
            );


    const cinema =
        transactions
            .filter(
                item =>
                    item.type === "Mini Cinema"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.total || 0),
                0
            );


    const food =
        transactions
            .filter(
                item =>
                    item.type === "Food & Drink"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.total || 0),
                0
            );


    document.getElementById(
        "reportIncome"
    ).textContent = rupiah(total);

    document.getElementById(
        "reportRental"
    ).textContent = rupiah(rental);

    document.getElementById(
        "reportCinema"
    ).textContent = rupiah(cinema);

    document.getElementById(
        "reportFood"
    ).textContent = rupiah(food);


    const paymentMap = {};


    transactions.forEach(item => {

        if (!paymentMap[item.payment]) {
            paymentMap[item.payment] = {
                count: 0,
                total: 0
            };
        }

        paymentMap[item.payment].count++;

        paymentMap[item.payment].total +=
            Number(item.total || 0);

    });


    const report =
        document.getElementById(
            "paymentReport"
        );


    const entries =
        Object.entries(paymentMap);


    if (!entries.length) {

        report.innerHTML =
            `<p>Belum ada data pembayaran.</p>`;

        return;
    }


    report.innerHTML =
        entries.map(
            ([method, info]) => {

                return `
                    <div class="payment-item">

                        <span>
                            ${escapeHTML(method)}
                        </span>

                        <strong>
                            ${info.count} transaksi
                        </strong>

                        <span>
                            ${rupiah(info.total)}
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* =========================
   SETTINGS
========================= */

function loadSettings() {

    document.getElementById(
        "settingPS3"
    ).value =
        data.settings.ps3Price;

    document.getElementById(
        "settingPS4"
    ).value =
        data.settings.ps4Price;

    document.getElementById(
        "ps3PriceView"
    ).textContent =
        `${rupiah(data.settings.ps3Price)}/jam`;

    document.getElementById(
        "ps4PriceView"
    ).textContent =
        `${rupiah(data.settings.ps4Price)}/jam`;

}


document
    .getElementById("settingsForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            data.settings.ps3Price =
                Math.max(
                    0,
                    Number(
                        document.getElementById(
                            "settingPS3"
                        ).value
                    ) || 0
                );

            data.settings.ps4Price =
                Math.max(
                    0,
                    Number(
                        document.getElementById(
                            "settingPS4"
                        ).value
                    ) || 0
                );


            saveData();

            loadSettings();

            updateRentalCalculation();

            showToast(
                "Pengaturan berhasil disimpan."
            );

        }
    );


/* =========================
   RESET
========================= */

document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        () => {

            const yes =
                confirm(
                    "Yakin ingin menghapus semua data?"
                );

            if (!yes) return;

            localStorage.removeItem(
                "gamehub_pos_data"
            );

            data =
                structuredClone(
                    DEFAULT_DATA
                );

            saveData();

            renderAll();

            showToast(
                "Semua data berhasil direset."
            );

        }
    );


/* =========================
   DARK MODE
========================= */

document
    .getElementById("themeBtn")
    .addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            const dark =
                document.body.classList.contains(
                    "dark"
                );

            localStorage.setItem(
                "gamehub_dark_mode",
                dark
            );

            document.getElementById(
                "themeBtn"
            ).textContent =
                dark
                    ? "☀️ Mode Terang"
                    : "🌙 Mode Gelap";

        }
    );


function loadTheme() {

    const dark =
        localStorage.getItem(
            "gamehub_dark_mode"
        ) === "true";

    if (dark) {

        document.body.classList.add(
            "dark"
        );

        document.getElementById(
            "themeBtn"
        ).textContent =
            "☀️ Mode Terang";

    }

}


/* =========================
   EXPORT CSV
========================= */

document
    .getElementById("exportBtn")
    .addEventListener(
        "click",
        exportCSV
    );


function exportCSV() {

    if (!data.transactions.length) {

        showToast(
            "Belum ada transaksi untuk diekspor."
        );

        return;
    }


    const headers = [
        "Tanggal",
        "Jenis",
        "Pelanggan",
        "Total",
        "Metode Pembayaran",
        "Dibayar",
        "Kembalian",
        "Status"
    ];


    const rows =
        data.transactions.map(item => [

            formatDate(item.date),

            item.type,

            item.customer,

            item.total,

            item.payment,

            item.paid,

            item.change,

            "LUNAS"

        ]);


    const csv = [
        headers,
        ...rows
    ]
        .map(row =>
            row.map(value =>
                `"${String(value)
                    .replaceAll('"', '""')}"`
            ).join(",")
        )
        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `gamehub-transaksi-${getToday()}.csv`;

    link.click();

    URL.revokeObjectURL(url);

    showToast(
        "File CSV berhasil dibuat."
    );

}


/* =========================
   DEFAULT DATETIME
========================= */

function toLocalDateTimeInput(date) {

    const local =
        new Date(
            date.getTime() -
            date.getTimezoneOffset() * 60000
        );

    return local
        .toISOString()
        .slice(0, 16);

}


function setDefaultDateTime() {

    const now =
        new Date();

    const value =
        toLocalDateTimeInput(now);

    rentalStart.value =
        value;

    cinemaStart.value =
        value;

    updateRentalCalculation();

    updateCinemaCalculation();

}


/* =========================
   RENDER ALL
========================= */

function renderAll() {

    renderDashboard();

    renderRentalSessions();

    renderCinemaSessions();

    renderFoods();

    renderTransactions();

    renderReports();

    loadSettings();

    updateCountdowns();

}


/* =========================
   START
========================= */

loadTheme();

setDefaultDateTime();

renderAll();

updateRentalCalculation();

updateCinemaCalculation();