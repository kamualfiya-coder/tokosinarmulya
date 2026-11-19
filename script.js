
// ======================================================
// 1. PENGATURAN AWAL
// ======================================================

const ADMIN_PASSWORD = "1234";

const $ = (id) => document.getElementById(id);

function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(number) || 0);
}

function buatId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatTanggal(date) {
    if (!date) return "-";

    return new Date(date + "T00:00:00").toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

function showToast(message) {
    const toast = $("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// ======================================================
// 2. PENYIMPANAN DATA
// ======================================================

const produkAwal = [
    { id: 1, name: "Lampu LED Hori 5W", category: "Lampu", stock: 9, hargaUmum: 12000, hargaTokoMesin: 11000, image: "" },
    { id: 2, name: "Lampu LED Hori 7W", category: "Lampu", stock: 3, hargaUmum: 15000, hargaTokoMesin: 14000, image: "" },
    { id: 3, name: "Lampu LED Hori 9W", category: "Lampu", stock: 1, hargaUmum: 18000, hargaTokoMesin: 17000, image: "" },
    { id: 4, name: "Lampu LED Hori 12W", category: "Lampu", stock: 10, hargaUmum: 20000, hargaTokoMesin: 19000, image: "" },
    { id: 5, name: "Lampu LED Hori 15W", category: "Lampu", stock: 9, hargaUmum: 22000, hargaTokoMesin: 21000, image: "" },
    { id: 6, name: "Lampu LED Hori 18W", category: "Lampu", stock: 6, hargaUmum: 24000, hargaTokoMesin: 23000, image: "" },
    { id: 7, name: "Lampu LED Hori 20W", category: "Lampu", stock: 2, hargaUmum: 26000, hargaTokoMesin: 25000, image: "" }
];

function ambilData(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error("Gagal membaca data:", error);
        return defaultValue;
    }
}

function simpanData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        showToast("Penyimpanan penuh. Gunakan gambar yang lebih kecil.");
        return false;
    }
}

let products = ambilData("sinarMulyaProducts", null);

if (!products) {
    products = produkAwal.map((p) => ({ ...p }));
    simpanData("sinarMulyaProducts", products);
} else {
    products = products.map((p) => {
        const hargaUmum = Number(p.hargaUmum ?? p.price ?? 0);

        return {
            ...p,
            hargaUmum,
            hargaTokoMesin: Number(
                p.hargaTokoMesin ?? hargaUmum - 1000
            ),
            stock: Number(p.stock) || 0,
            image: p.image || ""
        };
    });

    simpanData("sinarMulyaProducts", products);
}

let transactions = ambilData("sinarMulyaTransactions", []);
let bills = ambilData("sinarMulyaBills", []);
let receipts = ambilData("sinarMulyaReceipts", []);


// ======================================================
// 3. VARIABEL APLIKASI
// ======================================================

const screens = [
    "homeScreen",
    "catalogScreen",
    "cartScreen",
    "machineMenuScreen",
    "billListScreen",
    "billDetailScreen",
    "successScreen",
    "reportScreen",
    "machineReportScreen",
    "adminLoginScreen",
    "adminMenuScreen",
    "updateMenuScreen",
    "productAdminScreen",
    "tambahBarangScreen",
    "notaPembelianScreen"
];

let activeTransactionType = "Umum";
let selectedTransactionDate = getToday();

let cart = [];
let selectedPayment = "";

let searchKeyword = "";

let activeProductId = null;
let activeBillId = null;

let selectedBillItems = [];
let isAdminLoggedIn = false;


// ======================================================
// 4. NAVIGASI HALAMAN
// ======================================================



function showScreen(screenId) {
    // Sembunyikan semua halaman.
    screens.forEach((id) => {
        const screen = $(id);

        if (screen) {
            screen.classList.add("hidden");
            screen.style.display = "none";
        }
    });

    // Tampilkan halaman tujuan.
    const target = $(screenId);

    if (!target) {
        console.error("Halaman tidak ditemukan:", screenId);
        return;
    }

    target.classList.remove("hidden");
    target.style.display = "";

    // Atur tombol kembali.
    const backButton = $("backButton");

    if (backButton) {
        backButton.classList.toggle(
            "hidden",
            screenId === "homeScreen"
        );
    }

    // Kembalikan warna tombol halaman utama.
    if (screenId === "homeScreen") {
        $("generalButton").style.backgroundColor = "var(--blue)";
        $("machineButton").style.backgroundColor = "#79add4";
    }

    // Perbarui isi halaman.
    switch (screenId) {
        case "homeScreen":
            renderHome();
            break;

        case "catalogScreen":
            renderCatalog();
            break;

        case "cartScreen":
            renderCart();
            break;

        case "billListScreen":
            renderBills();
            break;

        case "billDetailScreen":
            renderBillDetail();
            break;

        case "reportScreen":
            renderGeneralReport();
            break;

        case "machineReportScreen":
            renderMachineReport();
            break;

        case "productAdminScreen":
            renderAdminProducts();
            break;

        case "notaPembelianScreen":
            renderReceipts();
            break;
    }
}


