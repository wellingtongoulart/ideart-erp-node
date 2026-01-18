/**
 * Página de Pedidos
 * Gerenciamento de pedidos do sistema
 */

const pedidosPage = {
    title: 'Pedidos',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Pedidos</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoPedidoBtn">
                    <i class="fas fa-plus"></i> Novo Pedido
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="pedidosTable">
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pedidosTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Novo Pedido -->
        <div class="modal" id="modalNovoPedido">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Pedido</h3>
                    <button class="modal-close" id="fecharModalPedidoBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoPedido">
                        <div class="form-group">
                            <label for="pedClienteId">Cliente *</label>
                            <select id="pedClienteId" name="cliente_id" required>
                                <option value="">Selecione um cliente</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="pedDataPedido">Data do Pedido</label>
                            <input type="date" id="pedDataPedido" name="data_pedido">
                        </div>

                        <div class="form-group">
                            <label for="pedDescricao">Descrição</label>
                            <textarea id="pedDescricao" name="descricao" rows="4" placeholder="Descrição do pedido"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="pedValorTotal">Valor Total *</label>
                            <input type="number" id="pedValorTotal" name="valor_total" step="0.01" required placeholder="0.00">
                        </div>

                        <div class="form-group">
                            <label for="pedStatus">Status</label>
                            <select id="pedStatus" name="status">
                                <option value="pendente">Pendente</option>
                                <option value="processando">Processando</option>
                                <option value="enviado">Enviado</option>
                                <option value="entregue">Entregue</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div class="alert alert-info" id="mensagemPedido" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarPedidoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarPedidoBtn">
                        <i class="fas fa-save"></i> Salvar Pedido
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de pedidos
 */
function inicializarPedidos() {
    const novoPedidoBtn = document.getElementById('novoPedidoBtn');
    const fecharModalBtn = document.getElementById('fecharModalPedidoBtn');
    const cancelarPedidoBtn = document.getElementById('cancelarPedidoBtn');
    const salvarPedidoBtn = document.getElementById('salvarPedidoBtn');
    const modalNovoPedido = document.getElementById('modalNovoPedido');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar lista de pedidos
    carregarPedidos();

    // Abrir modal para novo pedido
    if (novoPedidoBtn) {
        novoPedidoBtn.addEventListener('click', abrirModalNovoPedido);
    }

    // Buscar pedidos
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaPedidos);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalPedido);
    }

    if (cancelarPedidoBtn) {
        cancelarPedidoBtn.addEventListener('click', fecharModalPedido);
    }

    // Salvar pedido
    if (salvarPedidoBtn) {
        salvarPedidoBtn.addEventListener('click', salvarNovoPedido);
    }

    // Fechar modal ao clicar fora
    if (modalNovoPedido) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoPedido) {
                fecharModalPedido();
            }
        });
    }
}

/**
 * Carrega a lista de pedidos do servidor
 */
function carregarPedidos() {
    fetch('/api/pedidos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('pedidosTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(pedido => {
                    const statusClasses = {
                        'pendente': 'style="background-color: #fff3cd; color: #856404;"',
                        'processando': 'style="background-color: #d1ecf1; color: #0c5460;"',
                        'enviado': 'style="background-color: #cfe2ff; color: #084298;"',
                        'entregue': 'style="background-color: #d1e7dd; color: #155724;"',
                        'cancelado': 'style="background-color: #f8d7da; color: #842029;"'
                    };

                    const row = document.createElement('tr');
                    const dataFormatada = pedido.data_pedido ? new Date(pedido.data_pedido).toLocaleDateString('pt-BR') : '-';
                    const valor = parseFloat(pedido.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                    row.innerHTML = `
                        <td>${pedido.numero || pedido.id}</td>
                        <td>${pedido.cliente_nome || '-'}</td>
                        <td>${dataFormatada}</td>
                        <td>${valor}</td>
                        <td><span ${statusClasses[pedido.status] || ''} style="padding: 0.3rem 0.6rem; border-radius: 4px;">${pedido.status}</span></td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="verPedido(${pedido.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarPedido(${pedido.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar pedidos:', erro);
            alert('Erro ao carregar pedidos');
        });
}

/**
 * Abre o modal para criar novo pedido
 */
function abrirModalNovoPedido() {
    const modal = document.getElementById('modalNovoPedido');
    const form = document.getElementById('formNovoPedido');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo pedido
 */
function fecharModalPedido() {
    const modal = document.getElementById('modalNovoPedido');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo pedido
 */
function salvarNovoPedido() {
    const form = document.getElementById('formNovoPedido');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.cliente_id || !dados.valor_total) {
        mostrarMensagemPedido('Cliente e Valor Total são obrigatórios', 'warning');
        return;
    }

    fetch('/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Pedido salvo com sucesso!');
                fecharModalPedido();
                carregarPedidos();
            } else {
                mostrarMensagemPedido(data.mensagem || 'Erro ao salvar pedido', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemPedido('Erro ao salvar pedido', 'error');
        });
}

/**
 * Visualiza um pedido específico
 */
function verPedido(id) {
    abrirEdicao('pedido', id);
}

/**
 * Deleta um pedido
 */
function deletarPedido(id) {
    if (confirm('Tem certeza que deseja deletar este pedido?')) {
        fetch(`/api/pedidos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Pedido deletado com sucesso!');
                    carregarPedidos();
                } else {
                    alert(data.mensagem || 'Erro ao deletar pedido');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar pedido');
            });
    }
}

/**
 * Mostra mensagem no modal de pedido
 */
function mostrarMensagemPedido(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemPedido');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de pedidos
 */
function abrirBuscaPedidos() {
    if (!window.buscaPedidos) {
        window.buscaPedidos = new BuscaAvancada({
            endpoint: '/api/pedidos',
            titulo: 'Buscar Pedidos',
            campos: ['numero', 'cliente', 'status'],
            onResultado: (pedido) => {
                // Scroll até a tabela
                const table = document.getElementById('pedidosTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do pedido encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#pedidosTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == pedido.numero || idCell.textContent == pedido.id) {
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
    window.buscaPedidos.abrir();
}
