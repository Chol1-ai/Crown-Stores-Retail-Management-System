/* Forgot password - request reset token via username + email */

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const resultDiv = document.getElementById('resultMessage');
    
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
        });
        
        const data = await response.json();
        resultDiv.style.display = 'block';
        
        if (response.ok) {
            resultDiv.textContent = data.message;
            resultDiv.className = 'error-message success';
            resultDiv.innerHTML = `<strong>Success!</strong><br>Reset Token: <code>${data.resetToken}</code><br>Login and use Settings to change password.`;
        } else {
            resultDiv.textContent = data.message;
            resultDiv.className = 'error-message';
        }
    } catch (error) {
        resultDiv.textContent = 'Connection error';
        resultDiv.style.display = 'block';
    }
});