/**
 * IDEART ERP — Entry point (ES Module)
 *
 * Roteamento client-side, inicialização e fiação da UI.
 */

import {
    restoreSidebarState,
    initializeUserProfile,
    handleLogout,
    toggleSidebarSize,
    toggleUserDropdown,
    mostrarErro
} from './utils.js';

import { abrirModalAlterarSenha } from './change-password.js';

import { dashboardPage, inicializarDashboard } from './pages/dashboard.js';
import { produtosPage, inicializarProdutos } from './pages/produtos.js';
import { pedidosPage, inicializarPedidos } from './pages/pedidos.js';
import { clientesPage, inicializarClientes } from './pages/clientes.js';
import { orcamentosPage, inicializarOrcamentos } from './pages/orcamentos.js';
import { profissionaisPage, inicializarProfissionais } from './pages/profissionais.js';
import { relatoriosPage, inicializarRelatorios } from './pages/relatorios.js';

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
    relatorios: {
        init: () => {
            document.getElementById('pageTitle').textContent = relatoriosPage.title;
            document.getElementById('contentArea').innerHTML = relatoriosPage.content;
            inicializarRelatorios();
        }
    }
};

const DEFAULT_PAGE = 'dashboard';

function getPageFromHash() {
    const raw = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (!raw) return DEFAULT_PAGE;
    return pageConfig[raw] ? raw : DEFAULT_PAGE;
}

export function navigateTo(pageName) {
    const target = pageConfig[pageName] ? pageName : DEFAULT_PAGE;
    const nextHash = `#/${target}`;
    if (window.location.hash === nextHash) {
        renderPage(target);
    } else {
        window.location.hash = nextHash;
    }
}

function renderPage(pageName) {
    const pageConfig_item = pageConfig[pageName];

    if (!pageConfig_item) {
        console.warn(`Página '${pageName}' não encontrada. Carregando ${DEFAULT_PAGE}.`);
        navigateTo(DEFAULT_PAGE);
        return;
    }

    try {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }

        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }

        pageConfig_item.init();
    } catch (error) {
        console.error(`Erro ao carregar página '${pageName}':`, error);
        mostrarErro('Erro ao carregar página. Tente novamente.');
    }
}

// Mantém compatibilidade com chamadas existentes a loadPage(name)
export function loadPage(pageName) {
    navigateTo(pageName);
}

function initializeApp() {
    try {
        restoreSidebarState();
        initializeUserProfile();

        const initialPage = getPageFromHash();
        if (!window.location.hash) {
            history.replaceState(null, '', `#/${initialPage}`);
        }

        renderPage(initialPage);

        window.addEventListener('hashchange', () => {
            renderPage(getPageFromHash());
        });

        setupNavigation();
        setupSidebarToggle();
        setupUserMenu();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        mostrarErro('Erro ao inicializar o aplicativo.');
    }
}

function setupNavigation() {
    document.querySelectorAll('.menu-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.getAttribute('data-page');
            navigateTo(pageName);
        });
    });
}

function setupSidebarToggle() {
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');

    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.toggle-sidebar')) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebarSize();
        });
    }
}

function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }

    document.addEventListener('click', (e) => {
        if (userDropdown && userMenuBtn) {
            if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        }
    });

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
            abrirModalAlterarSenha();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
});
