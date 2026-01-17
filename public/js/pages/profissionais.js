/**
 * Página de Profissionais
 * Gerenciamento de profissionais/funcionários do sistema
 */

const profissionaisPage = {
    title: 'Profissionais',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Profissionais</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoProfissionalBtn">
                    <i class="fas fa-plus"></i> Novo Profissional
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="profissionaisTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Especialidade</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="profissionaisTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de profissionais
 */
function inicializarProfissionais() {
    const novoProfissionalBtn = document.getElementById('novoProfissionalBtn');
    
    if (novoProfissionalBtn) {
        novoProfissionalBtn.addEventListener('click', abrirModalNovoProfissional);
    }
}

/**
 * Abre modal para criar novo profissional
 */
function abrirModalNovoProfissional() {
    mostrarAviso('Funcionalidade de novo profissional em desenvolvimento!');
    // TODO: Implementar novo profissional
}
