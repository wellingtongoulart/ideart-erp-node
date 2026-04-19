/**
 * Página de Documentos
 * Gerenciamento de documentos do sistema
 */

import { DataTable } from '../data-table.js';

let tabelaDocumentos = null;

const documentosPage = {
    title: 'Documentos',
    content: `
        <div class="card">
            <h2 class="card-title">Gerenciamento de Documentos</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="novoDocumentoBtn">
                    <i class="fas fa-plus"></i> Novo Documento
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div id="documentosTableMount"></div>
        </div>

        <!-- Modal de Novo Documento -->
        <div class="modal" id="modalNovoDocumento">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Novo Documento</h3>
                    <button class="modal-close" id="fecharModalDocumentoBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formNovoDocumento">
                        <div class="form-group">
                            <label for="docNome">Nome do Documento *</label>
                            <input type="text" id="docNome" name="nome" required placeholder="Nome do documento">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="docTipo">Tipo de Documento *</label>
                                <select id="docTipo" name="tipo" required>
                                    <option value="">Selecione um tipo</option>
                                    <option value="contrato">Contrato</option>
                                    <option value="fatura">Fatura</option>
                                    <option value="recibo">Recibo</option>
                                    <option value="nota_fiscal">Nota Fiscal</option>
                                    <option value="relatorio">Relatório</option>
                                    <option value="proposta">Proposta</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="docData">Data do Documento</label>
                                <input type="date" id="docData" name="data_documento">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="docTipoReferencia">Tipo de Referência</label>
                            <select id="docTipoReferencia" name="referencia_tipo">
                                <option value="">Selecione</option>
                                <option value="cliente">Cliente</option>
                                <option value="pedido">Pedido</option>
                                <option value="orcamento">Orçamento</option>
                                <option value="profissional">Profissional</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="docReferenciaId">ID da Referência</label>
                            <input type="number" id="docReferenciaId" name="referencia_id" placeholder="ID do cliente, pedido, etc">
                        </div>

                        <div class="form-group">
                            <label for="docDescricao">Descrição</label>
                            <textarea id="docDescricao" name="descricao" rows="4" placeholder="Descrição do documento"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="docArquivo">URL do Arquivo</label>
                            <input type="text" id="docArquivo" name="arquivo_url" placeholder="https://exemplo.com/documento.pdf">
                        </div>

                        <div class="alert alert-info" id="mensagemDocumento" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelarDocumentoBtn">Cancelar</button>
                    <button class="btn btn-primary" id="salvarDocumentoBtn">
                        <i class="fas fa-save"></i> Salvar Documento
                    </button>
                </div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de documentos
 */
function inicializarDocumentos() {
    const novoDocumentoBtn = document.getElementById('novoDocumentoBtn');
    const fecharModalBtn = document.getElementById('fecharModalDocumentoBtn');
    const cancelarDocumentoBtn = document.getElementById('cancelarDocumentoBtn');
    const salvarDocumentoBtn = document.getElementById('salvarDocumentoBtn');
    const modalNovoDocumento = document.getElementById('modalNovoDocumento');

    tabelaDocumentos = new DataTable({
        mount: document.getElementById('documentosTableMount'),
        endpoint: '/api/documentos',
        tamanhoPagina: 10,
        ordenacaoPadrao: { chave: 'criado_em', direcao: 'desc' },
        filtrosSalvos: { contexto: 'documentos_lista' },
        filtros: [
            { chave: 'busca', tipo: 'text', placeholder: 'Buscar por nome...' },
            { chave: 'tipo', tipo: 'select',
              placeholder: 'Todos os tipos',
              opcoes: [
                { valor: 'contrato', rotulo: 'Contrato' },
                { valor: 'fatura', rotulo: 'Fatura' },
                { valor: 'recibo', rotulo: 'Recibo' },
                { valor: 'nota_fiscal', rotulo: 'Nota Fiscal' },
                { valor: 'relatorio', rotulo: 'Relatório' },
                { valor: 'proposta', rotulo: 'Proposta' },
                { valor: 'outro', rotulo: 'Outro' }
            ]},
            { chave: 'referencia_tipo', tipo: 'select',
              placeholder: 'Qualquer referência',
              opcoes: [
                { valor: 'cliente', rotulo: 'Cliente' },
                { valor: 'pedido', rotulo: 'Pedido' },
                { valor: 'orcamento', rotulo: 'Orçamento' },
                { valor: 'profissional', rotulo: 'Profissional' },
                { valor: 'outro', rotulo: 'Outro' }
            ]},
            { tipo: 'date-range', rotulo: 'Data',
              chaveMin: 'data_inicio', chaveMax: 'data_fim' }
        ],
        colunas: [
            { chave: 'id', rotulo: 'ID', ordenavel: true, largura: '70px' },
            { chave: 'nome', rotulo: 'Nome', ordenavel: true },
            { chave: 'tipo', rotulo: 'Tipo', ordenavel: true,
              formatar: (d) => d.tipo || '-' },
            { chave: 'referencia_tipo', rotulo: 'Referência', ordenavel: true,
              formatar: (d) => d.referencia_tipo ? `${d.referencia_tipo} (#${d.referencia_id})` : '-' },
            { chave: 'data_criacao', rotulo: 'Data', ordenavel: true,
              formatar: (d) => d.data_criacao ? new Date(d.data_criacao).toLocaleDateString('pt-BR') : '-' }
        ],
        acoes: (d) => `
            <button class="btn btn-primary btn-small" onclick="verDocumento(${d.id})">
                <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn btn-secondary btn-small" onclick="deletarDocumento(${d.id})">
                <i class="fas fa-trash"></i> Deletar
            </button>
        `
    });
    tabelaDocumentos.inicializar();

    if (novoDocumentoBtn) {
        novoDocumentoBtn.addEventListener('click', abrirModalNovoDocumento);
    }

    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalDocumento);
    }

    if (cancelarDocumentoBtn) {
        cancelarDocumentoBtn.addEventListener('click', fecharModalDocumento);
    }

    if (salvarDocumentoBtn) {
        salvarDocumentoBtn.addEventListener('click', salvarNovoDocumento);
    }

    if (modalNovoDocumento) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoDocumento) {
                fecharModalDocumento();
            }
        });
    }
}

