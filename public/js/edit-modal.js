/**
 * Sistema de Edição com Modal Contextualizado
 * Funciona para todos os módulos (produtos, clientes, etc.)
 */

class EditModal {
  constructor(tipoItem, endpoint, campos) {
    this.tipoItem = tipoItem; // 'produto', 'cliente', etc.
    this.endpoint = endpoint; // '/api/produtos', '/api/clientes', etc.
    this.campos = campos; // Array de campos para o formulário
    this.modal = null;
    this.itemAtual = null;
  }

  /**
   * Abre o modal de edição para um item
   */
  async abrirEdicao(id) {
    try {
      // Buscar dados do item
      const response = await fetch(`${this.endpoint}/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('user_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do item');
      }

      const data = await response.json();
      this.itemAtual = data.dados;

      // Preparar campos com valores
      const camposComValores = this.campos.map(campo => ({
        ...campo,
        value: this.itemAtual[campo.name] || ''
      }));

      // Criar e exibir modal
      this.criarModal(camposComValores);

    } catch (erro) {
      console.error('Erro ao abrir edição:', erro);
      this.mostrarErro('Erro ao carregar dados para edição');
    }
  }

  /**
   * Cria o modal de edição
   */
  criarModal(campos) {
    const modalId = `edit-modal-${this.tipoItem}-${Date.now()}`;

    // Fechar modal anterior se existir
    const modalAnterior = document.getElementById(modalId);
    if (modalAnterior) {
      modalAnterior.remove();
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Editar ${this.tipoItem}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-${modalId}" class="edit-form">
                        <input type="hidden" name="id" value="${this.itemAtual.id}">
                        ${this.renderizarCampos(campos, modalId)}
                    </form>
                    <div class="alert-container" id="alert-${modalId}"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelar-${modalId}">Cancelar</button>
                    <button class="btn btn-primary" id="salvar-${modalId}">
                        <i class="fas fa-save"></i> Salvar Alterações
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.modal = modal;

    // Adicionar event listeners
    this.adicionarEventListeners(modalId);
  }

  /**
   * Renderiza campos do formulário
   */
  renderizarCampos(campos, modalId) {
    return campos.map(campo => {
      const { name, label, type = 'text', required = false, placeholder = '', options = [] } = campo;

      if (type === 'hidden') {
        return `<input type="hidden" name="${name}" value="${campo.value || ''}">`;
      }

      if (type === 'textarea') {
        return `
                    <div class="form-group">
                        <label for="${modalId}-${name}">${label}${required ? ' <span style="color:red">*</span>' : ''}</label>
                        <textarea 
                            id="${modalId}-${name}" 
                            name="${name}" 
                            rows="4" 
                            placeholder="${placeholder}"
                            ${required ? 'required' : ''}
                        >${campo.value || ''}</textarea>
                    </div>
                `;
      }

      if (type === 'select') {
        const optionsHtml = options.map(opt => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          const selected = val === campo.value ? 'selected' : '';
          return `<option value="${val}" ${selected}>${label}</option>`;
        }).join('');

        return `
                    <div class="form-group">
                        <label for="${modalId}-${name}">${label}${required ? ' <span style="color:red">*</span>' : ''}</label>
                        <select 
                            id="${modalId}-${name}" 
                            name="${name}"
                            ${required ? 'required' : ''}
                        >
                            <option value="">Selecione...</option>
                            ${optionsHtml}
                        </select>
                    </div>
                `;
      }

      if (type === 'number') {
        return `
                    <div class="form-group">
                        <label for="${modalId}-${name}">${label}${required ? ' <span style="color:red">*</span>' : ''}</label>
                        <input 
                            type="number" 
                            id="${modalId}-${name}" 
                            name="${name}" 
                            value="${campo.value || ''}"
                            placeholder="${placeholder}"
                            step="0.01"
                            ${required ? 'required' : ''}
                        >
                    </div>
                `;
      }

      if (type === 'checkbox') {
        return `
                    <div class="form-group">
                        <input 
                            type="checkbox" 
                            id="${modalId}-${name}" 
                            name="${name}" 
                            ${campo.value ? 'checked' : ''}
                        >
                        <label for="${modalId}-${name}">${label}</label>
                    </div>
                `;
      }

      // Text, email, date, etc.
      return `
                <div class="form-group">
                    <label for="${modalId}-${name}">${label}${required ? ' <span style="color:red">*</span>' : ''}</label>
                    <input 
                        type="${type}" 
                        id="${modalId}-${name}" 
                        name="${name}" 
                        value="${campo.value || ''}"
                        placeholder="${placeholder}"
                        ${required ? 'required' : ''}
                    >
                </div>
            `;
    }).join('');
  }

  /**
   * Adiciona event listeners ao modal
   */
  adicionarEventListeners(modalId) {
    const fecharBtn = this.modal.querySelector('.modal-close');
    const cancelarBtn = document.getElementById(`cancelar-${modalId}`);
    const salvarBtn = document.getElementById(`salvar-${modalId}`);
    const form = document.getElementById(`form-${modalId}`);

    fecharBtn.addEventListener('click', () => this.fecharModal());
    cancelarBtn.addEventListener('click', () => this.fecharModal());
    salvarBtn.addEventListener('click', () => this.salvarEdicao(form, modalId));

    // Fechar ao clicar fora do modal
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.fecharModal();
      }
    });
  }

  /**
   * Salva as alterações
   */
  async salvarEdicao(form, modalId) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData);

    try {
      const response = await fetch(`${this.endpoint}/${dados.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('user_token')}`
        },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (result.sucesso) {
        this.mostrarSucesso('Alterações salvas com sucesso!');
        setTimeout(() => {
          this.fecharModal();
          // Recarregar a lista
          window.location.reload();
        }, 1500);
      } else {
        this.mostrarErro(result.mensagem || 'Erro ao salvar alterações');
      }
    } catch (erro) {
      console.error('Erro ao salvar:', erro);
      this.mostrarErro('Erro ao conectar ao servidor');
    }
  }

  /**
   * Fecha o modal
   */
  fecharModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  /**
   * Mostra mensagem de erro
   */
  mostrarErro(mensagem) {
    const alertDiv = this.modal.querySelector('[class*="alert-container"]');
    if (alertDiv) {
      alertDiv.innerHTML = `<div class="alert alert-danger">${mensagem}</div>`;
    } else {
      alert(mensagem);
    }
  }

  /**
   * Mostra mensagem de sucesso
   */
  mostrarSucesso(mensagem) {
    const alertDiv = this.modal.querySelector('[class*="alert-container"]');
    if (alertDiv) {
      alertDiv.innerHTML = `<div class="alert alert-success">${mensagem}</div>`;
    }
  }
}

// Criar instâncias globais para cada módulo
const editModals = {
  produto: new EditModal('Produto', '/api/produtos', [
    { name: 'nome', label: 'Nome do Produto', required: true },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { name: 'categoria', label: 'Categoria' },
    { name: 'sku', label: 'SKU' },
    { name: 'preco_custo', label: 'Preço de Custo', type: 'number' },
    { name: 'preco_venda', label: 'Preço de Venda', type: 'number', required: true },
    { name: 'estoque', label: 'Estoque', type: 'number' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox' }
  ]),

  cliente: new EditModal('Cliente', '/api/clientes', [
    { name: 'nome', label: 'Nome', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'telefone', label: 'Telefone' },
    { name: 'endereco', label: 'Endereço' },
    { name: 'cidade', label: 'Cidade' },
    { name: 'estado', label: 'Estado' },
    { name: 'cep', label: 'CEP' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox' }
  ]),

  profissional: new EditModal('Profissional', '/api/profissionais', [
    { name: 'nome', label: 'Nome', required: true },
    { name: 'especialidade', label: 'Especialidade' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'telefone', label: 'Telefone' },
    { name: 'disponibilidade', label: 'Disponibilidade' },
    { name: 'ativo', label: 'Ativo', type: 'checkbox' }
  ]),

  orcamento: new EditModal('Orçamento', '/api/orcamentos', [
    { name: 'numero', label: 'Número', required: true },
    { name: 'cliente_id', label: 'Cliente' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { name: 'valor_total', label: 'Valor Total', type: 'number' },
    { name: 'data_validade', label: 'Data de Validade', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Aprovado', 'Rejeitado'] }
  ]),

  pedido: new EditModal('Pedido', '/api/pedidos', [
    { name: 'numero', label: 'Número', required: true },
    { name: 'cliente_id', label: 'Cliente' },
    { name: 'data_entrega', label: 'Data de Entrega', type: 'date' },
    { name: 'valor_total', label: 'Valor Total', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Confirmado', 'Enviado', 'Entregue'] }
  ]),

  documento: new EditModal('Documento', '/api/documentos', [
    { name: 'titulo', label: 'Título', required: true },
    { name: 'tipo', label: 'Tipo' },
    { name: 'conteudo', label: 'Conteúdo', type: 'textarea' },
    { name: 'versao', label: 'Versão', type: 'number' }
  ]),

  logistica: new EditModal('Logística', '/api/logistica', [
    { name: 'pedido_id', label: 'Pedido' },
    { name: 'codigo_rastreamento', label: 'Código de Rastreamento', required: true },
    { name: 'transportadora', label: 'Transportadora' },
    { name: 'data_envio', label: 'Data de Envio', type: 'date' },
    { name: 'data_entrega', label: 'Data de Entrega', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Enviado', 'Em Trânsito', 'Entregue'] }
  ])
};

// Função global para abrir edição
function abrirEdicao(tipoItem, id) {
  if (editModals[tipoItem]) {
    editModals[tipoItem].abrirEdicao(id);
  } else {
    console.error(`Tipo de item não encontrado: ${tipoItem}`);
  }
}
