/* Sales dashboard (POS) - search products, cart, checkout, daily sales, receipts */

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDailySales();
    loadReceipts();

    const searchBtn = document.getElementById('searchProductBtn');
    const barcodeInput = document.getElementById('barcodeInput');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (searchBtn) searchBtn.addEventListener('click', searchProduct);
    if (barcodeInput) barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProduct();
    });
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
});

function searchProduct() {
    const query = (document.getElementById('barcodeInput')?.value || '').trim();
    if (!query) return;

    const btn = document.getElementById('searchProductBtn');
    const originalText = btn?.textContent || 'Search';
    if (btn) { btn.textContent = 'Searching...'; btn.disabled = true; }

    fetch('/api/products/search?q=' + encodeURIComponent(query), { headers: getAuthHeaders() })
        .then(res => {
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
            if (!res.ok) throw new Error('Search failed: ' + res.status);
            return res.json();
        })
        .then(data => {
            if (data.length > 0) {
                addToCart(data[0]);
                if (barcodeInput) barcodeInput.value = '';
            } else {
                alert('Product not found: ' + query);
            }
        })
        .catch(err => {
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
            alert('Search error: ' + err.message);
        });
}

function addToCart(product) {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartTable();
}

function updateCartTable() {
    const tbody = document.querySelector('#cartTable tbody');
    if (!tbody) return;
    tbody.innerHTML = cart.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.selling_price)}</td>
            <td>${formatCurrency(item.selling_price * item.quantity)}</td>
            <td>
                <button class="btn btn-delete" onclick="removeFromCart(${index})">Remove</button>
            </td>
        </tr>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartTable();
}

function checkout() {
    if (cart.length === 0) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const results = [];
    let hasError = false;

    cart.forEach(item => {
        const itemTotal = item.selling_price * item.quantity;
        fetch('/api/sales', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_id: item._id,
                quantity: item.quantity,
                amount_paid: itemTotal,
                sales_agent_id: user.id
            })
        })
        .then(res => {
            if (!res.ok) return res.json().then(err => { hasError = true; results.push(err.message || 'Sale failed'); });
            return res.json();
        })
        .then(data => {
            if (data && data.message) results.push(data.message);
        })
        .catch(err => {
            hasError = true;
            results.push('Network error');
        });
    });

    setTimeout(() => {
        cart = [];
        updateCartTable();
        loadDailySales();
        loadReceipts();
        if (hasError) alert('Some sales failed:\n' + results.join('\n'));
        else alert('Sale completed successfully!');
    }, 600);
}

function loadDailySales() {
    const tbody = document.querySelector('#salesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    const today = new Date().toISOString().split('T')[0];
    fetch('/api/sales/report?start_date=' + today + '&end_date=' + today, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = data.map(sale => `
                <tr>
                    <td>${new Date(sale.date).toLocaleTimeString()}</td>
                    <td>${sale.product_id?.name || ''}</td>
                    <td>${sale.quantity}</td>
                    <td>${formatCurrency(sale.total_amount)}</td>
                </tr>
            `).join('') || '<tr><td colspan="4">No sales today</td></tr>';
        })
        .catch(() => { tbody.innerHTML = '<tr><td colspan="4">Error loading sales</td></tr>'; });
}

function loadReceipts() {
    const tbody = document.querySelector('#receiptsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    fetch('/api/sales', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = data.slice(0, 10).map(sale => `
                <tr>
                    <td>${sale._id}</td>
                    <td>${new Date(sale.date).toLocaleDateString()}</td>
                    <td>${formatCurrency(sale.total_amount)}</td>
                    <td>
                        <button class="btn btn-primary" onclick="printReceipt('${sale._id}')">Print</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(() => { tbody.innerHTML = '<tr><td colspan="4">Error loading receipts</td></tr>'; });
}

function printReceipt(id) {
    alert('Receipt ' + id + ' printed');
}
