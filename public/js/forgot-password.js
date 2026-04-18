// FORGOT PASSWORD PAGE LOGIC

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    const input = document.getElementById('identificador');
    const inputError = document.getElementById('identificadorError');
    const submitBtn = document.getElementById('submitBtn');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');
    const resetLinkBox = document.getElementById('resetLinkBox');
    const resetLink = document.getElementById('resetLink');

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

    function hideAlerts() {
        errorAlert.style.display = 'none';
        successAlert.style.display = 'none';
        inputError.textContent = '';
    }

    input.addEventListener('input', hideAlerts);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlerts();
        resetLinkBox.style.display = 'none';

        const identificador = input.value.trim();
        if (!identificador) {
            inputError.textContent = 'Informe seu usuário ou email';
            return;
        }

        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div>';

        try {
            const response = await fetch('/api/autenticacao/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identificador })
            });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                showError(data.mensagem || 'Não foi possível processar a solicitação');
                return;
            }

            showSuccess(data.mensagem || 'Solicitação processada.');

            if (data.resetUrl) {
                resetLink.textContent = data.resetUrl;
                resetLink.href = data.resetUrl;
                resetLinkBox.style.display = 'block';
            }
        } catch (erro) {
            console.error('Erro ao solicitar recuperação:', erro);
            showError('Erro ao conectar. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
});
