/* Category module - CRUD for categories */

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

function loadCategories() {
    fetch('/api/categories', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#categoriesTable tbody');
            tbody.innerHTML = data.map(cat => `
                <tr>
                    <td>${cat.name}</td>
                    <td>${cat.description || ''}</td>
                    <td>${cat.status}</td>
                    <td class="table-actions">
                        <button class="btn btn-edit" onclick="editCategory('${cat._id}')">Edit</button>
                        <button class="btn btn-delete" onclick="deleteCategory('${cat._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('categoryModal').style.display = 'none';
});

document.getElementById('categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDesc').value
    };
    
    fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        loadCategories();
        document.getElementById('categoryModal').style.display = 'none';
    });
});

function editCategory(id) {
    fetch(`/api/categories/${id}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(cat => {
            document.getElementById('categoryId').value = cat._id;
            document.getElementById('categoryName').value = cat.name;
            document.getElementById('categoryDesc').value = cat.description;
            document.getElementById('modalTitle').textContent = 'Edit Category';
            document.getElementById('categoryModal').style.display = 'block';
        });
}

function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Category deleted');
        loadCategories();
    })
    .catch(err => {
        alert('Error deleting category');
        console.error(err);
    });
}