function goBack() {
    const current = screens.find((id) => {
        const element = $(id);
        return element && !element.classList.contains("hidden");
    });

    const routes = {
        catalogScreen: activeTransactionType === "Toko Mesin"
            ? "machineMenuScreen"
            : "homeScreen",

        cartScreen: "catalogScreen",
        machineMenuScreen: "homeScreen",
        billListScreen: "machineMenuScreen",
        billDetailScreen: "billListScreen",
        successScreen: "homeScreen",

        reportScreen: "adminMenuScreen",
        machineReportScreen: "adminMenuScreen",

        adminLoginScreen: "homeScreen",
        adminMenuScreen: "homeScreen",

        updateMenuScreen: "adminMenuScreen",
        productAdminScreen: "updateMenuScreen",
        tambahBarangScreen: "productAdminScreen",
        notaPembelianScreen: "updateMenuScreen"
    };

    showScreen(routes[current] || "homeScreen");
}

// ======================================================
// 5. BERANDA DAN GRAFIK MINGGUAN
// ======================================================

function hitungPemasukan(data) {
    return data.reduce((total, transaksi) => {
        if (transaksi.payment === "Utang") return total;

        return total + Number(transaksi.total || 0);
    }, 0);
}

function transaksiBulanan(data, month) {
    return data.filter((t) => {
        return String(t.date || "").slice(0, 7) === month;
    });
}

function formatAngkaGrafik(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + " jt";
    }

    if (number >= 1000) {
        return (number / 1000).toFixed(0) + " rb";
    }

    return String(number);
}


function drawChart() {
    const canvas = $("salesChart");

    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Mengambil tanggal yang dipilih.
    const tanggalDipilih = new Date(
        selectedTransactionDate + "T00:00:00"
    );

    // Menentukan hari Senin pada minggu tersebut.
    const hari = tanggalDipilih.getDay();
    const selisihSenin = hari === 0 ? 6 : hari - 1;

    const senin = new Date(tanggalDipilih);
    senin.setDate(tanggalDipilih.getDate() - selisihSenin);

    const namaHari = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu"
    ];

    const dataMinggu = namaHari.map((nama, index) => {
        const tanggal = new Date(senin);
        tanggal.setDate(senin.getDate() + index);

        const tahun = tanggal.getFullYear();
        const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
        const hariTanggal = String(tanggal.getDate()).padStart(2, "0");

        const tanggalString = `${tahun}-${bulan}-${hariTanggal}`;

        const transaksiHari = transactions.filter((t) => {
            return t.date === tanggalString &&
                t.payment !== "Utang";
        });

        return {
            nama,
            umum: hitungPemasukan(
                transaksiHari.filter((t) => t.type === "Umum")
            ),
            mesin: hitungPemasukan(
                transaksiHari.filter((t) => t.type === "Toko Mesin")
            )
        };
    });

    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 220;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const nilaiMaksimal = Math.max(
        ...dataMinggu.map((d) => Math.max(d.umum, d.mesin)),
        1
    );

    const chartTop = 30;
    const chartBottom = height - 40;
    const chartHeight = chartBottom - chartTop;

    const jarakKelompok = width / 7;
    const lebarBatang = Math.min(15, jarakKelompok * 0.25);

    // Garis bantu grafik.
    context.strokeStyle = "#e8ebf2";
    context.lineWidth = 1;

    for (let i = 0; i <= 3; i++) {
        const y = chartTop + (chartHeight / 3) * i;

        context.beginPath();
        context.moveTo(8, y);
        context.lineTo(width - 8, y);
        context.stroke();
    }

    dataMinggu.forEach((item, index) => {
        const tengah = jarakKelompok * index + jarakKelompok / 2;

        const tinggiUmum =
            (item.umum / nilaiMaksimal) * chartHeight;

        const tinggiMesin =
            (item.mesin / nilaiMaksimal) * chartHeight;

        // Batang transaksi umum.
        context.fillStyle = "#4054bd";

        context.fillRect(
            tengah - lebarBatang - 1,
            chartBottom - Math.max(tinggiUmum, item.umum > 0 ? 2 : 0),
            lebarBatang,
            Math.max(tinggiUmum, item.umum > 0 ? 2 : 0)
        );

        // Batang transaksi Toko Mesin.
        context.fillStyle = "#79add4";

        context.fillRect(
            tengah + 1,
            chartBottom - Math.max(tinggiMesin, item.mesin > 0 ? 2 : 0),
            lebarBatang,
            Math.max(tinggiMesin, item.mesin > 0 ? 2 : 0)
        );

        // Nama hari.
        context.fillStyle = "#8490a5";
        context.font = "10px Arial";
        context.textAlign = "center";

        context.fillText(
            item.nama,
            tengah,
            height - 12
        );
    });
}


function renderHome() {
    // Tanggal hanya ditampilkan pada tombol tanggal di beranda.

    if ($("homeDateText")) {
        $("homeDateText").textContent =
            formatTanggal(selectedTransactionDate);
    }

    if ($("datePicker")) {
        $("datePicker").value = selectedTransactionDate;
    }

    drawChart();
}


// ======================================================
// 6. KATALOG BARANG
// ======================================================

function getProductPrice(product) {
    return activeTransactionType === "Toko Mesin"
        ? Number(product.hargaTokoMesin)
        : Number(product.hargaUmum);
}

function setTransactionTheme(type) {
    activeTransactionType = type;

    document.body.classList.toggle(
        "machine-theme",
        type === "Toko Mesin"
    );

    if ($("catalogTitle")) {
        $("catalogTitle").textContent =
            type === "Toko Mesin"
                ? "Toko Mesin"
                : "Transaksi Umum";
    }

    if ($("cartTitle")) {
        $("cartTitle").textContent =
            type === "Toko Mesin"
                ? "Keranjang Toko Mesin"
                : "Keranjang";
    }

    if ($("debtPaymentButton")) {
        $("debtPaymentButton").classList.toggle(
            "hidden",
            type !== "Toko Mesin"
        );
    }
}

