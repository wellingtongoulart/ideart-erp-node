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
    `
};

/**
 * Inicializa a página de pedidos
 */
function inicializarPedidos() {
    const novoPedidoBtn = document.getElementById('novoPedidoBtn');
    
    // Carregar lista de pedidos
    carregarPedidos();

    // Abrir modal para novo pedido
    if (novoPedidoBtn) {
        novoPedidoBtn.addEventListener('click', abrirModalNovoPedido);
    }
}

/**
 * Carrega a lista de pedidos do servidor
 */
function carregarPedidos() {
    getAPI('/api/pedidos')
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
                    row.innerHTML = `
                        <td>${pedido.numero}</td>
                        <td>${pedido.cliente_nome}</td>
                        <td>${formatarData(pedido.data_pedido)}</td>
                        <td>${formatarMoeda(pedido.valor_total)}</td>
                        <td><span ${statusClasses[pedido.status] || ''} style="padding: 0.3rem 0.6rem; border-radius: 4px;">${pedido.status}</span></td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="verPedido(${pedido.id})">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar pedidos:', erro);
            mostrarErro('Erro ao carregar pedidos');
        });
}

/**
 * Abre modal para criar novo pedido
 */
function abrirModalNovoPedido() {
    mostrarAviso('Funcionalidade de novo pedido em desenvolvimento!');
    // TODO: Implementar novo pedido
}

/**
 * Visualiza um pedido específico
 */
function verPedido(id) {
    mostrarAviso('Funcionalidade de visualizar pedido em desenvolvimento! Pedido ID: ' + id);
    // TODO: Implementar visualização de pedido
}
