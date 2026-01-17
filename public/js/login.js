// LOGIN PAGE LOGIC

// Configurações
const LOGIN_CONFIG = {
    storageKey: 'ideart_credentials',
    sessionKey: 'ideart_session',
    rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 dias
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
};

// Estado
const loginState = {
    attempts: 0,
    locked: false,
    lockoutTime: null,
};

// Elementos do DOM (serão inicializados no DOMContentLoaded)
let loginForm, usernameInput, passwordInput, rememberMeCheckbox, loginBtn;
let loadingSpinner, errorAlert, errorMessage, successAlert, successMessage, usernameError, passwordError;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
});

// Função de inicialização
function initializeLogin() {
    // Inicializar elementos do DOM
    loginForm = document.getElementById('loginForm');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    rememberMeCheckbox = document.getElementById('rememberMe');
    loginBtn = document.getElementById('loginBtn');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorAlert = document.getElementById('errorAlert');
    errorMessage = document.getElementById('errorMessage');
    successAlert = document.getElementById('successAlert');
    successMessage = document.getElementById('successMessage');
    usernameError = document.getElementById('usernameError');
    passwordError = document.getElementById('passwordError');

    // Verificar se o usuário já está logado
    if (isUserLoggedIn()) {
        redirectToHome();
        return;
    }

    // Carregar credenciais salvas (se houver)
    loadSavedCredentials();

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    usernameInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);
    loginBtn.addEventListener('click', () => {
        loginBtn.blur(); // Remove foco após clique
    });

    // Permitir login ao pressionar Enter na senha
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Verificar se a conta está bloqueada
    checkLockout();
}

// Verificar se usuário já está logado
function isUserLoggedIn() {
    return sessionStorage.getItem(LOGIN_CONFIG.sessionKey) !== null;
}