function renderCatalog() {
    const container = $("productGrid");

    if (!container) return;

    // Semua kategori ditampilkan bersama.
    // Pencarian hanya berdasarkan nama barang.

    const filteredProducts = products.filter((p) => {
        return p.name.toLowerCase().includes(
            searchKeyword.toLowerCase()
        );
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = "<p>Barang tidak ditemukan.</p>";
        return;
    }

    container.innerHTML = filteredProducts.map((p) => `
        <div class="product-card">

            ${p.image
                ? `<img src="${p.image}" class="product-image" alt="${escapeHTML(p.name)}">`
                : `<div class="product-art">📦</div>`
            }

            <h3>${escapeHTML(p.name)}</h3>

            <p>${rupiah(getProductPrice(p))}</p>

            <small>Stok: ${p.stock}</small>

            <div class="quick-quantity">
                <button
                    data-add="${p.id}"
                    ${p.stock <= 0 ? "disabled" : ""}>
                    ${p.stock <= 0 ? "Stok Habis" : "Tambah"}
                </button>
            </div>

        </div>
    `).join("");

    container.querySelectorAll("[data-add]").forEach((button) => {
        button.addEventListener("click", () => {
            addToCart(Number(button.dataset.add));
        });
    });
}

function addToCart(productId) {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const cartItem = cart.find((item) => {
        return item.productId === productId;
    });

    const jumlahDiKeranjang = cartItem ? cartItem.qty : 0;

    if (jumlahDiKeranjang >= product.stock) {
        showToast("Stok barang tidak mencukupi.");
        return;
    }

    if (cartItem) {
        cartItem.qty++;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            qty: 1,
            price: getProductPrice(product)
        });
    }

    showToast("Barang ditambahkan.");
    renderCart();
}


// ======================================================
// 7. KERANJANG DAN PEMBAYARAN
// ======================================================

function getCartTotal() {
    return cart.reduce((total, item) => {
        return total + item.qty * item.price;
    }, 0);
}

function renderCart() {
    const container = $("cartItems");

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = "<p>Keranjang masih kosong.</p>";
    } else {
        container.innerHTML = cart.map((item, index) => `
            <div class="cart-item">

                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${rupiah(item.price)} x ${item.qty}</small>
                    <p>${rupiah(item.price * item.qty)}</p>
                </div>

                <div class="cart-actions">
                    <button data-minus="${index}">−</button>
                    <span>${item.qty}</span>
                    <button data-plus="${index}">+</button>
                    <button data-remove="${index}">Hapus</button>
                </div>

            </div>
        `).join("");
    }

    if ($("cartTotal")) {
        $("cartTotal").textContent = rupiah(getCartTotal());
    }

    if ($("cartCount")) {
        $("cartCount").textContent = cart.reduce(
            (sum, item) => sum + item.qty,
            0
        );
    }

    container.querySelectorAll("[data-minus]").forEach((button) => {
        button.addEventListener("click", () => {
            changeCartQuantity(Number(button.dataset.minus), -1);
        });
    });

    container.querySelectorAll("[data-plus]").forEach((button) => {
        button.addEventListener("click", () => {
            changeCartQuantity(Number(button.dataset.plus), 1);
        });
    });

    container.querySelectorAll("[data-remove]").forEach((button) => {
        button.addEventListener("click", () => {
            cart.splice(Number(button.dataset.remove), 1);
            renderCart();
        });
    });

    document.querySelectorAll("[data-payment]").forEach((button) => {
        button.classList.toggle(
            "selected",
            button.dataset.payment === selectedPayment
        );
    });

    if ($("debtPaymentButton")) {
        $("debtPaymentButton").classList.toggle(
            "hidden",
            activeTransactionType !== "Toko Mesin"
        );
    }

    if ($("finishButton")) {
        $("finishButton").disabled =
            cart.length === 0 || !selectedPayment;
    }
}

function changeCartQuantity(index, change) {
    const item = cart[index];

    if (!item) return;

    const product = products.find((p) => {
        return p.id === item.productId;
    });

    if (!product) return;

    const jumlahBaru = item.qty + change;

    if (jumlahBaru <= 0) {
        cart.splice(index, 1);
    } else if (jumlahBaru > product.stock) {
        showToast("Stok barang tidak mencukupi.");
        return;
    } else {
        item.qty = jumlahBaru;
    }

    renderCart();
}


// ======================================================
// 8. MENYIMPAN TRANSAKSI DAN TAGIHAN
// ======================================================

function buatItemTransaksi() {
    return cart.map((item) => ({
        id: buatId(),
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        price: item.price,
        subtotal: item.qty * item.price
    }));
}

function simpanTransaksiLangsung() {
    const transaction = {
        id: buatId(),
        date: selectedTransactionDate,
        type: activeTransactionType,
        payment: selectedPayment,
        items: buatItemTransaksi(),
        total: getCartTotal(),
        label: "Transaksi Langsung"
    };

    transactions.push(transaction);
}

function buatTagihan() {
    const items = buatItemTransaksi();

    const bill = {
        id: buatId(),
        date: selectedTransactionDate,
        originalItems: items,
        remainingItems: items.map((item) => ({ ...item })),
        payments: [],
        originalTotal: getCartTotal(),
        status: "Belum Lunas"
    };

    bills.push(bill);
}

