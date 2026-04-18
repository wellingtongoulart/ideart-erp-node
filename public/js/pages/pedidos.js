/**
 * Página de Pedidos — versão refatorada
 * Pedidos são criados automaticamente a partir de orçamentos aprovados.
 * Permite visualizar detalhes (itens, cliente, vínculo com orçamento) e atualizar status.
 */

const pedidosPage = {
    title: 'Pedidos',
    content: `
        <div id="pedidosListaView" class="card">
            <div class="card-header-row">
                <h2 class="card-title">Gerenciamento de Pedidos</h2>
                <div class="btn-group">
                    <button class="btn btn-secondary" id="pedAtualizarBtn">
                        <i class="fas fa-sync"></i> Atualizar
                    </button>
                </div>
            </div>

            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Os pedidos são gerados automaticamente a partir da <strong>aprovação de orçamentos</strong>. Use a tela de Orçamentos para criar novos pedidos.
            </div>

            <div class="filters-row">
                <input type="text" id="pedFiltroBusca" placeholder="Buscar por nº ou cliente..." />
                <select id="pedFiltroStatus">
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="processando">Processando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <button class="btn btn-secondary" id="pedFiltrarBtn"><i class="fas fa-search"></i> Filtrar</button>
            </div>

            <div class="table-wrapper">
                <table id="pedidosTable">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Orçamento</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th style="width: 200px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pedidosTbody"></tbody>
                </table>
            </div>
        </div>

        <!-- Modal de detalhes/edição do pedido -->
        <div class="modal" id="pedModalDetalhes">
            <div class="modal-content" style="max-width: 820px;">
                <div class="modal-header">
                    <h3 id="pedModalTitulo">Pedido</h3>
                    <button class="modal-close" id="pedModalClose">&times;</button>
                </div>
                <div class="modal-body" id="pedModalBody"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="pedModalCancelar">Fechar</button>
                    <button class="btn btn-primary" id="pedModalSalvar"><i class="fas fa-save"></i> Salvar Alterações</button>
                </div>
            </div>
        </div>
    `
};

const pedState = {
    pedidoAtualId: null,
    pedidoAtual: null
};

function inicializarPedidos() {
    carregarPedidos();
    adicionarEstilosPedidos();

    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('pedAtualizarBtn', 'click', carregarPedidos);
    on('pedFiltrarBtn', 'click', carregarPedidos);
    on('pedFiltroBusca', 'keypress', (e) => { if (e.key === 'Enter') carregarPedidos(); });
    on('pedModalClose', 'click', () => fecharModalPed('pedModalDetalhes'));
    on('pedModalCancelar', 'click', () => fecharModalPed('pedModalDetalhes'));
    on('pedModalSalvar', 'click', salvarAlteracoesPedido);
}

