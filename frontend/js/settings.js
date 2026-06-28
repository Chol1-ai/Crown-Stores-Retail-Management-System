/* Settings page - change password, logout */

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.full_name;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('passwordMessage');
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (newPass !== confirm) {
            messageEl.textContent = 'New passwords do not match';
            messageEl.className = 'settings-message error';
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ currentPassword: current, newPassword: newPass })
            });

            const data = await response.json();
            if (response.ok) {
                messageEl.textContent = data.message;
                messageEl.className = 'settings-message success';
                document.getElementById('changePasswordForm').reset();
            } else {
                messageEl.textContent = data.message;
                messageEl.className = 'settings-message error';
            }
        } catch (err) {
            messageEl.textContent = 'Connection error';
            messageEl.className = 'settings-message error';
        }
    });
});
