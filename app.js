const API_URL = "https://api.escuelajs.co/api/v1/products";

let products = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortAsc = true;

// Fetch data
async function fetchProducts() {
  const res = await fetch(API_URL);
  products = await res.json();
  render();
}

function render() {
  let filtered = filterAndSort();
  renderTable(paginate(filtered));
  renderPagination(filtered.length);
}

function filterAndSort() {
  let data = [...products];

  const keyword = document.getElementById("searchInput").value.toLowerCase();
  if (keyword) {
    data = data.filter(p => p.title.toLowerCase().includes(keyword));
  }

  if (sortField) {
    data.sort((a, b) => {
      if (a[sortField] > b[sortField]) return sortAsc ? 1 : -1;
      if (a[sortField] < b[sortField]) return sortAsc ? -1 : 1;
      return 0;
    });
  }

  return data;
}

function paginate(data) {
  const start = (currentPage - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach(p => {
    const tr = document.createElement("tr");
    tr.title = p.description; // hover description

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" width="60"></td>
    `;

    tr.onclick = () => openDetailModal(p);
    tbody.appendChild(tr);
  });
}

function renderPagination(total) {
  const pages = Math.ceil(total / pageSize);
  const ul = document.getElementById("pagination");
  ul.innerHTML = "";

  for (let i = 1; i <= pages; i++) {
    ul.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="goPage(${i})">${i}</button>
      </li>
    `;
  }
}

function goPage(p) {
  currentPage = p;
  render();
}

// Sorting
function sortBy(field) {
  sortAsc = sortField === field ? !sortAsc : true;
  sortField = field;
  render();
}

// Export CSV
function exportCSV() {
  const rows = paginate(filterAndSort());
  let csv = "id,title,price\n";
  rows.forEach(r => {
    csv += `${r.id},"${r.title}",${r.price}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "products.csv";
  a.click();
}

// Detail Modal
function openDetailModal(p) {
  document.getElementById("detailId").value = p.id;
  document.getElementById("detailTitle").value = p.title;
  document.getElementById("detailPrice").value = p.price;
  document.getElementById("detailDescription").value = p.description;
  new bootstrap.Modal("#detailModal").show();
}

// Update
async function updateProduct() {
  const id = document.getElementById("detailId").value;
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: detailTitle.value,
      price: detailPrice.value,
      description: detailDescription.value
    })
  });
  fetchProducts();
  bootstrap.Modal.getInstance(detailModal).hide();
}

// Create
function openCreateModal() {
  new bootstrap.Modal("#createModal").show();
}

async function createProduct() {
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: createTitle.value,
      price: createPrice.value,
      description: createDescription.value,
      images: [createImage.value],
      categoryId: Number(createCategory.value)
    })
  });
  fetchProducts();
  bootstrap.Modal.getInstance(createModal).hide();
}

// Events
searchInput.oninput = () => { currentPage = 1; render(); };
pageSize.onchange = e => { pageSize = +e.target.value; currentPage = 1; render(); };

fetchProducts();
