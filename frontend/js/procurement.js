/* Procurement module - record and delete procurement entries */

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadProcurements();
});

function loadProducts() {
    fetch('/api/products', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('procurementProduct');
            select.innerHTML = '<option value="">Select Product</option>' + 
                data.map(prod => `<option value="${prod._id}">${prod.name}</option>`).join('');
        });
}

function loadProcurements() {
    fetch('/api/procurements', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#procurementTable tbody');
            tbody.innerHTML = data.map(proc => `
                <tr>
                    <td>${new Date(proc.date_received).toLocaleDateString()}</td>
                    <td>${proc.product_id?.name || ''}</td>
                    <td>${proc.supplier_name}</td>
                    <td>${proc.quantity_received}</td>
                    <td>${formatCurrency(proc.cost_price)}</td>
                    <td class="table-actions">
                        <button class="btn btn-delete" onclick="deleteProcurement('${proc._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

document.getElementById('addProcurementBtn').addEventListener('click', () => {
    loadProducts();
    document.getElementById('procurementModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('procurementModal').style.display = 'none';
});

document.getElementById('procurementForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        product_id: document.getElementById('procurementProduct').value,
        supplier_name: document.getElementById('supplierName').value,
        quantity_received: document.getElementById('quantityReceived').value,
        cost_price: document.getElementById('procurementCostPrice').value
    };
    
    fetch('/api/procurements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        loadProcurements();
        document.getElementById('procurementModal').style.display = 'none';
    });
});

function deleteProcurement(id) {
    if (!confirm('Delete this procurement record?')) return;
    fetch(`/api/procurements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Procurement deleted');
        loadProcurements();
    })
    .catch(err => alert('Error deleting procurement'));
}