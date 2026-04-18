/**
 * Página de Relatórios
 * Visualização e geração de relatórios
 */

import { mostrarAviso, mostrarErro, formatarMoeda, formatarData, formatarDataHora, formatarNumero } from '../utils.js';
import { BuscaAvancada } from '../busca-avancada.js';
import { DataTable } from '../data-table.js';

const COLUNAS_MOEDA = new Set([
    'valor_total', 'valor_total_gasto', 'preco_venda', 'preco_custo',
    'receita_bruta', 'receita_liquida', 'desconto_total', 'desconto'
]);
const COLUNAS_DATA = new Set(['data', 'data_pedido', 'data_entrega_prevista', 'data_entrega_real']);
const COLUNAS_DATA_HORA = new Set(['data_envio', 'data_criacao', 'data_atualizacao']);
const COLUNAS_INTEIRAS = new Set(['total_pedidos', 'total_itens', 'quantidade_total', 'estoque', 'id']);

const LABELS = {
    id: 'ID',
    nome: 'Nome',
    email: 'E-mail',
    telefone: 'Telefone',
    cidade: 'Cidade',
    categoria: 'Categoria',
    estoque: 'Qtd. em estoque',
    preco_venda: 'Preço de venda',
    valor_total: 'Valor total',
    total_pedidos: 'Total de pedidos',
    valor_total_gasto: 'Total gasto',
    data: 'Data',
    data_pedido: 'Data do pedido',
    numero: 'Número',
    cliente: 'Cliente',
    status: 'Status',
    total_itens: 'Itens'
};

