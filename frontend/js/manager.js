/* Manager dashboard - branch overview stats (sales, inventory value, low stock) */

document.addEventListener('DOMContentLoaded', () => {
    loadOverview();
});

function loadOverview() {
    Promise.all([
        fetch('/api/sales?date=' + new Date().toISOString().split('T')[0], { headers: getAuthHeaders() }).then(r => r.json()),
        fetch('/api/products', { headers: getAuthHeaders() }).then(r => r.json())
    ]).then(([sales, products]) => {
        const dailySales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const inventoryValue = products.reduce((sum, prod) => sum + (prod.cost_price * prod.quantity_available), 0);
        const lowStock = products.filter(p => p.quantity_available <= p.reorder_level).length;
        
        document.getElementById('dailySales').textContent = formatCurrency(dailySales);
        document.getElementById('inventoryValue').textContent = formatCurrency(inventoryValue);
        document.getElementById('lowStock').textContent = lowStock;
    });
}