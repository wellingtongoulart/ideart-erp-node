/**
 * Modal de Alteração de Senha (usuário logado)
 *
 * Expõe `abrirModalAlterarSenha()` para ser chamado pelo dropdown do usuário.
 * Depende de: utils.js (getCurrentUser, mostrarSucesso, mostrarErro).
 */

(function () {
    const MODAL_ID = 'modal-alterar-senha';

    function fecharModal() {
        const el = document.getElementById(MODAL_ID);
        if (el) el.remove();
    }

    function toggleVisibilidade(btn) {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');
        if (!input || !icon) return;
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    function exibirMensagem(msgEl, mensagem, tipo) {
        if (!msgEl) return;
        msgEl.textContent = mensagem;
        msgEl.className = `alert alert-${tipo}`;
        msgEl.style.display = 'block';
    }

    function limparMensagem(msgEl) {
        if (!msgEl) return;
        msgEl.style.display = 'none';
        msgEl.textContent = '';
    }

    function abrirModalAlterarSenha() {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (!user || !user.id) {
            if (typeof mostrarErro === 'function') {
                mostrarErro('Não foi possível identificar o usuário logado.');
            }
            return;
        }

        // Evita abrir múltiplas instâncias
        fecharModal();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 460px;">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Alterar Senha</h3>
                    <button class="modal-close" type="button" id="fechar-${MODAL_ID}">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info" id="msg-${MODAL_ID}" style="display:none;"></div>
                    <form id="form-${MODAL_ID}">
                        ${campoSenha('senhaAtual', 'Senha Atual', 'Digite sua senha atual')}
                        ${campoSenha('novaSenha', 'Nova Senha', 'Mínimo de 6 caracteres')}
                        ${campoSenha('confirmarSenha', 'Confirmar Nova Senha', 'Repita a nova senha')}
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelar-${MODAL_ID}">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="salvar-${MODAL_ID}">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const msgEl = document.getElementById(`msg-${MODAL_ID}`);
        const senhaAtual = document.getElementById(`field-${MODAL_ID}-senhaAtual`);
        const novaSenha = document.getElementById(`field-${MODAL_ID}-novaSenha`);
        const confirmarSenha = document.getElementById(`field-${MODAL_ID}-confirmarSenha`);
        const salvarBtn = document.getElementById(`salvar-${MODAL_ID}`);

        // Fechar: botão X, Cancelar, clique fora, Esc
        document.getElementById(`fechar-${MODAL_ID}`).addEventListener('click', fecharModal);
        document.getElementById(`cancelar-${MODAL_ID}`).addEventListener('click', fecharModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                fecharModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Toggle de visibilidade
        modal.querySelectorAll('.toggle-password').forEach((btn) => {
            btn.addEventListener('click', () => toggleVisibilidade(btn));
        });

        // Limpar mensagens ao digitar
        [senhaAtual, novaSenha, confirmarSenha].forEach((input) => {
            input.addEventListener('input', () => limparMensagem(msgEl));
        });

        // Enter envia
        modal.querySelector(`#form-${MODAL_ID}`).addEventListener('submit', (e) => {
            e.preventDefault();
            salvarBtn.click();
        });

        salvarBtn.addEventListener('click', async () => {
            limparMensagem(msgEl);

            const atual = senhaAtual.value;
            const nova = novaSenha.value;
            const confirmacao = confirmarSenha.value;

            if (!atual || !nova || !confirmacao) {
                exibirMensagem(msgEl, 'Preencha todos os campos.', 'erro');
                return;
            }
            if (nova.length < 6) {
                exibirMensagem(msgEl, 'A nova senha deve ter pelo menos 6 caracteres.', 'erro');
                return;
            }
            if (nova !== confirmacao) {
                exibirMensagem(msgEl, 'As senhas não coincidem.', 'erro');
                return;
            }
            if (nova === atual) {
                exibirMensagem(msgEl, 'A nova senha deve ser diferente da atual.', 'erro');
                return;
            }

            const originalHTML = salvarBtn.innerHTML;
            salvarBtn.disabled = true;
            salvarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                const response = await fetch('/api/autenticacao/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuarioId: user.id,
                        senhaAtual: atual,
                        novaSenha: nova
                    })
                });
                const data = await response.json();

                if (!response.ok || !data.sucesso) {
                    exibirMensagem(msgEl, data.mensagem || 'Não foi possível alterar a senha.', 'erro');
                    return;
                }

                exibirMensagem(msgEl, 'Senha alterada com sucesso!', 'sucesso');
                if (typeof mostrarSucesso === 'function') {
                    mostrarSucesso('Senha alterada com sucesso!');
                }
                setTimeout(fecharModal, 1200);
            } catch (erro) {
                console.error('Erro ao alterar senha:', erro);
                exibirMensagem(msgEl, 'Erro ao conectar. Tente novamente.', 'erro');
            } finally {
                salvarBtn.disabled = false;
                salvarBtn.innerHTML = originalHTML;
            }
        });

        // Focar no primeiro campo
        setTimeout(() => senhaAtual.focus(), 50);
    }

    function campoSenha(name, label, placeholder) {
        const id = `field-${MODAL_ID}-${name}`;
        return `
            <div class="form-group">
                <label for="${id}">${label} <span style="color:red;">*</span></label>
                <div style="position: relative;">
                    <input type="password" id="${id}" name="${name}" placeholder="${placeholder}"
                           autocomplete="new-password" style="width:100%; padding: 0.75rem; padding-right: 42px;
                           border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.95rem;">
                    <button type="button" class="toggle-password" data-target="${id}"
                            style="position:absolute; right:8px; top:50%; transform:translateY(-50%);
                            background:none; border:none; color: var(--primary-blue); cursor:pointer;
                            padding: 6px;" aria-label="Mostrar/ocultar senha">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Exportar
    window.abrirModalAlterarSenha = abrirModalAlterarSenha;
})();
