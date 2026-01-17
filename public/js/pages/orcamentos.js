/**
 * Página de Orçamentos
 * Gerenciamento de orçamentos do sistema
 */

const orcamentosPage = {
    title: 'Orçamentos',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Orçamentos</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoOrcamentoBtn">
                    <i class="fas fa-plus"></i> Novo Orçamento
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="orcamentosTable">
                    <thead>
                        <tr>
                            <th>ID Orçamento</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="orcamentosTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de orçamentos
 */
function inicializarOrcamentos() {
    const novoOrcamentoBtn = document.getElementById('novoOrcamentoBtn');
    
    // Carregar lista de orçamentos
    carregarOrcamentos();

    // Abrir modal para novo orçamento
    if (novoOrcamentoBtn) {
        novoOrcamentoBtn.addEventListener('click', abrirModalNovoOrcamento);
    }
}

/**
 * Carrega a lista de orçamentos do servidor
 */
function carregarOrcamentos() {
    // TODO: Implementar carregamento de orçamentos
    mostrarInfo('Funcionalidade de orçamentos em desenvolvimento');
}

/**
 * Abre modal para criar novo orçamento
 */
function abrirModalNovoOrcamento() {
    mostrarAviso('Funcionalidade de novo orçamento em desenvolvimento!');
    // TODO: Implementar novo orçamento
}
