/**
 * Página de Pedidos — versão refatorada
 * Pedidos são criados automaticamente a partir de orçamentos aprovados.
 * Permite visualizar detalhes (itens, cliente, vínculo com orçamento) e atualizar status.
 */

import { formatarMoeda, formatarData } from '../utils.js';
import { DataTable } from '../data-table.js';

let tabelaPedidos = null;

export const pedidosPage = {
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

            <div id="pedidosTableMount"></div>
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

// `desconto` é armazenado como percentual (0-100); `valor_total` é o bruto.
// O total exibido nas listagens/detalhes precisa aplicar o desconto.
function calcularTotalComDesconto(pedido) {
    const bruto = Number(pedido?.valor_total) || 0;
    let perc = Number(pedido?.desconto) || 0;
    if (perc < 0) perc = 0;
    if (perc > 100) perc = 100;
    return bruto * (1 - perc / 100);
}

const STATUS_PEDIDO_OPCOES = ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'];

export function inicializarPedidos() {
    adicionarEstilosPedidos();

    tabelaPedidos = new DataTable({
        mount: document.getElementById('pedidosTableMount'),
        endpoint: '/api/pedidos',
        tamanhoPagina: 10,
        ordenacaoPadrao: { chave: 'criado_em', direcao: 'desc' },
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Buscar por nº ou cliente...' },
            { chave: 'status', tipo: 'select',
              placeholder: 'Todos os status',
              opcoes: [
                { valor: 'pendente', rotulo: 'Pendente' },
                { valor: 'processando', rotulo: 'Processando' },
                { valor: 'enviado', rotulo: 'Enviado' },
                { valor: 'entregue', rotulo: 'Entregue' },
                { valor: 'cancelado', rotulo: 'Cancelado' }
            ]},
            { tipo: 'date-range', rotulo: 'Data pedido',
              chaveMin: 'data_pedido_inicio', chaveMax: 'data_pedido_fim' },
            { tipo: 'number-range', rotulo: 'Valor',
              chaveMin: 'valor_min', chaveMax: 'valor_max',
              step: '0.01', placeholderMin: 'R$ mín', placeholderMax: 'R$ máx' }
        ],
        colunas: [
            { chave: 'numero', rotulo: 'Nº', ordenavel: true,
              formatar: (p) => p.numero || p.id },
            { chave: 'orcamento_id', rotulo: 'Orçamento', ordenavel: true,
              formatar: (p) => p.orcamento_id ? `#${p.orcamento_id}` : '-' },
            { chave: 'cliente_nome', rotulo: 'Cliente', ordenavel: true,
              formatar: (p) => p.cliente_nome || '-' },
            { chave: 'data_pedido', rotulo: 'Data', ordenavel: true,
              formatar: (p) => formatarData(p.data_pedido) },
            { chave: 'valor_total', rotulo: 'Total', ordenavel: true,
              formatar: (p) => formatarMoeda(calcularTotalComDesconto(p)) },
            { chave: 'status', rotulo: 'Status', ordenavel: true,
              formatar: (p) => renderStatusSelectPed(p) }
        ],
        acoes: (p) => `
            <div class="acoes-row">
                <button class="btn btn-primary btn-small" onclick="abrirDetalhesPedido(${p.id})" title="Detalhes/Editar">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary btn-small" style="color:#c62828;border-color:#c62828" onclick="cancelarPedido(${p.id})" title="Cancelar">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `
    });
    tabelaPedidos.inicializar();

    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('pedAtualizarBtn', 'click', () => tabelaPedidos.recarregar());
    on('pedModalClose', 'click', () => fecharModalPed('pedModalDetalhes'));
    on('pedModalCancelar', 'click', () => fecharModalPed('pedModalDetalhes'));
    on('pedModalSalvar', 'click', salvarAlteracoesPedido);
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

function renderStatusSelectPed(p) {
    const desabilitado = p.status === 'cancelado' || p.status === 'entregue';
    const cor = corStatusPed(p.status);
    const options = STATUS_PEDIDO_OPCOES.map(s =>
        `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');
    return `
        <select class="status-select"
                data-id="${p.id}"
                data-status-anterior="${p.status}"
                style="background:${cor};"
                ${desabilitado ? 'disabled' : ''}
                onchange="mudarStatusPedido(this)">
            ${options}
        </select>
    `;
}

export async function mudarStatusPedido(sel) {
    const id = sel.dataset.id;
    const statusAnterior = sel.dataset.statusAnterior;
    const novoStatus = sel.value;
    if (novoStatus === statusAnterior) return;

    if (novoStatus === 'cancelado') {
        sel.value = statusAnterior;
        alert('Para cancelar, use o botão "Cancelar" ao lado — ele permite informar o motivo.');
        return;
    }

    const ok = confirm(`Alterar status do pedido para "${novoStatus}"?`);
    if (!ok) {
        sel.value = statusAnterior;
        return;
    }

    sel.disabled = true;
    try {
        const res = await fetch(`/api/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        sel.dataset.statusAnterior = novoStatus;
        sel.style.background = corStatusPed(novoStatus);
        if (novoStatus === 'entregue' || novoStatus === 'cancelado') {
            sel.disabled = true;
        } else {
            sel.disabled = false;
        }
    } catch (e) {
        alert(e.message || 'Erro ao atualizar status');
        sel.value = statusAnterior;
        sel.disabled = false;
    }
}

export async function abrirDetalhesPedido(id) {
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
            <div><span>Subtotal:</span> <strong>${formatarMoeda(pedido.valor_total || 0)}</strong></div>
            <div><span>Desconto:</span> <strong>${pedido.desconto || 0}%</strong></div>
            <div class="total-final"><span>Total:</span> <strong>${formatarMoeda(calcularTotalComDesconto(pedido))}</strong></div>
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
        if (tabelaPedidos) tabelaPedidos.recarregar();
    } catch (e) {
        alert(e.message || 'Erro ao salvar pedido');
    }
}

export async function cancelarPedido(id) {
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
        if (tabelaPedidos) tabelaPedidos.recarregar();
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
        .section-title { color: var(--primary-blue); font-size:1rem; margin: 1rem 0 .5rem 0; padding-bottom:.3rem; border-bottom:2px solid var(--light-blue); }
        .acoes-row { display:flex; gap:.25rem; flex-wrap:wrap; }
        .totals-box { background:#f5f8fc; border-radius:8px; padding:.75rem 1.25rem; display:flex; flex-direction:column; gap:.4rem; align-items:flex-end; }
        .totals-box > div { display:flex; gap:1rem; min-width:240px; justify-content:space-between; }
        .totals-box .total-final { border-top:2px solid var(--primary-blue); padding-top:.3rem; font-size:1.05rem; color: var(--primary-blue); }
        .status-select {
            color: #fff;
            font-weight: 600;
            font-size: .85rem;
            padding: .3rem .6rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-transform: capitalize;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right .3rem center;
            background-size: 16px;
            padding-right: 1.6rem;
            transition: opacity .2s ease;
        }
        .status-select:hover:not(:disabled) { opacity: .85; }
        .status-select:disabled { cursor: not-allowed; opacity: .7; }
        .status-select option { background: #fff; color: #333; font-weight: 500; }
    `;
    document.head.appendChild(style);
}

// Handlers chamados via onclick/onchange inline nos templates HTML
window.abrirDetalhesPedido = abrirDetalhesPedido;
window.cancelarPedido = cancelarPedido;
window.mudarStatusPedido = mudarStatusPedido;
