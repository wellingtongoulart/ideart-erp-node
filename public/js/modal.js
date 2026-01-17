/**
 * Sistema de Modal Reutilizável
 * Componente para criação e edição de registros
 */

class Modal {
    constructor(config) {
        this.id = config.id || 'modal-' + Date.now();
        this.title = config.title || 'Modal';
        this.fields = config.fields || [];
        this.onSave = config.onSave || null;
        this.onClose = config.onClose || null;
        this.submitText = config.submitText || 'Salvar';
        this.cancelText = config.cancelText || 'Cancelar';
        this.size = config.size || 'medium'; // small, medium, large
        this.modal = null;
        this.formData = {};
    }

    /**
     * Cria e renderiza o modal
     */
    render() {
        const modalElement = document.createElement('div');
        modalElement.id = this.id;
        modalElement.className = 'modal show';

        const sizeClass = `modal-${this.size}`;

        let fieldsHTML = '';
        this.fields.forEach((field, index) => {
            fieldsHTML += this.renderField(field, index);
        });
        fieldsHTML += '</div>'; // Fechar última form-row

        modalElement.innerHTML = `
            <div class="modal-content ${sizeClass}">
                <div class="modal-header">
                    <h3>${this.title}</h3>
                    <button class="modal-close" data-modal-id="${this.id}">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="form-${this.id}">
                        <div class="alert alert-info" id="mensagem-${this.id}" style="display: none;"></div>
                        ${fieldsHTML}
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelar-${this.id}">${this.cancelText}</button>
                    <button class="btn btn-primary" id="salvar-${this.id}">
                        <i class="fas fa-save"></i> ${this.submitText}
                    </button>
                </div>
            </div>
        `;

        this.modal = modalElement;
        this.attachEventListeners();
        document.body.appendChild(modalElement);

        return this.modal;
    }

    /**
     * Renderiza um campo do formulário
     */
    renderField(field, index) {
        const { name, label, type = 'text', required = false, placeholder = '', value = '', options = [], rows = 3, step, min, max } = field;

        if (type === 'hidden') {
            return `<input type="hidden" id="field-${this.id}-${name}" name="${name}" value="${value}">`;
        }

        let fieldHTML = '<div class="form-row">';

        const requiredAttr = required ? 'required' : '';
        const requiredLabel = required ? ' <span style="color: red;">*</span>' : '';

        if (type === 'textarea') {
            fieldHTML += `
                <div class="form-group">
                    <label for="field-${this.id}-${name}">${label}${requiredLabel}</label>
                    <textarea id="field-${this.id}-${name}" name="${name}" rows="${rows}" placeholder="${placeholder}" ${requiredAttr}>${value}</textarea>
                </div>
            `;
        } else if (type === 'select') {
            let optionsHTML = `<option value="">Selecione...</option>`;
            if (Array.isArray(options)) {
                options.forEach(opt => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    const selected = optValue === value ? 'selected' : '';
                    optionsHTML += `<option value="${optValue}" ${selected}>${optLabel}</option>`;
                });
            }

            fieldHTML += `
                <div class="form-group">
                    <label for="field-${this.id}-${name}">${label}${requiredLabel}</label>
                    <select id="field-${this.id}-${name}" name="${name}" ${requiredAttr}>
                        ${optionsHTML}
                    </select>
                </div>
            `;
        } else if (type === 'checkbox') {
            const checked = value ? 'checked' : '';
            fieldHTML += `
                <div class="form-group checkbox">
                    <input type="checkbox" id="field-${this.id}-${name}" name="${name}" ${checked}>
                    <label for="field-${this.id}-${name}">${label}</label>
                </div>
            `;
        } else {
            const stepAttr = step ? `step="${step}"` : '';
            const minAttr = min !== undefined ? `min="${min}"` : '';
            const maxAttr = max !== undefined ? `max="${max}"` : '';
            
            fieldHTML += `
                <div class="form-group">
                    <label for="field-${this.id}-${name}">${label}${requiredLabel}</label>
                    <input type="${type}" id="field-${this.id}-${name}" name="${name}" placeholder="${placeholder}" value="${value}" ${requiredAttr} ${stepAttr} ${minAttr} ${maxAttr}>
                </div>
            `;
        }

