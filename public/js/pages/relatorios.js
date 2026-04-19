/**
 * Página de Relatórios
 * Visualização e geração de relatórios
 */

import { mostrarAviso, mostrarErro, formatarMoeda, formatarData, formatarDataHora, formatarNumero } from '../utils.js';
import { BuscaAvancada } from '../busca-avancada.js';
import { DataTable } from '../data-table.js';

const COLUNAS_MOEDA = new Set([
    'valor_total', 'valor_total_gasto', 'preco_venda', 'preco_custo',
    'receita_bruta', 'receita_liquida', 'desconto_total', 'desconto',
    'valor_bruto', 'valor_liquido', 'ticket_medio'
]);
const COLUNAS_DATA = new Set(['data', 'data_pedido', 'data_entrega_prevista', 'data_entrega_real']);
const COLUNAS_DATA_HORA = new Set(['data_envio', 'data_criacao', 'data_atualizacao']);
const COLUNAS_INTEIRAS = new Set([
    'total_pedidos', 'total_itens', 'quantidade_total', 'estoque', 'id',
    'itens_vendidos', 'clientes_unicos', 'pedidos_entregues', 'pedidos_cancelados', 'dias_com_vendas'
]);

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
    total_itens: 'Itens',
    valor_bruto: 'Valor bruto',
    valor_liquido: 'Valor líquido',
    desconto_total: 'Desconto total',
    ticket_medio: 'Ticket médio',
    itens_vendidos: 'Itens vendidos',
    clientes_unicos: 'Clientes únicos',
    pedidos_entregues: 'Pedidos entregues',
    pedidos_cancelados: 'Pedidos cancelados',
    dias_com_vendas: 'Dias com vendas'
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
            </div>
            <div class="grid">
                <div class="grid-item" data-tipo="vendas" onclick="abrirRelatorioVendas()">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Vendas</h3>
                    <p>Relatório de vendas e receita</p>
                </div>
                <div class="grid-item" data-tipo="estoque" onclick="abrirRelatorioProdutos()">
                    <i class="fas fa-cube"></i>
                    <h3>Estoque</h3>
                    <p>Movimentação de produtos</p>
                </div>
                <div class="grid-item" data-tipo="clientes" onclick="abrirRelatorioClientes()">
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
                <div class="relatorio-filtros-barra">
                    <h3 id="tituloRelatorio" style="margin:0;"></h3>
                    <span class="filtros-info" id="filtrosInfo"></span>
                </div>
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

    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', gerarRelatorioPDF);
    }

    if (exportarExcelBtn) {
        exportarExcelBtn.addEventListener('click', exportarRelatorioExcel);
    }

    buscaBtns.forEach(btn => {
        btn.addEventListener('click', abrirBuscaRelatorios);
    });
}

function marcarCartaoAtivo(tipo) {
    document.querySelectorAll('.grid-item[data-tipo]').forEach(card => {
        card.classList.toggle('grid-item--ativo', card.dataset.tipo === tipo);
    });
}

function opcoesUnicas(dados, campo) {
    const vistos = new Set();
    const opcoes = [];
    dados.forEach(linha => {
        const valor = linha[campo];
        if (valor == null || valor === '') return;
        const chave = String(valor);
        if (vistos.has(chave)) return;
        vistos.add(chave);
        opcoes.push({ valor: chave, rotulo: chave });
    });
    opcoes.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
    return opcoes;
}

function construirFiltros(tipo, dados) {
    const base = [{ chave: '__busca_global__', tipo: 'text', placeholder: 'Filtrar nesta tabela...' }];

    if (tipo === 'vendas') {
        return [
            ...base,
            {
                tipo: 'date-range', campo: 'data',
                chaveMin: 'data_min', chaveMax: 'data_max',
                rotulo: 'Data', placeholderMin: 'De', placeholderMax: 'Até'
            },
            {
                tipo: 'number-range', campo: 'total_pedidos',
                chaveMin: 'total_pedidos_min', chaveMax: 'total_pedidos_max',
                rotulo: 'Pedidos', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '1'
            },
            {
                tipo: 'number-range', campo: 'valor_liquido',
                chaveMin: 'valor_liquido_min', chaveMax: 'valor_liquido_max',
                rotulo: 'Valor líquido (R$)', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '0.01'
            },
            {
                tipo: 'number-range', campo: 'ticket_medio',
                chaveMin: 'ticket_medio_min', chaveMax: 'ticket_medio_max',
                rotulo: 'Ticket médio (R$)', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '0.01'
            },
            {
                tipo: 'number-range', campo: 'itens_vendidos',
                chaveMin: 'itens_vendidos_min', chaveMax: 'itens_vendidos_max',
                rotulo: 'Itens vendidos', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '1'
            }
        ];
    }

    if (tipo === 'estoque') {
        return [
            ...base,
            {
                chave: 'categoria', tipo: 'select',
                rotulo: 'Categoria', placeholder: 'Todas as categorias',
                opcoes: opcoesUnicas(dados, 'categoria')
            },
            {
                tipo: 'number-range', campo: 'estoque',
                chaveMin: 'estoque_min', chaveMax: 'estoque_max',
                rotulo: 'Estoque', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '1'
            },
            {
                tipo: 'number-range', campo: 'preco_venda',
                chaveMin: 'preco_venda_min', chaveMax: 'preco_venda_max',
                rotulo: 'Preço (R$)', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '0.01'
            },
            {
                tipo: 'number-range', campo: 'valor_total',
                chaveMin: 'valor_total_min', chaveMax: 'valor_total_max',
                rotulo: 'Valor total (R$)', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '0.01'
            }
        ];
    }

    if (tipo === 'clientes') {
        return [
            ...base,
            {
                chave: 'cidade', tipo: 'select',
                rotulo: 'Cidade', placeholder: 'Todas as cidades',
                opcoes: opcoesUnicas(dados, 'cidade')
            },
            {
                tipo: 'number-range', campo: 'total_pedidos',
                chaveMin: 'total_pedidos_min', chaveMax: 'total_pedidos_max',
                rotulo: 'Pedidos', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '1'
            },
            {
                tipo: 'number-range', campo: 'valor_total_gasto',
                chaveMin: 'valor_total_gasto_min', chaveMax: 'valor_total_gasto_max',
                rotulo: 'Total gasto (R$)', placeholderMin: 'Mín', placeholderMax: 'Máx', step: '0.01'
            }
        ];
    }

    return base;
}

