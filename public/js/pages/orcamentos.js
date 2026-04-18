/**
 * Página de Orçamentos — versão refatorada
 * Fluxo completo: listagem, novo/editar com itens, aprovar/recusar, exportação PDF/Excel.
 */

const orcamentosPage = {
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

            <div class="filters-row">
                <input type="text" id="orcFiltroBusca" placeholder="Buscar por nº ou cliente..." />
                <select id="orcFiltroStatus">
                    <option value="">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="recusado">Recusado</option>
                    <option value="expirado">Expirado</option>
                    <option value="convertido">Convertido</option>
                </select>
                <button class="btn btn-secondary" id="orcFiltrarBtn"><i class="fas fa-search"></i> Filtrar</button>
            </div>

            <div class="table-wrapper">
                <table id="orcamentosTable">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Validade</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th style="width: 280px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="orcamentosTbody"></tbody>
                </table>
            </div>
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
                <h3 class="section-title">Produtos/Serviços</h3>
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
                                <th>SKU</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Fornecedor</th>
                                <th style="width:90px;">Qtd</th>
                                <th>Valor unit.</th>
                                <th>Valor total</th>
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
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Selecionar Produto</h3>
                    <button class="modal-close" id="orcModalProdutoClose">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" id="orcBuscaProduto" placeholder="Filtrar por nome ou SKU..." />
                    </div>
                    <div class="table-wrapper" style="max-height:400px; overflow-y:auto;">
                        <table>
                            <thead>
                                <tr><th>SKU</th><th>Nome</th><th>Categoria</th><th>Preço</th><th></th></tr>
                            </thead>
                            <tbody id="orcListaProdutos"></tbody>
                        </table>
                    </div>
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
                        <label>Nome *</label>
                        <input type="text" id="orcCustomNome" />
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea id="orcCustomDescricao" rows="2"></textarea>
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

// ====== Estado da página ======
const orcState = {
    modoEdicao: false,
    editingId: null,
    itens: [],        // {produto_id|null, nome_customizado, sku, categoria, fornecedor, quantidade, preco_unitario, ...}
    originalSnapshot: null,  // snapshot dos dados carregados para detectar alterações
    produtosCache: [],
    clientes: [],
    profissionais: []
};

// ====== Inicialização ======
function inicializarOrcamentos() {
    carregarOrcamentos();
    adicionarEstilosOrcamento();

    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('novoOrcamentoBtn', 'click', abrirFormularioNovo);
    on('orcFiltrarBtn', 'click', carregarOrcamentos);
    on('orcFiltroBusca', 'keypress', (e) => { if (e.key === 'Enter') carregarOrcamentos(); });
    on('orcVoltarBtn', 'click', voltarParaLista);
    on('orcSalvarBtn', 'click', salvarOrcamento);

    on('orcClienteSelect', 'change', atualizarCamposCliente);

    on('orcAddProdutoCadBtn', 'click', abrirModalProduto);
    on('orcAddProdutoCustomBtn', 'click', abrirModalCustom);

    on('orcModalProdutoClose', 'click', () => fecharModal('orcModalProduto'));
    on('orcModalCustomClose', 'click', () => fecharModal('orcModalCustom'));
    on('orcModalBaseClose', 'click', () => fecharModal('orcModalBase'));

    on('orcBuscaProduto', 'input', filtrarListaProdutos);
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
async function carregarOrcamentos() {
    const tbody = document.getElementById('orcamentosTbody');
    if (!tbody) return;

    const busca = (document.getElementById('orcFiltroBusca') || {}).value || '';
    const status = (document.getElementById('orcFiltroStatus') || {}).value || '';
    const qs = new URLSearchParams();
    if (busca) qs.append('busca', busca);
    if (status) qs.append('status', status);
    qs.append('limite', '100');

    try {
        const res = await fetch(`/api/orcamentos?${qs.toString()}`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem || 'Erro');

        tbody.innerHTML = '';
        if (!data.dados || data.dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhum orçamento encontrado</td></tr>';
            return;
        }

        data.dados.forEach(o => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${o.numero || o.id}</td>
                <td>${o.cliente_nome || '-'}</td>
                <td>${formatarData(o.data_criacao)}</td>
                <td>${formatarData(o.data_validade)}</td>
                <td>${formatarMoeda(o.valor_total || 0)}</td>
                <td><span class="status-badge" style="background:${corStatusOrc(o.status)};color:#fff;padding:.25rem .5rem;border-radius:4px;font-size:.85rem;">${o.status}</span></td>
                <td>${renderAcoesOrcamento(o)}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (erro) {
        console.error(erro);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c00;">Erro ao carregar orçamentos</td></tr>';
    }
}

function renderAcoesOrcamento(o) {
    const podeAprovar = o.status === 'pendente';
    return `
        <div class="acoes-row">
            <button class="btn btn-secondary btn-small" onclick="editarOrcamento(${o.id})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            ${podeAprovar ? `
                <button class="btn btn-primary btn-small" style="background:#2e7d32" onclick="aprovarOrcamento(${o.id})" title="Aprovar">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-secondary btn-small" style="color:#c62828;border-color:#c62828" onclick="recusarOrcamento(${o.id})" title="Recusar">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
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
    await Promise.all([carregarClientes(), carregarProfissionais(), carregarProdutosCache()]);
    renderizarItens();
    recalcularTotais();
    mostrarView(false);
}

async function editarOrcamento(id) {
    orcState.modoEdicao = true;
    orcState.editingId = id;
    document.getElementById('orcFormTitulo').textContent = `Editar Orçamento #${id}`;
    document.getElementById('orcBaseCard').style.display = 'none';

    limparFormulario();
    await Promise.all([carregarClientes(), carregarProfissionais(), carregarProdutosCache()]);

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
            descricao_customizada: it.descricao_customizada,
            sku: it.sku || '-',
            categoria: it.categoria || '-',
            fornecedor: '-',
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
     'orcFormaPagamento','orcObservacoes','orcAssinatura','orcClienteEmail','orcClienteTelefone']
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
    await carregarOrcamentos();
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
async function carregarClientes() {
    try {
        const res = await fetch('/api/clientes?limite=500');
        const data = await res.json();
        orcState.clientes = data.dados || [];
        const sel = document.getElementById('orcClienteSelect');
        sel.innerHTML = '<option value="">Selecione...</option>' +
            orcState.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    } catch (_) {}
}

async function carregarProfissionais() {
    try {
        const res = await fetch('/api/profissionais?limite=500');
        const data = await res.json();
        orcState.profissionais = data.dados || [];
        const sel = document.getElementById('orcProfissionalSelect');
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

// ====== Tabela de itens ======
function renderizarItens() {
    const tbody = document.getElementById('orcItensTbody');
    if (!tbody) return;

    if (orcState.itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;">Nenhum item adicionado</td></tr>';
        return;
    }

    tbody.innerHTML = orcState.itens.map((it, idx) => {
        const subtotal = (Number(it.quantidade) || 0) * (Number(it.preco_unitario) || 0);
        return `
            <tr>
                <td>
                    <button class="btn-icone" onclick="moverItem(${idx}, -1)" title="Subir" ${idx === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-icone" onclick="moverItem(${idx}, 1)" title="Descer" ${idx === orcState.itens.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </td>
                <td>${it.sku || '-'}</td>
                <td>${it.nome || '-'}</td>
                <td>${it.categoria || '-'}</td>
                <td>${it.fornecedor || '-'}</td>
                <td>
                    <input type="number" min="1" step="1" value="${it.quantidade}" style="width:70px;"
                           onchange="alterarQuantidade(${idx}, this.value)"/>
                </td>
                <td>
                    <input type="number" min="0" step="0.01" value="${it.preco_unitario}" style="width:100px;"
                           onchange="alterarPreco(${idx}, this.value)"/>
                </td>
                <td>${formatarMoeda(subtotal)}</td>
                <td>
                    <button class="btn-icone" onclick="removerItem(${idx})" title="Remover" style="color:#c62828;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function moverItem(idx, dir) {
    const novoIdx = idx + dir;
    if (novoIdx < 0 || novoIdx >= orcState.itens.length) return;
    const tmp = orcState.itens[idx];
    orcState.itens[idx] = orcState.itens[novoIdx];
    orcState.itens[novoIdx] = tmp;
    renderizarItens();
}

function alterarQuantidade(idx, valor) {
    orcState.itens[idx].quantidade = Math.max(1, parseInt(valor) || 1);
    renderizarItens();
    recalcularTotais();
}

function alterarPreco(idx, valor) {
    orcState.itens[idx].preco_unitario = Math.max(0, parseFloat(valor) || 0);
    renderizarItens();
    recalcularTotais();
}

function removerItem(idx) {
    orcState.itens.splice(idx, 1);
    renderizarItens();
    recalcularTotais();
}

// ====== Modal de produtos cadastrados ======
function abrirModalProduto() {
    filtrarListaProdutos();
    abrirModal('orcModalProduto');
}

function filtrarListaProdutos() {
    const tbody = document.getElementById('orcListaProdutos');
    if (!tbody) return;
    const q = (document.getElementById('orcBuscaProduto').value || '').toLowerCase();
    const filtrados = orcState.produtosCache.filter(p =>
        (p.nome || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
    );
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum produto encontrado</td></tr>';
        return;
    }
    tbody.innerHTML = filtrados.map(p => `
        <tr>
            <td>${p.sku || '-'}</td>
            <td>${p.nome}</td>
            <td>${p.categoria || '-'}</td>
            <td>${formatarMoeda(p.preco_venda)}</td>
            <td><button class="btn btn-primary btn-small" onclick="selecionarProduto(${p.id})">Adicionar</button></td>
        </tr>
    `).join('');
}

function selecionarProduto(id) {
    const p = orcState.produtosCache.find(x => x.id === id);
    if (!p) return;
    orcState.itens.push({
        produto_id: p.id,
        nome: p.nome,
        sku: p.sku || '-',
        categoria: p.categoria || '-',
        fornecedor: p.fornecedor || '-',
        quantidade: 1,
        preco_unitario: Number(p.preco_venda) || 0
    });
    fecharModal('orcModalProduto');
    renderizarItens();
    recalcularTotais();
}

// ====== Modal de produto customizado ======
function abrirModalCustom() {
    document.getElementById('orcCustomNome').value = '';
    document.getElementById('orcCustomDescricao').value = '';
    document.getElementById('orcCustomQtd').value = 1;
    document.getElementById('orcCustomPreco').value = 0;
    abrirModal('orcModalCustom');
}

function adicionarItemCustomizado() {
    const nome = document.getElementById('orcCustomNome').value.trim();
    const descricao = document.getElementById('orcCustomDescricao').value.trim();
    const qtd = parseInt(document.getElementById('orcCustomQtd').value) || 1;
    const preco = parseFloat(document.getElementById('orcCustomPreco').value) || 0;
    if (!nome) { alert('Informe o nome do item'); return; }

    orcState.itens.push({
        produto_id: null,
        nome: nome,
        nome_customizado: nome,
        descricao_customizada: descricao,
        sku: '-',
        categoria: 'Personalizado',
        fornecedor: '-',
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

async function selecionarBase(id) {
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
            descricao_customizada: it.descricao_customizada,
            sku: it.sku || '-',
            categoria: it.categoria || '-',
            fornecedor: '-',
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
            descricao_customizada: it.descricao_customizada || null,
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
        await carregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao salvar orçamento');
    }
}

// ====== Ações da listagem ======
async function aprovarOrcamento(id) {
    if (!confirm('Confirmar criação de um novo pedido?')) return;
    try {
        const res = await fetch(`/api/orcamentos/${id}/aprovar`, { method: 'POST' });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        alert(`Pedido ${data.dados.pedido_numero} criado com sucesso!`);
        carregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao aprovar orçamento');
    }
}

async function recusarOrcamento(id) {
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
        carregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao recusar orçamento');
    }
}

async function deletarOrcamento(id) {
    if (!confirm('Tem certeza que deseja deletar este orçamento?')) return;
    try {
        const res = await fetch(`/api/orcamentos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        carregarOrcamentos();
    } catch (e) {
        alert(e.message || 'Erro ao deletar orçamento');
    }
}

// ====== Exportação ======
async function exportarOrcamentoPDF(id) {
    try {
        const res = await fetch(`/api/orcamentos/${id}/exportacao`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        abrirDocumentoImpressao(data.dados);
    } catch (e) {
        alert(e.message || 'Erro ao exportar');
    }
}

async function exportarOrcamentoExcel(id) {
    try {
        const res = await fetch(`/api/orcamentos/${id}/exportacao`);
        const data = await res.json();
        if (!data.sucesso) throw new Error(data.mensagem);
        gerarCSVOrcamento(data.dados);
    } catch (e) {
        alert(e.message || 'Erro ao exportar');
    }
}

function gerarCSVOrcamento({ orcamento, itens, empresa }) {
    const sep = ';';
    const linhas = [];
    linhas.push(['Empresa', empresa.nome_fantasia || ''].join(sep));
    linhas.push(['Email', empresa.email || ''].join(sep));
    linhas.push(['Telefone', empresa.telefone || ''].join(sep));
    linhas.push([]);
    linhas.push(['Orçamento Nº', orcamento.numero || orcamento.id].join(sep));
    linhas.push(['Cliente', orcamento.cliente_nome || ''].join(sep));
    linhas.push(['Email Cliente', orcamento.cliente_email || ''].join(sep));
    linhas.push(['Telefone Cliente', orcamento.cliente_telefone || ''].join(sep));
    linhas.push(['Profissional', orcamento.profissional_nome || ''].join(sep));
    linhas.push(['Data', formatarData(orcamento.data_criacao)].join(sep));
    linhas.push(['Validade', formatarData(orcamento.data_validade)].join(sep));
    linhas.push([]);
    linhas.push(['Código', 'Produto', 'Categoria', 'Quantidade', 'Valor Unitário', 'Valor Total'].join(sep));
    (itens || []).forEach(it => {
        linhas.push([
            it.sku || '-',
            (it.produto_nome || it.nome_customizado || '').replace(/;/g, ','),
            it.categoria || '-',
            it.quantidade,
            (it.preco_unitario || 0).toFixed(2).replace('.', ','),
            (it.subtotal || 0).toFixed(2).replace('.', ',')
        ].join(sep));
    });
    linhas.push([]);
    linhas.push(['Desconto (%)', (orcamento.desconto || 0)].join(sep));
    linhas.push(['Total', (orcamento.valor_total || 0).toFixed(2).replace('.', ',')].join(sep));
    linhas.push(['Forma de Pagamento', orcamento.forma_pagamento || ''].join(sep));
    linhas.push(['Observações', (orcamento.observacoes || '').replace(/\n/g, ' | ')].join(sep));

    const csv = '\uFEFF' + linhas.map(l => Array.isArray(l) ? l : [l]).map(l => l.join ? l.join(sep) : l).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento-${orcamento.numero || orcamento.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function abrirDocumentoImpressao({ orcamento, itens, empresa }) {
    const subtotal = (itens || []).reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
    let descPerc = Number(orcamento.desconto) || 0;
    if (descPerc < 0) descPerc = 0;
    if (descPerc > 100) descPerc = 100;
    const descValor = subtotal * (descPerc / 100);
    const total = subtotal - descValor;

    const qtdItens = (itens || []).length;
    const itensRows = (itens || []).map((it, i) => `
        <tr>
            <td>${String(i + 1).padStart(3, '0')}</td>
            <td>${it.produto_nome || it.nome_customizado || '-'}</td>
            <td style="text-align:center;">${it.quantidade}</td>
            <td style="text-align:right;">${formatarMoeda(it.preco_unitario)}</td>
            <td style="text-align:right;">${formatarMoeda(it.subtotal)}</td>
        </tr>
    `).join('');

    // Quando houver poucos itens, completa com linhas em branco até um teto
    // que caiba em uma página A4; se houver muitos itens, não adiciona linhas vazias
    // e deixa o fluxo natural quebrar em múltiplas páginas.
    const LIMITE_UMA_PAGINA = 22;
    const linhasVazias = qtdItens <= LIMITE_UMA_PAGINA ? (LIMITE_UMA_PAGINA - qtdItens) : 0;
    const vazias = Array.from({ length: linhasVazias }, () => '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>').join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Orçamento ${orcamento.numero || orcamento.id}</title>
<style>
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f3a5f; }
    .doc { width: 194mm; margin: 0 auto; padding: 4mm 0; }

    .topo { display: flex; border: 2px solid #1f3a5f; }
    .topo .logo { flex: 2; padding: 8px; border-right: 1px solid #1f3a5f; text-align: center; }
    .topo .logo .title { font-size: 18px; font-weight: 800; }
    .topo .logo .sub { font-size: 9px; color: #555; margin-top: 2px; }
    .topo .contato { flex: 2; padding: 8px; font-size: 11px; border-right: 1px solid #1f3a5f; line-height: 1.35; }
    .topo .numero { flex: 1; padding: 8px; text-align: center; }
    .topo .numero .lbl { font-weight: 700; font-size: 12px; }
    .topo .numero .num { margin-top: 4px; padding: 6px; border: 1px solid #1f3a5f; font-weight: 700; font-size: 13px; }

    .cliente-box { border: 2px solid #1f3a5f; border-top: none; padding: 6px 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 14px; font-size: 11px; }
    .cliente-box .row { display: flex; gap: 4px; }
    .cliente-box .row .label { font-weight: 700; min-width: 95px; text-align: right; }
    .cliente-box .row .val { flex: 1; border-bottom: 1px solid #1f3a5f; }

    table.items { width: 100%; border-collapse: collapse; border: 2px solid #1f3a5f; }
    table.items thead { display: table-header-group; }
    table.items thead th { background: #eaf1fb; color: #1f3a5f; font-size: 11px; padding: 4px; border: 1px solid #1f3a5f; }
    table.items tbody td { font-size: 10px; padding: 3px 5px; border: 1px solid #b9c4d6; height: 16px; }

    .resumo { display: grid; grid-template-columns: 2fr 1fr; border: 2px solid #1f3a5f; border-top: none; page-break-inside: avoid; }
    .resumo .obs { padding: 8px; border-right: 1px solid #1f3a5f; font-size: 10px; }
    .resumo .totais { display: grid; grid-template-columns: 1fr 1fr; font-size: 11px; }
    .resumo .totais .cel { padding: 4px 8px; border-bottom: 1px solid #b9c4d6; }
    .resumo .totais .cel.lbl { text-align: right; font-weight: 700; border-right: 1px solid #b9c4d6; background: #f5f8fc; }
    .resumo .totais .cel:last-child, .resumo .totais .cel:nth-last-child(2) { border-bottom: none; }

    .actions { text-align: right; margin: 10px; }
    .actions button { padding: 6px 12px; cursor: pointer; font-size: 12px; }

    @media print {
        .actions { display: none; }
        .doc { padding: 0; }
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
            <div class="logo">
                <div class="title">${(empresa.nome_fantasia || 'IDEART').toUpperCase()}</div>
                <div class="sub">${empresa.razao_social || ''}</div>
            </div>
            <div class="contato">
                <div><strong>ENDEREÇO:</strong> ${[empresa.endereco, empresa.cidade, empresa.estado].filter(Boolean).join(' - ')}</div>
                <div><strong>TELEFONE:</strong> ${empresa.telefone || ''}</div>
                <div><strong>E-MAIL:</strong> ${empresa.email || ''}</div>
            </div>
            <div class="numero">
                <div class="lbl">ORÇAMENTO Nº</div>
                <div class="num">${orcamento.numero || orcamento.id}</div>
            </div>
        </div>

        <div class="cliente-box">
            <div class="row"><div class="label">Nome:</div><div class="val">${orcamento.cliente_nome || ''}</div></div>
            <div class="row"><div class="label">Data:</div><div class="val">${formatarData(orcamento.data_criacao)}</div></div>
            <div class="row"><div class="label">Email:</div><div class="val">${orcamento.cliente_email || ''}</div></div>
            <div class="row"><div class="label">Cidade/Estado:</div><div class="val">${[orcamento.cliente_cidade, orcamento.cliente_estado].filter(Boolean).join(' / ')}</div></div>
            <div class="row"><div class="label">Telefone:</div><div class="val">${orcamento.cliente_telefone || ''}</div></div>
            <div class="row"><div class="label">Profissional:</div><div class="val">${orcamento.profissional_nome || '-'}</div></div>
        </div>

        <table class="items">
            <thead>
                <tr>
                    <th style="width:52px;">Código</th>
                    <th>Produto</th>
                    <th style="width:70px;">Quantidade</th>
                    <th style="width:90px;">Valor Unitário</th>
                    <th style="width:90px;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itensRows}
                ${vazias}
            </tbody>
        </table>

        <div class="resumo">
            <div class="obs">
                <div><strong>Observações:</strong><br>${(orcamento.observacoes || '').replace(/\n/g,'<br>')}</div>
                <div style="margin-top:14px;"><strong>Assinatura:</strong> ${orcamento.assinatura || '_________________________'}</div>
            </div>
            <div class="totais">
                <div class="cel lbl">Desconto</div><div class="cel">${descPerc}%</div>
                <div class="cel lbl">Total</div><div class="cel">${formatarMoeda(subtotal)}</div>
                <div class="cel lbl">Total com desconto</div><div class="cel">${formatarMoeda(total)}</div>
                <div class="cel lbl">Válido até</div><div class="cel">${formatarData(orcamento.data_validade)}</div>
                <div class="cel lbl">Forma de Pagamento</div><div class="cel">${orcamento.forma_pagamento || '-'}</div>
            </div>
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
        .filters-row { display:flex; gap:.5rem; margin-bottom:1rem; flex-wrap:wrap; }
        .filters-row input, .filters-row select { flex:1; min-width:150px; padding:.5rem; border:1px solid #ddd; border-radius:6px; }
        .section-title { color: var(--primary-blue); font-size:1.1rem; margin: 1.25rem 0 .75rem 0; padding-bottom: .3rem; border-bottom:2px solid var(--light-blue); }
        .acoes-row { display:flex; gap:.25rem; flex-wrap:wrap; }
        .btn-icone { background:none; border:1px solid transparent; padding:.25rem .4rem; cursor:pointer; border-radius:4px; }
        .btn-icone:hover { background:#f0f4fb; }
        .btn-icone:disabled { opacity:.3; cursor:not-allowed; }
        .orc-itens-table th, .orc-itens-table td { padding:.5rem; font-size:.9rem; }
        .orc-itens-table input[type=number] { padding:.3rem; border:1px solid #ddd; border-radius:4px; }
        .totals-box { margin-top:1rem; background:#f5f8fc; border-radius:8px; padding:1rem 1.5rem; display:flex; flex-direction:column; gap:.4rem; align-items:flex-end; }
        .totals-box > div { display:flex; gap:1rem; min-width:260px; justify-content:space-between; }
        .totals-box .total-final { border-top:2px solid var(--primary-blue); padding-top:.4rem; margin-top:.25rem; font-size:1.1rem; color: var(--primary-blue); }
    `;
    document.head.appendChild(style);
}
