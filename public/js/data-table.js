/**
 * DataTable — componente reutilizável de tabela com paginação,
 * ordenação por cabeçalho e filtros server-side.
 *
 * Uso básico:
 *   const tabela = new DataTable({
 *     mount: document.getElementById('produtosTableMount'),
 *     endpoint: '/api/produtos',
 *     colunas: [
 *       { chave: 'id', rotulo: 'ID', ordenavel: true },
 *       { chave: 'nome', rotulo: 'Nome', ordenavel: true },
 *       { chave: 'preco_venda', rotulo: 'Preço', ordenavel: true,
 *         formatar: (linha) => formatarMoeda(linha.preco_venda) }
 *     ],
 *     filtros: [
 *       { chave: 'busca', tipo: 'text', placeholder: 'Buscar...' },
 *       { chave: 'ativo', tipo: 'select',
 *         opcoes: [{ valor: '', rotulo: 'Todos' }, { valor: 'true', rotulo: 'Ativos' }] }
 *     ],
 *     acoes: (linha) => `<button ...>Editar</button>`,
 *     ordenacaoPadrao: { chave: 'id', direcao: 'desc' }
 *   });
 *   tabela.inicializar();
 */

const ICONE_ORDENACAO_NEUTRO = '<i class="fas fa-sort" aria-hidden="true"></i>';
const ICONE_ORDENACAO_ASC = '<i class="fas fa-sort-up" aria-hidden="true"></i>';
const ICONE_ORDENACAO_DESC = '<i class="fas fa-sort-down" aria-hidden="true"></i>';

export class DataTable {
    constructor(opcoes) {
        if (!opcoes || !opcoes.mount) {
            throw new Error('DataTable: "mount" é obrigatório');
        }
        if (!opcoes.endpoint && !opcoes.dadosLocais) {
            throw new Error('DataTable: informe "endpoint" (modo server) ou "dadosLocais" (modo cliente)');
        }

        this.mount = typeof opcoes.mount === 'string'
            ? document.querySelector(opcoes.mount)
            : opcoes.mount;

        this.endpoint = opcoes.endpoint;
        // Modo local: quando `dadosLocais` é fornecido, o componente faz
        // busca/ordenação/paginação em memória, sem chamar o servidor.
        this.dadosLocais = opcoes.dadosLocais || null;
        this.colunas = opcoes.colunas || [];
        this.filtros = opcoes.filtros || [];
        this.acoes = opcoes.acoes || null;
        this.tamanhoPagina = opcoes.tamanhoPagina || 10;
        this.mensagemVazia = opcoes.mensagemVazia || 'Nenhum registro encontrado';
        this.mensagemErro = opcoes.mensagemErro || 'Erro ao carregar registros';
        this.extrairDados = opcoes.extrairDados || ((json) => json.dados || []);
        this.extrairPaginacao = opcoes.extrairPaginacao || ((json) => json.paginacao || null);
        this.paramsExtras = opcoes.paramsExtras || (() => ({}));
        this.onCarregado = opcoes.onCarregado || null;

        this.estado = {
            pagina: 1,
            ordenarPor: opcoes.ordenacaoPadrao?.chave || null,
            ordem: opcoes.ordenacaoPadrao?.direcao || 'desc',
            valoresFiltros: {}
        };

        // inicializa valores padrão dos filtros
        this.filtros.forEach(f => {
            this.estado.valoresFiltros[f.chave] = f.valorPadrao || '';
        });

        this._debounceBusca = null;
    }

    inicializar() {
        this._renderizarEsqueleto();
        this._recarregar();
    }

    recarregar() {
        this._recarregar();
    }

    definirDadosLocais(dados) {
        this.dadosLocais = dados || [];
        this.estado.pagina = 1;
        this._recarregar();
    }

    obterLinhas() {
        return this._ultimasLinhas || [];
    }