// Carregar credenciais salvas
function loadSavedCredentials() {
    try {
        const savedCredentials = localStorage.getItem(LOGIN_CONFIG.storageKey);
        if (savedCredentials) {
            const credentials = JSON.parse(atob(savedCredentials)); // Decodificar
            
            // Verificar se as credenciais não expiraram
            if (credentials.expiresAt && new Date(credentials.expiresAt) > new Date()) {
                usernameInput.value = credentials.username;
                rememberMeCheckbox.checked = true;
                
                // Focar no campo de senha para o usuário digitar
                passwordInput.focus();
            } else {
                // Credenciais expiradas, limpar
                localStorage.removeItem(LOGIN_CONFIG.storageKey);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar credenciais salvas:', error);
        localStorage.removeItem(LOGIN_CONFIG.storageKey);
    }
}

// Salvar credenciais
function saveCredentials(username, remember) {
    if (remember) {
        try {
            const credentials = {
                username: username,
                expiresAt: new Date(Date.now() + LOGIN_CONFIG.rememberMeDuration).toISOString()
            };
            // Criptografar (básico - apenas base64 para exemplo)
            localStorage.setItem(LOGIN_CONFIG.storageKey, btoa(JSON.stringify(credentials)));
        } catch (error) {
            console.error('Erro ao salvar credenciais:', error);
        }
    } else {
        // Limpar credenciais se não marcou "lembrar"
        localStorage.removeItem(LOGIN_CONFIG.storageKey);
    }
}

// Limpar credenciais
function clearCredentials() {
    localStorage.removeItem(LOGIN_CONFIG.storageKey);
}

// Validar formulário
function validateForm() {
    let isValid = true;

    // Validar username
    const username = usernameInput.value.trim();
    if (!username) {
        showError(usernameError, 'Por favor, digite seu usuário');
        isValid = false;
    } else if (username.length < 3) {
        showError(usernameError, 'O usuário deve ter pelo menos 3 caracteres');
        isValid = false;
    } else {
        hideError(usernameError);
    }

    // Validar senha
    const password = passwordInput.value;
    if (!password) {
        showError(passwordError, 'Por favor, digite sua senha');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordError, 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    } else {
        hideError(passwordError);
    }

    return isValid;
}

// Mostrar erro
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

// Esconder erro
function hideError(element) {
    element.textContent = '';
    element.classList.remove('show');
}

// Limpar erro ao digitar
function clearError() {
    hideError(usernameError);
    hideError(passwordError);
    hideAlert();
}

// Mostrar alerta de erro
function showErrorAlert(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Mostrar alerta de sucesso
function showSuccessAlert(message) {
    successMessage.textContent = message;
    successAlert.style.display = 'flex';
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 3000);
}

// Esconder alertas
function hideAlert() {
    errorAlert.style.display = 'none';
    successAlert.style.display = 'none';
}

// Verificar bloqueio da conta
function checkLockout() {
    if (loginState.locked && loginState.lockoutTime) {
        const now = new Date().getTime();
        const lockoutExpiry = new Date(loginState.lockoutTime).getTime();

        if (now < lockoutExpiry) {
            const minutesRemaining = Math.ceil((lockoutExpiry - now) / 1000 / 60);
            showErrorAlert(`Conta bloqueada por ${minutesRemaining} minutos`);
            disableLoginForm();
            return;
        } else {
            // Bloqueio expirou
            loginState.locked = false;
            loginState.attempts = 0;
            enableLoginForm();
        }
    }
}

// Desabilitar formulário
function disableLoginForm() {
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    loginBtn.disabled = true;
}

// Habilitar formulário
function enableLoginForm() {
    usernameInput.disabled = false;
    passwordInput.disabled = false;
    loginBtn.disabled = false;
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    // Verificar se está bloqueado
    if (loginState.locked) {
        checkLockout();
        return;
    }

    // Validar formulário
    if (!validateForm()) {
        return;
    }

    // Mostrar loading
    showLoading(true);
    loginBtn.disabled = true;

    try {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Simular requisição ao servidor
        // Em produção, seria uma requisição real à API
        const response = await performLogin(username, password);

        if (response.success) {
            // Salvar credenciais se marcou "lembrar"
            saveCredentials(username, rememberMe);

            // Criar sessão
            createSession(response.user);

            // Mostrar mensagem de sucesso
            showSuccessAlert('Login realizado com sucesso! Redirecionando...');

            // Aguardar um pouco e redirecionar
            setTimeout(() => {
                redirectToHome();
            }, 1500);
        } else {
            // Falha no login
            handleLoginFailure(response.message);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showErrorAlert('Erro ao conectar ao servidor. Tente novamente.');
    } finally {
        showLoading(false);
        loginBtn.disabled = false;
    }
}

// Simular requisição de login (Em produção, seria uma requisição real)
async function performLogin(username, password) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Credenciais de teste (para demonstração)
    const validCredentials = [
        { username: 'admin', password: '123456' },
        { username: 'user@email.com', password: 'senha123' },
        { username: 'usuario', password: 'password' }
    ];

    // Verificar credenciais
    const isValid = validCredentials.some(cred =>
        cred.username === username && cred.password === password
    );

    if (isValid) {
        loginState.attempts = 0;
        return {
            success: true,
            user: {
                id: 1,
                username: username,
                email: username.includes('@') ? username : `${username}@ideart.com`,
                name: username.charAt(0).toUpperCase() + username.slice(1),
                role: 'admin',
                avatar: `https://ui-avatars.com/api/?name=${username}&background=0066cc&color=fff`
            }
        };
    } else {
        return {
            success: false,
            message: 'Usuário ou senha inválidos'
        };
    }
}

// Handle falha de login
function handleLoginFailure(message) {
    loginState.attempts++;

    // Mostrar erro
    showErrorAlert(message || 'Erro ao fazer login. Tente novamente.');

    // Limpar senha por segurança
    passwordInput.value = '';
    passwordInput.focus();

    // Verificar limite de tentativas
    if (loginState.attempts >= LOGIN_CONFIG.maxLoginAttempts) {
        loginState.locked = true;
        loginState.lockoutTime = new Date(Date.now() + LOGIN_CONFIG.lockoutDuration);
        disableLoginForm();
        showErrorAlert(`Muitas tentativas. Conta bloqueada por 15 minutos.`);
    }
}

// Criar sessão
function createSession(user) {
    const session = {
        user: {
            ...user,
            lastAccess: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 horas
    };
    
    sessionStorage.setItem(LOGIN_CONFIG.sessionKey, JSON.stringify(session));
    
    // Salvar dados do usuário também em localStorage para disponibilidade entre abas
    const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        lastAccess: new Date().toISOString()
    };
    
    localStorage.setItem('ideart_user', JSON.stringify(userData));
}

// Mostrar/esconder loading
function showLoading(show) {
    if (show) {
        loadingSpinner.style.display = 'flex';
        loginBtn.innerHTML = '<div class="spinner"></div>';
    } else {
        loadingSpinner.style.display = 'none';
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Entrar</span>';
    }
}

// Redirecionar para home
function redirectToHome() {
    // Redirecionar para a página principal do sistema
    window.location.href = '/index.html';
}

// Logout (para ser usado em outras páginas)
function logout() {
    sessionStorage.removeItem(LOGIN_CONFIG.sessionKey);
    localStorage.removeItem('ideart_user');
    window.location.href = '/login.html';
}

// Exportar funções para usar em outras páginas
window.logoutUser = logout;
