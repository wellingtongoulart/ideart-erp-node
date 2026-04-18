/**
 * Página de Produtos
 * Gerenciamento de produtos do sistema
 */

import { abrirEdicao } from '../edit-modal.js';
import { BuscaAvancada } from '../busca-avancada.js';
import { DataTable } from '../data-table.js';
import { formatarMoeda } from '../utils.js';

let tabelaProdutos = null;

export const produtosPage = {
    title: 'Produtos',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Produtos</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoProdutoBtn">
                    <i class="fas fa-plus"></i> Novo Produto
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div id="produtosTableMount"></div>
        </div>

        <!-- Modal de Novo Produto -->
        <div class="modal" id="modalNovoProduto">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Produto</h3>
                    <button class="modal-close" id="fecharModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoProduto">
                        <div class="form-group">
                            <label for="produtoNome">Nome do Produto *</label>
                            <input type="text" id="produtoNome" name="nome" required placeholder="Digite o nome do produto">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="produtoCategoria">Categoria</label>
                                <input type="text" id="produtoCategoria" name="categoria" placeholder="Ex: Eletrônicos">
                            </div>
                            <div class="form-group">
                                <label for="produtoSku">SKU</label>
                                <input type="text" id="produtoSku" name="sku" placeholder="Ex: PROD001">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="produtoDescricao">Descrição</label>
                            <textarea id="produtoDescricao" name="descricao" rows="3" placeholder="Digite a descrição do produto"></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="produtoPrecoCusto">Preço de Custo (R$)</label>
                                <input type="number" id="produtoPrecoCusto" name="preco_custo" step="0.01" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label for="produtoPrecoVenda">Preço de Venda (R$) *</label>
                                <input type="number" id="produtoPrecoVenda" name="preco_venda" step="0.01" required placeholder="0.00">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="produtoFornecedor">Fornecedor</label>
                                <input type="text" id="produtoFornecedor" name="fornecedor" placeholder="Ex: Samsung">
                            </div>
                            <div class="form-group">
                                <label for="produtoEstoque">Estoque</label>
                                <input type="number" id="produtoEstoque" name="estoque" min="0" value="0" placeholder="0">
                            </div>
                        </div>
                        <div class="form-group checkbox">
                            <input type="checkbox" id="produtoAtivo" name="ativo" checked>
                            <label for="produtoAtivo">Produto Ativo</label>
                        </div>

                        <div class="alert alert-info" id="mensagemProduto" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarProdutoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarProdutoBtn">
                        <i class="fas fa-save"></i> Salvar Produto
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de produtos
 */
export function inicializarProdutos() {
    const novoProdutoBtn = document.getElementById('novoProdutoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const cancelarProdutoBtn = document.getElementById('cancelarProdutoBtn');
    const salvarProdutoBtn = document.getElementById('salvarProdutoBtn');
    const modalNovoProduto = document.getElementById('modalNovoProduto');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Inicializa tabela paginada/ordenável
    tabelaProdutos = new DataTable({
        mount: document.getElementById('produtosTableMount'),
        endpoint: '/api/produtos',
        tamanhoPagina: 10,
        ordenacaoPadrao: { chave: 'criado_em', direcao: 'desc' },
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Buscar por nome ou SKU...' },
            { chave: 'categoria', tipo: 'select',
              placeholder: 'Todas as categorias',
              opcoesEndpoint: '/api/produtos/categorias/lista' },
            { chave: 'fornecedor', tipo: 'select',
              placeholder: 'Todos os fornecedores',
              opcoesEndpoint: '/api/produtos/fornecedores/lista' },
            { chave: 'ativo', tipo: 'select', opcoes: [
                { valor: 'true', rotulo: 'Somente ativos' },
                { valor: 'false', rotulo: 'Somente inativos' }
            ], placeholder: 'Ativos e inativos' },
            { tipo: 'number-range', rotulo: 'Preço',
              chaveMin: 'preco_min', chaveMax: 'preco_max',
              step: '0.01', placeholderMin: 'R$ mín', placeholderMax: 'R$ máx' },
            { tipo: 'number-range', rotulo: 'Estoque',
              chaveMin: 'estoque_min', chaveMax: 'estoque_max',
              step: '1', placeholderMin: 'Mín', placeholderMax: 'Máx' }
        ],
        colunas: [
            { chave: 'id', rotulo: 'ID', ordenavel: true, largura: '70px' },
            { chave: 'nome', rotulo: 'Nome', ordenavel: true },
            { chave: 'categoria', rotulo: 'Categoria', ordenavel: true,
              formatar: (p) => p.categoria || '-' },
            { chave: 'fornecedor', rotulo: 'Fornecedor', ordenavel: true,
              formatar: (p) => p.fornecedor || '-' },
            { chave: 'preco_venda', rotulo: 'Preço', ordenavel: true,
              formatar: (p) => formatarMoeda(p.preco_venda || 0) },
            { chave: 'estoque', rotulo: 'Estoque', ordenavel: true }
        ],
        acoes: (p) => `
            <button class="btn btn-primary btn-small" onclick="editarProduto(${p.id})">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-secondary btn-small" onclick="deletarProduto(${p.id})">
                <i class="fas fa-trash"></i> Deletar
            </button>
        `
    });
    tabelaProdutos.inicializar();

    // Abrir modal
    if (novoProdutoBtn) {
        novoProdutoBtn.addEventListener('click', abrirModalNovoProduto);
    }

    // Buscar produtos
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaProdutos);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalProduto);
    }

    if (cancelarProdutoBtn) {
        cancelarProdutoBtn.addEventListener('click', fecharModalProduto);
    }

    // Salvar produto
    if (salvarProdutoBtn) {
        salvarProdutoBtn.addEventListener('click', salvarNovoProduto);
    }

    // Fechar modal ao clicar fora
    if (modalNovoProduto) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoProduto) {
                fecharModalProduto();
            }
        });
    }
}

