let products = localStorage.getItem('selectedProducts')
products = JSON.parse(products)
const phoneNumber = localStorage.getItem('phoneNumber')

function loadData() {
    let totalAmount = 0
    products.forEach(product => {
        let row = ''
        let tr = document.createElement('tr')

        totalAmount += product.qty * product.price

        row += `
          <td>${product.title}</td>
          <td>₹${product.price}</td>
          <td>${product.qty}</td>
          <td>₹${(product.qty * product.price).toFixed(2)}</td>
          `
        tr.innerHTML = row
        document.getElementById('product-table-body').append(tr)
    });

    document.getElementById('customer-mobile').innerHTML = phoneNumber
    document.getElementById('total-amount').innerHTML = `${totalAmount.toFixed(2)}`

    const date = new Date();
    document.getElementById('receipt-date').innerHTML = date.toLocaleDateString()
    document.getElementById('receipt-time').innerHTML = date.toLocaleTimeString()
}

window.onload = loadData()



function printReceipt() {
    let body = document.body.innerHTML
    let receipt = document.querySelector('.receipt-container')

    document.body.innerHTML = receipt.innerHTML

    window.print()

    document.body.innerHTML = body
}