function recarregarTabela() {
    if (tabelaDocumentos) tabelaDocumentos.recarregar();
}

/**
 * Abre o modal para criar novo documento
 */
function abrirModalNovoDocumento() {
    const modal = document.getElementById('modalNovoDocumento');
    const form = document.getElementById('formNovoDocumento');

    if (form) {
        form.reset();
    }

    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Fecha o modal de novo documento
 */
function fecharModalDocumento() {
    const modal = document.getElementById('modalNovoDocumento');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Salva um novo documento
 */
function salvarNovoDocumento() {
    const form = document.getElementById('formNovoDocumento');
    if (!form) return;

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    if (!dados.nome || !dados.tipo) {
        mostrarMensagemDocumento('Nome e Tipo são obrigatórios', 'warning');
        return;
    }

    fetch('/api/documentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                alert('Documento salvo com sucesso!');
                fecharModalDocumento();
                recarregarTabela();
            } else {
                mostrarMensagemDocumento(data.mensagem || 'Erro ao salvar documento', 'error');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemDocumento('Erro ao salvar documento', 'error');
        });
}

/**
 * Visualiza um documento
 */
function verDocumento(id) {
    abrirEdicao('documento', id);
}

/**
 * Deleta um documento
 */
function deletarDocumento(id) {
    if (confirm('Tem certeza que deseja deletar este documento?')) {
        fetch(`/api/documentos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Documento deletado com sucesso!');
                    recarregarTabela();
                } else {
                    alert(data.mensagem || 'Erro ao deletar documento');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar documento');
            });
    }
}

/**
 * Mostra mensagem no modal de documento
 */
function mostrarMensagemDocumento(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemDocumento');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

window.verDocumento = verDocumento;
window.deletarDocumento = deletarDocumento;
