// ======================================================================
// CONFIG — change this to your Render backend URL (no trailing slash)
// ======================================================================
const API_BASE_URL = "https://your-app-name.onrender.com";

// ======================================================================
// DOM references
// ======================================================================
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const categorySelect = document.getElementById("categorySelect");
const booksGrid = document.getElementById("booksGrid");
const emptyState = document.getElementById("emptyState");
const statusMessage = document.getElementById("statusMessage");
const heroSubtitle = document.getElementById("heroSubtitle");

let debounceTimer = null;

// ======================================================================
// Init
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadBooks();

    searchInput.addEventListener("input", () => {
        clearBtn.hidden = searchInput.value.length === 0;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(loadBooks, 350); // debounce typing
    });

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.hidden = true;
        loadBooks();
    });

    categorySelect.addEventListener("change", loadBooks);
});

// ======================================================================
// Load category list for the filter dropdown
// ======================================================================
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) return; // non-fatal, dropdown just stays with "All categories"
        const categories = await res.json();
        categories.forEach((cat) => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            categorySelect.appendChild(opt);
        });
    } catch (err) {
        console.warn("Could not load categories:", err);
    }
}

// ======================================================================
// Load books (optionally filtered by search text + category)
// ======================================================================
async function loadBooks() {
    const q = searchInput.value.trim();
    const category = categorySelect.value;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);

    showStatus("Loading books…");

    try {
        const res = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        renderBooks(data.books, q, category);
    } catch (err) {
        console.error(err);
        showStatus(
            "Couldn't reach the library server. Please try again in a moment.",
            true
        );
        booksGrid.innerHTML = "";
        emptyState.hidden = true;
    }
}

// ======================================================================
// Render
// ======================================================================
function renderBooks(books, q, category) {
    hideStatus();

    if (!books || books.length === 0) {
        booksGrid.innerHTML = "";
        emptyState.hidden = false;
        heroSubtitle.textContent = "0 books found";
        return;
    }

    emptyState.hidden = true;

    if (q || category) {
        heroSubtitle.textContent = `${books.length} book${books.length === 1 ? "" : "s"} found`;
    } else {
        heroSubtitle.textContent = `Browse our collection of ${books.length} books`;
    }

    booksGrid.innerHTML = books.map(bookCardHTML).join("");
}

function bookCardHTML(book) {
    const img = book.photo_url
        ? `<img src="${escapeAttr(book.photo_url)}" alt="${escapeAttr(book.title)}" class="book-img" onerror="this.replaceWith(placeholderNode())">`
        : `<div class="book-img-placeholder"><i class="fas fa-book"></i></div>`;

    const availableBadge =
        book.available_copies > 0
            ? `<span class="badge-available">${book.available_copies} available</span>`
            : `<span class="badge-unavailable">Unavailable</span>`;

    return `
        <div class="book-card">
            ${img}
            <div class="book-body">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">${escapeHtml(book.author || "Unknown author")}</div>
                <div class="book-meta">
                    <span class="badge-category" title="${escapeAttr(book.category || "")}">${escapeHtml(book.category || "Uncategorized")}</span>
                    ${availableBadge}
                </div>
            </div>
        </div>
    `;
}

// ======================================================================
// Helpers
// ======================================================================
function showStatus(text, isError = false) {
    statusMessage.hidden = false;
    statusMessage.textContent = text;
    statusMessage.classList.toggle("error", isError);
}

function hideStatus() {
    statusMessage.hidden = true;
    statusMessage.classList.remove("error");
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
}