/**
 * Página de Profissionais
 * Gerenciamento de profissionais/funcionários do sistema
 */

const profissionaisPage = {
    title: 'Profissionais',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Profissionais</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoProfissionalBtn">
                    <i class="fas fa-plus"></i> Novo Profissional
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="table-wrapper">
                <table id="profissionaisTable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Especialidade</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="profissionaisTbody">
                        <!-- Carregado dinamicamente -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Novo Profissional -->
        <div class="modal" id="modalNovoProfissional">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Profissional</h3>
                    <button class="modal-close" id="fecharModalProfissionalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoProfissional">
                        <div class="form-group">
                            <label for="profNome">Nome *</label>
                            <input type="text" id="profNome" name="nome" required placeholder="Nome completo">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profEspecialidade">Especialidade</label>
                                <input type="text" id="profEspecialidade" name="especialidade" placeholder="Ex: Encanador">
                            </div>
                            <div class="form-group">
                                <label for="profCPF">CPF</label>
                                <input type="text" id="profCPF" name="cpf" placeholder="000.000.000-00">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profEmail">Email</label>
                                <input type="email" id="profEmail" name="email" placeholder="email@example.com">
                            </div>
                            <div class="form-group">
                                <label for="profTelefone">Telefone</label>
                                <input type="text" id="profTelefone" name="telefone" placeholder="(11) 99999-9999">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="profEndereco">Endereço</label>
                            <input type="text" id="profEndereco" name="endereco" placeholder="Rua, número">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profCidade">Cidade</label>
                                <input type="text" id="profCidade" name="cidade" placeholder="São Paulo">
                            </div>
                            <div class="form-group">
                                <label for="profEstado">Estado</label>
                                <input type="text" id="profEstado" name="estado" placeholder="SP">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="profDataAdmissao">Data de Admissão</label>
                                <input type="date" id="profDataAdmissao" name="data_admissao">
                            </div>
                            <div class="form-group">
                                <label for="profSalario">Salário</label>
                                <input type="number" id="profSalario" name="salario" step="0.01" placeholder="0.00">
                            </div>
                        </div>

                        <div class="alert alert-info" id="mensagemProfissional" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarProfissionalBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarProfissionalBtn">
                        <i class="fas fa-save"></i> Salvar Profissional
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de profissionais
 */
function inicializarProfissionais() {
    const novoProfissionalBtn = document.getElementById('novoProfissionalBtn');
    const fecharModalBtn = document.getElementById('fecharModalProfissionalBtn');
    const cancelarProfissionalBtn = document.getElementById('cancelarProfissionalBtn');
    const salvarProfissionalBtn = document.getElementById('salvarProfissionalBtn');
    const modalNovoProfissional = document.getElementById('modalNovoProfissional');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Carregar lista de profissionais
    carregarProfissionais();

    // Abrir modal para novo profissional
    if (novoProfissionalBtn) {
        novoProfissionalBtn.addEventListener('click', abrirModalNovoProfissional);
    }

    // Buscar profissionais
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaProfissionais);
    });

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalProfissional);
    }

    if (cancelarProfissionalBtn) {
        cancelarProfissionalBtn.addEventListener('click', fecharModalProfissional);
    }

    // Salvar profissional
    if (salvarProfissionalBtn) {
        salvarProfissionalBtn.addEventListener('click', salvarNovoProfissional);
    }

    // Fechar modal ao clicar fora
    if (modalNovoProfissional) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoProfissional) {
                fecharModalProfissional();
            }
        });
    }
}

/**
 * Carrega a lista de profissionais do servidor
 */
function carregarProfissionais() {
    fetch('/api/profissionais')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('profissionaisTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(profissional => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${profissional.id}</td>
                        <td>${profissional.nome}</td>
                        <td>${profissional.especialidade || '-'}</td>
                        <td>${profissional.email || '-'}</td>
                        <td>${profissional.telefone || '-'}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarProfissional(${profissional.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarProfissional(${profissional.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar profissionais:', erro);
            alert('Erro ao carregar profissionais');
        });
}

/**
 * Abre o modal para criar novo profissional
 */
function abrirModalNovoProfissional() {
    const modal = document.getElementById('modalNovoProfissional');
    const form = document.getElementById('formNovoProfissional');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha o modal de novo profissional
 */
function fecharModalProfissional() {
    const modal = document.getElementById('modalNovoProfissional');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva um novo profissional
 */
function salvarNovoProfissional() {
    const form = document.getElementById('formNovoProfissional');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.nome) {
        mostrarMensagemProfissional('Nome é obrigatório', 'warning');
        return;
    }

    fetch('/api/profissionais', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Profissional salvo com sucesso!');
                fecharModalProfissional();
                carregarProfissionais();
            } else {
                mostrarMensagemProfissional(data.mensagem || 'Erro ao salvar profissional', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemProfissional('Erro ao salvar profissional', 'error');
        });
}

/**
 * Edita um profissional
 */
function editarProfissional(id) {
    abrirEdicao('profissional', id);
}

/**
 * Deleta um profissional
 */
function deletarProfissional(id) {
    if (confirm('Tem certeza que deseja deletar este profissional?')) {
        fetch(`/api/profissionais/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Profissional deletado com sucesso!');
                    carregarProfissionais();
                } else {
                    alert(data.mensagem || 'Erro ao deletar profissional');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar profissional');
            });
    }
}

/**
 * Mostra mensagem no modal de profissional
 */
function mostrarMensagemProfissional(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemProfissional');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

/**
 * Abre o modal de busca de profissionais
 */
function abrirBuscaProfissionais() {
    if (!window.buscaProfissionais) {
        window.buscaProfissionais = new BuscaAvancada({
            endpoint: '/api/profissionais',
            titulo: 'Buscar Profissionais',
            campos: ['nome', 'especialidade', 'email'],
            onResultado: (profissional) => {
                // Scroll até a tabela
                const table = document.getElementById('profissionaisTable');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth' });

                    // Destaca a linha do profissional encontrado
                    setTimeout(() => {
                        const linhas = document.querySelectorAll('#profissionaisTbody tr');
                        linhas.forEach(linha => {
                            const idCell = linha.querySelector('td:first-child');
                            if (idCell && idCell.textContent == profissional.id) {
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
    window.buscaProfissionais.abrir();
}
