/**
 * Página de Documentos
 * Gerenciamento de documentos do sistema
 */

const documentosPage = {
    title: 'Documentos',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Documentos</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoDocumentoBtn">
                    <i class="fas fa-plus"></i> Novo Documento
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="documentosTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Referência</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="documentosTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de documentos
 */
function inicializarDocumentos() {
    const novoDocumentoBtn = document.getElementById('novoDocumentoBtn');
    
    if (novoDocumentoBtn) {
        novoDocumentoBtn.addEventListener('click', abrirModalNovoDocumento);
    }
}

/**
 * Abre modal para criar novo documento
 */
function abrirModalNovoDocumento() {
    mostrarAviso('Funcionalidade de novo documento em desenvolvimento!');
    // TODO: Implementar novo documento
}