async function carregarPedidos() {
    const tbody = document.getElementById('pedidosTbody');
    if (!tbody) return;

    const busca = (document.getElementById('pedFiltroBusca') || {}).value || '';
    const status = (document.getElementById('pedFiltroStatus') || {}).value || '';
    const qs = new URLSearchParams();
    if (busca) qs.append('busca', busca);
    if (status) qs.append('status', status);
    qs.append('limite', '100');

    try {
        const res = await fetch(`/api/pedidos?${qs.toString()}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        tbody.innerHTML = '';
        if (!data.dados || data.dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhum pedido encontrado</td></tr>';
            return;
        }
        data.dados.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.numero || p.id}</td>
                <td>${p.orcamento_id ? `#${p.orcamento_id}` : '-'}</td>
                <td>${p.cliente_nome || '-'}</td>
                <td>${formatarData(p.data_pedido)}</td>
                <td>${formatarMoeda(p.valor_total || 0)}</td>
                <td><span class="status-badge" style="background:${corStatusPed(p.status)};color:#fff;padding:.25rem .5rem;border-radius:4px;font-size:.85rem;">${p.status}</span></td>
                <td>
                    <div class="acoes-row">
                        <button class="btn btn-primary btn-small" onclick="abrirDetalhesPedido(${p.id})" title="Detalhes/Editar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-small" style="color:#c62828;border-color:#c62828" onclick="cancelarPedido(${p.id})" title="Cancelar">
                            <i class="fas fa-ban"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c00;">Erro ao carregar pedidos</td></tr>';
    }
}

function corStatusPed(status) {
    const cores = {
        pendente: '#ff9800',
        processando: '#1976d2',
        enviado: '#7b1fa2',
        entregue: '#2e7d32',
        cancelado: '#c62828'
    };
    return cores[status] || '#607d8b';
}

async function abrirDetalhesPedido(id) {
    pedState.pedidoAtualId = id;
    try {
        const res = await fetch(`/api/pedidos/${id}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        pedState.pedidoAtual = data.dados;
        renderizarDetalhesPedido(data.dados);
        const m = document.getElementById('pedModalDetalhes');
        if (m) m.classList.add('show');
    } catch (e) {
        alert(e.message || 'Erro ao carregar pedido');
    }
}

function renderizarDetalhesPedido({ pedido, itens }) {
    document.getElementById('pedModalTitulo').textContent = `Pedido ${pedido.numero || pedido.id}`;

    const body = document.getElementById('pedModalBody');
    const itensRows = (itens || []).map(it => `
        <tr>
            <td>${it.sku || '-'}</td>
            <td>${it.produto_nome || it.nome_customizado || '-'}</td>
            <td style="text-align:center;">${it.quantidade}</td>
            <td style="text-align:right;">${formatarMoeda(it.preco_unitario)}</td>
            <td style="text-align:right;">${formatarMoeda(it.subtotal)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum item</td></tr>';

    body.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Cliente</label>
                <input type="text" value="${pedido.cliente_nome || ''}" disabled />
            </div>
            <div class="form-group">
                <label>Orçamento Origem</label>
                <input type="text" value="${pedido.orcamento_numero || (pedido.orcamento_id ? '#' + pedido.orcamento_id : '-')}" disabled />
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Data do Pedido</label>
                <input type="text" value="${formatarData(pedido.data_pedido)}" disabled />
            </div>
            <div class="form-group">
                <label>Data de Entrega Prevista</label>
                <input type="date" id="pedEntregaPrevista" value="${(pedido.data_entrega_prevista || '').split('T')[0] || ''}" />
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Status</label>
                <select id="pedStatus">
                    ${['pendente','processando','enviado','entregue','cancelado'].map(s =>
                        `<option value="${s}" ${pedido.status === s ? 'selected' : ''}>${s}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Forma de Pagamento</label>
                <input type="text" value="${pedido.forma_pagamento || '-'}" disabled />
            </div>
        </div>

        <h4 class="section-title">Itens do Pedido</h4>
        <div class="table-wrapper">
            <table>
                <thead><tr><th>SKU</th><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead>
                <tbody>${itensRows}</tbody>
            </table>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
            <label>Observações</label>
            <textarea id="pedObservacoes" rows="3">${pedido.observacoes || ''}</textarea>
        </div>

        <div class="totals-box" style="margin-top:1rem;">
            <div><span>Desconto:</span> <strong>${pedido.desconto || 0}%</strong></div>
            <div class="total-final"><span>Total:</span> <strong>${formatarMoeda(pedido.valor_total || 0)}</strong></div>
        </div>
    `;
}

async function salvarAlteracoesPedido() {
    if (!pedState.pedidoAtualId) return;
    const payload = {
        status: document.getElementById('pedStatus').value,
        data_entrega_prevista: document.getElementById('pedEntregaPrevista').value || null,
        observacoes: document.getElementById('pedObservacoes').value
    };
    try {
        const res = await fetch(`/api/pedidos/${pedState.pedidoAtualId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        alert('Pedido atualizado');
        fecharModalPed('pedModalDetalhes');
        carregarPedidos();
    } catch (e) {
        alert(e.message || 'Erro ao salvar pedido');
    }
}

async function cancelarPedido(id) {
    const motivo = prompt('Motivo do cancelamento (opcional):', '');
    if (motivo === null) return;
    try {
        const res = await fetch(`/api/pedidos/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        alert('Pedido cancelado');
        carregarPedidos();
    } catch (e) {
        alert(e.message || 'Erro ao cancelar pedido');
    }
}

function fecharModalPed(id) { const m = document.getElementById(id); if (m) m.classList.remove('show'); }

function adicionarEstilosPedidos() {
    if (document.getElementById('pedidos-custom-style')) return;
    const style = document.createElement('style');
    style.id = 'pedidos-custom-style';
    style.textContent = `
        .card-header-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
        .filters-row { display:flex; gap:.5rem; margin-bottom:1rem; flex-wrap:wrap; }
        .filters-row input, .filters-row select { flex:1; min-width:150px; padding:.5rem; border:1px solid #ddd; border-radius:6px; }
        .section-title { color: var(--primary-blue); font-size:1rem; margin: 1rem 0 .5rem 0; padding-bottom:.3rem; border-bottom:2px solid var(--light-blue); }
        .acoes-row { display:flex; gap:.25rem; flex-wrap:wrap; }
        .totals-box { background:#f5f8fc; border-radius:8px; padding:.75rem 1.25rem; display:flex; flex-direction:column; gap:.4rem; align-items:flex-end; }
        .totals-box > div { display:flex; gap:1rem; min-width:240px; justify-content:space-between; }
        .totals-box .total-final { border-top:2px solid var(--primary-blue); padding-top:.3rem; font-size:1.05rem; color: var(--primary-blue); }
    `;
    document.head.appendChild(style);
}
