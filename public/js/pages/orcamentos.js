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

        <!-- Modal de Novo Orçamento -->
        <div class="modal" id="modalNovoOrcamento">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Orçamento</h3>
                    <button class="modal-close" id="fecharModalOrcamentoBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoOrcamento">
                        <div class="form-group">
                            <label for="orcClienteId">Cliente *</label>
                            <select id="orcClienteId" name="cliente_id" required>
                                <option value="">Selecione um cliente</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="orcDataEmissao">Data de Emissão</label>
                            <input type="date" id="orcDataEmissao" name="data_emissao">
                        </div>

                        <div class="form-group">
                            <label for="orcDataValidade">Data de Validade</label>
                            <input type="date" id="orcDataValidade" name="data_validade">
                        </div>

                        <div class="form-group">
                            <label for="orcDescricao">Descrição</label>
                            <textarea id="orcDescricao" name="descricao" rows="4" placeholder="Descrição do orçamento"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="orcValor">Valor *</label>
                            <input type="number" id="orcValor" name="valor" step="0.01" required placeholder="0.00">
                        </div>

                        <div class="form-group">
                            <label for="orcStatus">Status</label>
                            <select id="orcStatus" name="status">
                                <option value="pendente">Pendente</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="recusado">Recusado</option>
                                <option value="expirado">Expirado</option>
                            </select>
                        </div>

                        <div class="alert alert-info" id="mensagemOrcamento" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarOrcamentoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarOrcamentoBtn">
                        <i class="fas fa-save"></i> Salvar Orçamento
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de orçamentos
 */
function inicializarOrcamentos() {
    const novoOrcamentoBtn = document.getElementById('novoOrcamentoBtn');
    const fecharModalBtn = document.getElementById('fecharModalOrcamentoBtn');
    const cancelarOrcamentoBtn = document.getElementById('cancelarOrcamentoBtn');
    const salvarOrcamentoBtn = document.getElementById('salvarOrcamentoBtn');
    const modalNovoOrcamento = document.getElementById('modalNovoOrcamento');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar lista de orçamentos
    carregarOrcamentos();

    // Abrir modal para novo orçamento
    if (novoOrcamentoBtn) {
        novoOrcamentoBtn.addEventListener('click', abrirModalNovoOrcamento);
    }

    // Buscar orçamentos
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaOrcamentos);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalOrcamento);
    }

    if (cancelarOrcamentoBtn) {
        cancelarOrcamentoBtn.addEventListener('click', fecharModalOrcamento);
    }

    // Salvar orçamento
    if (salvarOrcamentoBtn) {
        salvarOrcamentoBtn.addEventListener('click', salvarNovoOrcamento);
    }

    // Fechar modal ao clicar fora
    if (modalNovoOrcamento) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoOrcamento) {
                fecharModalOrcamento();
            }
        });
    }
}

/**
 * Carrega a lista de orçamentos do servidor
 */
function carregarOrcamentos() {
    fetch('/api/orcamentos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('orcamentosTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(orcamento => {
                    const row = document.createElement('tr');
                    const dataFormatada = orcamento.data_emissao ? new Date(orcamento.data_emissao).toLocaleDateString('pt-BR') : '-';
                    const valor = parseFloat(orcamento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                    row.innerHTML = `
                        <td>${orcamento.id}</td>
                        <td>${orcamento.cliente_nome || '-'}</td>
                        <td>${dataFormatada}</td>
                        <td>${valor}</td>
                        <td><span class="status-badge" style="background: ${getCorStatus(orcamento.status)}">${orcamento.status}</span></td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarOrcamento(${orcamento.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarOrcamento(${orcamento.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar orçamentos:', erro);
            alert('Erro ao carregar orçamentos');
        });
}

/**
 * Abre o modal para criar novo orçamento
 */
function abrirModalNovoOrcamento() {
    const modal = document.getElementById('modalNovoOrcamento');
    const form = document.getElementById('formNovoOrcamento');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo orçamento
 */
function fecharModalOrcamento() {
    const modal = document.getElementById('modalNovoOrcamento');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo orçamento
 */
function salvarNovoOrcamento() {
    const form = document.getElementById('formNovoOrcamento');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.cliente_id || !dados.valor) {
        mostrarMensagemOrcamento('Cliente e Valor são obrigatórios', 'warning');
        return;
    }

    fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Orçamento salvo com sucesso!');
                fecharModalOrcamento();
                carregarOrcamentos();
            } else {
                mostrarMensagemOrcamento(data.mensagem || 'Erro ao salvar orçamento', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemOrcamento('Erro ao salvar orçamento', 'error');
        });
}

/**
 * Edita um orçamento
 */
function editarOrcamento(id) {
    abrirEdicao('orcamento', id);
}

/**
 * Deleta um orçamento
 */
function deletarOrcamento(id) {
    if (confirm('Tem certeza que deseja deletar este orçamento?')) {
        fetch(`/api/orcamentos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Orçamento deletado com sucesso!');
                    carregarOrcamentos();
                } else {
                    alert(data.mensagem || 'Erro ao deletar orçamento');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar orçamento');
            });
    }
}

/**
 * Mostra mensagem no modal de orçamento
 */
function mostrarMensagemOrcamento(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemOrcamento');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de orçamentos
 */
function abrirBuscaOrcamentos() {
    if (!window.buscaOrcamentos) {
        window.buscaOrcamentos = new BuscaAvancada({
            endpoint: '/api/orcamentos',
            titulo: 'Buscar Orçamentos',
            campos: ['numero', 'cliente', 'status'],
            onResultado: (orcamento) => {
                // Scroll até a tabela
                const table = document.getElementById('orcamentosTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do orçamento encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#orcamentosTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == orcamento.id) {
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
    window.buscaOrcamentos.abrir();
}

/**
 * Retorna a cor do status
 */
function getCorStatus(status) {
    const cores = {
        'pendente': '#ff9800',
        'aprovado': '#4caf50',
        'recusado': '#f44336',
        'expirado': '#9e9e9e'
    };
    return cores[status] || '#2196f3';
}
