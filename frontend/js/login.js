/* Login page - authenticate user, handle remember me and role redirect */

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, rememberMe })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            }
            redirectToDashboard(data.user.role);
        } else {
            errorDiv.textContent = data.message;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error';
        errorDiv.style.display = 'block';
    }
});

document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        this.textContent = '👁️';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        document.getElementById('username').value = rememberedUsername;
        document.getElementById('rememberMe').checked = true;
    }
});

function redirectToDashboard(role) {
    switch(role) {
        case 'director':
            window.location.href = '/pages/director-dashboard.html';
            break;
        case 'manager':
            window.location.href = '/pages/manager-dashboard.html';
            break;
        case 'sales_agent':
            window.location.href = '/pages/sales-dashboard.html';
            break;
    }
}