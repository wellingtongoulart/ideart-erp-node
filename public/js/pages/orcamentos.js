/**
 * Página de Orçamentos — versão refatorada
 * Fluxo completo: listagem, novo/editar com itens, aprovar/recusar, exportação PDF/Excel.
 */

import { formatarMoeda, formatarData } from '../utils.js';
import { DataTable } from '../data-table.js';

let tabelaOrcamentos = null;
let tabelaProdutosModal = null;

export const orcamentosPage = {
    title: 'Orçamentos',
    content: `
        <!-- LISTAGEM -->
        <div id="orcamentosListaView" class="card">
            <div class="card-header-row">
                <h2 class="card-title">Gerenciamento de Orçamentos</h2>
                <div class="btn-group">
                    <button class="btn btn-primary" id="novoOrcamentoBtn">
                        <i class="fas fa-plus"></i> Novo Orçamento
                    </button>
                </div>
            </div>

            <div id="orcamentosTableMount"></div>
        </div>

        <!-- FORMULÁRIO (NOVO/EDITAR) -->
        <div id="orcamentosFormView" style="display:none;">
            <div class="card">
                <div class="card-header-row">
                    <h2 class="card-title" id="orcFormTitulo">Novo Orçamento</h2>
                    <div class="btn-group">
                        <button class="btn btn-secondary" id="orcVoltarBtn">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                        <button class="btn btn-primary" id="orcSalvarBtn">
                            <i class="fas fa-save"></i> Salvar Orçamento
                        </button>
                    </div>
                </div>

                <!-- Base em outro orçamento -->
                <div class="alert alert-info" id="orcBaseCard" style="display:none;">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                        <span><i class="fas fa-info-circle"></i> Deseja utilizar os dados de outro orçamento já cadastrado como base?</span>
                        <div>
                            <button class="btn btn-primary btn-small" id="orcUsarBaseBtn">Sim, selecionar</button>
                            <button class="btn btn-secondary btn-small" id="orcNaoUsarBaseBtn">Não, começar em branco</button>
                        </div>
                    </div>
                </div>

                <!-- Dados do Cliente -->
                <h3 class="section-title">Dados do Cliente</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="orcClienteSelect">Cliente *</label>
                        <select id="orcClienteSelect"><option value="">Selecione...</option></select>
                    </div>
                    <div class="form-group">
                        <label for="orcProfissionalSelect">Profissional Vinculado</label>
                        <select id="orcProfissionalSelect"><option value="">Nenhum</option></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="text" id="orcClienteEmail" disabled />
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" id="orcClienteTelefone" disabled />
                    </div>
                </div>

                <!-- Produtos -->
                <h3 class="section-title">Produtos/Serviços por Ambiente</h3>

                <div class="form-row orc-ambiente-row-topo">
                    <div class="form-group">
                        <label for="orcAmbienteAtual">Ambiente atual (novos itens vão para este ambiente)</label>
                        <input type="text" id="orcAmbienteAtual" list="orcAmbientesList"
                               placeholder="Ex: Sala, Cozinha, Suíte Master..." autocomplete="off" />
                        <datalist id="orcAmbientesList"></datalist>
                    </div>
                </div>

                <div class="btn-group" style="margin-bottom: 0.75rem;">
                    <button class="btn btn-primary btn-small" id="orcAddProdutoCadBtn">
                        <i class="fas fa-plus"></i> Incluir produto cadastrado
                    </button>
                    <button class="btn btn-secondary btn-small" id="orcAddProdutoCustomBtn">
                        <i class="fas fa-edit"></i> Incluir produto/serviço personalizado
                    </button>
                </div>

                <div class="table-wrapper">
                    <table id="orcItensTable" class="orc-itens-table">
                        <thead>
                            <tr>
                                <th style="width:70px;">Ordem</th>
                                <th style="width:110px;">Código</th>
                                <th>Nome</th>
                                <th style="width:110px;">Cor</th>
                                <th style="width:110px;">Tamanho</th>
                                <th style="width:80px;">Qtd</th>
                                <th style="width:120px;">Valor unit.</th>
                                <th style="width:110px;">Valor total</th>
                                <th style="width:60px;"></th>
                            </tr>
                        </thead>
                        <tbody id="orcItensTbody">
                            <tr><td colspan="9" style="text-align:center; color:#999;">Nenhum item adicionado</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Detalhes / Resumo -->
                <h3 class="section-title">Detalhes</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data de Emissão</label>
                        <input type="date" id="orcDataEmissao" />
                    </div>
                    <div class="form-group">
                        <label>Válido até</label>
                        <input type="date" id="orcDataValidade" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Forma de Pagamento</label>
                        <select id="orcFormaPagamento">
                            <option value="">Selecione...</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="Débito">Débito</option>
                            <option value="Crédito">Crédito</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Transferência">Transferência</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Desconto (%)</label>
                        <input type="number" id="orcDesconto" step="0.01" min="0" max="100" value="0" />
                    </div>
                </div>

                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="orcObservacoes" rows="3" placeholder="Informações adicionais..."></textarea>
                </div>
                <div class="form-group">
                    <label>Assinatura (nome do responsável)</label>
                    <input type="text" id="orcAssinatura" placeholder="Nome de quem assinou" />
                </div>

                <div class="totals-box">
                    <div><span>Subtotal:</span> <strong id="orcSubtotal">R$ 0,00</strong></div>
                    <div><span>Desconto:</span> <strong id="orcDescontoValor">R$ 0,00</strong></div>
                    <div class="total-final"><span>Total com desconto:</span> <strong id="orcTotalFinal">R$ 0,00</strong></div>
                </div>
            </div>
        </div>

        <!-- MODAL: selecionar produto cadastrado -->
        <div class="modal" id="orcModalProduto">
            <div class="modal-content" style="max-width: 1000px;">
                <div class="modal-header">
                    <h3>Selecionar Produtos</h3>
                    <button class="modal-close" id="orcModalProdutoClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="orcProdutoTableMount"></div>

                    <div class="orc-selecionados-box">
                        <div class="orc-selecionados-header">
                            <strong>Produtos selecionados (<span id="orcSelecionadosCount">0</span>)</strong>
                            <button class="btn btn-secondary btn-small" id="orcSelecionadosLimpar" type="button">
                                <i class="fas fa-eraser"></i> Limpar lista
                            </button>
                        </div>
                        <div class="table-wrapper" style="max-height:220px; overflow-y:auto;">
                            <table class="orc-selecionados-table">
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Nome</th>
                                        <th style="width:90px;">Qtd</th>
                                        <th style="width:110px;">Valor unit.</th>
                                        <th style="width:110px;">Subtotal</th>
                                        <th style="width:40px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="orcSelecionadosTbody">
                                    <tr><td colspan="6" style="text-align:center; color:#999;">Nenhum produto selecionado</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="orcModalProdutoCancelar" type="button">Cancelar</button>
                    <button class="btn btn-primary" id="orcModalProdutoConfirmar" type="button">
                        <i class="fas fa-check"></i> Inserir no orçamento
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL: produto customizado -->
        <div class="modal" id="orcModalCustom">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Incluir produto/serviço personalizado</h3>
                    <button class="modal-close" id="orcModalCustomClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Código</label>
                        <input type="text" id="orcCustomCodigo" placeholder="SKU ou código interno (opcional)" />
                    </div>
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" id="orcCustomNome" />
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea id="orcCustomDescricao" rows="2"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cor</label>
                            <input type="text" id="orcCustomCor" placeholder="Opcional" />
                        </div>
                        <div class="form-group">
                            <label>Tamanho</label>
                            <input type="text" id="orcCustomTamanho" placeholder="Opcional" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quantidade *</label>
                            <input type="number" id="orcCustomQtd" value="1" min="1" />
                        </div>
                        <div class="form-group">
                            <label>Valor Unitário *</label>
                            <input type="number" id="orcCustomPreco" step="0.01" min="0" value="0" />
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="orcCustomCancelar">Cancelar</button>
                    <button class="btn btn-primary" id="orcCustomAdicionar">Adicionar</button>
                </div>
            </div>
        </div>

        <!-- MODAL: selecionar orçamento base -->
        <div class="modal" id="orcModalBase">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Selecionar orçamento como base</h3>
                    <button class="modal-close" id="orcModalBaseClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" id="orcBuscaBase" placeholder="Filtrar por nº ou cliente..." />
                    </div>
                    <div class="table-wrapper" style="max-height:400px; overflow-y:auto;">
                        <table>
                            <thead>
                                <tr><th>Nº</th><th>Cliente</th><th>Data</th><th>Valor</th><th></th></tr>
                            </thead>
                            <tbody id="orcListaBase"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
};

// `desconto` é armazenado como percentual (0-100); `valor_total` é o bruto.
// O total exibido nas listagens/impressões precisa aplicar o desconto.
function calcularTotalComDesconto(registro) {
    const bruto = Number(registro?.valor_total) || 0;
    let perc = Number(registro?.desconto) || 0;
    if (perc < 0) perc = 0;
    if (perc > 100) perc = 100;
    return bruto * (1 - perc / 100);
}

// ====== Estado da página ======
const orcState = {
    modoEdicao: false,
    editingId: null,
    itens: [],        // {produto_id|null, nome, nome_customizado, sku, ambiente, tamanho, cor, quantidade, preco_unitario, ...}
    originalSnapshot: null,  // snapshot dos dados carregados para detectar alterações
    produtosCache: [],
    clientes: [],
    profissionais: [],
    produtosSelecionados: []  // staging do modal de produtos (antes de inserir no orçamento)
};

// ====== Utilidades de ambientes ======
function ambienteAtual() {
    const el = document.getElementById('orcAmbienteAtual');
    return el ? (el.value || '').trim() : '';
}

function listarAmbientes() {
    const set = new Set();
    orcState.itens.forEach((it) => {
        const amb = (it.ambiente || '').trim();
        if (amb) set.add(amb);
    });
    return Array.from(set);
}

function atualizarDatalistAmbientes() {
    const dl = document.getElementById('orcAmbientesList');
    if (!dl) return;
    const existentes = listarAmbientes();
    dl.innerHTML = existentes.map((a) => `<option value="${escaparHtml(a)}"></option>`).join('');
}

function escaparHtml(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ====== Inicialização ======
export function inicializarOrcamentos() {
    adicionarEstilosOrcamento();
    inicializarTabelaOrcamentos();

    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('novoOrcamentoBtn', 'click', abrirFormularioNovo);
    on('orcVoltarBtn', 'click', voltarParaLista);
    on('orcSalvarBtn', 'click', salvarOrcamento);

    on('orcClienteSelect', 'change', atualizarCamposCliente);

    on('orcAddProdutoCadBtn', 'click', abrirModalProduto);
    on('orcAddProdutoCustomBtn', 'click', abrirModalCustom);

    on('orcModalProdutoClose', 'click', cancelarSelecaoProdutos);
    on('orcModalProdutoCancelar', 'click', cancelarSelecaoProdutos);
    on('orcModalProdutoConfirmar', 'click', confirmarProdutosSelecionados);
    on('orcSelecionadosLimpar', 'click', limparProdutosSelecionados);
    on('orcModalCustomClose', 'click', () => fecharModal('orcModalCustom'));
    on('orcModalBaseClose', 'click', () => fecharModal('orcModalBase'));

    inicializarTabelaProdutosModal();

    on('orcBuscaBase', 'input', filtrarListaBase);

    on('orcCustomCancelar', 'click', () => fecharModal('orcModalCustom'));
    on('orcCustomAdicionar', 'click', adicionarItemCustomizado);

    on('orcDesconto', 'input', recalcularTotais);

    on('orcUsarBaseBtn', 'click', abrirModalBase);
    on('orcNaoUsarBaseBtn', 'click', () => {
        const c = document.getElementById('orcBaseCard'); if (c) c.style.display = 'none';
    });
}

// ====== Listagem ======
function inicializarTabelaOrcamentos() {
    tabelaOrcamentos = new DataTable({
        mount: document.getElementById('orcamentosTableMount'),
        endpoint: '/api/orcamentos',
        tamanhoPagina: 10,
        ordenacaoPadrao: { chave: 'criado_em', direcao: 'desc' },
        filtrosSalvos: { contexto: 'orcamentos_lista' },
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Buscar por nº ou cliente...' },
            { chave: 'status', tipo: 'select',
              placeholder: 'Todos os status',
              opcoes: [
                { valor: 'pendente', rotulo: 'Pendente' },
                { valor: 'aprovado', rotulo: 'Aprovado' },
                { valor: 'recusado', rotulo: 'Recusado' },
                { valor: 'expirado', rotulo: 'Expirado' },
                { valor: 'convertido', rotulo: 'Convertido' }
            ]},
            { tipo: 'date-range', rotulo: 'Data criação',
              chaveMin: 'data_criacao_inicio', chaveMax: 'data_criacao_fim' },
            { tipo: 'date-range', rotulo: 'Validade',
              chaveMin: 'data_validade_inicio', chaveMax: 'data_validade_fim' },
            { tipo: 'number-range', rotulo: 'Valor',
              chaveMin: 'valor_min', chaveMax: 'valor_max',
              step: '0.01', placeholderMin: 'R$ mín', placeholderMax: 'R$ máx' }
        ],
        colunas: [
            { chave: 'numero', rotulo: 'Nº', ordenavel: true,
              formatar: (o) => o.numero || o.id },
            { chave: 'cliente_nome', rotulo: 'Cliente', ordenavel: true,
              formatar: (o) => o.cliente_nome || '-' },
            { chave: 'data_criacao', rotulo: 'Data', ordenavel: true,
              formatar: (o) => formatarData(o.data_criacao) },
            { chave: 'data_validade', rotulo: 'Validade', ordenavel: true,
              formatar: (o) => formatarData(o.data_validade) },
            { chave: 'valor_total', rotulo: 'Valor', ordenavel: true,
              formatar: (o) => formatarMoeda(calcularTotalComDesconto(o)) },
            { chave: 'status', rotulo: 'Status', ordenavel: true,
              formatar: (o) => `<span class="status-badge" style="background:${corStatusOrc(o.status)};color:#fff;padding:.25rem .5rem;border-radius:4px;font-size:.85rem;">${o.status}</span>` }
        ],
        acoes: (o) => renderAcoesOrcamento(o),
        larguraAcoes: '260px'
    });
    tabelaOrcamentos.inicializar();
}

function recarregarOrcamentos() {
    if (tabelaOrcamentos) tabelaOrcamentos.recarregar();
}

function renderAcoesOrcamento(o) {
    const podeAprovar = o.status === 'pendente';
    return `
        <div class="acoes-stack">
            <div class="acoes-row">
                <button class="btn btn-secondary btn-small" onclick="editarOrcamento(${o.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-small" onclick="exportarOrcamentoPDF(${o.id})" title="Exportar PDF">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button class="btn btn-secondary btn-small" onclick="exportarOrcamentoExcel(${o.id})" title="Exportar Excel">
                    <i class="fas fa-file-excel"></i>
                </button>
                <button class="btn btn-secondary btn-small" style="color:#c62828;border-color:#c62828" onclick="deletarOrcamento(${o.id})" title="Deletar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${podeAprovar ? `
                <div class="acoes-row acoes-row-secundaria">
                    <button class="btn btn-primary btn-small acao-aprovar" onclick="aprovarOrcamento(${o.id})">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                    <button class="btn btn-secondary btn-small acao-recusar" onclick="recusarOrcamento(${o.id})">
                        <i class="fas fa-times"></i> Recusar
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function corStatusOrc(status) {
    const cores = {
        pendente: '#ff9800',
        aprovado: '#2e7d32',
        recusado: '#c62828',
        expirado: '#9e9e9e',
        convertido: '#1976d2'
    };
    return cores[status] || '#1976d2';
}

// ====== Navegação lista <-> formulário ======
function mostrarView(lista) {
    document.getElementById('orcamentosListaView').style.display = lista ? 'block' : 'none';
    document.getElementById('orcamentosFormView').style.display = lista ? 'none' : 'block';
}

async function abrirFormularioNovo() {
    orcState.modoEdicao = false;
    orcState.editingId = null;
    orcState.itens = [];
    orcState.originalSnapshot = null;

    document.getElementById('orcFormTitulo').textContent = 'Novo Orçamento';
    document.getElementById('orcBaseCard').style.display = 'block';

    limparFormulario();
    await Promise.all([carregarClientesOrc(), carregarProfissionaisOrc(), carregarProdutosCache()]);
    renderizarItens();
    recalcularTotais();
    mostrarView(false);
}

export async function editarOrcamento(id) {
    orcState.modoEdicao = true;
    orcState.editingId = id;
    document.getElementById('orcFormTitulo').textContent = `Editar Orçamento #${id}`;
    document.getElementById('orcBaseCard').style.display = 'none';

    limparFormulario();
    await Promise.all([carregarClientesOrc(), carregarProfissionaisOrc(), carregarProdutosCache()]);

    try {
        const res = await fetch(`/api/orcamentos/${id}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem || 'Erro');
        const o = data.dados;

        document.getElementById('orcClienteSelect').value = o.cliente_id || '';
        document.getElementById('orcProfissionalSelect').value = o.profissional_id || '';
        document.getElementById('orcDataEmissao').value = (o.data_criacao || '').split('T')[0] || '';
        document.getElementById('orcDataValidade').value = (o.data_validade || '').split('T')[0] || '';
        document.getElementById('orcFormaPagamento').value = o.forma_pagamento || '';
        document.getElementById('orcDesconto').value = o.desconto || 0;
        document.getElementById('orcObservacoes').value = o.observacoes || '';
        document.getElementById('orcAssinatura').value = o.assinatura || '';
        atualizarCamposCliente();

        orcState.itens = (o.itens || []).map(it => ({
            produto_id: it.produto_id,
            nome: it.produto_nome || it.nome_customizado,
            nome_customizado: it.produto_id ? null : it.nome_customizado,
            codigo_customizado: it.produto_id ? null : (it.codigo_customizado || ''),
            descricao_customizada: it.descricao_customizada,
            sku: it.sku || '-',
            ambiente: it.ambiente || '',
            tamanho: it.tamanho || '',
            cor: it.cor || '',
            quantidade: Number(it.quantidade) || 1,
            preco_unitario: Number(it.preco_unitario) || 0
        }));

        renderizarItens();
        recalcularTotais();
        orcState.originalSnapshot = snapshotFormulario();
        mostrarView(false);
    } catch (erro) {
        console.error(erro);
        alert('Erro ao carregar orçamento para edição');
    }
}

function limparFormulario() {
    ['orcClienteSelect','orcProfissionalSelect','orcDataEmissao','orcDataValidade',
     'orcFormaPagamento','orcObservacoes','orcAssinatura','orcClienteEmail','orcClienteTelefone',
     'orcAmbienteAtual']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('orcDesconto').value = 0;
    orcState.itens = [];
}

async function voltarParaLista() {
    if (orcState.modoEdicao || orcState.itens.length > 0) {
        const atual = snapshotFormulario();
        const alterado = JSON.stringify(atual) !== JSON.stringify(orcState.originalSnapshot || {});
        if (alterado) {
            const ok = confirm('Você tem alterações não salvas. Deseja realmente voltar?');
            if (!ok) return;
        }
    }
    mostrarView(true);
    recarregarOrcamentos();
}

function snapshotFormulario() {
    return {
        cliente_id: document.getElementById('orcClienteSelect').value,
        profissional_id: document.getElementById('orcProfissionalSelect').value,
        data_emissao: document.getElementById('orcDataEmissao').value,
        data_validade: document.getElementById('orcDataValidade').value,
        forma_pagamento: document.getElementById('orcFormaPagamento').value,
        desconto: document.getElementById('orcDesconto').value,
        observacoes: document.getElementById('orcObservacoes').value,
        assinatura: document.getElementById('orcAssinatura').value,
        itens: JSON.parse(JSON.stringify(orcState.itens))
    };
}

// ====== Dropdowns de apoio ======
// Nomes prefixados com "orc" para evitar colisão global com funções de mesmo nome
// nas páginas de clientes/profissionais.
async function carregarClientesOrc() {
    try {
        const res = await fetch('/api/clientes?limite=500');
        const data = await res.json();
        orcState.clientes = data.dados || [];
        const sel = document.getElementById('orcClienteSelect');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione...</option>' +
            orcState.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    } catch (_) {}
}

async function carregarProfissionaisOrc() {
    try {
        const res = await fetch('/api/profissionais?limite=500');
        const data = await res.json();
        orcState.profissionais = data.dados || [];
        const sel = document.getElementById('orcProfissionalSelect');
        if (!sel) return;
        sel.innerHTML = '<option value="">Nenhum</option>' +
            orcState.profissionais.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    } catch (_) {}
}

async function carregarProdutosCache() {
    try {
        const res = await fetch('/api/produtos?limite=1000&ativo=true');
        const data = await res.json();
        orcState.produtosCache = data.dados || [];
    } catch (_) {}
}

function atualizarCamposCliente() {
    const id = parseInt(document.getElementById('orcClienteSelect').value);
    const c = orcState.clientes.find(x => x.id === id);
    document.getElementById('orcClienteEmail').value = c ? (c.email || '') : '';
    document.getElementById('orcClienteTelefone').value = c ? (c.telefone || '') : '';
}

// ====== Tabela de itens (agrupada por ambiente) ======
// Retorna a ordem canônica dos ambientes: primeira ocorrência no array de itens
// define a ordem. Itens sem ambiente vão para o grupo "(Sem ambiente)".
function ordemAmbientes() {
    const vistos = [];
    orcState.itens.forEach((it) => {
        const amb = (it.ambiente || '').trim() || '(Sem ambiente)';
        if (!vistos.includes(amb)) vistos.push(amb);
    });
    return vistos;
}

function renderizarItens() {
    const tbody = document.getElementById('orcItensTbody');
    if (!tbody) return;

    atualizarDatalistAmbientes();

    if (orcState.itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;">Nenhum item adicionado</td></tr>';
        return;
    }

    const ambientes = ordemAmbientes();
    const linhas = [];
    // Renderiza cada ambiente como uma seção com cabeçalho + linhas de itens.
    // A "ordem" exibida é contínua entre ambientes (1, 2, 3, ...), batendo com o PDF.
    let numeroLinha = 1;
    ambientes.forEach((ambiente) => {
        const itensDoAmbiente = orcState.itens
            .map((it, idx) => ({ it, idx }))
            .filter(({ it }) => ((it.ambiente || '').trim() || '(Sem ambiente)') === ambiente);

        linhas.push(`
            <tr class="orc-ambiente-header">
                <td colspan="9">
                    <span class="orc-ambiente-nome">
                        <i class="fas fa-folder-open"></i>
                        <input type="text" class="orc-ambiente-edit" value="${escaparHtml(ambiente === '(Sem ambiente)' ? '' : ambiente)}"
                               placeholder="(Sem ambiente)"
                               onchange="renomearAmbiente('${escaparAspas(ambiente)}', this.value)" />
                    </span>
                    <span class="orc-ambiente-acoes">
                        <button class="btn-icone" onclick="removerAmbiente('${escaparAspas(ambiente)}')" title="Remover ambiente e seus itens" style="color:#c62828;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </span>
                </td>
            </tr>
        `);

        itensDoAmbiente.forEach(({ it, idx }, posGrupo) => {
            const subtotal = (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0);
            const primeiro = posGrupo === 0;
            const ultimo = posGrupo === itensDoAmbiente.length - 1;
            linhas.push(`
                <tr>
                    <td class="orc-col-ordem">
                        <span class="orc-ordem-num">${String(numeroLinha++).padStart(2, '0')}</span>
                        <button class="btn-icone" onclick="moverItemNoAmbiente(${idx}, -1)" title="Subir no ambiente" ${primeiro ? 'disabled' : ''}>
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn-icone" onclick="moverItemNoAmbiente(${idx}, 1)" title="Descer no ambiente" ${ultimo ? 'disabled' : ''}>
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </td>
                    <td>${escaparHtml(it.sku || '-')}</td>
                    <td>${escaparHtml(it.nome || '-')}</td>
                    <td>
                        <input type="text" value="${escaparHtml(it.cor || '')}" placeholder="—"
                               onchange="alterarCampoItem(${idx}, 'cor', this.value)" />
                    </td>
                    <td>
                        <input type="text" value="${escaparHtml(it.tamanho || '')}" placeholder="—"
                               onchange="alterarCampoItem(${idx}, 'tamanho', this.value)" />
                    </td>
                    <td>
                        <input type="number" min="1" step="1" value="${it.quantidade}" class="orc-input-qtd"
                               onchange="alterarQuantidade(${idx}, this.value)"/>
                    </td>
                    <td>
                        <input type="number" min="0" step="0.01" value="${Number(it.preco_unitario).toFixed(2)}" class="orc-input-valor"
                               onchange="alterarPrecoUnitario(${idx}, this.value)" />
                    </td>
                    <td>${formatarMoeda(subtotal)}</td>
                    <td>
                        <button class="btn-icone" onclick="removerItem(${idx})" title="Remover item" style="color:#c62828;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    });

    tbody.innerHTML = linhas.join('');
}

// Usado apenas dentro de atributos inline onclick com aspas simples.
function escaparAspas(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Move um item dentro do seu próprio ambiente, preservando a posição
// relativa dos outros ambientes no array global de itens.
export function moverItemNoAmbiente(idx, dir) {
    const alvo = orcState.itens[idx];
    if (!alvo) return;
    const ambienteAlvo = (alvo.ambiente || '').trim() || '(Sem ambiente)';

    // Índices globais dos itens que pertencem ao mesmo ambiente, em ordem.
    const indicesNoAmbiente = orcState.itens
        .map((it, i) => ({ it, i }))
        .filter(({ it }) => (((it.ambiente || '').trim() || '(Sem ambiente)') === ambienteAlvo))
        .map(({ i }) => i);

    const posNoAmbiente = indicesNoAmbiente.indexOf(idx);
    const novaPos = posNoAmbiente + dir;
    if (novaPos < 0 || novaPos >= indicesNoAmbiente.length) return;

    const outroIdx = indicesNoAmbiente[novaPos];
    const tmp = orcState.itens[idx];
    orcState.itens[idx] = orcState.itens[outroIdx];
    orcState.itens[outroIdx] = tmp;
    renderizarItens();
}

export function alterarQuantidade(idx, valor) {
    orcState.itens[idx].quantidade = Math.max(1, parseInt(valor) || 1);
    renderizarItens();
    recalcularTotais();
}

export function alterarPrecoUnitario(idx, valor) {
    const num = parseFloat(valor);
    orcState.itens[idx].preco_unitario = Number.isFinite(num) && num >= 0 ? num : 0;
    renderizarItens();
    recalcularTotais();
}

export function alterarCampoItem(idx, campo, valor) {
    if (!orcState.itens[idx]) return;
    const permitidos = ['cor', 'tamanho', 'ambiente'];
    if (!permitidos.includes(campo)) return;
    orcState.itens[idx][campo] = (valor || '').toString();
    if (campo === 'ambiente') renderizarItens();
}

export function removerItem(idx) {
    orcState.itens.splice(idx, 1);
    renderizarItens();
    recalcularTotais();
}

// Renomeia o ambiente de TODOS os itens do grupo (edição inline do cabeçalho).
export function renomearAmbiente(antigo, novo) {
    const novoNome = (novo || '').trim();
    const antigoNome = antigo === '(Sem ambiente)' ? '' : antigo;
    orcState.itens.forEach((it) => {
        const atual = (it.ambiente || '').trim();
        if (atual === antigoNome) it.ambiente = novoNome;
    });
    renderizarItens();
}

export function removerAmbiente(ambiente) {
    const nome = ambiente === '(Sem ambiente)' ? '' : ambiente;
    const qtd = orcState.itens.filter((it) => ((it.ambiente || '').trim() === nome)).length;
    if (qtd === 0) return;
    const ok = confirm(`Remover o ambiente "${ambiente}" e seus ${qtd} item(ns)?`);
    if (!ok) return;
    orcState.itens = orcState.itens.filter((it) => ((it.ambiente || '').trim() !== nome));
    renderizarItens();
    recalcularTotais();
}

// ====== Modal de produtos cadastrados ======
function inicializarTabelaProdutosModal() {
    const mount = document.getElementById('orcProdutoTableMount');
    if (!mount) return;
    tabelaProdutosModal = new DataTable({
        mount,
        endpoint: '/api/produtos',
        tamanhoPagina: 8,
        ordenacaoPadrao: { chave: 'nome', direcao: 'asc' },
        // força somente produtos ativos neste modal
        paramsExtras: () => ({ ativo: 'true' }),
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Filtrar por nome ou SKU...' },
            { chave: 'categoria', tipo: 'select',
              placeholder: 'Todas as categorias',
              opcoesEndpoint: '/api/produtos/categorias/lista' },
            { chave: 'fornecedor', tipo: 'select',
              placeholder: 'Todos os fornecedores',
              opcoesEndpoint: '/api/produtos/fornecedores/lista' },
            { tipo: 'number-range', rotulo: 'Preço',
              chaveMin: 'preco_min', chaveMax: 'preco_max',
              step: '0.01', placeholderMin: 'R$ mín', placeholderMax: 'R$ máx' },
            { tipo: 'number-range', rotulo: 'Estoque',
              chaveMin: 'estoque_min', chaveMax: 'estoque_max',
              step: '1', placeholderMin: 'Mín', placeholderMax: 'Máx' }
        ],
        colunas: [
            { chave: 'sku', rotulo: 'SKU', ordenavel: true,
              formatar: (p) => p.sku || '-' },
            { chave: 'nome', rotulo: 'Nome', ordenavel: true },
            { chave: 'categoria', rotulo: 'Categoria', ordenavel: true,
              formatar: (p) => p.categoria || '-' },
            { chave: 'fornecedor', rotulo: 'Fornecedor', ordenavel: true,
              formatar: (p) => p.fornecedor || '-' },
            { chave: 'estoque', rotulo: 'Estoque', ordenavel: true },
            { chave: 'preco_venda', rotulo: 'Preço', ordenavel: true,
              formatar: (p) => formatarMoeda(p.preco_venda || 0) }
        ],
        acoes: (p) => `
            <button class="btn btn-primary btn-small" onclick="selecionarProduto(${p.id}, this)">Adicionar</button>
        `
    });
    tabelaProdutosModal.inicializar();
}

function abrirModalProduto() {
    orcState.produtosSelecionados = [];
    renderizarProdutosSelecionados();
    abrirModal('orcModalProduto');
    if (tabelaProdutosModal) tabelaProdutosModal.recarregar();
}

export function selecionarProduto(id, origem) {
    // Preferência: produto carregado agora no modal; fallback: cache geral
    let p = null;
    if (tabelaProdutosModal) {
        p = tabelaProdutosModal.obterLinhas().find(x => x.id === id);
    }
    if (!p) {
        p = orcState.produtosCache.find(x => x.id === id);
    }
    if (!p) return;

    // Se o produto já estiver na lista de seleção, incrementa a quantidade
    const existente = orcState.produtosSelecionados.find(x => x.produto_id === p.id);
    if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 0) + 1;
    } else {
        orcState.produtosSelecionados.push({
            produto_id: p.id,
            nome: p.nome,
            sku: p.sku || '-',
            quantidade: 1,
            preco_unitario: Number(p.preco_venda) || 0,
            // Campos opcionais preenchidos já no orçamento; começam vazios no staging
            cor: '',
            tamanho: ''
        });
    }
    renderizarProdutosSelecionados();

    // Feedback visual: pisca a linha da tabela em verde claro
    const tr = origem && origem.closest ? origem.closest('tr') : null;
    if (tr) {
        tr.classList.remove('orc-linha-adicionada');
        // força reflow para permitir disparar a animação novamente em cliques consecutivos
        void tr.offsetWidth;
        tr.classList.add('orc-linha-adicionada');
    }
}

function renderizarProdutosSelecionados() {
    const tbody = document.getElementById('orcSelecionadosTbody');
    const count = document.getElementById('orcSelecionadosCount');
    if (count) count.textContent = orcState.produtosSelecionados.length;
    if (!tbody) return;

    if (orcState.produtosSelecionados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">Nenhum produto selecionado</td></tr>';
        return;
    }

    tbody.innerHTML = orcState.produtosSelecionados.map((it, idx) => {
        const subtotal = (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0);
        return `
            <tr>
                <td>${it.sku || '-'}</td>
                <td>${it.nome || '-'}</td>
                <td>
                    <input type="number" min="1" step="1" value="${it.quantidade}" style="width:70px;"
                           onchange="alterarQtdSelecionado(${idx}, this.value)"/>
                </td>
                <td>${formatarMoeda(it.preco_unitario)}</td>
                <td>${formatarMoeda(subtotal)}</td>
                <td>
                    <button class="btn-icone" onclick="removerSelecionado(${idx})" title="Remover" style="color:#c62828;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

export function alterarQtdSelecionado(idx, valor) {
    if (!orcState.produtosSelecionados[idx]) return;
    orcState.produtosSelecionados[idx].quantidade = Math.max(1, parseInt(valor) || 1);
    renderizarProdutosSelecionados();
}

export function removerSelecionado(idx) {
    orcState.produtosSelecionados.splice(idx, 1);
    renderizarProdutosSelecionados();
}

function limparProdutosSelecionados() {
    if (orcState.produtosSelecionados.length === 0) return;
    orcState.produtosSelecionados = [];
    renderizarProdutosSelecionados();
}

function cancelarSelecaoProdutos() {
    orcState.produtosSelecionados = [];
    fecharModal('orcModalProduto');
}

function confirmarProdutosSelecionados() {
    if (orcState.produtosSelecionados.length === 0) {
        alert('Nenhum produto selecionado. Adicione ao menos um produto à lista.');
        return;
    }
    const ambiente = ambienteAtual();
    orcState.produtosSelecionados.forEach(sel => {
        orcState.itens.push({ ...sel, ambiente });
    });
    orcState.produtosSelecionados = [];
    fecharModal('orcModalProduto');
    renderizarItens();
    recalcularTotais();
}

// ====== Modal de produto customizado ======
function abrirModalCustom() {
    ['orcCustomCodigo','orcCustomNome','orcCustomDescricao','orcCustomCor','orcCustomTamanho']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('orcCustomQtd').value = 1;
    document.getElementById('orcCustomPreco').value = 0;
    abrirModal('orcModalCustom');
}

function adicionarItemCustomizado() {
    const codigo = document.getElementById('orcCustomCodigo').value.trim();
    const nome = document.getElementById('orcCustomNome').value.trim();
    const descricao = document.getElementById('orcCustomDescricao').value.trim();
    const cor = document.getElementById('orcCustomCor').value.trim();
    const tamanho = document.getElementById('orcCustomTamanho').value.trim();
    const qtd = parseInt(document.getElementById('orcCustomQtd').value) || 1;
    const preco = parseFloat(document.getElementById('orcCustomPreco').value) || 0;
    if (!nome) { alert('Informe o nome do item'); return; }

    orcState.itens.push({
        produto_id: null,
        nome: nome,
        nome_customizado: nome,
        descricao_customizada: descricao,
        sku: codigo || '-',
        ambiente: ambienteAtual(),
        cor: cor,
        tamanho: tamanho,
        quantidade: qtd,
        preco_unitario: preco
    });
    fecharModal('orcModalCustom');
    renderizarItens();
    recalcularTotais();
}

// ====== Modal de orçamento base ======
async function abrirModalBase() {
    try {
        const res = await fetch('/api/orcamentos?limite=100');
        const data = await res.json();
        const tbody = document.getElementById('orcListaBase');
        const lista = data.dados || [];
        if (lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum orçamento encontrado</td></tr>';
        } else {
            tbody.innerHTML = lista.map(o => `
                <tr>
                    <td>${o.numero || o.id}</td>
                    <td>${o.cliente_nome || '-'}</td>
                    <td>${formatarData(o.data_criacao)}</td>
                    <td>${formatarMoeda(o.valor_total || 0)}</td>
                    <td><button class="btn btn-primary btn-small" onclick="selecionarBase(${o.id})">Usar</button></td>
                </tr>
            `).join('');
        }
        abrirModal('orcModalBase');
    } catch (_) {
        alert('Erro ao carregar orçamentos');
    }
}

function filtrarListaBase() {
    const q = (document.getElementById('orcBuscaBase').value || '').toLowerCase();
    const rows = document.querySelectorAll('#orcListaBase tr');
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

export async function selecionarBase(id) {
    try {
        const res = await fetch(`/api/orcamentos/${id}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        const o = data.dados;

        document.getElementById('orcClienteSelect').value = o.cliente_id || '';
        document.getElementById('orcProfissionalSelect').value = o.profissional_id || '';
        document.getElementById('orcFormaPagamento').value = o.forma_pagamento || '';
        document.getElementById('orcDesconto').value = o.desconto || 0;
        document.getElementById('orcObservacoes').value = o.observacoes || '';
        atualizarCamposCliente();

        orcState.itens = (o.itens || []).map(it => ({
            produto_id: it.produto_id,
            nome: it.produto_nome || it.nome_customizado,
            nome_customizado: it.produto_id ? null : it.nome_customizado,
            codigo_customizado: it.produto_id ? null : (it.codigo_customizado || ''),
            descricao_customizada: it.descricao_customizada,
            sku: it.sku || '-',
            ambiente: it.ambiente || '',
            tamanho: it.tamanho || '',
            cor: it.cor || '',
            quantidade: Number(it.quantidade) || 1,
            preco_unitario: Number(it.preco_unitario) || 0
        }));
        fecharModal('orcModalBase');
        document.getElementById('orcBaseCard').style.display = 'none';
        renderizarItens();
        recalcularTotais();
    } catch (_) {
        alert('Erro ao carregar orçamento base');
    }
}

// ====== Cálculos ======
function recalcularTotais() {
    let subtotal = 0;
    orcState.itens.forEach(it => {
        subtotal += (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0);
    });
    const descInput = document.getElementById('orcDesconto');
    let descPerc = parseFloat(descInput.value) || 0;
    if (descPerc < 0) descPerc = 0;
    if (descPerc > 100) { descPerc = 100; descInput.value = 100; }
    const descValor = subtotal * (descPerc / 100);
    const total = subtotal - descValor;
    document.getElementById('orcSubtotal').textContent = formatarMoeda(subtotal);
    document.getElementById('orcDescontoValor').textContent = formatarMoeda(descValor);
    document.getElementById('orcTotalFinal').textContent = formatarMoeda(total);
}

// ====== Salvar ======
async function salvarOrcamento() {
    const cliente_id = document.getElementById('orcClienteSelect').value;
    if (!cliente_id) { alert('Selecione um cliente'); return; }
    if (orcState.itens.length === 0) {
        if (!confirm('Nenhum item foi adicionado. Deseja salvar mesmo assim?')) return;
    }

    const payload = {
        cliente_id: parseInt(cliente_id),
        profissional_id: parseInt(document.getElementById('orcProfissionalSelect').value) || null,
        data_criacao: document.getElementById('orcDataEmissao').value || null,
        data_validade: document.getElementById('orcDataValidade').value || null,
        desconto: parseFloat(document.getElementById('orcDesconto').value) || 0,
        observacoes: document.getElementById('orcObservacoes').value,
        forma_pagamento: document.getElementById('orcFormaPagamento').value,
        assinatura: document.getElementById('orcAssinatura').value,
        itens: orcState.itens.map(it => ({
            produto_id: it.produto_id,
            nome_customizado: it.produto_id ? null : (it.nome_customizado || it.nome),
            codigo_customizado: it.produto_id ? null : ((it.codigo_customizado || (it.sku && it.sku !== '-' ? it.sku : '')) || null),
            descricao_customizada: it.descricao_customizada || null,
            ambiente: (it.ambiente || '').trim() || null,
            tamanho: (it.tamanho || '').trim() || null,
            cor: (it.cor || '').trim() || null,
            quantidade: it.quantidade,
            preco_unitario: it.preco_unitario
        }))
    };

    try {
        const url = orcState.modoEdicao ? `/api/orcamentos/${orcState.editingId}` : '/api/orcamentos';
        const method = orcState.modoEdicao ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem || 'Erro ao salvar');
        alert(data.mensagem || 'Orçamento salvo');
        orcState.originalSnapshot = snapshotFormulario();
        mostrarView(true);
        recarregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao salvar orçamento');
    }
}

// ====== Ações da listagem ======
export async function aprovarOrcamento(id) {
    if (!confirm('Confirmar criação de um novo pedido?')) return;
    try {
        const res = await fetch(`/api/orcamentos/${id}/aprovar`, { method: 'POST' });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        alert(`Pedido ${data.dados.pedido_numero} criado com sucesso!`);
        recarregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao aprovar orçamento');
    }
}

export async function recusarOrcamento(id) {
    const motivo = prompt('Motivo da recusa (opcional):', '');
    if (motivo === null) return;
    try {
        const res = await fetch(`/api/orcamentos/${id}/recusar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motivo })
        });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        alert('Orçamento recusado');
        recarregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao recusar orçamento');
    }
}

export async function deletarOrcamento(id) {
    if (!confirm('Tem certeza que deseja deletar este orçamento?')) return;
    try {
        const res = await fetch(`/api/orcamentos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        recarregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao deletar orçamento');
    }
}

// ====== Exportação ======
export async function exportarOrcamentoPDF(id) {
    try {
        const res = await fetch(`/api/orcamentos/${id}/exportacao`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        abrirDocumentoImpressao(data.dados);
    } catch (e) {
        alert(e.message || 'Erro ao exportar');
    }
}

export async function exportarOrcamentoExcel(id) {
    try {
        const resposta = await fetch(`/api/orcamentos/${id}/exportar-xlsx`);
        if (!resposta.ok) {
            let mensagem = 'Erro ao exportar orçamento';
            try {
                const erro = await resposta.json();
                mensagem = erro.mensagem || mensagem;
            } catch (_) { /* resposta pode não ser JSON */ }
            throw new Error(mensagem);
        }

        const blob = await resposta.blob();
        const nome = extrairNomeArquivo(resposta.headers.get('Content-Disposition'))
            || `orcamento-${id}.xlsx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
        alert(e.message || 'Erro ao exportar');
    }
}

function extrairNomeArquivo(contentDisposition) {
    if (!contentDisposition) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch (_) { return match[1]; }
}

function agruparItensPorAmbientePDF(itens) {
    const ordem = [];
    const grupos = new Map();
    (itens || []).forEach((it) => {
        const chave = (it.ambiente && String(it.ambiente).trim()) || '';
        if (!grupos.has(chave)) {
            grupos.set(chave, []);
            ordem.push(chave);
        }
        grupos.get(chave).push(it);
    });
    return ordem.map((nome) => ({ nome, itens: grupos.get(nome) }));
}

function escaparHtmlPDF(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function abrirDocumentoImpressao({ orcamento, itens, empresa }) {
    const subtotal = (itens || []).reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
    let descPerc = Number(orcamento.desconto) || 0;
    if (descPerc < 0) descPerc = 0;
    if (descPerc > 100) descPerc = 100;
    const descValor = subtotal * (descPerc / 100);
    const total = subtotal - descValor;

    const grupos = agruparItensPorAmbientePDF(itens);

    // Monta as linhas de itens agrupadas por ambiente; numeração contínua (1,2,3...)
    // para bater com a aparência da referência do cliente.
    let numeroLinha = 0;
    const linhasItensHTML = grupos.map((grupo) => {
        const cabecalhoAmbiente = grupo.nome
            ? `<tr class="grupo-ambiente"><td colspan="8">${escaparHtmlPDF(grupo.nome.toUpperCase())}</td></tr>`
            : '';
        const linhas = grupo.itens.map((it) => {
            numeroLinha += 1;
            return `
                <tr>
                    <td style="text-align:center;">${numeroLinha}</td>
                    <td>${escaparHtmlPDF(it.sku || '-')}</td>
                    <td>${escaparHtmlPDF(it.produto_nome || it.nome_customizado || '-')}</td>
                    <td style="text-align:center;">${escaparHtmlPDF(it.cor || '')}</td>
                    <td style="text-align:center;">${escaparHtmlPDF(it.tamanho || '')}</td>
                    <td style="text-align:center;">${it.quantidade}</td>
                    <td style="text-align:right;">${formatarMoeda(it.preco_unitario)}</td>
                    <td style="text-align:right;">${formatarMoeda(it.subtotal)}</td>
                </tr>
            `;
        }).join('');
        return cabecalhoAmbiente + linhas;
    }).join('');

    const itensVaziosMsg = (itens || []).length === 0
        ? '<tr><td colspan="8" style="text-align:center;color:#999;padding:8px;">Nenhum item cadastrado</td></tr>'
        : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Orçamento ${escaparHtmlPDF(orcamento.numero || orcamento.id)}</title>
<style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f3a5f; }
    .doc { width: 190mm; margin: 0 auto; padding: 4mm 0; }

    .topo { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .topo .logo-box {
        flex: 0 0 260px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        overflow: hidden;
        position: relative;
    }
    .topo .logo-box img {
        width: 290%;
        height: 290%;
        object-fit: stretch;
        object-position: center center;
        display: block;
        /* Zoom no SVG para compensar o padding transparente interno;
           overflow: hidden acima recorta o excedente. */
        transform: scale(1);
        transform-origin: center center;
        margin-top: -75px;  /* sobe a logo para dentro do topo — ajuste fino aqui */
        filter: brightness(0) saturate(100%) invert(16%) sepia(47%) saturate(1500%) hue-rotate(190deg) brightness(93%) contrast(95%);
    }
    .topo .logo-box .logo-fallback { font-size: 24px; font-weight: 800; color: #1f3a5f; letter-spacing: .5px; }
    .topo .titulo { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .topo .titulo h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #1f3a5f; }
    .topo .titulo .barra { width: 100%; height: 6px; background: #1f3a5f; margin-top: 6px; }
    .topo .numero { flex: 0 0 150px; border: 1.5px solid #1f3a5f; display: flex; flex-direction: column; }
    .topo .numero .lbl { background: #1f3a5f; color: #fff; text-align: center; padding: 3px 6px; font-size: 11px; font-weight: 700; }
    .topo .numero .num { padding: 6px; text-align: center; font-weight: 700; font-size: 13px; background: #ffe4b5; }

    .empresa-info { display: flex; gap: 24px; font-size: 10.5px; padding: 4px 0; border-top: 1px solid #dfe4ec; border-bottom: 1px solid #dfe4ec; margin-bottom: 6px; }
    .empresa-info > div > strong { margin-right: 4px; }

    .faixa-secao { background: #dfe4ec; color: #1f3a5f; font-weight: 700; padding: 4px 8px; font-size: 11px; letter-spacing: .5px; border-top: 1px solid #1f3a5f; border-bottom: 1px solid #1f3a5f; text-transform: uppercase; }

    .cliente-box { padding: 5px 8px 8px 8px; font-size: 10.5px; line-height: 1.55; }
    .cliente-box .linha { display: flex; gap: 6px; }
    .cliente-box .lbl { font-weight: 700; }

    table.items { width: 100%; border-collapse: collapse; margin-top: 4px; }
    table.items thead { display: table-header-group; background: #dfe4ec; }
    table.items thead th { color: #1f3a5f; font-size: 10.5px; padding: 5px 4px; border: 1px solid #1f3a5f; text-transform: uppercase; }
    table.items tbody td { font-size: 10px; padding: 3px 5px; border: 1px solid #b9c4d6; height: 16px; }
    table.items tr.grupo-ambiente td { background: #1f3a5f; color: #fff; font-weight: 700; padding: 5px 8px; font-size: 10.5px; letter-spacing: 1px; border: 1px solid #1f3a5f; }

    table.totais { width: 100%; border-collapse: collapse; margin-top: 6px; }
    table.totais td { padding: 5px 10px; font-size: 11px; border: 1px solid #b9c4d6; }
    table.totais td.lbl { text-align: right; font-weight: 700; background: #f5f8fc; width: 70%; }
    table.totais td.val { text-align: right; width: 30%; }
    table.totais tr.final td { background: #1f3a5f; color: #fff; font-size: 12.5px; }

    .rodape { margin-top: 10px; font-size: 10.5px; color: #333; }
    .rodape .entrega { margin-bottom: 6px; }
    .rodape .obs { white-space: pre-wrap; }
    .rodape .assinatura { margin-top: 14px; font-weight: 700; }

    .actions { text-align: right; margin: 10px; }
    .actions button { padding: 6px 12px; cursor: pointer; font-size: 12px; }

    @media print {
        .actions { display: none; }
        .doc { padding: 0; }
        table.items tbody tr, tr.grupo-ambiente { page-break-inside: avoid; }
    }
</style>
</head>
<body>
    <div class="actions">
        <button onclick="window.print()">Imprimir / Salvar PDF</button>
        <button onclick="window.close()">Fechar</button>
    </div>
    <div class="doc">
        <div class="topo">
            <div class="logo-box">
                <img src="/images/ideart-logo.svg" alt="${escaparHtmlPDF(empresa.nome_fantasia || 'Ideart')}"
                     onerror="if(this.src.endsWith('.svg')){this.src='/images/ideart-logo.png';}else{this.style.display='none';this.nextElementSibling.style.display='block';}" />
                <div class="logo-fallback" style="display:none;">${escaparHtmlPDF((empresa.nome_fantasia || 'IDEART').toUpperCase())}</div>
            </div>
            <div class="titulo">
                <h1>ORÇAMENTO</h1>
                <div class="barra"></div>
            </div>
            <div class="numero">
                <div class="lbl">ORÇAMENTO Nº.</div>
                <div class="num">${escaparHtmlPDF(orcamento.numero || `#${orcamento.id}`)}</div>
            </div>
        </div>

        <div class="empresa-info">
            <div><strong>CNPJ:</strong>${escaparHtmlPDF(empresa.cnpj || '-')}</div>
            <div><strong>TELEFONE:</strong>${escaparHtmlPDF(empresa.telefone || '-')}</div>
            <div><strong>E-MAIL:</strong>${escaparHtmlPDF(empresa.email || '-')}</div>
            <div><strong>DATA:</strong>${escaparHtmlPDF(formatarData(orcamento.data_criacao))}</div>
        </div>

        <div class="faixa-secao">Dados do Cliente</div>
        <div class="cliente-box">
            <div class="linha"><span class="lbl">CLIENTE:</span><span>${escaparHtmlPDF(orcamento.cliente_nome || '-')}</span></div>
            <div class="linha"><span class="lbl">CPF/CNPJ:</span><span>${escaparHtmlPDF(orcamento.cliente_cpf || orcamento.cliente_cnpj || '')}</span></div>
            <div class="linha"><span class="lbl">ENDEREÇO:</span><span>${escaparHtmlPDF([orcamento.cliente_endereco, orcamento.cliente_cidade, orcamento.cliente_estado].filter(Boolean).join(', ') || '-')}</span></div>
            <div class="linha"><span class="lbl">TELEFONE:</span><span>${escaparHtmlPDF(orcamento.cliente_telefone || '-')}</span></div>
            <div class="linha"><span class="lbl">E-MAIL:</span><span>${escaparHtmlPDF(orcamento.cliente_email || '-')}</span></div>
        </div>

        <table class="items">
            <thead>
                <tr>
                    <th style="width:34px;">Item</th>
                    <th style="width:82px;">Código</th>
                    <th>Descrição do Produto</th>
                    <th style="width:68px;">Cor</th>
                    <th style="width:68px;">Tamanho</th>
                    <th style="width:44px;">Qtd.</th>
                    <th style="width:82px;">Vl. Unit.</th>
                    <th style="width:82px;">Vl. Total</th>
                </tr>
            </thead>
            <tbody>
                ${linhasItensHTML || itensVaziosMsg}
            </tbody>
        </table>

        <table class="totais">
            <tr>
                <td class="lbl">TOTAL DOS AMBIENTES:</td>
                <td class="val">${formatarMoeda(subtotal)}</td>
            </tr>
            <tr>
                <td class="lbl">DESCONTO (${descPerc}%):</td>
                <td class="val">- ${formatarMoeda(descValor)}</td>
            </tr>
            <tr class="final">
                <td class="lbl">ORÇAMENTO FINAL:</td>
                <td class="val">${formatarMoeda(total)}</td>
            </tr>
        </table>

        <div class="rodape">
            <div class="entrega"><strong>PREVISÃO DE ENTREGA:</strong> 10 - 15 DIAS ÚTEIS</div>
            <div><strong>Válido até:</strong> ${escaparHtmlPDF(formatarData(orcamento.data_validade))}
                 &nbsp;&nbsp;<strong>Forma de pagamento:</strong> ${escaparHtmlPDF(orcamento.forma_pagamento || '-')}</div>
            ${orcamento.observacoes ? `<div class="obs" style="margin-top:6px;"><strong>Observações:</strong><br>${escaparHtmlPDF(orcamento.observacoes)}</div>` : ''}
            ${orcamento.assinatura ? `<div class="assinatura">Assinatura: ${escaparHtmlPDF(orcamento.assinatura)}</div>` : ''}
        </div>
    </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.open();
    w.document.write(html);
    w.document.close();
}

// ====== Helpers de modal ======
function abrirModal(id) { const m = document.getElementById(id); if (m) m.classList.add('show'); }
function fecharModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('show'); }

// ====== Estilos adicionais ======
function adicionarEstilosOrcamento() {
    if (document.getElementById('orcamentos-custom-style')) return;
    const style = document.createElement('style');
    style.id = 'orcamentos-custom-style';
    style.textContent = `
        .card-header-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
        .section-title { color: var(--primary-blue); font-size:1.1rem; margin: 1.25rem 0 .75rem 0; padding-bottom: .3rem; border-bottom:2px solid var(--light-blue); }
        .acoes-stack { display:flex; flex-direction:column; gap:.35rem; }
        .acoes-row { display:flex; gap:.25rem; flex-wrap:wrap; }
        .acoes-row-secundaria { flex-wrap:nowrap; padding-top:.35rem; border-top:1px dashed #dfe4ec; }
        .acoes-row-secundaria .btn { flex:1; justify-content:center; white-space:nowrap; }
        .acao-aprovar { background:#2e7d32; color:#fff; }
        .acao-aprovar:hover { background:#256a28; }
        .acao-recusar { color:#c62828; border-color:#c62828; }
        .acao-recusar:hover { background:#c62828; color:#fff; }
        .btn-icone { background:none; border:1px solid transparent; padding:.25rem .4rem; cursor:pointer; border-radius:4px; }
        .btn-icone:hover { background:#f0f4fb; }
        .btn-icone:disabled { opacity:.3; cursor:not-allowed; }
        .orc-itens-table th, .orc-itens-table td { padding:.5rem; font-size:.9rem; }
        .orc-itens-table input[type=number], .orc-itens-table input[type=text] {
            padding:.3rem; border:1px solid #ddd; border-radius:4px; width:100%;
        }
        .orc-itens-table .orc-input-qtd { width:70px; }
        .orc-itens-table .orc-input-valor { width:110px; text-align:right; }
        .orc-itens-table .orc-col-ordem { white-space:nowrap; display:flex; align-items:center; gap:.2rem; }
        .orc-itens-table .orc-ordem-num { font-weight:700; color:var(--primary-blue); min-width:20px; }
        .orc-itens-table tr.orc-ambiente-header td {
            background: var(--primary-blue, #1f3a5f);
            color:#fff;
            padding: .45rem .75rem;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:.5rem;
        }
        .orc-itens-table tr.orc-ambiente-header .orc-ambiente-nome { display:flex; align-items:center; gap:.5rem; flex:1; }
        .orc-itens-table tr.orc-ambiente-header input.orc-ambiente-edit {
            background: rgba(255,255,255,.12);
            color:#fff;
            border:1px solid rgba(255,255,255,.35);
            border-radius:4px;
            padding:.25rem .5rem;
            font-weight:700;
            letter-spacing:.3px;
            min-width:260px;
        }
        .orc-itens-table tr.orc-ambiente-header input.orc-ambiente-edit::placeholder { color: rgba(255,255,255,.7); }
        .orc-itens-table tr.orc-ambiente-header .btn-icone { color:#fff !important; }
        .orc-itens-table tr.orc-ambiente-header .btn-icone:hover { background: rgba(255,255,255,.15); }
        .orc-ambiente-row-topo input[list] { padding:.5rem .6rem; border:1px solid #cdd6e3; border-radius:6px; font-size:.95rem; }
        .totals-box { margin-top:1rem; background:#f5f8fc; border-radius:8px; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:.4rem; align-items:flex-end; }
        .totals-box > div { display:flex; gap:1rem; min-width:260px; justify-content:space-between; }
        .totals-box .total-final { border-top:2px solid var(--primary-blue); padding-top:.4rem; margin-top:.25rem; font-size:1.1rem; color: var(--primary-blue); }
        .orc-selecionados-box { margin-top:1.25rem; border:1px solid var(--border-color); border-radius:8px; background:#f9fbfe; padding:.75rem 1rem; }
        .orc-selecionados-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.5rem; gap:1rem; flex-wrap:wrap; }
        .orc-selecionados-table { width:100%; border-collapse:collapse; }
        .orc-selecionados-table th, .orc-selecionados-table td { padding:.4rem .5rem; font-size:.9rem; border-bottom:1px solid #eef2f7; text-align:left; }
        .orc-selecionados-table th { background:#eaf1fb; color:var(--primary-blue); position:sticky; top:0; }
        .orc-selecionados-table input[type=number] { padding:.3rem; border:1px solid #ddd; border-radius:4px; }
        @keyframes orcLinhaAdicionada {
            0% { background-color: #c8f7c8; }
            100% { background-color: transparent; }
        }
        .orc-linha-adicionada > td { animation: orcLinhaAdicionada .9s ease-out; }
    `;
    document.head.appendChild(style);
}

// Handlers chamados via onclick/onchange inline nos templates HTML
window.editarOrcamento = editarOrcamento;
window.aprovarOrcamento = aprovarOrcamento;
window.recusarOrcamento = recusarOrcamento;
window.deletarOrcamento = deletarOrcamento;
window.exportarOrcamentoPDF = exportarOrcamentoPDF;
window.exportarOrcamentoExcel = exportarOrcamentoExcel;
window.moverItemNoAmbiente = moverItemNoAmbiente;
window.alterarQuantidade = alterarQuantidade;
window.alterarPrecoUnitario = alterarPrecoUnitario;
window.alterarCampoItem = alterarCampoItem;
window.renomearAmbiente = renomearAmbiente;
window.removerAmbiente = removerAmbiente;
window.removerItem = removerItem;
window.selecionarProduto = selecionarProduto;
window.selecionarBase = selecionarBase;
window.alterarQtdSelecionado = alterarQtdSelecionado;
window.removerSelecionado = removerSelecionado;
