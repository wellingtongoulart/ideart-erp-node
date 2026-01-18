/**
 * Utilidades e Helpers - Funções reutilizáveis
 * Funções auxiliares para toda a aplicação
 */

// ============================================
// CONFIGURAÇÕES
// ============================================

const APP_CONFIG = {
    sessionKey: 'ideart_session',
    userKey: 'ideart_user',
    sidebarMinimized: 'ideart_sidebar_minimized'
};

// ============================================
// FUNÇÕES DE USUÁRIO
// ============================================

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem(APP_CONFIG.userKey);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

function isUserLoggedIn() {
    return sessionStorage.getItem(APP_CONFIG.sessionKey) !== null;
}

// ============================================
// FUNÇÕES DE API
// ============================================

async function fetchAPI(endpoint, options = {}) {
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

async function getAPI(endpoint) {
    return fetchAPI(endpoint, { method: 'GET' });
}

async function postAPI(endpoint, dados) {
    return fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function putAPI(endpoint, dados) {
    return fetchAPI(endpoint, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

async function deleteAPI(endpoint) {
    return fetchAPI(endpoint, { method: 'DELETE' });
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

function formatarMoeda(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function formatarData(data) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
}

function formatarDataHora(data) {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleString('pt-BR');
}

function formatarNumero(numero) {
    return parseInt(numero).toLocaleString('pt-BR');
}

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCPF(cpf) {
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

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    return true;
}

function validarTelefone(telefone) {
    const regex = /^\(?[1-9]{2}\)? 9?\d{4}-?\d{4}$/;
    return regex.test(telefone);
}

// ============================================
// FUNÇÕES DE DOM
// ============================================

function getElementById(id) {
    return document.getElementById(id);
}

function querySelector(selector) {
    return document.querySelector(selector);
}

function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}

function criarElemento(tag, classes = '', innerHTML = '') {
    const elemento = document.createElement(tag);
    if (classes) elemento.className = classes;
    if (innerHTML) elemento.innerHTML = innerHTML;
    return elemento;
}

// ============================================
// FUNÇÕES DE NOTIFICAÇÃO
// ============================================

function mostrarNotificacao(mensagem, tipo = 'info', duracao = 3000) {
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

function mostrarErro(mensagem) {
    mostrarNotificacao(mensagem, 'erro');
}

function mostrarSucesso(mensagem) {
    mostrarNotificacao(mensagem, 'sucesso');
}

function mostrarAviso(mensagem) {
    mostrarNotificacao(mensagem, 'aviso');
}

function mostrarInfo(mensagem) {
    mostrarNotificacao(mensagem, 'info');
}

// ============================================
// FUNÇÕES DE CONFIRMAÇÃO
// ============================================

function confirmar(mensagem) {
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

function salvarLocalStorage(chave, valor) {
    try {
        localStorage.setItem(chave, typeof valor === 'object' ? JSON.stringify(valor) : valor);
    } catch (erro) {
        console.error('Erro ao salvar localStorage:', erro);
    }
}

function obterLocalStorage(chave) {
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

function removerLocalStorage(chave) {
    try {
        localStorage.removeItem(chave);
    } catch (erro) {
        console.error('Erro ao remover localStorage:', erro);
    }
}

// ============================================
// FUNÇÕES DE SIDEBAR
// ============================================

function toggleSidebarSize() {
    const sidebar = querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('minimized');
        const isMinimized = sidebar.classList.contains('minimized');
        salvarLocalStorage(APP_CONFIG.sidebarMinimized, isMinimized);
    }
}

function restoreSidebarState() {
    const sidebar = querySelector('.sidebar');
    const isMinimized = obterLocalStorage(APP_CONFIG.sidebarMinimized);
    if (isMinimized && sidebar) {
        sidebar.classList.add('minimized');
    }
}

// ============================================
// FUNÇÕES DE LOGOUT
// ============================================

function handleLogout(e) {
    e.preventDefault();
    if (confirm('Tem certeza que deseja sair?')) {
        sessionStorage.removeItem(APP_CONFIG.sessionKey);
        localStorage.removeItem(APP_CONFIG.userKey);
        window.location.href = '/login.html';
    }
}

// ============================================
// FUNÇÕES DE PERFIL
// ============================================

function initializeUserProfile() {
    try {
        const userStr = localStorage.getItem(APP_CONFIG.userKey);
        if (userStr) {
            const user = JSON.parse(userStr);
            
            // Atualizar avatar
            const userAvatarEl = getElementById('userAvatar');
            if (userAvatarEl) {
                userAvatarEl.src = user.avatar || 'https://via.placeholder.com/40';
            }
            
            // Atualizar nome
            const userNameEl = getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.name || 'Usuário';
            }
            
            // Atualizar papel/role
            const userRoleEl = getElementById('userRole');
            if (userRoleEl) {
                userRoleEl.textContent = user.funcao || 'Usuário';
            }
            
            // Atualizar última acesso
            const lastAccessEl = getElementById('lastAccess');
            if (lastAccessEl && user.lastAccess) {
                lastAccessEl.textContent = new Date(user.lastAccess).toLocaleString('pt-BR');
            }
            
            // Atualizar nome no dropdown
            const dropdownUserName = getElementById('dropdownUserName');
            if (dropdownUserName) {
                dropdownUserName.textContent = user.name || 'Usuário';
            }
            
            // Atualizar email no dropdown
            const dropdownUserEmail = getElementById('dropdownUserEmail');
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = user.email || 'usuario@email.com';
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar perfil:', error);
    }
}

// ============================================
// FUNÇÕES DE MENU
// ============================================

function toggleUserDropdown(e) {
    e.preventDefault();
    const dropdown = getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Exportar para uso em ES6 (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        getCurrentUser,
        isUserLoggedIn,
        fetchAPI,
        getAPI,
        postAPI,
        putAPI,
        deleteAPI,
        formatarMoeda,
        formatarData,
        formatarDataHora,
        formatarNumero,
        validarEmail,
        validarCPF,
        validarCNPJ,
        validarTelefone,
        getElementById,
        querySelector,
        querySelectorAll,
        criarElemento,
        mostrarNotificacao,
        mostrarErro,
        mostrarSucesso,
        mostrarAviso,
        mostrarInfo,
        confirmar,
        salvarLocalStorage,
        obterLocalStorage,
        removerLocalStorage,
        toggleSidebarSize,
        restoreSidebarState,
        handleLogout,
        initializeUserProfile,
        toggleUserDropdown
    };
}
