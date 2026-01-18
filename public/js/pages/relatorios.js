/**
 * Página de Relatórios
 * Visualização e geração de relatórios
 */

const relatoriosPage = {
    title: 'Relatórios',
    content: `
        <div class="card">
            <h2 class="card-title">Relatórios do Sistema</h2>
            <div class="btn-group">
                <button class="btn btn-primary" id="gerarRelatorioBtn">
                    <i class="fas fa-download"></i> Exportar PDF
                </button>
                <button class="btn btn-secondary" id="exportarExcelBtn">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-search"></i> Buscar
                </button>
            </div>
            <div class="grid">
                <div class="grid-item" onclick="abrirRelatorioVendas()">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Vendas</h3>
                    <p>Relatório de vendas e receita</p>
                </div>
                <div class="grid-item" onclick="abrirRelatorioProdutos()">
                    <i class="fas fa-cube"></i>
                    <h3>Estoque</h3>
                    <p>Movimentação de produtos</p>
                </div>
                <div class="grid-item" onclick="abrirRelatorioClientes()">
                    <i class="fas fa-users"></i>
                    <h3>Clientes</h3>
                    <p>Base de clientes e análise</p>
                </div>
                <div class="grid-item" onclick="abrirRelatorioLogistica()">
                    <i class="fas fa-truck"></i>
                    <h3>Logística</h3>
                    <p>Acompanhamento de entregas</p>
                </div>
            </div>

            <!-- Seção para exibir relatório detalhado -->
            <div id="relatorioDetalhado" style="margin-top: 30px; display: none;">
                <h3 id="tituloRelatorio"></h3>
                <div id="conteudoRelatorio"></div>
            </div>
        </div>
    `
};

/**
 * Inicializa a página de relatórios
 */
function inicializarRelatorios() {
    const gerarRelatorioBtn = document.getElementById('gerarRelatorioBtn');
    const exportarExcelBtn = document.getElementById('exportarExcelBtn');
    const buscaBtns = document.querySelectorAll('button:has(i.fa-search)');

    // Gerar relatório PDF
    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', gerarRelatorioPDF);
    }

    // Exportar para Excel
    if (exportarExcelBtn) {
        exportarExcelBtn.addEventListener('click', exportarRelatorioExcel);
    }

    // Buscar relatórios
    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaRelatorios);
    });
}

/**
 * Abre relatório de vendas
 */
function abrirRelatorioVendas() {
    fetch('/api/relatorios/vendas')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                exibirRelatorio('Relatório de Vendas', data.dados);
            } else {
                alert('Erro ao carregar relatório de vendas');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            alert('Erro ao carregar relatório');
        });
}

/**
 * Abre relatório de produtos/estoque
 */
function abrirRelatorioProdutos() {
    fetch('/api/relatorios/produtos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                exibirRelatorio('Relatório de Produtos/Estoque', data.dados);
            } else {
                alert('Erro ao carregar relatório de produtos');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            alert('Erro ao carregar relatório');
        });
}

/**
 * Abre relatório de clientes
 */
function abrirRelatorioClientes() {
    fetch('/api/relatorios/clientes')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                exibirRelatorio('Relatório de Clientes', data.dados);
            } else {
                alert('Erro ao carregar relatório de clientes');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            alert('Erro ao carregar relatório');
        });
}

/**
 * Abre relatório de logística
 */
function abrirRelatorioLogistica() {
    fetch('/api/relatorios/logistica')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                exibirRelatorio('Relatório de Logística', data.dados);
            } else {
                alert('Erro ao carregar relatório de logística');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            alert('Erro ao carregar relatório');
        });
}

/**
 * Exibe um relatório na página
 */
function exibirRelatorio(titulo, dados) {
    const secao = document.getElementById('relatorioDetalhado');
    const tituloEl = document.getElementById('tituloRelatorio');
    const conteudoEl = document.getElementById('conteudoRelatorio');

    tituloEl.textContent = titulo;
    
    if (Array.isArray(dados) && dados.length > 0) {
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        
        // Cabeçalho
        const primeirObjeto = dados[0];
        html += '<thead><tr style="background: #f5f5f5;">';
        Object.keys(primeirObjeto).forEach(chave => {
            html += `<th style="border: 1px solid #ddd; padding: 10px; text-align: left;">${chave}</th>`;
        });
        html += '</tr></thead>';

        // Corpo
        html += '<tbody>';
        dados.forEach(item => {
            html += '<tr>';
            Object.values(item).forEach(valor => {
                html += `<td style="border: 1px solid #ddd; padding: 10px;">${valor}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        conteudoEl.innerHTML = html;
    } else {
        conteudoEl.innerHTML = '<p>Nenhum dado disponível para este relatório</p>';
    }

    secao.style.display = 'block';
    secao.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Gera relatório em formato PDF
 */
function gerarRelatorioPDF() {
    mostrarAviso('Funcionalidade de geração de PDF em desenvolvimento!');
}

/**
 * Exporta relatório em formato Excel
 */
function exportarRelatorioExcel() {
    mostrarAviso('Funcionalidade de exportação Excel em desenvolvimento!');
}

/**
 * Abre modal de busca de relatórios
 */
function abrirBuscaRelatorios() {
    if (!window.buscaRelatorios) {
        window.buscaRelatorios = new BuscaAvancada({
            endpoint: '/api/relatorios',
            titulo: 'Buscar Relatórios',
            campos: ['titulo', 'tipo', 'descricao'],
            onResultado: (relatorio) => {
                console.log('Relatório encontrado:', relatorio);
                // Scroll até os relatórios
                const secao = document.getElementById('relatorioDetalhado');
                if (secao) {
                    secao.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    window.buscaRelatorios.abrir();
}
