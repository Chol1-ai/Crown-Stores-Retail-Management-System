/* Director dashboard - overview stats, sales/inventory/procurement reports, PDF export */

let currentSales = [];
let currentProducts = [];
let currentProcurements = [];

document.addEventListener('DOMContentLoaded', () => {
    loadOverviewStats();
    loadInventoryReport();
    loadProcurementReport();

    const generateBtn = document.getElementById('generateSalesReport');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const date = document.getElementById('salesDate').value;
            if (!date) {
                alert('Please select a date');
                return;
            }
            loadSalesReport(date);
        });
    }

    const salesDateInput = document.getElementById('salesDate');
    if (salesDateInput && !salesDateInput.value) {
        salesDateInput.value = new Date().toISOString().split('T')[0];
    }
});

function loadOverviewStats() {
    const today = new Date().toISOString().split('T')[0];
    
    Promise.all([
        fetch('/api/sales/report?start_date=' + today + '&end_date=' + today, { headers: getAuthHeaders() }),
        fetch('/api/products', { headers: getAuthHeaders() }),
        fetch('/api/procurements', { headers: getAuthHeaders() })
    ]).then(([salesRes, productsRes, procurementsRes]) => {
        return Promise.all([salesRes.json(), productsRes.json(), procurementsRes.json()]);
    }).then(([sales, products, procurements]) => {
        currentSales = sales;
        const totalSales = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
        const inventoryValue = products.reduce((sum, p) => sum + (p.cost_price || 0) * (p.quantity_available || 0), 0);
        const totalProcurement = procurements.reduce((sum, p) => sum + (p.cost_price || 0) * (p.quantity_received || 0), 0);

        const totalSalesEl = document.getElementById('totalSales');
        const inventoryValueEl = document.getElementById('inventoryValue');
        const totalProcurementEl = document.getElementById('totalProcurement');

        if (totalSalesEl) totalSalesEl.textContent = formatCurrency(totalSales);
        if (inventoryValueEl) inventoryValueEl.textContent = formatCurrency(inventoryValue);
        if (totalProcurementEl) totalProcurementEl.textContent = formatCurrency(totalProcurement);
    }).catch(() => {
        const totalSalesEl = document.getElementById('totalSales');
        const inventoryValueEl = document.getElementById('inventoryValue');
        const totalProcurementEl = document.getElementById('totalProcurement');
        if (totalSalesEl) totalSalesEl.textContent = 'Error';
        if (inventoryValueEl) inventoryValueEl.textContent = 'Error';
        if (totalProcurementEl) totalProcurementEl.textContent = 'Error';
    });
}

function loadSalesReport(date) {
    const tbody = document.querySelector('#salesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    fetch('/api/sales/report?start_date=' + date + '&end_date=' + date, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            currentSales = data;
            tbody.innerHTML = data.map(sale => `
                <tr>
                    <td>${new Date(sale.date).toLocaleDateString()}</td>
                    <td>${sale.product_id?.name || ''}</td>
                    <td>${sale.quantity}</td>
                    <td>${formatCurrency(sale.total_amount)}</td>
                </tr>
            `).join('') || '<tr><td colspan="4">No sales found for this date</td></tr>';
        })
        .catch(() => {
            tbody.innerHTML = '<tr><td colspan="4">Error loading sales report</td></tr>';
        });
}

function loadInventoryReport() {
    const tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    fetch('/api/products', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            currentProducts = data;
            tbody.innerHTML = data.map(prod => `
                <tr>
                    <td>${prod.name}</td>
                    <td>${prod.category_id?.name || ''}</td>
                    <td>${prod.quantity_available}</td>
                    <td>${prod.status}</td>
                </tr>
            `).join('') || '<tr><td colspan="4">No products found</td></tr>';
        })
        .catch(() => {
            tbody.innerHTML = '<tr><td colspan="4">Error loading inventory</td></tr>';
        });
}

function loadProcurementReport() {
    const tbody = document.querySelector('#procurementTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    fetch('/api/procurements', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            currentProcurements = data;
            tbody.innerHTML = data.map(proc => `
                <tr>
                    <td>${new Date(proc.date_received).toLocaleDateString()}</td>
                    <td>${proc.product_id?.name || ''}</td>
                    <td>${proc.supplier_name}</td>
                    <td>${proc.quantity_received}</td>
                </tr>
            `).join('') || '<tr><td colspan="4">No procurement records found</td></tr>';
        })
        .catch(() => {
            tbody.innerHTML = '<tr><td colspan="4">Error loading procurement</td></tr>';
        });
}

function buildPrintWindow(title, headers, rows) {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #222; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 13px; font-weight: normal; color: #555; margin-top: 0; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #777; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 12px; }
        th { background: #1a2a6c; color: #fff; }
        tr:nth-child(even) { background: #f9f9f9; }
        .amount { text-align: right; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <h2>Crown Stores CSRMS</h2>
    <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    <table>
        <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${rows.map(row => `<tr>${row.map((cell, i) => (i === headers.length - 1 && typeof cell === 'number') ? `<td class="amount">${cell.toLocaleString()}</td>` : `<td>${cell || ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
}

function exportSalesPDF() {
    if (!currentSales.length) { alert('No sales data to export'); return; }
    const rows = currentSales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        sale.product_id?.name || '',
        sale.quantity,
        sale.total_amount
    ]);
    buildPrintWindow('Sales Report', ['Date', 'Product', 'Quantity', 'Amount'], rows);
}

function exportInventoryPDF() {
    if (!currentProducts.length) { alert('No inventory data to export'); return; }
    const rows = currentProducts.map(prod => [
        prod.name,
        prod.category_id?.name || '',
        prod.quantity_available,
        prod.status
    ]);
    buildPrintWindow('Inventory Report', ['Product', 'Category', 'Stock', 'Status'], rows);
}

function exportProcurementPDF() {
    if (!currentProcurements.length) { alert('No procurement data to export'); return; }
    const rows = currentProcurements.map(proc => [
        new Date(proc.date_received).toLocaleDateString(),
        proc.product_id?.name || '',
        proc.supplier_name,
        proc.quantity_received
    ]);
    buildPrintWindow('Procurement Report', ['Date', 'Product', 'Supplier', 'Quantity'], rows);
}