        fieldHTML += '</div>';

        return fieldHTML;
    }

    /**
     * Anexa event listeners ao modal
     */
    attachEventListeners() {
        // Fechar ao clicar em X
        const closeBtn = this.modal.querySelector(`[data-modal-id="${this.id}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Fechar ao clicar em Cancelar
        const cancelBtn = document.getElementById(`cancelar-${this.id}`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Salvar ao clicar em Salvar
        const saveBtn = document.getElementById(`salvar-${this.id}`);
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => this.handleSave(e));
        }

        // Fechar ao clicar fora do modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    /**
     * Handle do envio do formulário
     */
    async handleSave(e) {
        e.preventDefault();

        // Coletar dados do formulário
        const form = document.getElementById(`form-${this.id}`);
        const formData = new FormData(form);

        this.formData = {};
        for (let [key, value] of formData.entries()) {
            const field = this.fields.find(f => f.name === key);
            if (field && field.type === 'checkbox') {
                this.formData[key] = form.querySelector(`[name="${key}"]`).checked;
            } else {
                this.formData[key] = value;
            }
        }

        // Validação
        const erro = this.validarFormulario();
        if (erro) {
            this.mostrarMensagem(erro, 'erro');
            return;
        }

        // Desabilitar botão
        const saveBtn = document.getElementById(`salvar-${this.id}`);
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        try {
            // Chamar callback onSave
            if (this.onSave) {
                const resultado = await this.onSave(this.formData);
                if (resultado === false) {
                    return;
                }
            }

            this.mostrarMensagem('Salvo com sucesso!', 'sucesso');
            setTimeout(() => this.close(), 1500);
        } catch (erro) {
            this.mostrarMensagem(erro.message || 'Erro ao salvar', 'erro');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }

    /**
     * Valida o formulário
     */
    validarFormulario() {
        for (let field of this.fields) {
            if (field.required) {
                const elemento = document.getElementById(`field-${this.id}-${field.name}`);
                const valor = elemento ? elemento.value.trim() : '';

                if (!valor) {
                    return `${field.label} é obrigatório`;
                }

                // Validações específicas
                if (field.type === 'email' && valor && !validarEmail(valor)) {
                    return `${field.label} inválido`;
                }

                if (field.type === 'number' && field.min !== undefined) {
                    if (parseFloat(valor) < field.min) {
                        return `${field.label} deve ser maior que ${field.min}`;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Mostra mensagem no modal
     */
    mostrarMensagem(mensagem, tipo = 'info') {
        const msgElement = document.getElementById(`mensagem-${this.id}`);
        if (msgElement) {
            msgElement.textContent = mensagem;
            msgElement.className = `alert alert-${tipo}`;
            msgElement.style.display = 'block';
        }
    }

    /**
     * Limpa mensagem do modal
     */
    limparMensagem() {
        const msgElement = document.getElementById(`mensagem-${this.id}`);
        if (msgElement) {
            msgElement.style.display = 'none';
            msgElement.textContent = '';
        }
    }

    /**
     * Abre o modal
     */
    open() {
        if (!this.modal) {
            this.render();
        }
        this.modal.classList.add('show');
        this.limparMensagem();
    }

    /**
     * Fecha o modal
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.remove();
                }
                this.modal = null;
                if (this.onClose) {
                    this.onClose();
                }
            }, 300);
        }
    }

    /**
     * Define valores dos campos
     */
    setValues(values) {
        for (let [key, value] of Object.entries(values)) {
            const elemento = document.getElementById(`field-${this.id}-${key}`);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = value;
                } else {
                    elemento.value = value;
                }
            }
        }
    }

    /**
     * Obtém valores dos campos
     */
    getValues() {
        const values = {};
        this.fields.forEach(field => {
            const elemento = document.getElementById(`field-${this.id}-${field.name}`);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    values[field.name] = elemento.checked;
                } else {
                    values[field.name] = elemento.value;
                }
            }
        });
        return values;
    }

    /**
     * Reset do formulário
     */
    reset() {
        const form = document.getElementById(`form-${this.id}`);
        if (form) {
            form.reset();
        }
        this.limparMensagem();
    }
}

// Criar alias para compatibilidade
const ModalForm = Modal;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Modal, ModalForm };
}
