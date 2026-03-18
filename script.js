// script.js

// Improved JavaScript code for an e-commerce application

// Error handling
function handleError(error) {
    console.error('An error occurred:', error);
}

// Cart management with localStorage
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    addItem(item) {
        this.items.push(item);
        this.updateLocalStorage();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updateLocalStorage();
    }

    updateLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }
}

// Event delegation
document.addEventListener('click', function (event) {
    if (event.target.matches('.add-to-cart')) {
        const item = { id: event.target.dataset.id, name: event.target.dataset.name };
        cart.addItem(item);
    }
});

// Debouncing for search
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(function(event) {
    const searchTerm = event.target.value;
    searchItems(searchTerm);
}, 300));

// Function to search items (implementation can vary)
function searchItems(term) {
    console.log('Searching for:', term);
    // Fetch and display items logic goes here...
}

// Example of using environment variables or configuration
const API_URL = process.env.API_URL || 'https://api.example.com';
console.log('API URL:', API_URL);

// Create an instance of Cart
const cart = new Cart();