
const categoryContainer = document.querySelector('.category-container')
const toggleMenu = document.querySelector('.toggle-menu')

function toggleCategorySidebar() {
    categoryContainer.classList.toggle('show')
}

document.addEventListener('click', (e) => {
    if (!categoryContainer.contains(e.target) && !toggleMenu.contains(e.target)) {
        categoryContainer.classList.remove('show')
    }
})

function initBilling() {
    getAllCategory()
    getProducts('all')
}

window.onload = () => {
    initBilling()
}

async function getAllCategory() {
    let req = await fetch('https://dummyjson.com/products/categories')
    let response = await req.json()

    let categoryBtn = `<button type="button" class='active' onclick="getProductByCategory('all',event)" >All Categories</button>`

    response.forEach(category => {
        categoryBtn += `<button type="button"  onclick="getProductByCategory('${category.slug}',event)" >${category.name}</button>`
    });

    document.querySelector('.categories').innerHTML = categoryBtn
}

async function getProducts(category) {

    let req, response, products

    if (category === 'all') {
        req = await fetch('https://dummyjson.com/products?limit=0')
    } else {
        req = await fetch(`https://dummyjson.com/products/category/${category}?limit=0`)
    }

    response = await req.json()

    products = response.products
    createProductBox(products)
}

function createProductBox(products) {
    let productsWrapper = document.querySelector('.products-wrapper')
    let productBoxHtmlStr = ''
    products.forEach(singleProduct => {
        productBoxHtmlStr += `<div class="product" data-product="${singleProduct.id}" onclick="selectProduct(${singleProduct.id}, this)">
                    <div class="product-img">
                        <img src="${singleProduct.thumbnail}"
                            alt="">
                    </div>
                    <div class="product-details">
                        <p class="product-name">
                            ${singleProduct.title}
                        </p>
                        <span>Price: ₹${singleProduct.price}</span>
                    </div>
                </div>`
    });

    productsWrapper.innerHTML = productBoxHtmlStr
}
function getProductByCategory(categorySlug, event) {
    getProducts(categorySlug)

    let activeCategoryBtn = document.querySelector(".categories button.active")
    activeCategoryBtn.classList.remove('active')

    event.target.classList.add('active')
}



async function searchProduct(searchQuery) {
    let req = await fetch(`https://dummyjson.com/products/search?q=${searchQuery}`)
    let response = await req.json();

    let products = response.products

    createProductBox(products)
}


async function selectProduct(productId, productBox) {
    let req = await fetch(`https://dummyjson.com/products/${productId}`);
    let response = await req.json();

    const { id, title, price } = response;

    let selectedProducts = localStorage.getItem('selectedProducts');
    if (selectedProducts) {
        selectedProducts = JSON.parse(selectedProducts);
    } else {
        selectedProducts = [];
    }

    let productIndex = selectedProducts.findIndex(product => product.id === id);

    if (productIndex !== -1) {
        // Product already selected, so remove it
        selectedProducts.splice(productIndex, 1);
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

        // Remove active class from product box
        productBox.classList.remove('active');

        // Remove corresponding row from selected items table
        let selectedItems = document.getElementById('selected-items');
        let rows = selectedItems.getElementsByTagName('tr');
        for (let row of rows) {
            if (row.querySelector('.trash-btn')?.getAttribute('onclick')?.includes(productId)) {
                row.remove();
                break;
            }
        }
    } else {
        // Product not selected, so add it
        selectedProducts.push({
            id, title, price, qty: 1
        });
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

        productBox.classList.add('active');

        // Creating billing section
        let selectedItems = document.getElementById('selected-items');

        let tr = document.createElement('tr');

        tr.innerHTML = `
                    <td>
                        <p class="product-name">${title}</p>
                        <span>Price: ₹${price}</span>
                    </td>
                    <td>
                        <div class="qty-box">
                            <button type="button" onclick="updateQty('desc', ${id},this)"><i class="ri-subtract-line"></i></button>
                            <input type="text" value="1" readonly>
                            <button type="button" onclick="updateQty('inc', ${id},this)"><i class="ri-add-line"></i></button>
                        </div>
                    </td>
                    <td>₹${price}</td>
                    <td>
                        <button type="button" class="trash-btn" onclick="removeSelectedItem(${id},this)" >
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </td>
                  `;

        selectedItems.append(tr);
    }

    calculateAmount();
}

function removeSelectedItem(productId, deleteBtn) {

    let selectedProducts = localStorage.getItem('selectedProducts')
    selectedProducts = JSON.parse(selectedProducts)
    
    let removeProduct = selectedProducts.find(product => product.id === productId)
    let newProductList = selectedProducts.filter(product => product.id != productId)

    localStorage.setItem('selectedProducts', JSON.stringify(newProductList))

    deleteBtn.closest('tr').remove()
    let totalAmount =   document.getElementById('total-product').innerHTML
    totalAmount -= removeProduct.price * removeProduct.qty 

    let productBox = document.querySelector(`.product[data-product='${productId}']`)
    productBox.classList.remove('active')

    calculateAmount()
}
function calculateAmount() {
    
    let selectedProducts = localStorage.getItem('selectedProducts')
    selectedProducts = JSON.parse(selectedProducts)

    let totalProduct = selectedProducts.length;
    let totalAmount = 0
    
    selectedProducts.forEach(product => {
        totalAmount += product.price * product.qty
    });

    document.getElementById('total-product').innerHTML = totalProduct
    document.getElementById('total-amount').innerHTML = `₹${totalAmount.toFixed(2)}`
}

function updateQty(inc_or_desc, productId, qtyBtn) {
    let selectedProducts = localStorage.getItem('selectedProducts')
    selectedProducts = JSON.parse(selectedProducts)

    let getProduct = selectedProducts.find(product => product.id === productId)


    if (inc_or_desc === 'inc') {
        getProduct.qty++
    } else {
        if (getProduct.qty > 1) {
            getProduct.qty--
        }
    }

    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts))


    let qtyTd = qtyBtn.closest('td')

    let qtyInput = qtyTd.querySelector('input')
    qtyInput.value = getProduct.qty
    let priceTd = qtyTd.nextElementSibling
    priceTd.innerHTML = `₹${(getProduct.qty * getProduct.price).toFixed(2)}`

    calculateAmount()
}


function saveBilling() {
    let phoneNumber = document.querySelector("input[name='phoneNumber']")
    let selectedProducts = localStorage.getItem('selectedProducts')
    if (!phoneNumber.value) {
        alert('Please enter customer phone number')
        return
    }

    if (selectedProducts === null) {
        alert('Please choose at least 1 product for billing')
        return
    }

    localStorage.setItem('phoneNumber', phoneNumber.value)

    window.open('receipt.html', "Receipt", "width=500;height=500")

}

 let billingContainer = document.querySelector('billing-container')
 bill