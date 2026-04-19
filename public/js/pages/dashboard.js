/**
 * Página de Dashboard
 * Visão executiva com KPIs, gráficos interativos e alertas
 */

import { getAPI, formatarMoeda, formatarData, mostrarErro } from '../utils.js';
import { navigateTo } from '../app.js';

export const dashboardPage = {
    title: 'Dashboard',
    content: `
        <div class="dash-toolbar">
            <div class="dash-periodo">
                <span class="dash-periodo-label">Período:</span>
                <div class="dash-periodo-tabs" role="tablist">
                    <button class="periodo-tab" data-periodo="7" role="tab">7 dias</button>
                    <button class="periodo-tab active" data-periodo="30" role="tab">30 dias</button>
                    <button class="periodo-tab" data-periodo="90" role="tab">90 dias</button>
                </div>
            </div>
        </div>

        <div class="dash-kpis">
            <div class="kpi-card kpi-primary">
                <div class="kpi-header">
                    <span class="kpi-label">Receita do mês</span>
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="kpi-value" id="kpiReceita">—</div>
                <div class="kpi-sub-row">
                    <span class="kpi-sub" id="kpiReceitaMoM">&nbsp;</span>
                    <span class="kpi-sub" id="kpiReceitaYoY">&nbsp;</span>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label">Pedidos em andamento</span>
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="kpi-value" id="kpiAndamento">—</div>
                <div class="kpi-sub">Pendentes, processando e enviados</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label" id="kpiTicketLabel">Ticket médio</span>
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="kpi-value" id="kpiTicket">—</div>
                <div class="kpi-sub" id="kpiTicketSub">&nbsp;</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header">
                    <span class="kpi-label" id="kpiConversaoLabel">Conversão de orçamentos</span>
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="kpi-value" id="kpiConversao">—</div>
                <div class="kpi-sub">Aprovados/convertidos no período</div>
            </div>
        </div>

        <div class="dash-grid">
            <div class="card dash-col-span-2">
                <div class="card-title-row">
                    <h2 class="card-title" id="receitaTitulo">Receita diária</h2>
                    <span class="card-hint" id="receitaPeriodoTotal"></span>
                </div>
                <div class="chart-container chart-tall">
                    <canvas id="chartReceita"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-title-row">
                    <h2 class="card-title">Pedidos por status</h2>
                    <span class="card-hint drill-hint">Clique para ver</span>
                </div>
                <div class="chart-container">
                    <canvas id="chartStatusPedidos"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-title-row">
                    <h2 class="card-title">Funil de orçamentos</h2>
                    <span class="card-hint drill-hint">Clique para ver</span>
                </div>
                <div id="funilOrcamentos" class="funil-list"></div>
            </div>
            <div class="card">
                <div class="card-title-row">
                    <h2 class="card-title" id="topProdutosTitulo">Top 5 produtos</h2>
                    <span class="card-hint drill-hint">Clique para ver</span>
                </div>
                <div class="chart-container">
                    <canvas id="chartTopProdutos"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-title-row">
                    <h2 class="card-title" id="topClientesTitulo">Top 5 clientes</h2>
                    <span class="card-hint drill-hint">Clique para ver</span>
                </div>
                <div class="chart-container">
                    <canvas id="chartTopClientes"></canvas>
                </div>
            </div>
        </div>

        <div class="dash-alertas">
            <div class="card alerta-card">
                <div class="card-title-row">
                    <h2 class="card-title"><i class="fas fa-triangle-exclamation"></i> Estoque crítico</h2>
                    <span class="badge badge-warn" id="badgeEstoque">0</span>
                </div>
                <div id="listaEstoque" class="alerta-lista"></div>
            </div>
            <div class="card alerta-card">
                <div class="card-title-row">
                    <h2 class="card-title"><i class="fas fa-clock"></i> Pedidos atrasados</h2>
                    <span class="badge badge-danger" id="badgeAtrasados">0</span>
                </div>
                <div id="listaAtrasados" class="alerta-lista"></div>
            </div>
            <div class="card alerta-card">
                <div class="card-title-row">
                    <h2 class="card-title"><i class="fas fa-hourglass-half"></i> Orçamentos vencendo</h2>
                    <span class="badge badge-warn" id="badgeVencendo">0</span>
                </div>
                <div id="listaVencendo" class="alerta-lista"></div>
            </div>
        </div>
    `
};

