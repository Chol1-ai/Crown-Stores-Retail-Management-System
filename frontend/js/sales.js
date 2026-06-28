/* Sales module - list all sales and delete records */

document.addEventListener('DOMContentLoaded', () => {
    loadSales();
});

function loadSales() {
    fetch('/api/sales', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#salesTable tbody');
            tbody.innerHTML = data.map(sale => `
                <tr>
                    <td>${new Date(sale.date).toLocaleString()}</td>
                    <td>${sale.product_id?.name || ''}</td>
                    <td>${sale.quantity}</td>
                    <td>${formatCurrency(sale.total_amount)}</td>
                    <td>${sale.sales_agent_id?.full_name || ''}</td>
                    <td class="table-actions">
                        <button class="btn btn-delete" onclick="deleteSale('${sale._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

function deleteSale(id) {
    if (!confirm('Delete this sale record?')) return;
    fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Sale deleted');
        loadSales();
    })
    .catch(err => alert('Error deleting sale'));
}