function kurangiStokKeranjang() {
    cart.forEach((item) => {
        const product = products.find((p) => {
            return p.id === item.productId;
        });

        if (product) {
            product.stock -= item.qty;
        }
    });
}

function completeTransaction() {
    if (cart.length === 0) {
        showToast("Keranjang masih kosong.");
        return;
    }

    if (!selectedPayment) {
        showToast("Pilih metode pembayaran terlebih dahulu.");
        return;
    }

    if (
        selectedPayment === "Utang" &&
        activeTransactionType !== "Toko Mesin"
    ) {
        showToast("Pembayaran utang hanya tersedia di Toko Mesin.");
        return;
    }

    const stokCukup = cart.every((item) => {
        const product = products.find((p) => {
            return p.id === item.productId;
        });

        return product && product.stock >= item.qty;
    });

    if (!stokCukup) {
        showToast("Ada barang yang stoknya tidak mencukupi.");
        return;
    }

    // Cadangan data sebelum transaksi disimpan.

    const produkLama = JSON.stringify(products);
    const transaksiLama = JSON.stringify(transactions);
    const tagihanLama = JSON.stringify(bills);

    if (selectedPayment === "Utang") {
        buatTagihan();
    } else {
        simpanTransaksiLangsung();
    }

    kurangiStokKeranjang();

    const suksesProduk = simpanData(
        "sinarMulyaProducts",
        products
    );

    const suksesTransaksi = simpanData(
        "sinarMulyaTransactions",
        transactions
    );

    const suksesTagihan = simpanData(
        "sinarMulyaBills",
        bills
    );

    if (!suksesProduk || !suksesTransaksi || !suksesTagihan) {
        products = JSON.parse(produkLama);
        transactions = JSON.parse(transaksiLama);
        bills = JSON.parse(tagihanLama);

        simpanData("sinarMulyaProducts", products);
        simpanData("sinarMulyaTransactions", transactions);
        simpanData("sinarMulyaBills", bills);

        showToast("Transaksi gagal disimpan. Data dikembalikan.");
        return;
    }

    cart = [];
    selectedPayment = "";

    showScreen("successScreen");
}


// ======================================================
// 9. DAFTAR TAGIHAN
// ======================================================

function hitungSisaTagihan(bill) {
    return (bill.remainingItems || []).reduce((total, item) => {
        return total + Number(
            item.subtotal || item.qty * item.price || 0
        );
    }, 0);
}

function renderBills() {
    const container = $("billList");

    if (!container) return;

    const activeBills = bills.filter((bill) => {
        return (bill.remainingItems || []).length > 0;
    });

    if ($("billCount")) {
        $("billCount").textContent = activeBills.length;
    }

    if (activeBills.length === 0) {
        container.innerHTML =
            "<p>Tidak ada tagihan yang belum dibayar.</p>";
        return;
    }

    container.innerHTML = activeBills.map((bill) => `
        <div class="bill-card">

            <strong>Tagihan #${escapeHTML(bill.id.slice(-6))}</strong>

            <small>Tanggal: ${formatTanggal(bill.date)}</small>

            <p>Sisa tagihan: ${rupiah(hitungSisaTagihan(bill))}</p>

            <button data-open-bill="${escapeHTML(bill.id)}">
                Lihat Tagihan
            </button>

        </div>
    `).join("");

    container.querySelectorAll("[data-open-bill]").forEach((button) => {
        button.addEventListener("click", () => {
            activeBillId = button.dataset.openBill;
            selectedBillItems = [];
            selectedPayment = "";

            showScreen("billDetailScreen");
        });
    });
}


// ======================================================
// 10. DETAIL TAGIHAN DAN CICILAN
// ======================================================

function getActiveBill() {
    return bills.find((bill) => bill.id === activeBillId);
}

function renderBillDetail() {
    const container = $("billDetail");

    if (!container) return;

    const bill = getActiveBill();

    if (!bill) {
        container.innerHTML = "<p>Tagihan tidak ditemukan.</p>";
        return;
    }

    const remainingItems = bill.remainingItems || [];
    const payments = bill.payments || [];

    container.innerHTML = `
        <p>Nomor Tagihan: #${escapeHTML(bill.id.slice(-6))}</p>

        <p>Tanggal: ${formatTanggal(bill.date)}</p>

        <h3>Pilih barang yang akan dibayar</h3>

        ${remainingItems.map((item) => `
            <label class="bill-item">

                <input
                    type="checkbox"
                    data-bill-item="${escapeHTML(item.id)}"
                    ${selectedBillItems.includes(item.id) ? "checked" : ""}
                >

                <span>
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${item.qty} x ${rupiah(item.price)}</small>
                </span>

                <strong>${rupiah(item.subtotal)}</strong>

            </label>
        `).join("")}

        <h3>Sisa Tagihan: ${rupiah(hitungSisaTagihan(bill))}</h3>

        <h3>Riwayat Pembayaran</h3>

        ${payments.length === 0
            ? "<p>Belum ada pembayaran.</p>"
            : payments.map((payment) => `
                <div class="bill-history">
                    <strong>${rupiah(payment.total)}</strong>
                    <small>${formatTanggal(payment.date)} - ${escapeHTML(payment.payment)}</small>
                </div>
            `).join("")
        }
    `;

    container.querySelectorAll("[data-bill-item]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const itemId = checkbox.dataset.billItem;

            if (checkbox.checked) {
                if (!selectedBillItems.includes(itemId)) {
                    selectedBillItems.push(itemId);
                }
            } else {
                selectedBillItems = selectedBillItems.filter(
                    (id) => id !== itemId
                );
            }

            updateBillPaymentButton();
        });
    });

    updateBillPaymentButton();

    document.querySelectorAll(".bill-method").forEach((button) => {
        button.classList.toggle(
            "selected",
            button.dataset.method === selectedPayment
        );
    });
}

