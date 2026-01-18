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

        <!-- Modal de Novo Documento -->
        <div class="modal" id="modalNovoDocumento">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Documento</h3>
                    <button class="modal-close" id="fecharModalDocumentoBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoDocumento">
                        <div class="form-group">
                            <label for="docNome">Nome do Documento *</label>
                            <input type="text" id="docNome" name="nome" required placeholder="Nome do documento">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="docTipo">Tipo de Documento *</label>
                                <select id="docTipo" name="tipo" required>
                                    <option value="">Selecione um tipo</option>
                                    <option value="contrato">Contrato</option>
                                    <option value="fatura">Fatura</option>
                                    <option value="recibo">Recibo</option>
                                    <option value="nota_fiscal">Nota Fiscal</option>
                                    <option value="relatorio">Relatório</option>
                                    <option value="proposta">Proposta</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="docData">Data do Documento</label>
                                <input type="date" id="docData" name="data_documento">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="docTipoReferencia">Tipo de Referência</label>
                            <select id="docTipoReferencia" name="referencia_tipo">
                                <option value="">Selecione</option>
                                <option value="cliente">Cliente</option>
                                <option value="pedido">Pedido</option>
                                <option value="orcamento">Orçamento</option>
                                <option value="profissional">Profissional</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="docReferenciaId">ID da Referência</label>
                            <input type="number" id="docReferenciaId" name="referencia_id" placeholder="ID do cliente, pedido, etc">
                        </div>

                        <div class="form-group">
                            <label for="docDescricao">Descrição</label>
                            <textarea id="docDescricao" name="descricao" rows="4" placeholder="Descrição do documento"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="docArquivo">URL do Arquivo</label>
                            <input type="text" id="docArquivo" name="arquivo_url" placeholder="https://exemplo.com/documento.pdf">
                        </div>

                        <div class="alert alert-info" id="mensagemDocumento" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarDocumentoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarDocumentoBtn">
                        <i class="fas fa-save"></i> Salvar Documento
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de documentos
 */
function inicializarDocumentos() {
    const novoDocumentoBtn = document.getElementById('novoDocumentoBtn');
    const fecharModalBtn = document.getElementById('fecharModalDocumentoBtn');
    const cancelarDocumentoBtn = document.getElementById('cancelarDocumentoBtn');
    const salvarDocumentoBtn = document.getElementById('salvarDocumentoBtn');
    const modalNovoDocumento = document.getElementById('modalNovoDocumento');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar lista de documentos
    carregarDocumentos();

    // Abrir modal para novo documento
    if (novoDocumentoBtn) {
        novoDocumentoBtn.addEventListener('click', abrirModalNovoDocumento);
    }

    // Buscar documentos
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaDocumentos);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalDocumento);
    }

    if (cancelarDocumentoBtn) {
        cancelarDocumentoBtn.addEventListener('click', fecharModalDocumento);
    }

    // Salvar documento
    if (salvarDocumentoBtn) {
        salvarDocumentoBtn.addEventListener('click', salvarNovoDocumento);
    }

    // Fechar modal ao clicar fora
    if (modalNovoDocumento) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoDocumento) {
                fecharModalDocumento();
            }
        });
    }
}

/**
 * Carrega a lista de documentos do servidor
 */
function carregarDocumentos() {
    fetch('/api/documentos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('documentosTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(documento => {
                    const row = document.createElement('tr');
                    const dataFormatada = documento.data_documento ? new Date(documento.data_documento).toLocaleDateString('pt-BR') : '-';
                    const referencia = documento.referencia_tipo ? `${documento.referencia_tipo} (#${documento.referencia_id})` : '-';

                    row.innerHTML = `
                        <td>${documento.id}</td>
                        <td>${documento.nome}</td>
                        <td>${documento.tipo || '-'}</td>
                        <td>${referencia}</td>
                        <td>${dataFormatada}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="verDocumento(${documento.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarDocumento(${documento.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar documentos:', erro);
            alert('Erro ao carregar documentos');
        });
}

/**
 * Abre o modal para criar novo documento
 */
function abrirModalNovoDocumento() {
    const modal = document.getElementById('modalNovoDocumento');
    const form = document.getElementById('formNovoDocumento');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo documento
 */
function fecharModalDocumento() {
    const modal = document.getElementById('modalNovoDocumento');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo documento
 */
function salvarNovoDocumento() {
    const form = document.getElementById('formNovoDocumento');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.nome || !dados.tipo) {
        mostrarMensagemDocumento('Nome e Tipo são obrigatórios', 'warning');
        return;
    }

    fetch('/api/documentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Documento salvo com sucesso!');
                fecharModalDocumento();
                carregarDocumentos();
            } else {
                mostrarMensagemDocumento(data.mensagem || 'Erro ao salvar documento', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemDocumento('Erro ao salvar documento', 'error');
        });
}

/**
 * Visualiza um documento
 */
function verDocumento(id) {
    abrirEdicao('documento', id);
}

/**
 * Deleta um documento
 */
function deletarDocumento(id) {
    if (confirm('Tem certeza que deseja deletar este documento?')) {
        fetch(`/api/documentos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Documento deletado com sucesso!');
                    carregarDocumentos();
                } else {
                    alert(data.mensagem || 'Erro ao deletar documento');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar documento');
            });
    }
}

/**
 * Mostra mensagem no modal de documento
 */
function mostrarMensagemDocumento(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemDocumento');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de documentos
 */
function abrirBuscaDocumentos() {
    if (!window.buscaDocumentos) {
        window.buscaDocumentos = new BuscaAvancada({
            endpoint: '/api/documentos',
            titulo: 'Buscar Documentos',
            campos: ['nome', 'tipo', 'referencia_tipo'],
            onResultado: (documento) => {
                // Scroll até a tabela
                const table = document.getElementById('documentosTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do documento encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#documentosTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == documento.id) {
                                linha.style.background = '#fff9c4';
                                setTimeout(() => {
                                    linha.style.background = '';
                                }, 3000);
                            }
                        });
                    }, 500);
                }
            }
        });
    }
    window.buscaDocumentos.abrir();
}

/**
 * Abre modal para criar novo documento
 */
function abrirModalNovoDocumento() {
    mostrarAviso('Funcionalidade de novo documento em desenvolvimento!');
    // TODO: Implementar novo documento
}
