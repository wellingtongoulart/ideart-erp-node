/**
 * IDEART ERP - Application Main File (Refactored)
 * 
 * Este arquivo gerencia o roteamento de páginas e a inicialização do aplicativo.
 * 
 * ESTRUTURA MODULAR:
 * - utils.js: Funções utilitárias (API, formatting, validação, etc)
 * - modal.js: Sistema de modais reutilizável
 * - pages/*.js: Lógica específica de cada página
 * 
 * DEPENDÊNCIAS:
 * - Requer: utils.js, modal.js, pages/*.js (devem estar carregados antes)
 * - Não tem dependências internas
 */

/**
 * Mapa de páginas e suas funções de inicialização
 * Cada página deve ser definida em pages/*.js com:
 *  - [name]Page.title (string)
 *  - [name]Page.content (HTML string)
 *  - inicializar[Name]() (function)
 */
const pageConfig = {
    dashboard: {
        init: () => {
            document.getElementById('pageTitle').textContent = dashboardPage.title;
            document.getElementById('contentArea').innerHTML = dashboardPage.content;
            inicializarDashboard();
        }
    },
    produtos: {
        init: () => {
            document.getElementById('pageTitle').textContent = produtosPage.title;
            document.getElementById('contentArea').innerHTML = produtosPage.content;
            inicializarProdutos();
        }
    },
    pedidos: {
        init: () => {
            document.getElementById('pageTitle').textContent = pedidosPage.title;
            document.getElementById('contentArea').innerHTML = pedidosPage.content;
            inicializarPedidos();
        }
    },
    clientes: {
        init: () => {
            document.getElementById('pageTitle').textContent = clientesPage.title;
            document.getElementById('contentArea').innerHTML = clientesPage.content;
            inicializarClientes();
        }
    },
    orcamentos: {
        init: () => {
            document.getElementById('pageTitle').textContent = orcamentosPage.title;
            document.getElementById('contentArea').innerHTML = orcamentosPage.content;
            inicializarOrcamentos();
        }
    },
    profissionais: {
        init: () => {
            document.getElementById('pageTitle').textContent = profissionaisPage.title;
            document.getElementById('contentArea').innerHTML = profissionaisPage.content;
            inicializarProfissionais();
        }
    },
    logistica: {
        init: () => {
            document.getElementById('pageTitle').textContent = logisticaPage.title;
            document.getElementById('contentArea').innerHTML = logisticaPage.content;
            inicializarLogistica();
        }
    },
    documentos: {
        init: () => {
            document.getElementById('pageTitle').textContent = documentosPage.title;
            document.getElementById('contentArea').innerHTML = documentosPage.content;
            inicializarDocumentos();
        }
    },
    relatorios: {
        init: () => {
            document.getElementById('pageTitle').textContent = relatoriosPage.title;
            document.getElementById('contentArea').innerHTML = relatoriosPage.content;
            inicializarRelatorios();
        }
    }
};

/**
 * Carrega uma página e inicializa seus componentes
 * @param {string} pageName - Nome da página (chave em pageConfig)
 */
function loadPage(pageName) {
    const pageConfig_item = pageConfig[pageName];
    
    if (!pageConfig_item) {
        console.warn(`Página '${pageName}' não encontrada. Carregando dashboard.`);
        loadPage('dashboard');
        return;
    }

    try {
        // Atualizar menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }

        // Fechar sidebar em mobile após clicar
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }

        // Inicializar a página
        pageConfig_item.init();
    } catch (error) {
        console.error(`Erro ao carregar página '${pageName}':`, error);
        mostrarErro('Erro ao carregar página. Tente novamente.');
    }
}

/**
 * Inicializa o aplicativo
 * Chamado quando DOMContentLoaded é disparado
 */
function initializeApp() {
    try {
        // Restaurar estado do sidebar
        restoreSidebarState();
        
        // Inicializar perfil do usuário
        initializeUserProfile();
        
        // Carregar página inicial
        loadPage('dashboard');

        // Setup navigation
        setupNavigation();
        
        // Setup sidebar toggle
        setupSidebarToggle();
        
        // Setup user menu
        setupUserMenu();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        mostrarErro('Erro ao inicializar o aplicativo.');
    }
}

/**
 * Configura navegação entre páginas
 */
function setupNavigation() {
    document.querySelectorAll('.menu-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.getAttribute('data-page');
            loadPage(pageName);
        });
    });
}

/**
 * Configura toggle do sidebar em dispositivos móveis
 */
function setupSidebarToggle() {
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.toggle-sidebar')) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Toggle de minimizar/maximizar
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebarSize();
        });
    }
}

/**
 * Configura menu de usuário (dropdown)
 */
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (userDropdown && userMenuBtn) {
            if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        }
    });
    
    // Alterar senha
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
            mostrarAviso('Funcionalidade de alterar senha em desenvolvimento!');
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Event Listener: DOMContentLoaded
 * Inicializa o aplicativo quando o DOM está pronto
 */
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Reload da página quando o tamanho da janela muda
 * Para ajustar sidebar responsivo
 */
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
});
