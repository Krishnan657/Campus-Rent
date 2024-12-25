let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productList = document.getElementById('product-list');
const cartCount = document.getElementById('cart-count');
const searchInput = document.getElementById('search-input');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const addProductBtn = document.getElementById('add-product-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const addProductModal = document.getElementById('add-product-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addProductForm = document.getElementById('add-product-form');
const clearCartBtn = document.getElementById('clear-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMessage = document.getElementById('empty-cart-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCart();
});

searchInput.addEventListener('input', debounce(filterProducts, 300));
loginBtn.addEventListener('click', () => toggleModal(loginModal, true));
registerBtn.addEventListener('click', () => toggleModal(registerModal, true));
logoutBtn.addEventListener('click', handleLogout);
addProductBtn.addEventListener('click', () => toggleModal(addProductModal, true));
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
addProductForm.addEventListener('submit', handleAddProduct);
clearCartBtn.addEventListener('click', clearCart);

// Functions
function fetchProducts() {
    fetch('/api/products')
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch products'))
        .then(data => {
            products = data;
            renderProducts(products);
        })
        .catch(error => console.error('Error fetching products:', error));
}

function renderProducts(productsToRender) {
    productList.innerHTML = productsToRender.length 
        ? productsToRender.map(product => {
            const isInCart = cart.some(item => item.id === product._id);
            return `
            <div class="product-card border rounded-lg p-4 shadow-md bg-white">
                <img src="${product.image}" alt="${product.name}" class="product-image w-full h-48 object-cover mb-4">
                <div class="product-info">
                    <h3 class="product-title text-xl font-semibold">${product.name}</h3>
                    <p class="product-description text-gray-600">${product.description}</p>
                    <p class="product-price text-lg font-bold text-blue-600">$${product.price.toFixed(2)}</p>
                </div>
                <div class="product-action mt-4 flex space-x-2">
                    <button class="btn btn-primary flex-1" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">
                        Add to Cart
                    </button>
                    <button class="btn btn-outline flex-1 ${isInCart ? '' : 'hidden'}" onclick="clearProduct('${product._id}')">
                        Remove
                    </button>
                </div>
            </div>`;
        }).join('')
        : `<p class="text-gray-500">No products found.</p>`;
}

function renderCart() {
    cartItemsContainer.innerHTML = cart.length 
        ? cart.map(item => `
            <div class="flex justify-between items-center border-b pb-2">
                <span class="text-gray-800">${item.name}</span>
                <div class="flex items-center space-x-2">
                    <span class="text-blue-600 font-bold">$${item.price.toFixed(2)}</span>
                    <button class="btn btn-outline" onclick="clearProduct('${item.id}')">Remove</button>
                </div>
            </div>`).join('')
        : '';
    emptyCartMessage.classList.toggle('hidden', cart.length > 0);
}

function addToCart(id, name, price) {
    if (cart.some(item => item.id === id)) {
        alert("This product is already in your cart!");
        return;
    }
    cart.push({ id, name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} has been added to your cart!`);
    updateCart();
}

function clearProduct(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product has been removed from your cart!');
    updateCart();
}

function clearCart() {
    if (!cart.length) return;
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('All products have been removed from your cart!');
    updateCart();
}

function updateCart() {
    cartCount.textContent = cart.length;
    renderCart();
    clearCartBtn.classList.toggle('hidden', !cart.length);
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    renderProducts(products.filter(product => product.name.toLowerCase().includes(searchTerm)));
}

function toggleModal(modal, show) {
    modal.classList.toggle('hidden', !show);
    modal.setAttribute('aria-hidden', String(!show));
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function handleLogin(event) {
    event.preventDefault();
    const email = loginForm['login-email'].value.trim();
    const password = loginForm['login-password'].value.trim();

    if (!email || !password) return alert('Please fill in all fields.');

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Error logging in.');
        if (data.message === 'Logged in successfully') {
            toggleModal(loginModal, false);
            updateUIAfterLogin();
        }
    })
    .catch(error => console.error('Error during login:', error));
}