function contextoFiltros(tipo) {
    return `relatorios_${tipo}`;
}

function atualizarInfoFiltros() {
    const el = document.getElementById('filtrosInfo');
    if (!el || !tabelaRelatorio || !estadoRelatorioAtual) return;
    const valores = tabelaRelatorio.obterValoresFiltros();
    const ativos = Object.entries(valores).filter(([k, v]) => v !== '' && v != null && k !== '__busca_global__').length;
    const filtradas = tabelaRelatorio.obterTodasLinhasFiltradas();
    const total = filtradas.length;
    if (ativos === 0) {
        el.textContent = `${total} ${total === 1 ? 'registro' : 'registros'}`;
        el.classList.remove('ativo');
    } else {
        el.textContent = `${ativos} ${ativos === 1 ? 'filtro ativo' : 'filtros ativos'} · ${total} ${total === 1 ? 'registro' : 'registros'}`;
        el.classList.add('ativo');
    }

    const resumoAtualizado = recalcularResumo(estadoRelatorioAtual.tipo, filtradas)
        || estadoRelatorioAtual.resumo;
    const resumoEl = document.getElementById('resumoRelatorio');
    if (resumoEl && resumoAtualizado) {
        const novoHtml = renderizarResumo(resumoAtualizado);
        const tmp = document.createElement('div');
        tmp.innerHTML = novoHtml;
        resumoEl.innerHTML = tmp.firstElementChild ? tmp.firstElementChild.innerHTML : '';
    }
}

async function carregarRelatorio(endpoint, titulo, tipo) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (!data.sucesso) {
            mostrarErro(data.mensagem || `Erro ao carregar ${titulo.toLowerCase()}`);
            return;
        }
        exibirRelatorio(titulo, data.dados, data.resumo, tipo, endpoint);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro(`Erro ao carregar ${titulo.toLowerCase()}`);
    }
}

export function abrirRelatorioVendas() {
    carregarRelatorio('/api/relatorios/vendas', 'Relatório de Vendas', 'vendas');
}

export function abrirRelatorioProdutos() {
    carregarRelatorio('/api/relatorios/estoque', 'Relatório de Estoque', 'estoque');
}

export function abrirRelatorioClientes() {
    carregarRelatorio('/api/relatorios/clientes', 'Relatório de Clientes', 'clientes');
}

function renderizarResumo(resumo) {
    if (!resumo || typeof resumo !== 'object') return '';
    const cards = Object.entries(resumo).map(([chave, valor]) => `
        <div style="flex:1; min-width:160px; background:#f8f9fa; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
            <div style="font-size:12px; color:#6b7280; text-transform:uppercase;">${escapeHtml(humanizar(chave))}</div>
            <div style="font-size:18px; font-weight:600; color:#111827; margin-top:4px;">${formatarValor(chave, valor)}</div>
        </div>
    `).join('');
    return `<div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px;" id="resumoRelatorio">${cards}</div>`;
}

let estadoRelatorioAtual = null;
let tabelaRelatorio = null;

