const books = [];

const form = document.getElementById("book-form");
const yearInput = document.getElementById("year");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const ratingInput = document.getElementById("rating");
const list = document.getElementById("book-list");
const count = document.getElementById("count");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const canvas = document.getElementById("poster");
const downloadLink = document.getElementById("download-link");
const ctx = canvas.getContext("2d");

yearInput.value = new Date().getFullYear();

const stars = (score) => "★".repeat(score) + "☆".repeat(5 - score);

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

  if (line) {
    lines.push(line);
  }

  lines = lines.slice(0, maxLines);
  lines.forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });
}

function renderList() {
  list.innerHTML = "";

  books.forEach((book, index) => {
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
      books.splice(index, 1);
      renderList();
    });

    left.append(title, meta);
    li.append(left, rating, removeBtn);
    list.appendChild(li);
  });

  count.textContent = `${books.length} 本`;
}

function drawPoster() {
  const year = yearInput.value || new Date().getFullYear();

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#eef2ff");
  gradient.addColorStop(1, "#fdf2f8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 54px sans-serif";
  ctx.fillText(`📚 ${year} 年度书籍记录`, 60, 96);

  ctx.fillStyle = "#64748b";
  ctx.font = "28px sans-serif";
  ctx.fillText(`总计 ${books.length} 本`, 60, 146);

  ctx.fillStyle = "#ffffffcc";
  ctx.fillRect(40, 180, canvas.width - 80, canvas.height - 260);

  const maxLines = 13;
  const displayBooks = books.slice(0, maxLines);

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

  if (books.length > maxLines) {
    ctx.fillStyle = "#475569";
    ctx.font = "22px sans-serif";
    ctx.fillText(`…另有 ${books.length - maxLines} 本已省略`, 70, canvas.height - 120);
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

  if (!title || !author || !rating) {
    return;
  }

  books.push({ title, author, rating });
  renderList();
  form.reset();
  yearInput.value = new Date().getFullYear();
  titleInput.focus();
});

generateBtn.addEventListener("click", () => {
  if (!books.length) {
    alert("请先添加至少一本书。");
    return;
  }

  drawPoster();
});

clearBtn.addEventListener("click", () => {
  books.length = 0;
  renderList();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  downloadLink.removeAttribute("href");
  downloadLink.classList.add("disabled");
});

renderList();
