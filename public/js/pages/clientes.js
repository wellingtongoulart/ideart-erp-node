/**
 * Página de Clientes
 * Gerenciamento de clientes do sistema
 */

const clientesPage = {
    title: 'Clientes',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Clientes</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoClienteBtn">
                    <i class="fas fa-plus"></i> Novo Cliente
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="clientesTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Cidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="clientesTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Novo Cliente -->
        <div class="modal" id="modalNovoCliente">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Cliente</h3>
                    <button class="modal-close" id="fecharModalClienteBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoCliente">
                        <div class="form-group">
                            <label for="cliNome">Nome *</label>
                            <input type="text" id="cliNome" name="nome" required placeholder="Nome completo">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliEmail">Email</label>
                                <input type="email" id="cliEmail" name="email" placeholder="email@example.com">
                            </div>
                            <div class="form-group">
                                <label for="cliTelefone">Telefone</label>
                                <input type="text" id="cliTelefone" name="telefone" placeholder="(11) 99999-9999">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="cliEndereco">Endereço</label>
                            <input type="text" id="cliEndereco" name="endereco" placeholder="Rua, número">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="cliCidade">Cidade</label>
                                <input type="text" id="cliCidade" name="cidade" placeholder="São Paulo">
                            </div>
                            <div class="form-group">
                                <label for="cliEstado">Estado</label>
                                <input type="text" id="cliEstado" name="estado" placeholder="SP">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="cliCEP">CEP</label>
                            <input type="text" id="cliCEP" name="cep" placeholder="00000-000">
                        </div>

                        <div class="alert alert-info" id="mensagemCliente" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarClienteBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarClienteBtn">
                        <i class="fas fa-save"></i> Salvar Cliente
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de clientes
 */
function inicializarClientes() {
    const novoClienteBtn = document.getElementById('novoClienteBtn');
    const fecharModalBtn = document.getElementById('fecharModalClienteBtn');
    const cancelarClienteBtn = document.getElementById('cancelarClienteBtn');
    const salvarClienteBtn = document.getElementById('salvarClienteBtn');
    const modalNovoCliente = document.getElementById('modalNovoCliente');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar lista de clientes
    carregarClientes();

    // Abrir modal para novo cliente
    if (novoClienteBtn) {
        novoClienteBtn.addEventListener('click', abrirModalNovoCliente);
    }

    // Buscar clientes
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaClientes);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalCliente);
    }

    if (cancelarClienteBtn) {
        cancelarClienteBtn.addEventListener('click', fecharModalCliente);
    }

    // Salvar cliente
    if (salvarClienteBtn) {
        salvarClienteBtn.addEventListener('click', salvarNovoCliente);
    }

    // Fechar modal ao clicar fora
    if (modalNovoCliente) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoCliente) {
                fecharModalCliente();
            }
        });
    }
}

/**
 * Carrega a lista de clientes do servidor
 */
function carregarClientes() {
    fetch('/api/clientes')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('clientesTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(cliente => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cliente.id}</td>
                        <td>${cliente.nome}</td>
                        <td>${cliente.email || '-'}</td>
                        <td>${cliente.telefone || '-'}</td>
                        <td>${cliente.cidade || '-'}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarCliente(${cliente.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarCliente(${cliente.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar clientes:', erro);
            alert('Erro ao carregar clientes');
        });
}

/**
 * Abre o modal para criar novo cliente
 */
function abrirModalNovoCliente() {
    const modal = document.getElementById('modalNovoCliente');
    const form = document.getElementById('formNovoCliente');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo cliente
 */
function fecharModalCliente() {
    const modal = document.getElementById('modalNovoCliente');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo cliente
 */
function salvarNovoCliente() {
    const form = document.getElementById('formNovoCliente');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.nome) {
        mostrarMensagemCliente('Nome é obrigatório', 'warning');
        return;
    }

    fetch('/api/clientes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Cliente salvo com sucesso!');
                fecharModalCliente();
                carregarClientes();
            } else {
                mostrarMensagemCliente(data.mensagem || 'Erro ao salvar cliente', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemCliente('Erro ao salvar cliente', 'error');
        });
}

/**
 * Edita um cliente
 */
function editarCliente(id) {
    abrirEdicao('cliente', id);
}

/**
 * Deleta um cliente
 */
function deletarCliente(id) {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
        fetch(`/api/clientes/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Cliente deletado com sucesso!');
                    carregarClientes();
                } else {
                    alert(data.mensagem || 'Erro ao deletar cliente');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar cliente');
            });
    }
}

/**
 * Mostra mensagem no modal de cliente
 */
function mostrarMensagemCliente(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemCliente');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de clientes
 */
function abrirBuscaClientes() {
    if (!window.buscaClientes) {
        window.buscaClientes = new BuscaAvancada({
            endpoint: '/api/clientes',
            titulo: 'Buscar Clientes',
            campos: ['nome', 'email', 'telefone'],
            onResultado: (cliente) => {
                // Scroll até a tabela
                const table = document.getElementById('clientesTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do cliente encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#clientesTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == cliente.id) {
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
    window.buscaClientes.abrir();
}