function exibirRelatorio(titulo, dados, resumo, tipo = null, endpoint = null) {
    const secao = document.getElementById('relatorioDetalhado');
    const tituloEl = document.getElementById('tituloRelatorio');
    const conteudoEl = document.getElementById('conteudoRelatorio');

    tituloEl.textContent = titulo;
    marcarCartaoAtivo(tipo);

    const dadosArr = Array.isArray(dados) ? dados : [];
    estadoRelatorioAtual = { titulo, dados: dadosArr, resumo: resumo || null, tipo, endpoint };

    const resumoHtml = renderizarResumo(resumo);
    if (dadosArr.length === 0) {
        conteudoEl.innerHTML = resumoHtml + '<p>Nenhum dado disponível para este relatório</p>';
        tabelaRelatorio = null;
        document.getElementById('filtrosInfo').textContent = '';
    } else {
        conteudoEl.innerHTML = resumoHtml + '<div id="relatorioTableMount"></div>';
        const colunas = Object.keys(dadosArr[0]).map(chave => ({
            chave,
            rotulo: humanizar(chave),
            ordenavel: true,
            formatar: (linha) => formatarValor(chave, linha[chave])
        }));
        const filtros = construirFiltros(tipo, dadosArr);

        tabelaRelatorio = new DataTable({
            mount: document.getElementById('relatorioTableMount'),
            dadosLocais: dadosArr,
            colunas,
            tamanhoPagina: 15,
            filtros,
            filtrosSalvos: { contexto: contextoFiltros(tipo) },
            onCarregado: () => {
                if (tabelaRelatorio) atualizarInfoFiltros();
            }
        });
        tabelaRelatorio.inicializar();
    }

    secao.style.display = 'block';
    secao.scrollIntoView({ behavior: 'smooth' });
}

function baixarBlob(nome, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function extrairNomeArquivo(contentDisposition) {
    if (!contentDisposition) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    if (!match) return null;
    try { return decodeURIComponent(match[1]); } catch (_) { return match[1]; }
}

function recalcularResumo(tipo, linhas) {
    if (!linhas || linhas.length === 0) return null;
    const somar = (chave) => linhas.reduce((s, r) => s + (Number(r[chave]) || 0), 0);
    if (tipo === 'vendas') {
        const totalPedidos = somar('total_pedidos');
        const valorLiquido = somar('valor_liquido');
        return {
            dias_com_vendas: linhas.length,
            total_pedidos: totalPedidos,
            valor_bruto: somar('valor_bruto'),
            desconto_total: somar('desconto_total'),
            valor_liquido: valorLiquido,
            ticket_medio: totalPedidos > 0 ? valorLiquido / totalPedidos : 0,
            itens_vendidos: somar('itens_vendidos'),
            pedidos_entregues: somar('pedidos_entregues'),
            pedidos_cancelados: somar('pedidos_cancelados')
        };
    }
    if (tipo === 'estoque') {
        return {
            total_itens: linhas.length,
            quantidade_total: somar('estoque'),
            valor_total: somar('valor_total')
        };
    }
    if (tipo === 'clientes') {
        return {
            total_clientes: linhas.length,
            total_pedidos: somar('total_pedidos'),
            valor_total_gasto: somar('valor_total_gasto')
        };
    }
    return null;
}

function obterDadosParaExportar() {
    if (!estadoRelatorioAtual) return null;
    if (tabelaRelatorio) {
        const filtrados = tabelaRelatorio.obterTodasLinhasFiltradas();
        const resumoRecalculado = recalcularResumo(estadoRelatorioAtual.tipo, filtrados)
            || estadoRelatorioAtual.resumo;
        return { dados: filtrados, resumo: resumoRecalculado };
    }
    return { dados: estadoRelatorioAtual.dados, resumo: estadoRelatorioAtual.resumo };
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
    if (!estadoRelatorioAtual) {
        mostrarAviso('Abra um relatório antes de exportar.');
        return;
    }
    const { titulo } = estadoRelatorioAtual;
    const { dados, resumo } = obterDadosParaExportar() || {};
    if (!dados || dados.length === 0) {
        mostrarAviso('Nenhum registro disponível com os filtros atuais.');
        return;
    }
    const janela = window.open('', '_blank');
    if (!janela) {
        mostrarErro('Permita pop-ups para exportar PDF.');
        return;
    }
    janela.document.open();
    janela.document.write(montarTabelaParaImpressao(titulo, dados, resumo));
    janela.document.close();
}

async function exportarRelatorioExcel() {
    if (!estadoRelatorioAtual) {
        mostrarAviso('Abra um relatório antes de exportar.');
        return;
    }
    const { titulo, tipo } = estadoRelatorioAtual;
    if (!tipo) {
        mostrarErro('Não foi possível identificar o tipo do relatório.');
        return;
    }

    const { dados, resumo } = obterDadosParaExportar() || {};
    if (!dados || dados.length === 0) {
        mostrarAviso('Nenhum registro disponível com os filtros atuais.');
        return;
    }

    try {
        const resposta = await fetch(`/api/relatorios/${tipo}/exportar-xlsx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dados, resumo })
        });
        if (!resposta.ok) {
            let mensagem = `Erro ao exportar ${titulo.toLowerCase()}`;
            try {
                const erro = await resposta.json();
                mensagem = erro.mensagem || mensagem;
            } catch (_) { /* resposta pode não ser JSON */ }
            throw new Error(mensagem);
        }

        const blob = await resposta.blob();
        const nome = extrairNomeArquivo(resposta.headers.get('Content-Disposition'))
            || `${tipo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        baixarBlob(nome, blob);
    } catch (erro) {
        console.error('Erro ao exportar XLSX:', erro);
        mostrarErro(erro.message || 'Erro ao exportar relatório');
    }
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