    _renderizarEsqueleto() {
        const totalColunas = this.colunas.length + (this.acoes ? 1 : 0);
        const filtrosHtml = this._renderizarFiltros();
        const cabecalhoHtml = this._renderizarCabecalho();

        this.mount.innerHTML = `
            ${filtrosHtml}
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>${cabecalhoHtml}</thead>
                    <tbody data-dt-tbody>
                        <tr><td colspan="${totalColunas}" class="dt-loading">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="dt-footer" data-dt-footer></div>
        `;

        // wire de filtros
        this.filtros.forEach(f => {
            const el = this.mount.querySelector(`[data-dt-filter="${f.chave}"]`);
            if (!el) return;
            if (f.tipo === 'text') {
                el.addEventListener('input', (e) => {
                    clearTimeout(this._debounceBusca);
                    this._debounceBusca = setTimeout(() => {
                        this.estado.valoresFiltros[f.chave] = e.target.value;
                        this.estado.pagina = 1;
                        this._recarregar();
                    }, 300);
                });
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        clearTimeout(this._debounceBusca);
                        this.estado.valoresFiltros[f.chave] = e.target.value;
                        this.estado.pagina = 1;
                        this._recarregar();
                    }
                });
            } else if (f.tipo === 'select') {
                el.addEventListener('change', (e) => {
                    this.estado.valoresFiltros[f.chave] = e.target.value;
                    this.estado.pagina = 1;
                    this._recarregar();
                });
            }
        });

        // wire de ordenação nos cabeçalhos
        this.mount.querySelectorAll('th[data-dt-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const chave = th.dataset.dtSort;
                if (this.estado.ordenarPor === chave) {
                    this.estado.ordem = this.estado.ordem === 'asc' ? 'desc' : 'asc';
                } else {
                    this.estado.ordenarPor = chave;
                    this.estado.ordem = 'asc';
                }
                this.estado.pagina = 1;
                this._atualizarIconesOrdenacao();
                this._recarregar();
            });
        });
    }

    _renderizarFiltros() {
        if (this.filtros.length === 0) return '';
        const campos = this.filtros.map(f => {
            if (f.tipo === 'select') {
                const opcoesHtml = (f.opcoes || [])
                    .map(o => `<option value="${this._escapar(o.valor)}">${this._escapar(o.rotulo)}</option>`)
                    .join('');
                return `
                    <select class="dt-filtro" data-dt-filter="${f.chave}" aria-label="${this._escapar(f.rotulo || f.chave)}">
                        ${opcoesHtml}
                    </select>
                `;
            }
            // default: text
            return `
                <input type="text"
                       class="dt-filtro"
                       data-dt-filter="${f.chave}"
                       placeholder="${this._escapar(f.placeholder || f.rotulo || 'Buscar...')}" />
            `;
        }).join('');

        return `<div class="dt-filtros">${campos}</div>`;
    }

    _renderizarCabecalho() {
        const ths = this.colunas.map(col => {
            if (col.ordenavel) {
                const icone = this._iconeOrdenacao(col.chave);
                return `
                    <th data-dt-sort="${col.chave}" class="dt-th-sortable"${col.largura ? ` style="width:${col.largura};"` : ''}>
                        <span class="dt-th-label">${this._escapar(col.rotulo)}</span>
                        <span class="dt-sort-icone" data-dt-icone="${col.chave}">${icone}</span>
                    </th>
                `;
            }
            return `<th${col.largura ? ` style="width:${col.largura};"` : ''}>${this._escapar(col.rotulo)}</th>`;
        }).join('');

        const thAcoes = this.acoes ? `<th class="dt-th-acoes" style="width:${this.larguraAcoes || 'auto'};">Ações</th>` : '';
        return `<tr>${ths}${thAcoes}</tr>`;
    }

    _iconeOrdenacao(chave) {
        if (this.estado.ordenarPor !== chave) return ICONE_ORDENACAO_NEUTRO;
        return this.estado.ordem === 'asc' ? ICONE_ORDENACAO_ASC : ICONE_ORDENACAO_DESC;
    }

    _atualizarIconesOrdenacao() {
        this.colunas.forEach(col => {
            if (!col.ordenavel) return;
            const span = this.mount.querySelector(`[data-dt-icone="${col.chave}"]`);
            if (span) span.innerHTML = this._iconeOrdenacao(col.chave);
        });
    }

    async _recarregar() {
        const tbody = this.mount.querySelector('[data-dt-tbody]');
        const footer = this.mount.querySelector('[data-dt-footer]');
        const totalColunas = this.colunas.length + (this.acoes ? 1 : 0);

        if (this.dadosLocais) {
            const { linhas, paginacao } = this._processarDadosLocais();
            this._ultimasLinhas = linhas;
            this._renderizarCorpo(linhas);
            this._renderizarRodape(footer, paginacao);
            if (typeof this.onCarregado === 'function') {
                this.onCarregado(linhas, paginacao, null);
            }
            return;
        }

        tbody.innerHTML = `<tr><td colspan="${totalColunas}" class="dt-loading">Carregando...</td></tr>`;

        const params = new URLSearchParams();
        params.set('pagina', String(this.estado.pagina));
        params.set('limite', String(this.tamanhoPagina));
        if (this.estado.ordenarPor) {
            params.set('ordenarPor', this.estado.ordenarPor);
            params.set('ordem', this.estado.ordem);
        }
        Object.entries(this.estado.valoresFiltros).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                params.set(k, v);
            }
        });
        const extras = this.paramsExtras() || {};
        Object.entries(extras).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                params.set(k, v);
            }
        });

        try {
            const url = `${this.endpoint}${this.endpoint.includes('?') ? '&' : '?'}${params.toString()}`;
            const res = await fetch(url);
            const json = await res.json();
            if (!json.sucesso) throw new Error(json.mensagem || this.mensagemErro);

            const linhas = this.extrairDados(json);
            const paginacao = this.extrairPaginacao(json);
            this._ultimasLinhas = linhas;

            this._renderizarCorpo(linhas);
            this._renderizarRodape(footer, paginacao);

            if (typeof this.onCarregado === 'function') {
                this.onCarregado(linhas, paginacao, json);
            }
        } catch (erro) {
            console.error('DataTable: erro ao carregar', erro);
            tbody.innerHTML = `<tr><td colspan="${totalColunas}" class="dt-erro">${this._escapar(erro.message || this.mensagemErro)}</td></tr>`;
            footer.innerHTML = '';
        }
    }

    _processarDadosLocais() {
        let resultado = this.dadosLocais.slice();

        // 1) Aplicar busca textual (filtro de texto) + filtros select
        Object.entries(this.estado.valoresFiltros).forEach(([chave, valor]) => {
            if (valor === '' || valor === null || valor === undefined) return;
            const filtroDef = this.filtros.find(f => f.chave === chave);
            if (!filtroDef) return;

            if (filtroDef.tipo === 'text') {
                const termo = String(valor).toLowerCase();
                resultado = resultado.filter(linha =>
                    Object.values(linha).some(v =>
                        v !== null && v !== undefined && String(v).toLowerCase().includes(termo)
                    )
                );
            } else if (filtroDef.tipo === 'select') {
                resultado = resultado.filter(linha => String(linha[chave] ?? '') === String(valor));
            }
        });

        // 2) Ordenação
        if (this.estado.ordenarPor) {
            const chave = this.estado.ordenarPor;
            const dir = this.estado.ordem === 'asc' ? 1 : -1;
            resultado.sort((a, b) => {
                const va = a[chave];
                const vb = b[chave];
                if (va === vb) return 0;
                if (va === null || va === undefined) return 1;
                if (vb === null || vb === undefined) return -1;
                const na = Number(va), nb = Number(vb);
                if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
                return String(va).localeCompare(String(vb), 'pt-BR') * dir;
            });
        }

        // 3) Paginação
        const total = resultado.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this.tamanhoPagina));
        if (this.estado.pagina > totalPaginas) this.estado.pagina = totalPaginas;
        const inicio = (this.estado.pagina - 1) * this.tamanhoPagina;
        const linhas = resultado.slice(inicio, inicio + this.tamanhoPagina);

        return {
            linhas,
            paginacao: { pagina: this.estado.pagina, limite: this.tamanhoPagina, total, totalPaginas }
        };
    }

    _renderizarCorpo(linhas) {
        const tbody = this.mount.querySelector('[data-dt-tbody]');
        const totalColunas = this.colunas.length + (this.acoes ? 1 : 0);

        if (!linhas || linhas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${totalColunas}" class="dt-vazio">${this._escapar(this.mensagemVazia)}</td></tr>`;
            return;
        }

        tbody.innerHTML = linhas.map(linha => {
            const celulas = this.colunas.map(col => {
                const classe = col.classeCelula ? ` class="${col.classeCelula}"` : '';
                const conteudo = col.formatar
                    ? col.formatar(linha)
                    : this._escapar(this._valorPorCaminho(linha, col.chave) ?? '-');
                return `<td${classe}>${conteudo}</td>`;
            }).join('');
            const acoesHtml = this.acoes ? `<td class="dt-td-acoes">${this.acoes(linha)}</td>` : '';
            return `<tr>${celulas}${acoesHtml}</tr>`;
        }).join('');
    }

    _renderizarRodape(footer, paginacao) {
        if (!paginacao) {
            footer.innerHTML = '';
            return;
        }
        const { pagina, totalPaginas, total, limite } = paginacao;
        if (!total || total === 0) {
            footer.innerHTML = '';
            return;
        }

        const inicio = ((pagina - 1) * limite) + 1;
        const fim = Math.min(pagina * limite, total);

        footer.innerHTML = `
            <div class="dt-info">Mostrando ${inicio}–${fim} de ${total}</div>
            <div class="dt-paginacao">
                <button class="dt-pag-btn" data-dt-page="prev" ${pagina <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                ${this._renderizarNumerosPagina(pagina, totalPaginas)}
                <button class="dt-pag-btn" data-dt-page="next" ${pagina >= totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        footer.querySelectorAll('[data-dt-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const alvo = btn.dataset.dtPage;
                if (alvo === 'prev' && pagina > 1) {
                    this.estado.pagina = pagina - 1;
                } else if (alvo === 'next' && pagina < totalPaginas) {
                    this.estado.pagina = pagina + 1;
                } else if (!isNaN(parseInt(alvo, 10))) {
                    this.estado.pagina = parseInt(alvo, 10);
                }
                this._recarregar();
            });
        });
    }

    _renderizarNumerosPagina(paginaAtual, totalPaginas) {
        if (totalPaginas <= 1) return '';
        const maxVisiveis = 5;
        let inicio = Math.max(1, paginaAtual - Math.floor(maxVisiveis / 2));
        let fim = Math.min(totalPaginas, inicio + maxVisiveis - 1);
        if (fim - inicio + 1 < maxVisiveis) {
            inicio = Math.max(1, fim - maxVisiveis + 1);
        }
        const botoes = [];
        if (inicio > 1) {
            botoes.push(`<button class="dt-pag-btn" data-dt-page="1">1</button>`);
            if (inicio > 2) botoes.push(`<span class="dt-pag-ellipsis">…</span>`);
        }
        for (let i = inicio; i <= fim; i++) {
            botoes.push(`<button class="dt-pag-btn${i === paginaAtual ? ' dt-pag-ativa' : ''}" data-dt-page="${i}">${i}</button>`);
        }
        if (fim < totalPaginas) {
            if (fim < totalPaginas - 1) botoes.push(`<span class="dt-pag-ellipsis">…</span>`);
            botoes.push(`<button class="dt-pag-btn" data-dt-page="${totalPaginas}">${totalPaginas}</button>`);
        }
        return botoes.join('');
    }

    _valorPorCaminho(obj, caminho) {
        if (!caminho) return null;
        return caminho.split('.').reduce((acc, parte) => (acc == null ? acc : acc[parte]), obj);
    }

    _escapar(valor) {
        if (valor === null || valor === undefined) return '';
        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
