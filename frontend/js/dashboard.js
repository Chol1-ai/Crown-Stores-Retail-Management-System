/* Shared dashboard utilities - auth, routing, helpers */

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').textContent = user.full_name;
    
    const avatar = document.getElementById('userAvatar');
    if (avatar && user.full_name) {
        const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);
        avatar.textContent = initials;
        avatar.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedUsername');
        window.location.href = 'login.html';
    });
    
    const page = window.location.pathname.split('/').pop();
    const allowedPages = {
        'director-dashboard.html': ['director'],
        'manager-dashboard.html': ['director', 'manager'],
        'sales-dashboard.html': ['sales_agent'],
        'category.html': ['director', 'manager'],
        'product.html': ['director', 'manager'],
        'procurement.html': ['director', 'manager'],
        'sales.html': ['director', 'manager'],
        'settings.html': ['director', 'manager', 'sales_agent']
    };
    
    if (page && allowedPages[page]) {
        if (!allowedPages[page].includes(user.role)) {
            const redirect = {
                'director': 'director-dashboard.html',
                'manager': 'manager-dashboard.html',
                'sales_agent': 'sales-dashboard.html'
            };
            window.location.href = redirect[user.role] || 'login.html';
            return;
        }
    }
    
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = e.target.dataset.section;
            if (!sectionId) return;
            
            e.preventDefault();
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.querySelectorAll('.sidebar a').forEach(a => {
                a.classList.remove('active');
            });
            
            e.target.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });
});

function formatCurrency(value) {
    return 'UGX ' + parseFloat(value).toLocaleString('en-UG', { minimumFractionDigits: 2 });
}

function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}