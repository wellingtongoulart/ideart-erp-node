/**
 * Utilidades e Helpers - Funções reutilizáveis
 * Funções auxiliares para toda a aplicação
 */

// ============================================
// CONFIGURAÇÕES
// ============================================

export const APP_CONFIG = {
    sessionKey: 'ideart_session',
    userKey: 'ideart_user',
    sidebarMinimized: 'ideart_sidebar_minimized'
};

// ============================================
// FUNÇÕES DE USUÁRIO
// ============================================

export function getCurrentUser() {
    try {
        const userStr = localStorage.getItem(APP_CONFIG.userKey);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

export function isUserLoggedIn() {
    return sessionStorage.getItem(APP_CONFIG.sessionKey) !== null;
}

// ============================================
// FUNÇÕES DE API
// ============================================

export async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        return data;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        throw erro;
    }
}

export async function getAPI(endpoint) {
    return fetchAPI(endpoint, { method: 'GET' });
}

export async function postAPI(endpoint, dados) {
    return fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

export async function putAPI(endpoint, dados) {
    return fetchAPI(endpoint, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

export async function deleteAPI(endpoint) {
    return fetchAPI(endpoint, { method: 'DELETE' });
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

export function formatarMoeda(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

export function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

export function formatarDataHora(data) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleString('pt-BR');
}

export function formatarNumero(numero) {
    return parseInt(numero).toLocaleString('pt-BR');
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

export function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    return true;
}

export function validarTelefone(telefone) {
    const regex = /^\(?[1-9]{2}\)? 9?\d{4}-?\d{4}$/;
    return regex.test(telefone);
}

// ============================================
// FUNÇÕES DE DOM
// ============================================

export function getElementById(id) {
    return document.getElementById(id);
}

export function querySelector(selector) {
    return document.querySelector(selector);
}

export function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}

export function criarElemento(tag, classes = '', innerHTML = '') {
    const elemento = document.createElement(tag);
    if (classes) elemento.className = classes;
    if (innerHTML) elemento.innerHTML = innerHTML;
    return elemento;
}

// ============================================
// FUNÇÕES DE NOTIFICAÇÃO
// ============================================

export function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
    const notif = criarElemento('div', `alert alert-${tipo}`);
    notif.textContent = mensagem;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        z-index: 3000;
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, duracao);
}

export function mostrarErro(mensagem) {
    mostrarNotificacao(mensagem, 'erro');
}

export function mostrarSucesso(mensagem) {
    mostrarNotificacao(mensagem, 'sucesso');
}

export function mostrarAviso(mensagem) {
    mostrarNotificacao(mensagem, 'aviso');
}

export function mostrarInfo(mensagem) {
    mostrarNotificacao(mensagem, 'info');
}

// ============================================
// FUNÇÕES DE CONFIRMAÇÃO
// ============================================

export function confirmar(mensagem) {
    return new Promise((resolve) => {
        const modal = criarElemento('div', 'modal show');
        modal.innerHTML = `
            <div class="modal-content" style="width: 400px;">
                <div class="modal-header">
                    <h3>Confirmação</h3>
                </div>
                <div class="modal-body">
                    <p>${mensagem}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelar-conf">Cancelar</button>
                    <button class="btn btn-primary" id="confirmar-conf">Confirmar</button>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });

        getElementById('cancelar-conf').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        getElementById('confirmar-conf').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        document.body.appendChild(modal);
    });
}

// ============================================
// FUNÇÕES DE ARMAZENAMENTO
// ============================================

export function salvarLocalStorage(chave, valor) {
    try {
        localStorage.setItem(chave, typeof valor === 'object' ? JSON.stringify(valor) : valor);
    } catch (erro) {
        console.error('Erro ao salvar localStorage:', erro);
    }
}

export function obterLocalStorage(chave) {
    try {
        const valor = localStorage.getItem(chave);
        try {
            return JSON.parse(valor);
        } catch {
            return valor;
        }
    } catch (erro) {
        console.error('Erro ao obter localStorage:', erro);
        return null;
    }
}

export function removerLocalStorage(chave) {
    try {
        localStorage.removeItem(chave);
    } catch (erro) {
        console.error('Erro ao remover localStorage:', erro);
    }
}

// ============================================
// FUNÇÕES DE SIDEBAR
// ============================================

export function toggleSidebarSize() {
    const sidebar = querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('minimized');
        const isMinimized = sidebar.classList.contains('minimized');
        salvarLocalStorage(APP_CONFIG.sidebarMinimized, isMinimized);
    }
}

export function restoreSidebarState() {
    const sidebar = querySelector('.sidebar');
    const isMinimized = obterLocalStorage(APP_CONFIG.sidebarMinimized);
    if (isMinimized && sidebar) {
        sidebar.classList.add('minimized');
    }
}

// ============================================
// FUNÇÕES DE LOGOUT
// ============================================

export function handleLogout(e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
        sessionStorage.removeItem(APP_CONFIG.sessionKey);
        sessionStorage.removeItem('user_token');
        sessionStorage.removeItem('user');
        localStorage.removeItem(APP_CONFIG.userKey);
        window.location.href = '/login.html';
    }
}

// ============================================
// FUNÇÕES DE PERFIL
// ============================================

export function initializeUserProfile() {
    try {
        const userStr = localStorage.getItem(APP_CONFIG.userKey);
        if (userStr) {
            const user = JSON.parse(userStr);

            // Buscar dados atualizados do banco (ID vem do JWT no backend)
            fetch('/api/autenticacao/user/me')
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        const dbUser = data.usuario;

                        // Atualizar localStorage com dados do banco
                        const updatedUser = {
                            ...user,
                            name: dbUser.nome,
                            role: dbUser.funcao,
                            email: dbUser.email
                        };
                        localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(updatedUser));

                        // Atualizar avatar
                        const userAvatarEl = getElementById('userAvatar');
                        if (userAvatarEl) {
                            userAvatarEl.textContent = (dbUser.nome || 'U').charAt(0).toUpperCase();
                            userAvatarEl.title = dbUser.nome || 'Usuário'; // Tooltip com nome completo
                        }

                        // Atualizar nome
                        const userNameEl = getElementById('userName');
                        if (userNameEl) {
                            userNameEl.textContent = dbUser.nome || 'Usuário';
                        }

                        // Atualizar papel/role
                        const userRoleEl = getElementById('userRole');
                        if (userRoleEl) {
                            userRoleEl.textContent = dbUser.funcao || 'Usuário';
                        }

                        // Atualizar última acesso
                        const lastAccessEl = getElementById('lastAccess');
                        if (lastAccessEl && user.lastAccess) {
                            lastAccessEl.textContent = new Date(user.lastAccess).toLocaleString('pt-BR');
                        }

                        // Atualizar nome no dropdown
                        const dropdownUserName = getElementById('dropdownUserName');
                        if (dropdownUserName) {
                            dropdownUserName.textContent = dbUser.nome || 'Usuário';
                        }

                        // Atualizar email no dropdown
                        const dropdownUserEmail = getElementById('dropdownUserEmail');
                        if (dropdownUserEmail) {
                            dropdownUserEmail.textContent = dbUser.email || 'usuario@email.com';
                        }
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar dados do usuário:', error);
                    // Fallback para localStorage
                    updateFromLocalStorage(user);
                });
        }
    } catch (error) {
        console.error('Erro ao inicializar perfil:', error);
    }
}

// Função auxiliar para fallback
function updateFromLocalStorage(user) {
    // Atualizar avatar
    const userAvatarEl = getElementById('userAvatar');
    if (userAvatarEl) {
        userAvatarEl.textContent = (user.nome || 'U').charAt(0).toUpperCase();
        userAvatarEl.title = user.nome || 'Usuário';
    }

    // Atualizar nome
    const userNameEl = getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = user.nome || 'Usuário';
    }

    // Atualizar papel/role
    const userRoleEl = getElementById('userRole');
    if (userRoleEl) {
        userRoleEl.textContent = user.role || 'Usuário';
    }

    // Atualizar última acesso
    const lastAccessEl = getElementById('lastAccess');
    if (lastAccessEl && user.lastAccess) {
        lastAccessEl.textContent = new Date(user.lastAccess).toLocaleString('pt-BR');
    }

    // Atualizar nome no dropdown
    const dropdownUserName = getElementById('dropdownUserName');
    if (dropdownUserName) {
        dropdownUserName.textContent = user.nome || 'Usuário';
    }

    // Atualizar email no dropdown
    const dropdownUserEmail = getElementById('dropdownUserEmail');
    if (dropdownUserEmail) {
        dropdownUserEmail.textContent = user.email || 'usuario@email.com';
    }
}

// ============================================
// FUNÇÕES DE MENU
// ============================================

export function toggleUserDropdown(e) {
    e.preventDefault();
    const dropdown = getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

