document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const username_val = document.getElementById('username').value;
            const password_val = document.getElementById('password').value;
            
            // Simulação de autenticação para site estático
            // Credenciais fixas conforme o código original do ESP32
            const valid_username = "Bruno"; 
            const valid_password = "11052001";

            if (username_val === valid_username && password_val === valid_password) {
                // Armazenar um token simples no localStorage para simular sessão
                localStorage.setItem('auth_token', 'fake_session_token_12345_static_site');
                window.location.href = 'index.html'; // Redireciona para o painel de controle
            } else {
                const errorMsg = document.getElementById('error-msg');
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                }
                const passwordInput = document.getElementById('password');
                if (passwordInput) {
                    passwordInput.value = '';
                }
            }
        });
    }
});