function humanizar(chave) {
    if (LABELS[chave]) return LABELS[chave];
    return chave
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarTexto(chave, valor) {
    if (valor === null || valor === undefined || valor === '') return '-';
    if (COLUNAS_MOEDA.has(chave)) return formatarMoeda(valor);
    if (COLUNAS_DATA_HORA.has(chave)) return formatarDataHora(valor);
    if (COLUNAS_DATA.has(chave)) return formatarData(valor);
    if (COLUNAS_INTEIRAS.has(chave)) return formatarNumero(valor);
    return String(valor);
}

function formatarValor(chave, valor) {
    return escapeHtml(formatarTexto(chave, valor));
}

export const relatoriosPage = {
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
                <!-- TODO: Relatório de Logística desabilitado — reativar quando solicitado.
                <div class="grid-item" onclick="abrirRelatorioLogistica()">
                    <i class="fas fa-truck"></i>
                    <h3>Logística</h3>
                    <p>Acompanhamento de entregas</p>
                </div>
                -->
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
export function inicializarRelatorios() {
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

async function carregarRelatorio(endpoint, titulo) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (!data.sucesso) {
            mostrarErro(data.mensagem || `Erro ao carregar ${titulo.toLowerCase()}`);
            return;
        }
        exibirRelatorio(titulo, data.dados, data.resumo);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro(`Erro ao carregar ${titulo.toLowerCase()}`);
    }
}

export function abrirRelatorioVendas() {
    carregarRelatorio('/api/relatorios/vendas', 'Relatório de Vendas');
}

export function abrirRelatorioProdutos() {
    carregarRelatorio('/api/relatorios/estoque', 'Relatório de Estoque');
}

export function abrirRelatorioClientes() {
    carregarRelatorio('/api/relatorios/clientes', 'Relatório de Clientes');
}

// TODO: Relatório de Logística desabilitado — reativar quando solicitado.
// function abrirRelatorioLogistica() {
//     fetch('/api/relatorios/logistica')
//         .then(response => response.json())
//         .then(data => {
//             if (data.sucesso) {
//                 exibirRelatorio('Relatório de Logística', data.dados);
//             } else {
//                 alert('Erro ao carregar relatório de logística');
//             }
//         })
//         .catch(erro => {
//             console.error('Erro:', erro);
//             alert('Erro ao carregar relatório');
//         });
// }

function renderizarResumo(resumo) {
    if (!resumo || typeof resumo !== 'object') return '';
    const cards = Object.entries(resumo).map(([chave, valor]) => `
        <div style="flex:1; min-width:160px; background:#f8f9fa; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
            <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">${escapeHtml(humanizar(chave))}</div>
            <div style="font-size:18px; font-weight:600; color:#111827; margin-top:4px;">${formatarValor(chave, valor)}</div>
        </div>
    `).join('');
    return `<div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px;">${cards}</div>`;
}

let estadoRelatorioAtual = null;
let tabelaRelatorio = null;

function exibirRelatorio(titulo, dados, resumo) {
    const secao = document.getElementById('relatorioDetalhado');
    const tituloEl = document.getElementById('tituloRelatorio');
    const conteudoEl = document.getElementById('conteudoRelatorio');

    tituloEl.textContent = titulo;

    const dadosArr = Array.isArray(dados) ? dados : [];
    estadoRelatorioAtual = { titulo, dados: dadosArr, resumo: resumo || null };

    const resumoHtml = renderizarResumo(resumo);
    if (dadosArr.length === 0) {
        conteudoEl.innerHTML = resumoHtml + '<p>Nenhum dado disponível para este relatório</p>';
        tabelaRelatorio = null;
    } else {
        conteudoEl.innerHTML = resumoHtml + '<div id="relatorioTableMount"></div>';
        const colunas = Object.keys(dadosArr[0]).map(chave => ({
            chave,
            rotulo: humanizar(chave),
            ordenavel: true,
            formatar: (linha) => formatarValor(chave, linha[chave])
        }));
        tabelaRelatorio = new DataTable({
            mount: document.getElementById('relatorioTableMount'),
            dadosLocais: dadosArr,
            colunas,
            tamanhoPagina: 15,
            filtros: [
                { chave: '__busca_global__', tipo: 'text', placeholder: 'Filtrar nesta tabela...' }
            ]
        });
        // o filtro global precisa de um chave que não colida com colunas reais.
        // como buscamos em Object.values(linha), a chave não importa.
        tabelaRelatorio.inicializar();
    }

    secao.style.display = 'block';
    secao.scrollIntoView({ behavior: 'smooth' });
}

function nomeArquivo(titulo, extensao) {
    const slug = titulo
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const d = new Date();
    const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `${slug}-${data}.${extensao}`;
}

function baixarArquivo(nome, conteudo, mime) {
    const blob = new Blob([conteudo], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function montarTabelaParaImpressao(titulo, dados, resumo) {
    const colunas = Object.keys(dados[0]);
    const cabecalho = colunas
        .map(c => `<th>${escapeHtml(humanizar(c))}</th>`).join('');
    const linhas = dados.map(item => {
        const celulas = colunas
            .map(c => `<td>${formatarValor(c, item[c])}</td>`).join('');
        return `<tr>${celulas}</tr>`;
    }).join('');

    const resumoHtml = resumo
        ? `<ul class="resumo">${Object.entries(resumo)
            .map(([k, v]) => `<li><strong>${escapeHtml(humanizar(k))}:</strong> ${formatarValor(k, v)}</li>`)
            .join('')}</ul>`
        : '';

    const geradoEm = new Date().toLocaleString('pt-BR');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(titulo)}</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .gerado { color: #666; font-size: 12px; margin-bottom: 16px; }
    .resumo { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 16px; margin: 0 0 16px; }
    .resumo li { background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    thead { background: #3b82f6; color: #fff; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    @media print {
        body { padding: 0; }
        thead { display: table-header-group; }
    }
</style>
</head>
<body>
    <h1>${escapeHtml(titulo)}</h1>
    <div class="gerado">Gerado em ${escapeHtml(geradoEm)}</div>
    ${resumoHtml}
    <table>
        <thead><tr>${cabecalho}</tr></thead>
        <tbody>${linhas}</tbody>
    </table>
    <script>
        window.addEventListener('load', () => {
            window.focus();
            window.print();
        });
    </script>
</body>
</html>`;
}

function gerarRelatorioPDF() {
    if (!estadoRelatorioAtual || estadoRelatorioAtual.dados.length === 0) {
        mostrarAviso('Abra um relatório antes de exportar.');
        return;
    }
    const { titulo, dados, resumo } = estadoRelatorioAtual;
    const janela = window.open('', '_blank');
    if (!janela) {
        mostrarErro('Permita pop-ups para exportar PDF.');
        return;
    }
    janela.document.open();
    janela.document.write(montarTabelaParaImpressao(titulo, dados, resumo));
    janela.document.close();
}

function escaparCSV(valor) {
    const texto = String(valor ?? '');
    if (/[";\r\n]/.test(texto)) {
        return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
}

function exportarRelatorioExcel() {
    if (!estadoRelatorioAtual || estadoRelatorioAtual.dados.length === 0) {
        mostrarAviso('Abra um relatório antes de exportar.');
        return;
    }
    const { titulo, dados, resumo } = estadoRelatorioAtual;
    const colunas = Object.keys(dados[0]);
    const separador = ';'; // Excel pt-BR usa ; por padrão

    const linhas = [];
    if (resumo) {
        Object.entries(resumo).forEach(([k, v]) => {
            linhas.push([humanizar(k), formatarTexto(k, v)].map(escaparCSV).join(separador));
        });
        linhas.push('');
    }
    linhas.push(colunas.map(c => escaparCSV(humanizar(c))).join(separador));
    dados.forEach(item => {
        linhas.push(colunas.map(c => escaparCSV(formatarTexto(c, item[c]))).join(separador));
    });

    const BOM = '\uFEFF'; // faz o Excel reconhecer UTF-8
    const conteudo = BOM + linhas.join('\r\n');
    baixarArquivo(nomeArquivo(titulo, 'csv'), conteudo, 'text/csv;charset=utf-8');
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

// Handlers chamados via onclick="..." inline nos templates HTML
window.abrirRelatorioVendas = abrirRelatorioVendas;
window.abrirRelatorioProdutos = abrirRelatorioProdutos;
window.abrirRelatorioClientes = abrirRelatorioClientes;
