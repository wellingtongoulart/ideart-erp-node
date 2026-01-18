/**
 * Sistema de Busca Avançada
 * Modal inteligente de busca com filtros contextuais
 */

class BuscaAvancada {
    constructor(config) {
        this.endpoint = config.endpoint;
        this.tituloModal = config.titulo;
        this.campos = config.campos; // Array de campos para buscar
        this.filtros = config.filtros || {}; // Filtros adicionais específicos
        this.onResultado = config.onResultado;
        this.onBuscar = config.onBuscar;
        this.resultados = [];
        this.modalId = `modalBusca_${Math.random().toString(36).substr(2, 9)}`;
        
        this.criar();
    }

    criar() {
        // Cria o modal HTML
        const modalHtml = `
            <div class="modal" id="${this.modalId}">
                <div class="modal-content" style="min-width: 500px;">
                    <div class="modal-header">
                        <h3>${this.tituloModal}</h3>
                        <button class="modal-close" id="fecharBusca_${this.modalId}">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 20px;">
                            <input type="text" 
                                id="inputBusca_${this.modalId}" 
                                placeholder="Digite para buscar..." 
                                class="form-control" 
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                                Buscando por: ${this.campos.join(', ')}
                            </div>
                        </div>

                        <div id="resultadosBusca_${this.modalId}" style="max-height: 400px; overflow-y: auto;">
                            <!-- Resultados carregados dinamicamente -->
                        </div>

                        <div id="statusBusca_${this.modalId}" style="text-align: center; color: #999; padding: 20px;">
                            Digite para buscar...
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insere o modal no DOM
        const temp = document.createElement('div');
        temp.innerHTML = modalHtml;
        document.body.appendChild(temp.firstElementChild);

        // Adiciona event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inputBusca = document.getElementById(`inputBusca_${this.modalId}`);
        const fecharBtn = document.getElementById(`fecharBusca_${this.modalId}`);
        const modal = document.getElementById(this.modalId);

        // Busca enquanto digita
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.trim();
            if (termo.length >= 2) {
                this.buscar(termo);
            } else if (termo.length === 0) {
                this.limpar();
            }
        });

        // Fechar modal
        fecharBtn.addEventListener('click', () => this.fechar());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fechar();
            }
        });

        // Enter para buscar
        inputBusca.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const termo = inputBusca.value.trim();
                if (termo.length >= 2) {
                    this.buscar(termo);
                }
            }
        });
    }

    async buscar(termo) {
        try {
            const statusDiv = document.getElementById(`statusBusca_${this.modalId}`);
            const resultadosDiv = document.getElementById(`resultadosBusca_${this.modalId}`);
            
            statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            resultadosDiv.innerHTML = '';

            // Monta a query de busca
            let url = `${this.endpoint}?busca=${encodeURIComponent(termo)}`;
            
            // Adiciona filtros específicos
            Object.keys(this.filtros).forEach(key => {
                if (this.filtros[key]) {
                    url += `&${key}=${encodeURIComponent(this.filtros[key])}`;
                }
            });

            const response = await fetch(url);
            const data = await response.json();

            if (data.sucesso && data.dados && data.dados.length > 0) {
                this.resultados = data.dados;
                this.exibirResultados(data.dados);
                statusDiv.innerHTML = `<small style="color: #666;">${data.dados.length} resultado(s) encontrado(s)</small>`;
            } else {
                statusDiv.innerHTML = '<small style="color: #999;">Nenhum resultado encontrado</small>';
                resultadosDiv.innerHTML = '';
            }
        } catch (erro) {
            console.error('Erro ao buscar:', erro);
            document.getElementById(`statusBusca_${this.modalId}`).innerHTML = 
                '<small style="color: #d32f2f;">Erro ao buscar. Tente novamente.</small>';
        }
    }

    exibirResultados(resultados) {
        const resultadosDiv = document.getElementById(`resultadosBusca_${this.modalId}`);
        resultadosDiv.innerHTML = '';

        resultados.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = `
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.3s;
                background: #f9f9f9;
            `;

            // Constrói o conteúdo baseado no tipo de dado
            let conteudo = this.construirConteudoItem(item);
            itemDiv.innerHTML = conteudo;

            itemDiv.addEventListener('mouseover', () => {
                itemDiv.style.background = '#f0f0f0';
                itemDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });

            itemDiv.addEventListener('mouseout', () => {
                itemDiv.style.background = '#f9f9f9';
                itemDiv.style.boxShadow = 'none';
            });

            itemDiv.addEventListener('click', () => {
                if (this.onResultado) {
                    this.onResultado(item);
                }
                this.fechar();
            });

            resultadosDiv.appendChild(itemDiv);
        });
    }

    construirConteudoItem(item) {
        let html = '<div style="display: flex; justify-content: space-between; align-items: center;">';
        
        // Título principal
        let titulo = item.nome || item.numero || item.descricao || 'Sem título';
        html += `<div><strong>${this.escaparHtml(titulo)}</strong>`;

        // Informações secundárias
        if (item.email) {
            html += `<br><small style="color: #666;">${this.escaparHtml(item.email)}</small>`;
        }
        if (item.telefone) {
            html += `<br><small style="color: #666;">${this.escaparHtml(item.telefone)}</small>`;
        }
        if (item.categoria) {
            html += `<br><small style="color: #999;">📁 ${this.escaparHtml(item.categoria)}</small>`;
        }
        if (item.status) {
            const corStatus = this.getCorStatus(item.status);
            html += `<br><small style="color: ${corStatus};">⊙ ${this.escaparHtml(item.status)}</small>`;
        }
        if (item.preco_venda) {
            html += `<br><small style="color: #2e7d32;">R$ ${parseFloat(item.preco_venda).toFixed(2)}</small>`;
        }
        if (item.valor_total) {
            html += `<br><small style="color: #2e7d32;">R$ ${parseFloat(item.valor_total).toFixed(2)}</small>`;
        }

        html += '</div>';
        
        // Badge com informação adicional
        if (item.id) {
            html += `<div style="background: #e3f2fd; padding: 4px 8px; border-radius: 3px; font-size: 12px; color: #1976d2;">ID: ${item.id}</div>`;
        }

        html += '</div>';
        return html;
    }

    getCorStatus(status) {
        const cores = {
            'pendente': '#ff9800',
            'aprovado': '#4caf50',
            'recusado': '#f44336',
            'processando': '#2196f3',
            'enviado': '#00bcd4',
            'entregue': '#4caf50',
            'cancelado': '#9e9e9e',
            'emtrancito': '#ff9800'
        };
        return cores[status] || '#757575';
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    abrir() {
        const modal = document.getElementById(this.modalId);
        modal.classList.add('show');
        document.getElementById(`inputBusca_${this.modalId}`).focus();
    }

    fechar() {
        const modal = document.getElementById(this.modalId);
        modal.classList.remove('show');
        this.limpar();
    }

    limpar() {
        document.getElementById(`inputBusca_${this.modalId}`).value = '';
        document.getElementById(`resultadosBusca_${this.modalId}`).innerHTML = '';
        document.getElementById(`statusBusca_${this.modalId}`).innerHTML = 'Digite para buscar...';
        this.resultados = [];
    }
}

// Exporta a classe
window.BuscaAvancada = BuscaAvancada;