const dashboardState = {
    charts: {},
    periodo: 30,
    topProdutosDados: [],
    topClientesDados: [],
    statusPedidosDados: []
};

const CORES_STATUS_PEDIDO = {
    pendente: '#f59e0b',
    processando: '#3b82f6',
    enviado: '#8b5cf6',
    entregue: '#10b981',
    cancelado: '#9ca3af'
};

const LABELS_STATUS_PEDIDO = {
    pendente: 'Pendente',
    processando: 'Processando',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
};

const ORDEM_FUNIL_ORCAMENTO = ['pendente', 'aprovado', 'convertido', 'recusado'];
const LABELS_STATUS_ORCAMENTO = {
    pendente: 'Pendentes',
    aprovado: 'Aprovados',
    convertido: 'Convertidos em pedido',
    recusado: 'Recusados'
};

export function inicializarDashboard() {
    destruirChartsDashboard();
    configurarSeletorPeriodo();
    configurarDrillDownLaterais();
    carregarDashboard();
}

function configurarSeletorPeriodo() {
    const tabs = document.querySelectorAll('.periodo-tab');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const novoPeriodo = Number(btn.dataset.periodo);
            if (novoPeriodo === dashboardState.periodo) return;
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            dashboardState.periodo = novoPeriodo;
            carregarDashboard();
        });
    });
}

function configurarDrillDownLaterais() {
    // Funil de orçamentos → página de orçamentos
    const funil = document.getElementById('funilOrcamentos');
    if (funil) {
        funil.style.cursor = 'pointer';
        funil.addEventListener('click', () => navigateTo('orcamentos'));
    }
}

async function carregarDashboard() {
    try {
        const resposta = await getAPI(`/api/dashboard/resumo?periodo=${dashboardState.periodo}`);
        if (!resposta.sucesso) {
            mostrarErro('Erro ao carregar dashboard');
            return;
        }
        const dados = resposta.dados;
        const dias = dados.periodo_dias || dashboardState.periodo;

        atualizarTitulosPorPeriodo(dias);

        dashboardState.topProdutosDados = dados.top_produtos || [];
        dashboardState.topClientesDados = dados.top_clientes || [];
        dashboardState.statusPedidosDados = dados.pedidos_por_status || [];

        renderKPIs(dados.kpis);
        renderChartReceita(dados.receita_diaria, dias);
        renderChartStatusPedidos(dados.pedidos_por_status);
        renderFunilOrcamentos(dados.orcamentos_por_status);
        renderChartTopProdutos(dados.top_produtos);
        renderChartTopClientes(dados.top_clientes);
        renderAlertas(dados.alertas);
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
    }
}

function atualizarTitulosPorPeriodo(dias) {
    const sufixo = `${dias} dias`;
    document.getElementById('receitaTitulo').textContent = `Receita diária (últimos ${sufixo})`;
    document.getElementById('topProdutosTitulo').textContent = `Top 5 produtos (${sufixo})`;
    document.getElementById('topClientesTitulo').textContent = `Top 5 clientes (${sufixo})`;
    document.getElementById('kpiTicketLabel').textContent = `Ticket médio (${sufixo})`;
    document.getElementById('kpiConversaoLabel').textContent = `Conversão de orçamentos (${sufixo})`;
}

function destruirChartsDashboard() {
    Object.values(dashboardState.charts).forEach(c => c?.destroy?.());
    dashboardState.charts = {};
}

function renderKPIs(kpis) {
    document.getElementById('kpiReceita').textContent = formatarMoeda(kpis.receita_mes);

    aplicarVariacao(document.getElementById('kpiReceitaMoM'), kpis.variacao_mom, 'MoM');
    aplicarVariacao(document.getElementById('kpiReceitaYoY'), kpis.variacao_yoy, 'YoY');

    document.getElementById('kpiAndamento').textContent = kpis.pedidos_em_andamento.toLocaleString('pt-BR');
    document.getElementById('kpiTicket').textContent = formatarMoeda(kpis.ticket_medio);
    document.getElementById('kpiTicketSub').textContent = `Base: ${kpis.total_clientes} clientes · ${kpis.total_produtos} produtos ativos`;
    document.getElementById('kpiConversao').textContent = `${kpis.taxa_conversao_orcamentos.toFixed(1)}%`;
}

