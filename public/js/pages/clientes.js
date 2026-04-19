/**
 * Página de Clientes
 * Gerenciamento de clientes do sistema
 */

import { abrirEdicao } from '../edit-modal.js';
import { BuscaAvancada } from '../busca-avancada.js';
import { DataTable } from '../data-table.js';

let tabelaClientes = null;

export const clientesPage = {
    title: 'Clientes',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Clientes</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoClienteBtn">
                    <i class="fas fa-plus"></i> Novo Cliente
                </button>
            </div>
            <div id="clientesTableMount"></div>
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
export function inicializarClientes() {
    const novoClienteBtn = document.getElementById('novoClienteBtn');
    const fecharModalBtn = document.getElementById('fecharModalClienteBtn');
    const cancelarClienteBtn = document.getElementById('cancelarClienteBtn');
    const salvarClienteBtn = document.getElementById('salvarClienteBtn');
    const modalNovoCliente = document.getElementById('modalNovoCliente');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    tabelaClientes = new DataTable({
        mount: document.getElementById('clientesTableMount'),
        endpoint: '/api/clientes',
        tamanhoPagina: 10,
        ordenacaoPadrao: { chave: 'criado_em', direcao: 'desc' },
        filtrosSalvos: { contexto: 'clientes_lista' },
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Buscar por nome, email ou telefone...' },
            { chave: 'cidade', tipo: 'text', placeholder: 'Cidade...' },
            { chave: 'estado', tipo: 'select',
              placeholder: 'Todos os estados',
              opcoesEndpoint: '/api/clientes/estados/lista' }
        ],
        colunas: [
            { chave: 'id', rotulo: 'ID', ordenavel: true, largura: '70px' },
            { chave: 'nome', rotulo: 'Nome', ordenavel: true },
            { chave: 'email', rotulo: 'Email', ordenavel: true,
              formatar: (c) => c.email || '-' },
            { chave: 'telefone', rotulo: 'Telefone', ordenavel: true,
              formatar: (c) => c.telefone || '-' },
            { chave: 'cidade', rotulo: 'Cidade', ordenavel: true,
              formatar: (c) => c.cidade || '-' }
        ],
        acoes: (c) => `
            <button class="btn btn-primary btn-small" onclick="editarCliente(${c.id})">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-secondary btn-small" onclick="deletarCliente(${c.id})">
                <i class="fas fa-trash"></i> Deletar
            </button>
        `
    });
    tabelaClientes.inicializar();

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

function recarregarTabela() {
    if (tabelaClientes) tabelaClientes.recarregar();
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
        modal.classList.add('show');
    }
}

/**
 * Fecha o modal de novo cliente
 */
function fecharModalCliente() {
    const modal = document.getElementById('modalNovoCliente');
    if (modal) {
        modal.classList.remove('show');
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
                recarregarTabela();
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
export function editarCliente(id) {
    abrirEdicao('cliente', id);
}

/**
 * Deleta um cliente
 */
export function deletarCliente(id) {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
        fetch(`/api/clientes/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Cliente deletado com sucesso!');
                    recarregarTabela();
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
                const mount = document.getElementById('clientesTableMount');
                if (mount) {
                    mount.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        const linhas = mount.querySelectorAll('tbody tr');
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

// Handlers chamados via onclick="..." inline nos templates HTML
window.editarCliente = editarCliente;
window.deletarCliente = deletarCliente;
