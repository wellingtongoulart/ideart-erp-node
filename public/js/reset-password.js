// RESET PASSWORD PAGE LOGIC

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    const tokenInvalidBox = document.getElementById('tokenInvalidBox');
    const tokenInvalidMessage = document.getElementById('tokenInvalidMessage');
    const userInfoBox = document.getElementById('userInfoBox');
    const userEmailEl = document.getElementById('userEmail');
    const resetForm = document.getElementById('resetForm');
    const novaSenha = document.getElementById('novaSenha');
    const confirmarSenha = document.getElementById('confirmarSenha');
    const novaSenhaError = document.getElementById('novaSenhaError');
    const confirmarSenhaError = document.getElementById('confirmarSenhaError');
    const submitBtn = document.getElementById('submitBtn');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');

    function showTokenError(msg) {
        tokenInvalidMessage.textContent = msg;
        tokenInvalidBox.style.display = 'flex';
        resetForm.style.display = 'none';
        userInfoBox.style.display = 'none';
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.style.display = 'flex';
        successAlert.style.display = 'none';
    }

    function showSuccess(msg) {
        successMessage.textContent = msg;
        successAlert.style.display = 'flex';
        errorAlert.style.display = 'none';
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    if (!token) {
        showTokenError('Token não informado. Solicite um novo link em "Esqueceu a senha?".');
        return;
    }

    // Validar token
    (async () => {
        try {
            const response = await fetch(`/api/autenticacao/validate-reset-token?token=${encodeURIComponent(token)}`);
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                showTokenError(data.mensagem || 'Token inválido ou expirado.');
                return;
            }

            tokenInvalidBox.style.display = 'none';
            resetForm.style.display = 'block';
            userInfoBox.style.display = 'block';
            userEmailEl.textContent = data.usuario && data.usuario.email ? data.usuario.email : '';
        } catch (erro) {
            console.error('Erro ao validar token:', erro);
            showTokenError('Erro ao validar token. Tente novamente.');
        }
    })();

    [novaSenha, confirmarSenha].forEach((input) => {
        input.addEventListener('input', () => {
            novaSenhaError.textContent = '';
            confirmarSenhaError.textContent = '';
            errorAlert.style.display = 'none';
        });
    });

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        novaSenhaError.textContent = '';
        confirmarSenhaError.textContent = '';
        errorAlert.style.display = 'none';
        successAlert.style.display = 'none';

        const senha = novaSenha.value;
        const confirmacao = confirmarSenha.value;

        if (senha.length < 6) {
            novaSenhaError.textContent = 'A senha deve ter pelo menos 6 caracteres';
            return;
        }
        if (senha !== confirmacao) {
            confirmarSenhaError.textContent = 'As senhas não coincidem';
            return;
        }

        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div>';

        try {
            const response = await fetch('/api/autenticacao/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha: senha })
            });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                showError(data.mensagem || 'Não foi possível redefinir a senha');
                return;
            }

            showSuccess('Senha redefinida com sucesso! Redirecionando para o login...');
            resetForm.querySelectorAll('input, button').forEach((el) => el.disabled = true);
            setTimeout(() => { window.location.href = '/login.html'; }, 2000);
        } catch (erro) {
            console.error('Erro ao redefinir senha:', erro);
            showError('Erro ao conectar. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
});
