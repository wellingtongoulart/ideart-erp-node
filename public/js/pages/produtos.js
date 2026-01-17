/**
 * Página de Produtos
 * Gerenciamento de produtos do sistema
 */

// Configuração da página de produtos
const produtosPage = {
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
            <div class="table-wrapper">
                <table id="produtosTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="produtosTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
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

                        <div class="form-group">
                            <label for="produtoEstoque">Estoque</label>
                            <input type="number" id="produtoEstoque" name="estoque" min="0" value="0" placeholder="0">
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
function inicializarProdutos() {
    const novoProdutoBtn = document.getElementById('novoProdutoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const cancelarProdutoBtn = document.getElementById('cancelarProdutoBtn');
    const salvarProdutoBtn = document.getElementById('salvarProdutoBtn');
    const modalNovoProduto = document.getElementById('modalNovoProduto');

    // Carregar lista de produtos
    carregarProdutos();

    // Abrir modal
    if (novoProdutoBtn) {
        novoProdutoBtn.addEventListener('click', abrirModalNovoProduto);
    }

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

/**
 * Carrega a lista de produtos do servidor
 */
function carregarProdutos() {
    fetch('/api/produtos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('produtosTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(produto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${produto.id}</td>
                        <td>${produto.nome}</td>
                        <td>${produto.categoria || '-'}</td>
                        <td>R$ ${parseFloat(produto.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>${produto.estoque}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarProduto(${produto.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarProduto(${produto.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar produtos:', erro);
            alert('Erro ao carregar produtos');
        });
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
                    carregarProdutos();
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
function editarProduto(id) {
    alert('Funcionalidade de edição em desenvolvimento! Produto ID: ' + id);
}

/**
 * Deleta um produto
 */
function deletarProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Produto deletado com sucesso!');
                    carregarProdutos();
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