function updateBillPaymentButton() {
    const bill = getActiveBill();

    if (!bill) return;

    const selectedItems = (bill.remainingItems || []).filter((item) => {
        return selectedBillItems.includes(item.id);
    });

    const total = selectedItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
    }, 0);

    // Tombol keranjang tidak diubah menjadi nominal pembayaran.
    // Nominal dapat ditampilkan pada elemen lain jika diperlukan.

    if ($("billFinish")) {
        $("billFinish").disabled =
            selectedItems.length === 0 || !selectedPayment;
    }
}

function bayarTagihan() {
    const bill = getActiveBill();

    if (!bill) return;

    if (selectedBillItems.length === 0) {
        showToast("Pilih barang yang akan dibayar.");
        return;
    }

    if (
        !selectedPayment ||
        !["Tunai", "Transfer"].includes(selectedPayment)
    ) {
        showToast("Pilih pembayaran Tunai atau Transfer.");
        return;
    }

    const paidItems = bill.remainingItems.filter((item) => {
        return selectedBillItems.includes(item.id);
    });

    if (paidItems.length === 0) return;

    const totalPembayaran = paidItems.reduce((sum, item) => {
        return sum + Number(item.subtotal || 0);
    }, 0);

    // Cadangan untuk mengembalikan data jika penyimpanan gagal.

    const tagihanLama = JSON.stringify(bills);
    const transaksiLama = JSON.stringify(transactions);

    const paymentRecord = {
        id: buatId(),
        date: getToday(),
        payment: selectedPayment,
        items: paidItems.map((item) => ({ ...item })),
        total: totalPembayaran
    };

    bill.payments.push(paymentRecord);

    bill.remainingItems = bill.remainingItems.filter((item) => {
        return !selectedBillItems.includes(item.id);
    });

    bill.status = bill.remainingItems.length === 0
        ? "Lunas"
        : "Belum Lunas";

    // Cicilan masuk sebagai pemasukan pada tanggal pembayaran.

    transactions.push({
        id: buatId(),
        date: paymentRecord.date,
        type: "Toko Mesin",
        payment: selectedPayment,
        items: paidItems.map((item) => ({ ...item })),
        total: totalPembayaran,
        label: "Pernah Menjadi Utang",
        billId: bill.id
    });

    const suksesTagihan = simpanData(
        "sinarMulyaBills",
        bills
    );

    const suksesTransaksi = simpanData(
        "sinarMulyaTransactions",
        transactions
    );

    if (!suksesTagihan || !suksesTransaksi) {
        bills = JSON.parse(tagihanLama);
        transactions = JSON.parse(transaksiLama);

        simpanData("sinarMulyaBills", bills);
        simpanData("sinarMulyaTransactions", transactions);

        showToast("Pembayaran gagal disimpan.");
        return;
    }

    selectedBillItems = [];
    selectedPayment = "";

    showToast("Pembayaran tagihan berhasil.");

    showScreen("billListScreen");
}


// ======================================================
// 11. FILTER BULAN LAPORAN
// ======================================================

function bulanDefault() {
    return selectedTransactionDate.slice(0, 7);
}

function ambilBulanLaporan(elementId) {
    const input = $(elementId);

    if (!input) return bulanDefault();

    if (!input.value) {
        input.value = bulanDefault();
    }

    return input.value;
}


// ======================================================
// 12. FUNGSI LAPORAN PER HARI
// ======================================================

function kelompokkanPerTanggal(data) {
    const kelompok = {};

    data.forEach((transaksi) => {
        const tanggal = transaksi.date || "Tanpa tanggal";

        if (!kelompok[tanggal]) {
            kelompok[tanggal] = [];
        }

        kelompok[tanggal].push(transaksi);
    });

    return Object.keys(kelompok)
        .sort((a, b) => b.localeCompare(a))
        .map((tanggal) => ({
            tanggal,
            transaksi: kelompok[tanggal]
        }));
}

function buatTampilanLaporanHarian(data, jenis) {
    if (data.length === 0) {
        return `<p>Belum ada pemasukan ${jenis} pada bulan ini.</p>`;
    }

    const kelompok = kelompokkanPerTanggal(data);

    return kelompok.map((grup) => {
        const totalHarian = hitungPemasukan(grup.transaksi);

        const daftarTransaksi = grup.transaksi
            .slice()
            .reverse()
            .map((t) => `
                <div class="transaction-card">

                    <strong>${rupiah(t.total)}</strong>

                    <small>Metode: ${escapeHTML(t.payment)}</small>

                    ${jenis === "Toko Mesin"
                        ? `<small>${escapeHTML(t.label || "Transaksi Langsung")}</small>`
                        : ""
                    }

                    <small>
                        ${(t.items || []).map((i) =>
                            `${escapeHTML(i.name)} (${i.qty})`
                        ).join(", ")}
                    </small>

                </div>
            `).join("");

        return `
            <div class="daily-report">

                <h4>${formatTanggal(grup.tanggal)}</h4>

                <div class="daily-report-total">
                    <span>Total pemasukan hari ini</span>
                    <strong>${rupiah(totalHarian)}</strong>
                </div>

                ${daftarTransaksi}

            </div>
        `;
    }).join("");
}


