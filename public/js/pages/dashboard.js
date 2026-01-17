/**
 * Página de Dashboard
 * Visão geral do sistema
 */

const dashboardPage = {
    title: 'Dashboard',
    content: `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total de Produtos</h3>
                <div class="stat-value">1.234</div>
                <div class="stat-change">↑ 12% em relação ao mês anterior</div>
            </div>
            <div class="stat-card">
                <h3>Orçamentos Pendentes</h3>
                <div class="stat-value">45</div>
                <div class="stat-change">Aguardando aprovação</div>
            </div>
            <div class="stat-card">
                <h3>Pedidos em Andamento</h3>
                <div class="stat-value">28</div>
                <div class="stat-change">Em processamento</div>
            </div>
            <div class="stat-card">
                <h3>Total de Clientes</h3>
                <div class="stat-value">567</div>
                <div class="stat-change">↑ 5% novo este mês</div>
            </div>
        </div>
        <div class="card">
            <h2 class="card-title">Últimas Atividades</h2>
            <div class="card-content">
                <p>Bem-vindo ao Ideart ERP! Comece navegando pelos menus para acessar as diferentes funcionalidades do sistema.</p>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de dashboard
 */
function inicializarDashboard() {
    // Carregar dados do dashboard
    carregarDados();
}

/**
 * Carrega os dados do dashboard
 */
function carregarDados() {
    // TODO: Implementar carregamento de dados dinâmicos do servidor
}
