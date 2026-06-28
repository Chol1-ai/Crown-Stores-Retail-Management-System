/* Product module - add/edit/delete products, adjust stock, update price */

let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    
    document.getElementById('stockAdjustForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('stockAdjustId').value;
        const newQty = parseInt(document.getElementById('stockNewQuantity').value);
        const reason = document.getElementById('stockReason').value;
        
        fetch(`/api/products/${id}/adjust-stock`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: newQty, reason })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            document.getElementById('stockAdjustModal').style.display = 'none';
            loadProducts();
        })
        .catch(err => alert('Error adjusting stock'));
    });
});

document.getElementById('addProductBtn').addEventListener('click', () => {
    loadCategories();
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        category_id: document.getElementById('productCategory').value,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDesc').value,
        cost_price: parseFloat(document.getElementById('costPrice').value),
        selling_price: parseFloat(document.getElementById('sellingPrice').value),
        reorder_level: parseInt(document.getElementById('reorderLevel').value),
        barcode: document.getElementById('barcode').value
    };
    
    fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        loadProducts();
        document.getElementById('productModal').style.display = 'none';
    });
});

function loadCategories() {
    fetch('/api/categories', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('productCategory');
            select.innerHTML = '<option value="">Select Category</option>' + 
                data.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('');
        });
}

function loadProducts() {
    fetch('/api/products', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            productsData = data;
            const tbody = document.querySelector('#productsTable tbody');
            tbody.innerHTML = data.map(prod => `
                <tr>
                    <td>${prod.name}</td>
                    <td>${prod.category_id?.name || ''}</td>
                    <td>${formatCurrency(prod.cost_price)}</td>
                    <td>${formatCurrency(prod.selling_price)}</td>
                    <td>${prod.quantity_available}</td>
                    <td>${prod.status}</td>
                    <td class="table-actions">
                        <button class="btn btn-edit" onclick="editProduct('${prod._id}')">Edit</button>
                        <button class="btn btn-primary" onclick="updatePrice('${prod._id}')">Price</button>
                        <button class="btn btn-stock" onclick="adjustStock('${prod._id}')">Stock</button>
                        <button class="btn btn-delete" onclick="deleteProduct('${prod._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

function editProduct(id) {
    const prod = productsData.find(p => p._id === id);
    if (!prod) return;
    
    loadCategories();
    document.getElementById('productId').value = prod._id;
    document.getElementById('productCategory').value = prod.category_id?._id || prod.category_id;
    document.getElementById('productName').value = prod.name;
    document.getElementById('productDesc').value = prod.description;
    document.getElementById('costPrice').value = prod.cost_price;
    document.getElementById('sellingPrice').value = prod.selling_price;
    document.getElementById('reorderLevel').value = prod.reorder_level;
    document.getElementById('barcode').value = prod.barcode;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productModal').style.display = 'block';
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Deleted');
        loadProducts();
    })
    .catch(err => alert('Error deleting product'));
}

function adjustStock(id) {
    const prod = productsData.find(p => p._id === id);
    if (!prod) return;
    
    document.getElementById('stockProductName').textContent = prod.name;
    document.getElementById('stockCurrent').textContent = prod.quantity_available;
    document.getElementById('stockNewQuantity').value = prod.quantity_available;
    document.getElementById('stockAdjustId').value = id;
    document.getElementById('stockAdjustModal').style.display = 'block';
}

function updatePrice(id) {
    alert('Update price functionality');
}