// ======================================================
// 13. LAPORAN PENJUALAN UMUM
// ======================================================

function renderGeneralReport() {
    const container = $("transactionList");

    if (!container) return;

    const bulan = ambilBulanLaporan("reportMonth");

    const data = transactions.filter((t) => {
        return t.type === "Umum" &&
            t.payment !== "Utang" &&
            String(t.date).slice(0, 7) === bulan;
    });

    const total = hitungPemasukan(data);

    if ($("reportTotal")) {
        $("reportTotal").textContent = rupiah(total);
    }

    container.innerHTML = buatTampilanLaporanHarian(
        data,
        "Umum"
    );
}


// ======================================================
// 14. LAPORAN TOKO MESIN
// ======================================================

function renderMachineReport() {
    const container = $("machineTransactionList");

    if (!container) return;

    const bulan = ambilBulanLaporan("machineReportMonth");

    // Transaksi Utang tidak dihitung sebagai pemasukan.
    // Pembayaran cicilan dihitung berdasarkan tanggal uang diterima.

    const data = transactions.filter((t) => {
        return t.type === "Toko Mesin" &&
            t.payment !== "Utang" &&
            String(t.date).slice(0, 7) === bulan;
    });

    const total = hitungPemasukan(data);

    if ($("machineReportTotal")) {
        $("machineReportTotal").textContent = rupiah(total);
    }

    container.innerHTML = buatTampilanLaporanHarian(
        data,
        "Toko Mesin"
    );
}


// ======================================================
// 15. LOGIN DAN MENU ADMIN
// ======================================================

function openAdminLogin() {
    if ($("adminPassword")) {
        $("adminPassword").value = "";
    }

    if ($("adminLoginMessage")) {
        $("adminLoginMessage").textContent = "";
    }

    showScreen("adminLoginScreen");
}

function loginAdmin() {
    const password = $("adminPassword")?.value || "";

    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        showScreen("adminMenuScreen");
    } else {
        if ($("adminLoginMessage")) {
            $("adminLoginMessage").textContent = "Password salah!";
        }
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    showScreen("homeScreen");
}

function pastikanAdmin() {
    if (!isAdminLoggedIn) {
        showToast("Silakan login sebagai admin.");
        showScreen("adminLoginScreen");
        return false;
    }

    return true;
}


// ======================================================
// 16. UPDATE BARANG ADMIN
// ======================================================

function renderAdminProducts() {
    const container = $("adminProductList");

    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = "<p>Belum ada barang.</p>";
        return;
    }

    container.innerHTML = products.map((p) => `
        <div class="admin-product-row">

            ${p.image
                ? `<img src="${p.image}" class="admin-product-image" alt="${escapeHTML(p.name)}">`
                : `<div class="admin-product-image">📦</div>`
            }

            <div class="admin-product-info">

                <strong>${escapeHTML(p.name)}</strong>

                <small>Stok: ${p.stock}</small>

                <small>Harga Umum: ${rupiah(p.hargaUmum)}</small>

                <small>Harga Mesin: ${rupiah(p.hargaTokoMesin)}</small>

            </div>

            <div class="admin-product-actions">
                <button data-edit-product="${p.id}">Edit</button>
            </div>

        </div>
    `).join("");

    container.querySelectorAll("[data-edit-product]").forEach((button) => {
        button.addEventListener("click", () => {
            editProduct(Number(button.dataset.editProduct));
        });
    });
}

function editProduct(productId) {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    activeProductId = productId;

    if ($("productFormTitle")) {
        $("productFormTitle").textContent = "Edit Barang";
    }

    if ($("productId")) $("productId").value = product.id;
    if ($("productName")) $("productName").value = product.name;
    if ($("productStock")) $("productStock").value = product.stock;
    if ($("generalPrice")) $("generalPrice").value = product.hargaUmum;
    if ($("machinePrice")) $("machinePrice").value = product.hargaTokoMesin;
    if ($("productImage")) $("productImage").value = "";

    showScreen("tambahBarangScreen");
}

function clearProductForm() {
    activeProductId = null;

    if ($("productFormTitle")) {
        $("productFormTitle").textContent = "Tambah Barang";
    }

    if ($("productId")) $("productId").value = "";
    if ($("productName")) $("productName").value = "";
    if ($("productStock")) $("productStock").value = "";
    if ($("generalPrice")) $("generalPrice").value = "";
    if ($("machinePrice")) $("machinePrice").value = "";
    if ($("productImage")) $("productImage").value = "";
}

function clearProductForm() {
    activeProductId = null;

    if ($("productId")) $("productId").value = "";
    if ($("productName")) $("productName").value = "";
    if ($("productStock")) $("productStock").value = "";
    if ($("generalPrice")) $("generalPrice").value = "";
    if ($("machinePrice")) $("machinePrice").value = "";
    if ($("productImage")) $("productImage").value = "";
}

