const STORAGE_KEY = "annual-books-app-state";

const state = {
  year: new Date().getFullYear(),
  sortMode: "time",
  books: [],
};

const form = document.getElementById("book-form");
const yearInput = document.getElementById("year");
const sortModeInput = document.getElementById("sort-mode");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const ratingInput = document.getElementById("rating");
const list = document.getElementById("book-list");
const count = document.getElementById("count");
const stats = document.getElementById("stats");
const generateBtn = document.getElementById("generate-btn");
const exportJsonBtn = document.getElementById("export-json-btn");
const clearBtn = document.getElementById("clear-btn");
const canvas = document.getElementById("poster");
const downloadLink = document.getElementById("download-link");
const ctx = canvas.getContext("2d");

const stars = (score) => "★".repeat(score) + "☆".repeat(5 - score);

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.books)) {
      state.books = parsed.books
        .map((item) => ({
          id: item.id ?? crypto.randomUUID(),
          title: String(item.title ?? "").trim(),
          author: String(item.author ?? "").trim(),
          rating: Number(item.rating ?? 0),
          createdAt: Number(item.createdAt ?? Date.now()),
        }))
        .filter((item) => item.title && item.author && item.rating >= 1 && item.rating <= 5);
    }

    state.year = Number(parsed.year) || new Date().getFullYear();
    state.sortMode = ["time", "rating-desc", "rating-asc"].includes(parsed.sortMode)
      ? parsed.sortMode
      : "time";
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getSortedBooks() {
  const copied = [...state.books];

  if (state.sortMode === "rating-desc") {
    copied.sort((a, b) => b.rating - a.rating || a.createdAt - b.createdAt);
  } else if (state.sortMode === "rating-asc") {
    copied.sort((a, b) => a.rating - b.rating || a.createdAt - b.createdAt);
  } else {
    copied.sort((a, b) => a.createdAt - b.createdAt);
  }

  return copied;
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const chars = [...text];
  let line = "";
  let lines = [];

  chars.forEach((char) => {
    const testLine = line + char;
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });
}

function renderStats(sortedBooks) {
  const avg = sortedBooks.length
    ? (sortedBooks.reduce((sum, item) => sum + item.rating, 0) / sortedBooks.length).toFixed(1)
    : "0.0";
  const fiveStars = sortedBooks.filter((item) => item.rating === 5).length;
  stats.innerHTML = `<span>平均分：${avg}</span><span>五星：${fiveStars} 本</span>`;
}

function renderList() {
  const sortedBooks = getSortedBooks();
  list.innerHTML = "";

  sortedBooks.forEach((book, index) => {
    const li = document.createElement("li");
    li.className = "book-item";

    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${book.title}`;

    const meta = document.createElement("div");
    meta.className = "book-meta";
    meta.textContent = book.author;

    const rating = document.createElement("div");
    rating.textContent = stars(book.rating);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "删除";
    removeBtn.addEventListener("click", () => {
      state.books = state.books.filter((item) => item.id !== book.id);
      saveState();
      renderList();
    });

    left.append(title, meta);
    li.append(left, rating, removeBtn);
    list.appendChild(li);
  });

  count.textContent = `${sortedBooks.length} 本`;
  renderStats(sortedBooks);
}

function drawPoster() {
  const sortedBooks = getSortedBooks();

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#eef2ff");
  gradient.addColorStop(1, "#fdf2f8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 54px sans-serif";
  ctx.fillText(`📚 ${state.year} 年度书籍记录`, 60, 96);

  ctx.fillStyle = "#64748b";
  ctx.font = "28px sans-serif";
  ctx.fillText(`总计 ${sortedBooks.length} 本`, 60, 146);

  ctx.fillStyle = "#ffffffcc";
  ctx.fillRect(40, 180, canvas.width - 80, canvas.height - 260);

  const maxLines = 13;
  const displayBooks = sortedBooks.slice(0, maxLines);

  displayBooks.forEach((book, i) => {
    const y = 235 + i * 70;
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 26px sans-serif";
    drawWrappedText(`${i + 1}. ${book.title}`, 70, y, 520, 30, 2);

    ctx.fillStyle = "#64748b";
    ctx.font = "22px sans-serif";
    drawWrappedText(`${book.author}`, 70, y + 35, 520, 26, 1);

    ctx.fillStyle = "#334155";
    ctx.font = "26px sans-serif";
    ctx.fillText(stars(book.rating), 650, y + 20);
  });

  if (sortedBooks.length > maxLines) {
    ctx.fillStyle = "#475569";
    ctx.font = "22px sans-serif";
    ctx.fillText(`…另有 ${sortedBooks.length - maxLines} 本已省略`, 70, canvas.height - 120);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px sans-serif";
  const date = new Date().toLocaleDateString("zh-CN");
  ctx.fillText(`生成于 ${date}`, 60, canvas.height - 40);

  downloadLink.href = canvas.toDataURL("image/png");
  downloadLink.classList.remove("disabled");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const rating = Number(ratingInput.value);

  if (!title || !author || !rating) return;

  state.year = Number(yearInput.value) || new Date().getFullYear();
  state.books.push({
    id: crypto.randomUUID(),
    title,
    author,
    rating,
    createdAt: Date.now(),
  });

  saveState();
  renderList();
  form.reset();
  yearInput.value = state.year;
  sortModeInput.value = state.sortMode;
  titleInput.focus();
});

yearInput.addEventListener("change", () => {
  state.year = Number(yearInput.value) || new Date().getFullYear();
  saveState();
});

sortModeInput.addEventListener("change", () => {
  state.sortMode = sortModeInput.value;
  saveState();
  renderList();
});

generateBtn.addEventListener("click", () => {
  if (!state.books.length) {
    alert("请先添加至少一本书。");
    return;
  }

  drawPoster();
});

exportJsonBtn.addEventListener("click", () => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `book-record-${state.year}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
  state.books = [];
  saveState();
  renderList();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  downloadLink.removeAttribute("href");
  downloadLink.classList.add("disabled");
});

loadState();
yearInput.value = state.year;
sortModeInput.value = state.sortMode;
renderList();
