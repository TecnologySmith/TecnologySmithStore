// Improved e-commerce functionality for TecnologySmithStore

class Product {
    constructor(name, price, category) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.inStock = true;
    }
}

class Cart {
    constructor() {
        this.items = [];
    }

    addItem(product) {
        if (product.inStock) {
            this.items.push(product);
            console.log(`Added ${product.name} to cart.`);
        } else {
            console.error(`Error: ${product.name} is out of stock.`);
        }
    }

    viewCart() {
        return this.items;
    }

    clearCart() {
        this.items = [];
        console.log(`Cart has been cleared.`);
    }
}

function filterProducts(products, category) {
    return products.filter(product => product.category === category);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupWhatsAppIntegration(phoneNumber) {
    const link = `https://wa.me/${phoneNumber}`;
    console.log(`Chat with us on WhatsApp: ${link}`);
}

// Sample usage:
const cart = new Cart();
const products = [
    new Product('Laptop', 1200, 'Electronics'),
    new Product('Headphones', 150, 'Electronics'),
    new Product('Shoes', 100, 'Fashion')
];

const filteredProducts = filterProducts(products, 'Electronics');
console.log(filteredProducts);

cart.addItem(products[0]); // Adding Laptop to cart
cart.addItem(products[1]); // Adding Headphones to cart

const debouncedSearch = debounce((searchTerm) => {
    console.log(`Searching for: ${searchTerm}`);
}, 300);

setupWhatsAppIntegration('1234567890'); // Replace with actual phone number