function bacaGambar(file, callback) {
    if (!file) {
        callback("");
        return;
    }

    if (!file.type.startsWith("image/")) {
        showToast("File harus berupa gambar.");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => callback(reader.result);

    reader.onerror = () => {
        showToast("Gambar gagal dibaca.");
    };

    reader.readAsDataURL(file);
}

function saveProduct() {
    if (!pastikanAdmin()) return;

    const name = $("productName")?.value.trim() || "";
    const stock = Number($("productStock")?.value);
    const generalPrice = Number($("generalPrice")?.value);
    const machinePrice = Number($("machinePrice")?.value);
    const imageFile = $("productImage")?.files?.[0];

    if (!name) {
        showToast("Nama barang wajib diisi.");
        return;
    }

    if (
        $("productStock")?.value === "" ||
        $("generalPrice")?.value === "" ||
        $("machinePrice")?.value === "" ||
        !Number.isFinite(stock) ||
        !Number.isFinite(generalPrice) ||
        !Number.isFinite(machinePrice) ||
        stock < 0 ||
        generalPrice < 0 ||
        machinePrice < 0
    ) {
        showToast("Periksa stok dan harga barang.");
        return;
    }

    const simpanBarang = (imageData) => {
        const existing = products.find((p) => {
            return p.id === activeProductId;
        });

        const produkLama = JSON.stringify(products);

        const productData = {
            id: activeProductId || Date.now(),
            name,
            category: existing?.category || "Barang",
            stock,
            hargaUmum: generalPrice,
            hargaTokoMesin: machinePrice,
            image: imageData || existing?.image || ""
        };

        if (existing) {
            products = products.map((p) => {
                return p.id === activeProductId ? productData : p;
            });
        } else {
            products.push(productData);
        }

        if (simpanData("sinarMulyaProducts", products)) {
            clearProductForm();
            renderCatalog();
            showToast("Data barang berhasil disimpan.");
            showScreen("productAdminScreen");
        } else {
            products = JSON.parse(produkLama);
        }
    };

    if (imageFile) {
        bacaGambar(imageFile, simpanBarang);
    } else {
        simpanBarang("");
    }
}


// ======================================================
// 17. DOKUMENTASI NOTA PEMBELIAN
// ======================================================

function saveReceipt() {
    if (!pastikanAdmin()) return;

    const date = $("receiptDate")?.value;
    const supplier = $("receiptSupplier")?.value.trim();
    const imageFile = $("receiptImage")?.files?.[0];

    if (!date || !supplier || !imageFile) {
        showToast("Tanggal, nama pemasok, dan foto nota wajib diisi.");
        return;
    }

    bacaGambar(imageFile, (imageData) => {
        if (!imageData) return;

        const receiptsLama = JSON.stringify(receipts);

        receipts.push({
            id: buatId(),
            date,
            supplier,
            image: imageData
        });

        if (simpanData("sinarMulyaReceipts", receipts)) {
            $("receiptDate").value = "";
            $("receiptSupplier").value = "";
            $("receiptImage").value = "";

            renderReceipts();
            showToast("Nota berhasil disimpan.");
        } else {
            receipts = JSON.parse(receiptsLama);
        }
    });
}

function renderReceipts() {
    const container = $("receiptList");

    if (!container) return;

    if (receipts.length === 0) {
        container.innerHTML = "<p>Belum ada dokumentasi nota.</p>";
        return;
    }

    container.innerHTML = receipts.slice().reverse().map((receipt) => `
        <div class="receipt-card">

            <strong>${escapeHTML(receipt.supplier)}</strong>

            <small>Tanggal: ${formatTanggal(receipt.date)}</small>

            <img
                src="${receipt.image}"
                class="receipt-image"
                alt="Nota ${escapeHTML(receipt.supplier)}"
            >

        </div>
    `).join("");
}


// ======================================================
// 18. EVENT LISTENER TOMBOL HTML
// ======================================================

// Tombol kembali.

if ($("backButton")) {
    $("backButton").addEventListener("click", goBack);
}


// Tombol transaksi umum.

if ($("generalButton")) {
    $("generalButton").addEventListener("click", () => {
        setTransactionTheme("Umum");

        cart = [];
        selectedPayment = "";
        searchKeyword = "";

        showScreen("catalogScreen");
    });
}


// Tombol Toko Mesin.

if ($("machineButton")) {
    $("machineButton").addEventListener("click", () => {
        setTransactionTheme("Toko Mesin");
        showScreen("machineMenuScreen");
    });
}


// Transaksi baru Toko Mesin.

if ($("newMachineOption")) {
    $("newMachineOption").addEventListener("click", () => {
        setTransactionTheme("Toko Mesin");

        cart = [];
        selectedPayment = "";
        searchKeyword = "";

        showScreen("catalogScreen");
    });
}


// Membuka daftar tagihan.

if ($("billOption")) {
    $("billOption").addEventListener("click", () => {
        showScreen("billListScreen");
    });
}


// Tombol keranjang.

if ($("openCartButton")) {
    $("openCartButton").addEventListener("click", () => {
        showScreen("cartScreen");
    });
}


// Pencarian barang.

if ($("searchInput")) {
    $("searchInput").addEventListener("input", (event) => {
        searchKeyword = event.target.value;
        renderCatalog();
    });
}


// Tombol tanggal di beranda.

function bukaPemilihTanggal() {
    const datePicker = $("datePicker");

    if (!datePicker) return;

    try {
        if (typeof datePicker.showPicker === "function") {
            datePicker.showPicker();
        } else {
            datePicker.click();
        }
    } catch (error) {
        datePicker.click();
    }
}

if ($("homeDateButton")) {
    $("homeDateButton").addEventListener("click", bukaPemilihTanggal);
}


// Input tanggal sebenarnya.

if ($("datePicker")) {
    $("datePicker").addEventListener("change", (event) => {
        if (!event.target.value) return;

        selectedTransactionDate = event.target.value;

        renderHome();
    });
}


// Memilih metode pembayaran transaksi.

document.querySelectorAll("[data-payment]").forEach((button) => {
    button.addEventListener("click", () => {
        selectedPayment = button.dataset.payment;
        renderCart();
    });
});


// Menyelesaikan transaksi.

if ($("finishButton")) {
    $("finishButton").addEventListener("click", completeTransaction);
}


// Memilih metode pembayaran tagihan.

document.querySelectorAll(".bill-method").forEach((button) => {
    button.addEventListener("click", () => {
        selectedPayment = button.dataset.method;

        renderBillDetail();
    });
});


// Menyelesaikan pembayaran tagihan.

if ($("billFinish")) {
    $("billFinish").addEventListener("click", bayarTagihan);
}


// Tombol kembali ke beranda setelah transaksi.

if ($("successHomeButton")) {
    $("successHomeButton").addEventListener("click", () => {
        showScreen("homeScreen");
    });
}


// Filter laporan umum.

if ($("reportMonth")) {
    $("reportMonth").addEventListener("change", renderGeneralReport);
}


// Filter laporan Toko Mesin.

if ($("machineReportMonth")) {
    $("machineReportMonth").addEventListener(
        "change",
        renderMachineReport
    );
}


// Tombol kembali laporan umum.

if ($("reportHomeButton")) {
    $("reportHomeButton").addEventListener("click", () => {
        showScreen(
            isAdminLoggedIn ? "adminMenuScreen" : "homeScreen"
        );
    });
}


// Tombol kembali laporan Toko Mesin.

if ($("machineReportHomeButton")) {
    $("machineReportHomeButton").addEventListener("click", () => {
        showScreen(
            isAdminLoggedIn ? "adminMenuScreen" : "homeScreen"
        );
    });
}


// Login admin.

if ($("adminButton")) {
    $("adminButton").addEventListener("click", openAdminLogin);
}

if ($("adminLoginButton")) {
    $("adminLoginButton").addEventListener("click", loginAdmin);
}

if ($("adminPassword")) {
    $("adminPassword").addEventListener("keydown", (event) => {
        if (event.key === "Enter") loginAdmin();
    });
}


// ======================================================
// MENU UPDATE BARANG
// ======================================================

if ($("updateProductOption")) {
    $("updateProductOption").addEventListener("click", () => {
        if (!pastikanAdmin()) return;

        showScreen("updateMenuScreen");
    });
}


// ======================================================
// SUBMENU DATA BARANG
// ======================================================

if ($("dataBarangOption")) {
    $("dataBarangOption").addEventListener("click", () => {
        if (!pastikanAdmin()) return;

        showScreen("productAdminScreen");
    });
}


// ======================================================
// SUBMENU TAMBAH BARANG
// ======================================================

if ($("tambahBarangOption")) {
    $("tambahBarangOption").addEventListener("click", () => {
        if (!pastikanAdmin()) return;

        clearProductForm();
        showScreen("tambahBarangScreen");
    });
}


// ======================================================
// SUBMENU NOTA PEMBELIAN
// ======================================================

if ($("notaPembelianOption")) {
    $("notaPembelianOption").addEventListener("click", () => {
        if (!pastikanAdmin()) return;

        showScreen("notaPembelianScreen");
    });
}

// Menu laporan umum admin.

if ($("generalReportOption")) {
    $("generalReportOption").addEventListener("click", () => {
        if (pastikanAdmin()) {
            showScreen("reportScreen");
        }
    });
}


// Menu laporan Toko Mesin admin.

if ($("machineReportOption")) {
    $("machineReportOption").addEventListener("click", () => {
        if (pastikanAdmin()) {
            showScreen("machineReportScreen");
        }
    });
}


// Logout admin.

if ($("adminLogoutButton")) {
    $("adminLogoutButton").addEventListener("click", logoutAdmin);
}


// Menyimpan barang.

if ($("saveProductButton")) {
    $("saveProductButton").addEventListener("click", saveProduct);
}


// Membatalkan edit barang.

if ($("cancelProductButton")) {
    $("cancelProductButton").addEventListener("click", () => {
        clearProductForm();
        showScreen("productAdminScreen");
    });
}


// Menyimpan nota.

if ($("saveReceiptButton")) {
    $("saveReceiptButton").addEventListener("click", saveReceipt);
}


// ======================================================
// 19. MENJALANKAN APLIKASI
// ======================================================

// Mengatur tanggal awal.

if ($("datePicker")) {
    $("datePicker").value = selectedTransactionDate;
}

if ($("reportMonth")) {
    $("reportMonth").value = bulanDefault();
}

if ($("machineReportMonth")) {
    $("machineReportMonth").value = bulanDefault();
}


// Tema awal.

setTransactionTheme("Umum");


// Menampilkan halaman beranda.

showScreen("homeScreen");


// Menggambar ulang grafik jika ukuran layar berubah.

window.addEventListener("resize", () => {
    const home = $("homeScreen");

    if (home && !home.classList.contains("hidden")) {
        drawChart();
    }
});
