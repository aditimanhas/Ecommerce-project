window.addEventListener("scroll", function () {
    let navbar = document.querySelector(".navbar");

    if (navbar && window.scrollY > 50) {
        navbar.classList.add("active");
    } else if (navbar) {
        navbar.classList.remove("active");
    }
});


let allProducts = [];


fetch("product.json")
    .then(res => res.json())
    .then(data => {
        allProducts = data;

        let productGrid = document.getElementById("productGrid");
        let featuredGrid = document.getElementById("featuredProducts");

        if (productGrid) {
            let urlParams = new URLSearchParams(window.location.search);
            let categoryFromURL = urlParams.get("category");

            if (categoryFromURL) {
                let filteredProducts = allProducts.filter(product => product.category === categoryFromURL);
                displayProducts(filteredProducts, productGrid);
            } else {
                displayProducts(allProducts, productGrid);
            }

            setupFilters();
        }

        if (featuredGrid) {
            let featuredProducts = allProducts.slice(5, 10);
            displayProducts(featuredProducts, featuredGrid);
        }

        updateCartCount();
    })
    .catch(err => console.log("JSON Error:", err));


function displayProducts(products, grid) {
    grid.innerHTML = "";

    if (products.length === 0) {
        grid.innerHTML = `<p style="color:white;">No products found</p>`;
        return;
    }

    products.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${product.image}">
                <h3>${product.name}</h3>
                <span>₹${product.price}</span>
                <button onclick="addToCart(${product.id})">🛒 ADD TO CART</button>
            </div>
        `;
    });
}


function setupFilters() {
    let category = document.getElementById("categoryFilter");
    let price = document.getElementById("priceFilter");

    if (!category || !price) return;

    category.addEventListener("change", applyFilters);
    price.addEventListener("change", applyFilters);
}

function applyFilters() {
    let categoryValue = document.getElementById("categoryFilter").value;
    let priceValue = document.getElementById("priceFilter").value;

    let filtered = allProducts.filter(product => {
        let matchCategory = categoryValue === "all" || product.category === categoryValue;
        let matchPrice = priceValue === "all" || product.price <= Number(priceValue);

        return  matchCategory && matchPrice;
    });

    displayProducts(filtered, document.getElementById("productGrid"));
}


function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let product = allProducts.find(item => item.id === id);
    let existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showPopup(product.name);
}


function showCart() {
    let cartItems = document.getElementById("cartItems");
    let subtotalBox = document.getElementById("subtotal");
    let grandTotalBox = document.getElementById("grandTotal");

    if (!cartItems) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `<p style="color:white; padding:20px;">Your cart is empty 🛒</p>`;
        subtotalBox.innerText = "₹0";
        grandTotalBox.innerText = "₹0";
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        let total = item.price * item.quantity;
        subtotal += total;

        cartItems.innerHTML += `
            <div class="cart-item">

                <div class="cart-product">
                    <img src="${item.image}">
                    <div>
                        <h3>${item.name}</h3>
                        <p>Category: ${item.category}</p>
                    </div>
                </div>

                <h4>₹${item.price}</h4>

                <div class="qty">
                    <button onclick="decreaseQty(${item.id})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQty(${item.id})">+</button>
                </div>

                <h4>₹${total}</h4>

                <button class="delete" onclick="removeItem(${item.id})">🗑</button>
            </div>
        `;
    });

    let grandTotal = subtotal + 99 - 200;
    if (grandTotal < 0) grandTotal = 0;

    subtotalBox.innerText = `₹${subtotal}`;
    grandTotalBox.innerText = `₹${grandTotal}`;
}


function increaseQty(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(p => p.id === id);

    if (item) item.quantity++;

    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
}

function decreaseQty(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(p => p.id === id);

    if (item.quantity > 1) item.quantity--;
    else cart = cart.filter(p => p.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(p => p.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
}


function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = cart.reduce((sum, item) => sum + item.quantity, 0);

    let count = document.querySelector(".cart sup");
    if (count) count.innerText = total;
}


function showPopup(name) {
    let popup = document.createElement("div");

    popup.className = "cart-popup";
    popup.innerHTML = `
        <div class="cart-popup-box">
            <h3>🛒 Added to Cart</h3>
            <p>${name} added successfully!</p>
        </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1500);
}


updateCartCount();
showCart();