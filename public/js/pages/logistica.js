/**
 * Página de Logística
 * Acompanhamento e gerenciamento de logística
 */

const logisticaPage = {
    title: 'Logística',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Logística</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoRastreamentoBtn">
                    <i class="fas fa-plus"></i> Novo Rastreamento
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="logisticaTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Rastreamento</th>
                            <th>Transportadora</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="logisticaTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Novo Rastreamento -->
        <div class="modal" id="modalNovoRastreamento">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Rastreamento</h3>
                    <button class="modal-close" id="fecharModalRastreamentoBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoRastreamento">
                        <div class="form-group">
                            <label for="rastNumero">Número de Rastreamento *</label>
                            <input type="text" id="rastNumero" name="numero_rastreamento" required placeholder="Ex: BR123456789BR">
                        </div>

                        <div class="form-group">
                            <label for="rastTransportadora">Transportadora *</label>
                            <input type="text" id="rastTransportadora" name="transportadora" required placeholder="Ex: Correios, Sedex">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="rastOrigem">Origem</label>
                                <input type="text" id="rastOrigem" name="origem" placeholder="Cidade/Estado">
                            </div>
                            <div class="form-group">
                                <label for="rastDestino">Destino</label>
                                <input type="text" id="rastDestino" name="destino" placeholder="Cidade/Estado">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="rastDataEnvio">Data de Envio</label>
                            <input type="date" id="rastDataEnvio" name="data_envio">
                        </div>

                        <div class="form-group">
                            <label for="rastDataEntrega">Data de Entrega Estimada</label>
                            <input type="date" id="rastDataEntrega" name="data_entrega_estimada">
                        </div>

                        <div class="form-group">
                            <label for="rastStatus">Status</label>
                            <select id="rastStatus" name="status">
                                <option value="postado">Postado</option>
                                <option value="em_transito">Em Trânsito</option>
                                <option value="em_entrega">Em Entrega</option>
                                <option value="entregue">Entregue</option>
                                <option value="perdido">Perdido</option>
                                <option value="devolvido">Devolvido</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="rastObservacoes">Observações</label>
                            <textarea id="rastObservacoes" name="observacoes" rows="3" placeholder="Observações adicionais"></textarea>
                        </div>

                        <div class="alert alert-info" id="mensagemRastreamento" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarRastreamentoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarRastreamentoBtn">
                        <i class="fas fa-save"></i> Salvar Rastreamento
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de logística
 */
function inicializarLogistica() {
    const novoRastreamentoBtn = document.getElementById('novoRastreamentoBtn');
    const fecharModalBtn = document.getElementById('fecharModalRastreamentoBtn');
    const cancelarRastreamentoBtn = document.getElementById('cancelarRastreamentoBtn');
    const salvarRastreamentoBtn = document.getElementById('salvarRastreamentoBtn');
    const modalNovoRastreamento = document.getElementById('modalNovoRastreamento');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar dados de logística
    carregarLogistica();

    // Abrir modal para novo rastreamento
    if (novoRastreamentoBtn) {
        novoRastreamentoBtn.addEventListener('click', abrirModalNovoRastreamento);
    }

    // Buscar logística
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaLogistica);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalRastreamento);
    }

    if (cancelarRastreamentoBtn) {
        cancelarRastreamentoBtn.addEventListener('click', fecharModalRastreamento);
    }

    // Salvar rastreamento
    if (salvarRastreamentoBtn) {
        salvarRastreamentoBtn.addEventListener('click', salvarNovoRastreamento);
    }

    // Fechar modal ao clicar fora
    if (modalNovoRastreamento) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoRastreamento) {
                fecharModalRastreamento();
            }
        });
    }
}

/**
 * Carrega dados de logística do servidor
 */
function carregarLogistica() {
    fetch('/api/logistica')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('logisticaTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(logistica => {
                    const statusClasses = {
                        'postado': '#2196f3',
                        'em_transito': '#ff9800',
                        'em_entrega': '#4caf50',
                        'entregue': '#4caf50',
                        'perdido': '#f44336',
                        'devolvido': '#9e9e9e'
                    };

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${logistica.id}</td>
                        <td>${logistica.numero_rastreamento || '-'}</td>
                        <td>${logistica.transportadora || '-'}</td>
                        <td>${logistica.origem || '-'}</td>
                        <td>${logistica.destino || '-'}</td>
                        <td><span style="background: ${statusClasses[logistica.status] || '#2196f3'}; color: white; padding: 0.3rem 0.6rem; border-radius: 4px;">${logistica.status || '-'}</span></td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarLogistica(${logistica.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarLogistica(${logistica.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar logística:', erro);
            alert('Erro ao carregar logística');
        });
}

/**
 * Abre o modal para criar novo rastreamento
 */
function abrirModalNovoRastreamento() {
    const modal = document.getElementById('modalNovoRastreamento');
    const form = document.getElementById('formNovoRastreamento');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo rastreamento
 */
function fecharModalRastreamento() {
    const modal = document.getElementById('modalNovoRastreamento');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo rastreamento
 */
function salvarNovoRastreamento() {
    const form = document.getElementById('formNovoRastreamento');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.numero_rastreamento || !dados.transportadora) {
        mostrarMensagemRastreamento('Número de Rastreamento e Transportadora são obrigatórios', 'warning');
        return;
    }

    fetch('/api/logistica', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Rastreamento salvo com sucesso!');
                fecharModalRastreamento();
                carregarLogistica();
            } else {
                mostrarMensagemRastreamento(data.mensagem || 'Erro ao salvar rastreamento', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemRastreamento('Erro ao salvar rastreamento', 'error');
        });
}

/**
 * Edita um rastreamento
 */
function editarLogistica(id) {
    abrirEdicao('logistica', id);
}

/**
 * Deleta um rastreamento
 */
function deletarLogistica(id) {
    if (confirm('Tem certeza que deseja deletar este rastreamento?')) {
        fetch(`/api/logistica/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Rastreamento deletado com sucesso!');
                    carregarLogistica();
                } else {
                    alert(data.mensagem || 'Erro ao deletar rastreamento');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar rastreamento');
            });
    }
}

/**
 * Mostra mensagem no modal de rastreamento
 */
function mostrarMensagemRastreamento(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemRastreamento');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de logística
 */
function abrirBuscaLogistica() {
    if (!window.buscaLogistica) {
        window.buscaLogistica = new BuscaAvancada({
            endpoint: '/api/logistica',
            titulo: 'Buscar Rastreamentos',
            campos: ['numero_rastreamento', 'transportadora', 'status'],
            onResultado: (logistica) => {
                // Scroll até a tabela
                const table = document.getElementById('logisticaTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do rastreamento encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#logisticaTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == logistica.id) {
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
    window.buscaLogistica.abrir();
}