function recarregarTabela() {
    if (tabelaProdutos) tabelaProdutos.recarregar();
}

/**
 * Abre o modal para criar novo produto
 */
function abrirModalNovoProduto() {
    const modal = document.getElementById('modalNovoProduto');
    const form = document.getElementById('formNovoProduto');

    if (form) {
        form.reset();
    }

    limparMensagemProduto();

    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Fecha o modal de produto
 */
function fecharModalProduto() {
    const modal = document.getElementById('modalNovoProduto');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Salva um novo produto
 */
function salvarNovoProduto(e) {
    e.preventDefault();

    const form = document.getElementById('formNovoProduto');
    if (!form) return;

    const nome = document.getElementById('produtoNome').value.trim();
    const categoria = document.getElementById('produtoCategoria').value.trim();
    const sku = document.getElementById('produtoSku').value.trim();
    const descricao = document.getElementById('produtoDescricao').value.trim();
    const preco_custo = parseFloat(document.getElementById('produtoPrecoCusto').value) || 0;
    const preco_venda = parseFloat(document.getElementById('produtoPrecoVenda').value);
    const fornecedor = document.getElementById('produtoFornecedor').value.trim();
    const estoque = parseInt(document.getElementById('produtoEstoque').value) || 0;

    // Validação
    if (!nome) {
        mostrarMensagemProduto('Nome do produto é obrigatório', 'erro');
        return;
    }

    if (!preco_venda || preco_venda <= 0) {
        mostrarMensagemProduto('Preço de venda é obrigatório e deve ser maior que zero', 'erro');
        return;
    }

    // Desabilitar botão durante envio
    const salvarBtn = document.getElementById('salvarProdutoBtn');
    salvarBtn.disabled = true;
    salvarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

    const dados = {
        nome,
        categoria,
        sku,
        descricao,
        preco_custo,
        preco_venda,
        fornecedor,
        estoque,
        ativo: document.getElementById('produtoAtivo').checked
    };

    fetch('/api/produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarMensagemProduto('Produto criado com sucesso!', 'sucesso');

                setTimeout(() => {
                    fecharModalProduto();
                    recarregarTabela();
                }, 1500);
            } else {
                mostrarMensagemProduto(data.mensagem || 'Erro ao salvar produto', 'erro');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemProduto('Erro ao comunicar com o servidor', 'erro');
        })
        .finally(() => {
            salvarBtn.disabled = false;
            salvarBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Produto';
        });
}

/**
 * Edita um produto existente
 */
export function editarProduto(id) {
    abrirEdicao('produto', id);
}

/**
 * Deleta um produto
 */
export function deletarProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Produto deletado com sucesso!');
                    recarregarTabela();
                } else {
                    alert(data.mensagem || 'Erro ao deletar produto');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar produto');
            });
    }
}

/**
 * Mostra mensagem no modal de produto
 */
function mostrarMensagemProduto(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemProduto');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Limpa mensagem do modal de produto
 */
function limparMensagemProduto() {
    const messageEl = document.getElementById('mensagemProduto');
    if (messageEl) {
        messageEl.style.display = 'none';
        messageEl.textContent = '';
    }
}

/**
 * Abre o modal de busca de produtos
 */
function abrirBuscaProdutos() {
    if (!window.buscaProdutos) {
        window.buscaProdutos = new BuscaAvancada({
            endpoint: '/api/produtos',
            titulo: 'Buscar Produtos',
            campos: ['nome', 'categoria', 'sku'],
            onResultado: (produto) => {
                const mount = document.getElementById('produtosTableMount');
                if (mount) {
                    mount.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        const linhas = mount.querySelectorAll('tbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == produto.id) {
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
    window.buscaProdutos.abrir();
}

// Handlers chamados via onclick="..." inline nos templates HTML
window.editarProduto = editarProduto;
window.deletarProduto = deletarProduto;
