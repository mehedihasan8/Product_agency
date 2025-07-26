const drawer = document.getElementById("mobileDrawer");
const backdrop = document.getElementById("drawerBackdrop");
const openBtn = document.getElementById("drawerToggleBtn");
const closeBtn = document.getElementById("drawerCloseBtn");

openBtn.addEventListener("click", () => {
  drawer.classList.add("open");
  backdrop.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  drawer.classList.remove("open");
  backdrop.classList.remove("show");
});

backdrop.addEventListener("click", () => {
  drawer.classList.remove("open");
  backdrop.classList.remove("show");
});


let allProducts = [];
let visibleCount = 6;

const showProduct = document.getElementById("show_product");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const total_product = document.getElementById("total_product");

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    allProducts = data;
    total_product.innerText = "Total Product: " + allProducts.length;
    renderProducts(allProducts.slice(0, visibleCount));
    updateLoadMoreBtn();
  });

function renderProducts(products) {
  showProduct.innerHTML = "";
  
  if (products.length === 0) {
    showProduct.innerHTML = "<p class='text-center fw-bold fs-2'>No products found.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "col-lg-4 cls-md-6 col-sm-6 mb-4";

    card.innerHTML = `
      <div class="card shadow-sm">
      <div class="card-image product_image">
        <div class="badge badge-success position-absolute rounded" style="top: 15px; right: 10px;">
        <mark style="border-radius: 5px; padding: 1px 8px 3px 8px;">${product?.category}</mark>
        </div>
        <img src="${product.image}" class="card-img-top h-100 w-100" alt="${product.name}" />
      </div>
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
          <div class="d-flex justify-content-between align-items-center">

          <p><strong>Price:</strong> <del>$${product.price}</del> 
             <span class="fw-bold">$${product.discountPrice}</span></p>
          <p><strong>Stock:</strong> ${product.stock}-pcs</p>
          </div>
        </div>
      </div>
    `;
    showProduct.appendChild(card);
  });
}

loadMoreBtn.addEventListener("click", () => {
  visibleCount += 6;
  const filtered = filterProducts(searchInput.value);
  renderProducts(filtered.slice(0, visibleCount));
  updateLoadMoreBtn();
});

searchInput.addEventListener("input", () => {
  visibleCount = 6;
  const filtered = filterProducts(searchInput.value);
  renderProducts(filtered.slice(0, visibleCount));
  updateLoadMoreBtn();
});

function filterProducts(keyword) {
  return allProducts.filter((item) =>
    item.name.toLowerCase().includes(keyword.toLowerCase())
  );
}

function updateLoadMoreBtn() {
  const filtered = filterProducts(searchInput.value);
  if (visibleCount >= filtered.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "inline-block";
  }
}
