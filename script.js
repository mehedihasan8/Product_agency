const drawer = document.getElementById("mobileDrawer");
const backdrop = document.getElementById("drawerBackdrop");
const openBtn = document.getElementById("drawerToggleBtn");
const closeBtn = document.getElementById("drawerCloseBtn");

let cart = [];
let cartCount = 0;

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
const cartBtn = document.querySelector(".btn-primary.px-4");
const cartBadge = document.getElementById("cart_badge");

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    allProducts = data;
    total_product.innerText = "Total Product: " + allProducts.length;
    renderProducts(allProducts.slice(0, visibleCount));
    updateLoadMoreBtn();
  });

if (cartBtn) {
  cartBtn.addEventListener("click", showCartModal);
}

function renderProducts(products) {
  showProduct.innerHTML = "";

  if (products.length === 0) {
    showProduct.innerHTML =
      "<p class='text-center fw-bold fs-2'>No products found.</p>";
    return;
  }

  products.forEach((product, index) => {
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
          </div>
        </div>
        <button class="btn btn-primary add-to-cart-btn" data-product-id="${index}">Add to Cart</button>
      </div>
    `;
    showProduct.appendChild(card);
  });

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", handleAddToCart);
  });
}

function handleAddToCart(event) {
  const productId = event.target.getAttribute("data-product-id");
  const product = allProducts[productId];

  if (product) {
    addToCart(product);
    showToast(`${product.name} added to cart!`);
  } else {
    showToast("Product out of stock!", "error");
  }
}

function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  cartCount += 1;
  updateCartUI();
}

function updateCartUI() {
  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? "inline-block" : "none";
  }
}

function showCartModal() {
  let modal = document.getElementById("cartModal");

  if (!modal) {
    createCartModal();
    modal = document.getElementById("cartModal");
  }

  // Update modal content
  updateCartModalContent();

  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

function createCartModal() {
  const modalHTML = `
    <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="cartModalLabel">
              <i class="bi bi-cart me-2"></i>Shopping Cart
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="cartModalBody">
            <!-- Cart items will be inserted here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Shopping</button>
            <button type="button" class="btn btn-primary" id="checkoutBtn">Checkout</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Add checkout event listener
  document
    .getElementById("checkoutBtn")
    .addEventListener("click", handleCheckout);
}

function updateCartModalContent() {
  const modalBody = document.getElementById("cartModalBody");

  if (cart.length === 0) {
    modalBody.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-cart-x display-1 text-muted"></i>
        <h4 class="mt-3">Your cart is empty</h4>
        <p class="text-muted">Add some products to your cart to see them here.</p>
      </div>
    `;
    return;
  }

  let totalAmount = 0;
  let cartHTML = '<div class="row">';

  cart.forEach((item, index) => {
    const itemTotal = item.discountPrice * item.quantity;
    totalAmount += itemTotal;

    cartHTML += `
      <div class="col-12 mb-3">
        <div class="card">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3">
                <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
              </div>
              <div class="col-6">
                <h6 class="card-title mb-1">${item.name}</h6>
                <p class="text-muted small mb-1">${item.category}</p>
                <p class="mb-0"><strong>$${item.discountPrice}</strong></p>
              </div>
              <div class="col-3 text-end">
                <div class="d-flex align-items-center justify-content-end mb-2">
                  <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateQuantity(${index}, -1)">-</button>
                  <span class="mx-2">${item.quantity}</span>
                  <button class="btn btn-sm btn-outline-secondary ms-2" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  cartHTML += `
    </div>
        <div class="border-top pt-3 mt-3">
          <div class="row">
            <div class="col-6">
              <h5>Total Items: ${cartCount}</h5>
            </div>
            <div class="col-6 text-end">
              <h5>Total Amount: $${totalAmount.toFixed(2)}</h5>
            </div>
          </div>
    </div>
  `;

  modalBody.innerHTML = cartHTML;
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
      cartCount -= cart[index].quantity - change;
      cart.splice(index, 1);
    } else {
      cartCount += change;
    }

    updateCartUI();
    updateCartModalContent();
  }
}

function removeFromCart(index) {
  if (cart[index]) {
    cartCount -= cart[index].quantity;
    cart.splice(index, 1);
    updateCartUI();
    updateCartModalContent();
  }
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }

  const checkoutBtn = document.getElementById("checkoutBtn")

  checkoutBtn.disabled = true;
  checkoutBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';

  showToast("Proceeding to checkout...", "success");

  setTimeout(() => {
    showToast(
      "🎉 Congratulations! Your order has been placed successfully!",
      "success",
    );

    cart = [];
    cartCount = 0;
    updateCartUI();

    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("cartModal"),
      );
      if (modal) {
        modal.hide();
      }

      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = "Checkout";
    }, 1000);
  }, 3000);
}

function showToast(message, type = "success") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className =
      "position-fixed top-0 start-50 translate-middle-x p-3";
    toastContainer.style.zIndex = "9999";
    document.body.appendChild(toastContainer);
  }

  const toastId = "toast-" + Date.now();
  const bgClass = type === "error" ? "bg-danger" : "bg-success";

  const toastHTML = `
    <div class="toast ${bgClass} text-white" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body w-100">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
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
    item.name.toLowerCase().includes(keyword.toLowerCase()),
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