function aplicarVariacao(el, variacao, sufixo) {
    if (!el) return;
    if (variacao === null || variacao === undefined) {
        el.textContent = `— ${sufixo} (sem base de comparação)`;
        el.className = 'kpi-sub';
        return;
    }
    const sinal = variacao >= 0 ? '▲' : '▼';
    el.textContent = `${sinal} ${Math.abs(variacao).toFixed(1)}% ${sufixo}`;
    el.className = 'kpi-sub ' + (variacao >= 0 ? 'kpi-up' : 'kpi-down');
}

function renderChartReceita(serie, dias) {
    const canvas = document.getElementById('chartReceita');
    if (!canvas) return;

    const chaveLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const mapa = new Map(serie.map(s => [String(s.data).slice(0, 10), Number(s.valor) || 0]));
    const labels = [];
    const valores = [];
    let total = 0;

    for (let i = dias - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const valor = mapa.get(chaveLocal(d)) || 0;
        labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        valores.push(valor);
        total += valor;
    }

    document.getElementById('receitaPeriodoTotal').textContent = `Total: ${formatarMoeda(total)}`;

    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, 'rgba(0, 102, 204, 0.35)');
    grad.addColorStop(1, 'rgba(0, 102, 204, 0.02)');

    const maxTicks = dias <= 7 ? 7 : (dias <= 30 ? 10 : 12);

    dashboardState.charts.receita = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Receita',
                data: valores,
                borderColor: '#0066cc',
                backgroundColor: grad,
                fill: true,
                tension: 0.35,
                pointRadius: dias <= 30 ? 3 : 1,
                pointHoverRadius: 6,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: () => navigateTo('pedidos'),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatarMoeda(ctx.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => formatarMoedaCurto(v) },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: maxTicks }
                }
            }
        }
    });

    canvas.style.cursor = 'pointer';
}

function renderChartStatusPedidos(dados) {
    const canvas = document.getElementById('chartStatusPedidos');
    if (!canvas) return;

    if (!dados || dados.length === 0) {
        canvas.parentElement.innerHTML = '<p class="empty-chart">Nenhum pedido registrado</p>';
        return;
    }

    const labels = dados.map(d => LABELS_STATUS_PEDIDO[d.status] || d.status);
    const valores = dados.map(d => Number(d.total));
    const cores = dados.map(d => CORES_STATUS_PEDIDO[d.status] || '#6b7280');

    dashboardState.charts.status = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            onClick: (_, elements) => {
                if (!elements.length) return navigateTo('pedidos');
                navigateTo('pedidos');
            },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
            }
        }
    });

    canvas.style.cursor = 'pointer';
}

function renderFunilOrcamentos(dados) {
    const container = document.getElementById('funilOrcamentos');
    if (!container) return;

    const mapa = new Map(dados.map(d => [d.status, d]));
    const total = dados.reduce((s, d) => s + Number(d.total || 0), 0);

    if (total === 0) {
        container.innerHTML = '<p class="empty-chart">Nenhum orçamento registrado</p>';
        return;
    }

    container.innerHTML = ORDEM_FUNIL_ORCAMENTO.map(status => {
        const item = mapa.get(status);
        const qtd = item ? Number(item.total) : 0;
        const valor = item ? Number(item.valor) : 0;
        const pct = total > 0 ? (qtd / total) * 100 : 0;
        const cor = {
            pendente: '#f59e0b',
            aprovado: '#3b82f6',
            convertido: '#10b981',
            recusado: '#ef4444'
        }[status];

        return `
            <div class="funil-item">
                <div class="funil-header">
                    <span class="funil-label">${LABELS_STATUS_ORCAMENTO[status]}</span>
                    <span class="funil-qtd">${qtd} · ${formatarMoeda(valor)}</span>
                </div>
                <div class="funil-barra-bg">
                    <div class="funil-barra" style="width: ${pct}%; background: ${cor};"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderChartTopProdutos(dados) {
    const canvas = document.getElementById('chartTopProdutos');
    if (!canvas) return;

    if (!dados || dados.length === 0) {
        canvas.parentElement.innerHTML = '<p class="empty-chart">Sem vendas no período</p>';
        return;
    }

    dashboardState.charts.topProdutos = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.nome || 'Sem nome'),
            datasets: [{
                label: 'Valor vendido',
                data: dados.map(d => Number(d.valor) || 0),
                backgroundColor: '#0066cc',
                hoverBackgroundColor: '#003d99',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            onClick: () => navigateTo('produtos'),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const d = dados[ctx.dataIndex];
                            return `${formatarMoeda(ctx.parsed.x)} · ${d.quantidade} un.`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { callback: v => formatarMoedaCurto(v) },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: { grid: { display: false } }
            }
        }
    });

    canvas.style.cursor = 'pointer';
}

function renderChartTopClientes(dados) {
    const canvas = document.getElementById('chartTopClientes');
    if (!canvas) return;

    if (!dados || dados.length === 0) {
        canvas.parentElement.innerHTML = '<p class="empty-chart">Sem pedidos no período</p>';
        return;
    }

    dashboardState.charts.topClientes = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dados.map(d => d.nome || 'Sem nome'),
            datasets: [{
                label: 'Faturamento',
                data: dados.map(d => Number(d.valor) || 0),
                backgroundColor: '#003d99',
                hoverBackgroundColor: '#0066cc',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            onClick: () => navigateTo('clientes'),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const d = dados[ctx.dataIndex];
                            return `${formatarMoeda(ctx.parsed.x)} · ${d.pedidos} pedido(s)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { callback: v => formatarMoedaCurto(v) },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: { grid: { display: false } }
            }
        }
    });

    canvas.style.cursor = 'pointer';
}

function renderAlertas(alertas) {
    const estoque = alertas.estoque_critico || [];
    const atrasados = alertas.pedidos_atrasados || [];
    const vencendo = alertas.orcamentos_vencendo || [];

    document.getElementById('badgeEstoque').textContent = estoque.length;
    document.getElementById('badgeAtrasados').textContent = atrasados.length;
    document.getElementById('badgeVencendo').textContent = vencendo.length;

    const listaEstoque = document.getElementById('listaEstoque');
    listaEstoque.innerHTML = estoque.length
        ? estoque.map(p => `
            <div class="alerta-item" data-nav="produtos">
                <div class="alerta-info">
                    <strong>${escapeHtml(p.nome)}</strong>
                    <span class="alerta-meta">${escapeHtml(p.categoria || 'Sem categoria')}</span>
                </div>
                <span class="alerta-valor ${p.estoque === 0 ? 'alerta-danger' : 'alerta-warn'}">${p.estoque} un.</span>
            </div>
        `).join('')
        : '<p class="empty-lista">Nenhum produto com estoque crítico</p>';

    const listaAtrasados = document.getElementById('listaAtrasados');
    listaAtrasados.innerHTML = atrasados.length
        ? atrasados.map(p => `
            <div class="alerta-item" data-nav="pedidos">
                <div class="alerta-info">
                    <strong>${escapeHtml(p.numero)} — ${escapeHtml(p.cliente || 'Sem cliente')}</strong>
                    <span class="alerta-meta">Previsto: ${formatarData(p.data_entrega_prevista)} · ${escapeHtml(p.status)}</span>
                </div>
                <span class="alerta-valor alerta-danger">${p.dias_atraso}d</span>
            </div>
        `).join('')
        : '<p class="empty-lista">Sem pedidos atrasados</p>';

    const listaVencendo = document.getElementById('listaVencendo');
    listaVencendo.innerHTML = vencendo.length
        ? vencendo.map(o => `
            <div class="alerta-item" data-nav="orcamentos">
                <div class="alerta-info">
                    <strong>${escapeHtml(o.numero || '-')} — ${escapeHtml(o.cliente || 'Sem cliente')}</strong>
                    <span class="alerta-meta">${formatarMoeda(o.valor_total)} · vence ${formatarData(o.data_validade)}</span>
                </div>
                <span class="alerta-valor alerta-warn">${o.dias_restantes}d</span>
            </div>
        `).join('')
        : '<p class="empty-lista">Nenhum orçamento vence nos próximos 7 dias</p>';

    // Drill-down nas listas de alertas
    [listaEstoque, listaAtrasados, listaVencendo].forEach(container => {
        container.querySelectorAll('.alerta-item[data-nav]').forEach(item => {
            item.addEventListener('click', () => navigateTo(item.dataset.nav));
        });
    });
}

function formatarMoedaCurto(valor) {
    const n = Number(valor) || 0;
    if (Math.abs(n) >= 1_000_000) return 'R$ ' + (n / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1_000) return 'R$ ' + (n / 1_000).toFixed(1) + 'k';
    return 'R$ ' + n.toFixed(0);
}

function escapeHtml(texto) {
    if (texto === null || texto === undefined) return '';
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
