// Controller de Relatórios
const ExcelJS = require('exceljs');
const pool = require('../config/database');
const {
    CORES,
    FONTES,
    preenchimento,
    bordaFina,
    aplicarEstiloCabecalho,
    aplicarEstiloLinha,
    aplicarTituloPrincipal,
    aplicarSubtitulo,
    ajustarLarguraColunas,
    formatarNomeArquivo,
    enviarXLSX
} = require('../utils/xlsxEstilos');

// GET - Relatório de Vendas
exports.vendas = async (req, res) => {
    try {
        const { data_inicio = '', data_fim = '' } = req.query;
        const connection = await pool.getConnection();

        let query = 'SELECT DATE(p.data_pedido) as data, COUNT(p.id) as total_pedidos, SUM(p.valor_total) as valor_total FROM pedidos p WHERE 1=1';
        let params = [];

        if (data_inicio) {
            query += ' AND p.data_pedido >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            query += ' AND p.data_pedido <= ?';
            params.push(data_fim);
        }

        query += ' GROUP BY DATE(p.data_pedido) ORDER BY data DESC';

        const [vendas] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório de vendas gerado com sucesso',
            dados: vendas
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de vendas',
            erro: erro.message
        });
    }
};

// GET - Relatório de Estoque
exports.estoque = async (req, res) => {
    try {
        const { categoria = '' } = req.query;
        const connection = await pool.getConnection();

        let query = 'SELECT id, nome, categoria, estoque, preco_venda, (estoque * preco_venda) as valor_total FROM produtos WHERE 1=1';
        let params = [];

        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        query += ' ORDER BY categoria, nome';

        const [estoque] = await connection.execute(query, params);
        connection.release();

        const resumo = {
            total_itens: estoque.length,
            quantidade_total: estoque.reduce((sum, p) => sum + (Number(p.estoque) || 0), 0),
            valor_total: estoque.reduce((sum, p) => sum + (Number(p.valor_total) || 0), 0)
        };

        res.json({
            sucesso: true,
            mensagem: 'Relatório de estoque gerado com sucesso',
            resumo: resumo,
            dados: estoque
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de estoque',
            erro: erro.message
        });
    }
};

// GET - Relatório Financeiro
exports.financeiro = async (req, res) => {
    try {
        const { data_inicio = '', data_fim = '' } = req.query;
        const connection = await pool.getConnection();

        let params = [];
        let query = `
            SELECT 
                COUNT(p.id) as total_pedidos,
                SUM(p.valor_total) as receita_bruta,
                SUM(p.desconto) as desconto_total,
                (SUM(p.valor_total) - SUM(p.desconto)) as receita_liquida
            FROM pedidos p
            WHERE p.status = 'entregue'
        `;

        if (data_inicio) {
            query += ' AND p.data_pedido >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            query += ' AND p.data_pedido <= ?';
            params.push(data_fim);
        }

        const [resultado] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório financeiro gerado com sucesso',
            dados: resultado[0] || {}
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório financeiro',
            erro: erro.message
        });
    }
};

// GET - Relatório de Clientes
exports.clientes = async (req, res) => {
    try {
        const { cidade = '' } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                c.id,
                c.nome,
                c.email,
                c.telefone,
                c.cidade,
                COUNT(p.id) as total_pedidos,
                SUM(p.valor_total) as valor_total_gasto
            FROM clientes c
            LEFT JOIN pedidos p ON c.id = p.cliente_id
            WHERE 1=1
        `;
        let params = [];

        if (cidade) {
            query += ' AND c.cidade = ?';
            params.push(cidade);
        }

        query += ' GROUP BY c.id ORDER BY valor_total_gasto DESC';

        const [clientes] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório de clientes gerado com sucesso',
            dados: clientes
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de clientes',
            erro: erro.message
        });
    }
};

// GET - Relatório de Pedidos
exports.pedidos = async (req, res) => {
    try {
        const { status = '', data_inicio = '', data_fim = '' } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                p.id,
                p.numero,
                c.nome as cliente,
                p.data_pedido,
                p.status,
                p.valor_total,
                COUNT(pi.id) as total_itens
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
            WHERE 1=1
        `;
        let params = [];

        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        if (data_inicio) {
            query += ' AND p.data_pedido >= ?';
            params.push(data_inicio);
        }

        if (data_fim) {
            query += ' AND p.data_pedido <= ?';
            params.push(data_fim);
        }

        query += ' GROUP BY p.id ORDER BY p.data_pedido DESC';

        const [pedidos] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório de pedidos gerado com sucesso',
            dados: pedidos
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de pedidos',
            erro: erro.message
        });
    }
};

// GET - Relatório de Logística
exports.logistica = async (req, res) => {
    try {
        const { status = '' } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                l.id,
                l.numero_rastreamento,
                l.transportadora,
                l.status,
                l.data_envio,
                l.data_entrega_prevista,
                l.data_entrega_real,
                p.numero as pedido_numero
            FROM logistica l
            LEFT JOIN pedidos p ON l.pedido_id = p.id
            WHERE 1=1
        `;
        let params = [];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        query += ' ORDER BY l.data_envio DESC';

        const [logistica] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório de logística gerado com sucesso',
            dados: logistica
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de logística',
            erro: erro.message
        });
    }
};

// ======================================================
// EXPORTAÇÃO XLSX
// ======================================================

const LABELS_COLUNAS = {
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
    data_envio: 'Data de envio',
    data_entrega_prevista: 'Previsão de entrega',
    data_entrega_real: 'Data real de entrega',
    numero: 'Número',
    numero_rastreamento: 'Rastreamento',
    transportadora: 'Transportadora',
    pedido_numero: 'Pedido',
    cliente: 'Cliente',
    status: 'Status',
    total_itens: 'Itens',
    total_gasto: 'Total gasto',
    quantidade_total: 'Quantidade total',
    total_itens_em_estoque: 'Total em estoque',
    receita_bruta: 'Receita bruta',
    receita_liquida: 'Receita líquida',
    desconto_total: 'Desconto total',
    desconto: 'Desconto'
};

const COLUNAS_MOEDA = new Set([
    'valor_total', 'valor_total_gasto', 'preco_venda', 'preco_custo',
    'receita_bruta', 'receita_liquida', 'desconto_total', 'desconto', 'total_gasto'
]);
const COLUNAS_DATA = new Set(['data', 'data_pedido', 'data_entrega_prevista', 'data_entrega_real']);
const COLUNAS_DATA_HORA = new Set(['data_envio', 'data_criacao', 'data_atualizacao']);
const COLUNAS_INTEIRAS = new Set(['total_pedidos', 'total_itens', 'quantidade_total', 'estoque']);

function humanizar(chave) {
    if (LABELS_COLUNAS[chave]) return LABELS_COLUNAS[chave];
    return String(chave).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatadorPorColuna(chave) {
    if (COLUNAS_MOEDA.has(chave)) return { numFmt: '"R$" #,##0.00', alignment: 'right', largura: 18 };
    if (COLUNAS_DATA.has(chave)) return { numFmt: 'dd/mm/yyyy', alignment: 'center', largura: 14 };
    if (COLUNAS_DATA_HORA.has(chave)) return { numFmt: 'dd/mm/yyyy hh:mm', alignment: 'center', largura: 18 };
    if (COLUNAS_INTEIRAS.has(chave)) return { numFmt: '#,##0', alignment: 'center', largura: 14 };
    if (chave === 'id') return { numFmt: '0', alignment: 'center', largura: 8 };
    if (chave === 'email') return { alignment: 'left', largura: 30 };
    if (chave === 'nome' || chave === 'cliente') return { alignment: 'left', largura: 28 };
    if (chave === 'status') return { alignment: 'center', largura: 14 };
    return { alignment: 'left', largura: 18 };
}

function prepararValorCelula(chave, valor) {
    if (valor === null || valor === undefined || valor === '') return '-';
    if (COLUNAS_MOEDA.has(chave)) return Number(valor) || 0;
    if (COLUNAS_INTEIRAS.has(chave)) return Number(valor) || 0;
    if (COLUNAS_DATA.has(chave) || COLUNAS_DATA_HORA.has(chave)) {
        const d = new Date(valor);
        return Number.isNaN(d.getTime()) ? '-' : d;
    }
    return valor;
}

function corPorStatus(status) {
    const s = String(status || '').toLowerCase();
    if (['entregue', 'aprovado', 'pago', 'concluido', 'concluído', 'finalizado'].includes(s)) {
        return { bg: CORES.verdeClaro, cor: CORES.verde };
    }
    if (['pendente', 'aguardando', 'em_transito', 'em transito', 'em andamento'].includes(s)) {
        return { bg: CORES.amareloClaro, cor: CORES.amarelo };
    }
    if (['cancelado', 'recusado', 'erro'].includes(s)) {
        return { bg: 'FFFEE2E2', cor: CORES.vermelho };
    }
    return null;
}

const RELATORIOS_DISPONIVEIS = {
    vendas: {
        titulo: 'Relatório de Vendas',
        filtros: ['data_inicio', 'data_fim'],
        ordem: ['data', 'total_pedidos', 'valor_total'],
        obterDados: async (conn, query) => {
            const { data_inicio = '', data_fim = '' } = query;
            let sql = 'SELECT DATE(p.data_pedido) as data, COUNT(p.id) as total_pedidos, SUM(p.valor_total) as valor_total FROM pedidos p WHERE 1=1';
            const params = [];
            if (data_inicio) { sql += ' AND p.data_pedido >= ?'; params.push(data_inicio); }
            if (data_fim) { sql += ' AND p.data_pedido <= ?'; params.push(data_fim); }
            sql += ' GROUP BY DATE(p.data_pedido) ORDER BY data DESC';
            const [rows] = await conn.execute(sql, params);
            const resumo = {
                total_pedidos: rows.reduce((s, r) => s + (Number(r.total_pedidos) || 0), 0),
                valor_total: rows.reduce((s, r) => s + (Number(r.valor_total) || 0), 0),
                dias_com_vendas: rows.length
            };
            return { dados: rows, resumo };
        }
    },
    estoque: {
        titulo: 'Relatório de Estoque',
        filtros: ['categoria'],
        ordem: ['id', 'nome', 'categoria', 'estoque', 'preco_venda', 'valor_total'],
        obterDados: async (conn, query) => {
            const { categoria = '' } = query;
            let sql = 'SELECT id, nome, categoria, estoque, preco_venda, (estoque * preco_venda) as valor_total FROM produtos WHERE 1=1';
            const params = [];
            if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
            sql += ' ORDER BY categoria, nome';
            const [rows] = await conn.execute(sql, params);
            const resumo = {
                total_itens: rows.length,
                quantidade_total: rows.reduce((s, p) => s + (Number(p.estoque) || 0), 0),
                valor_total: rows.reduce((s, p) => s + (Number(p.valor_total) || 0), 0)
            };
            return { dados: rows, resumo };
        }
    },
    financeiro: {
        titulo: 'Relatório Financeiro',
        filtros: ['data_inicio', 'data_fim'],
        ordem: ['total_pedidos', 'receita_bruta', 'desconto_total', 'receita_liquida'],
        obterDados: async (conn, query) => {
            const { data_inicio = '', data_fim = '' } = query;
            let sql = `
                SELECT COUNT(p.id) as total_pedidos,
                       SUM(p.valor_total) as receita_bruta,
                       SUM(p.desconto) as desconto_total,
                       (SUM(p.valor_total) - SUM(p.desconto)) as receita_liquida
                FROM pedidos p
                WHERE p.status = 'entregue'
            `;
            const params = [];
            if (data_inicio) { sql += ' AND p.data_pedido >= ?'; params.push(data_inicio); }
            if (data_fim) { sql += ' AND p.data_pedido <= ?'; params.push(data_fim); }
            const [rows] = await conn.execute(sql, params);
            return { dados: [rows[0] || {}], resumo: null };
        }
    },
    clientes: {
        titulo: 'Relatório de Clientes',
        filtros: ['cidade'],
        ordem: ['id', 'nome', 'email', 'telefone', 'cidade', 'total_pedidos', 'valor_total_gasto'],
        obterDados: async (conn, query) => {
            const { cidade = '' } = query;
            let sql = `
                SELECT c.id, c.nome, c.email, c.telefone, c.cidade,
                       COUNT(p.id) as total_pedidos,
                       SUM(p.valor_total) as valor_total_gasto
                FROM clientes c
                LEFT JOIN pedidos p ON c.id = p.cliente_id
                WHERE 1=1
            `;
            const params = [];
            if (cidade) { sql += ' AND c.cidade = ?'; params.push(cidade); }
            sql += ' GROUP BY c.id ORDER BY valor_total_gasto DESC';
            const [rows] = await conn.execute(sql, params);
            const resumo = {
                total_clientes: rows.length,
                total_pedidos: rows.reduce((s, r) => s + (Number(r.total_pedidos) || 0), 0),
                valor_total_gasto: rows.reduce((s, r) => s + (Number(r.valor_total_gasto) || 0), 0)
            };
            return { dados: rows, resumo };
        }
    },
    pedidos: {
        titulo: 'Relatório de Pedidos',
        filtros: ['status', 'data_inicio', 'data_fim'],
        ordem: ['id', 'numero', 'cliente', 'data_pedido', 'status', 'valor_total', 'total_itens'],
        obterDados: async (conn, query) => {
            const { status = '', data_inicio = '', data_fim = '' } = query;
            let sql = `
                SELECT p.id, p.numero, c.nome as cliente, p.data_pedido, p.status, p.valor_total,
                       COUNT(pi.id) as total_itens
                FROM pedidos p
                LEFT JOIN clientes c ON p.cliente_id = c.id
                LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
                WHERE 1=1
            `;
            const params = [];
            if (status) { sql += ' AND p.status = ?'; params.push(status); }
            if (data_inicio) { sql += ' AND p.data_pedido >= ?'; params.push(data_inicio); }
            if (data_fim) { sql += ' AND p.data_pedido <= ?'; params.push(data_fim); }
            sql += ' GROUP BY p.id ORDER BY p.data_pedido DESC';
            const [rows] = await conn.execute(sql, params);
            const resumo = {
                total_pedidos: rows.length,
                valor_total: rows.reduce((s, r) => s + (Number(r.valor_total) || 0), 0)
            };
            return { dados: rows, resumo };
        }
    },
    logistica: {
        titulo: 'Relatório de Logística',
        filtros: ['status'],
        ordem: ['id', 'numero_rastreamento', 'transportadora', 'status', 'data_envio', 'data_entrega_prevista', 'data_entrega_real', 'pedido_numero'],
        obterDados: async (conn, query) => {
            const { status = '' } = query;
            let sql = `
                SELECT l.id, l.numero_rastreamento, l.transportadora, l.status,
                       l.data_envio, l.data_entrega_prevista, l.data_entrega_real,
                       p.numero as pedido_numero
                FROM logistica l
                LEFT JOIN pedidos p ON l.pedido_id = p.id
                WHERE 1=1
            `;
            const params = [];
            if (status) { sql += ' AND l.status = ?'; params.push(status); }
            sql += ' ORDER BY l.data_envio DESC';
            const [rows] = await conn.execute(sql, params);
            return { dados: rows, resumo: { total_envios: rows.length } };
        }
    }
};

exports.exportarXLSX = async (req, res) => {
    const { tipo } = req.params;
    const definicao = RELATORIOS_DISPONIVEIS[tipo];
    if (!definicao) {
        return res.status(400).json({ sucesso: false, mensagem: `Tipo de relatório inválido: ${tipo}` });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const { dados, resumo } = await definicao.obterDados(connection, req.query);
        connection.release();

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Ideart ERP';
        workbook.created = new Date();
        const ws = workbook.addWorksheet(definicao.titulo.slice(0, 28), {
            views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }]
        });

        const colunas = dados.length > 0
            ? (definicao.ordem.length > 0
                ? definicao.ordem.filter(c => Object.prototype.hasOwnProperty.call(dados[0], c))
                : Object.keys(dados[0]))
            : definicao.ordem;

        const totalColunas = Math.max(colunas.length, 4);

        // Título principal
        aplicarTituloPrincipal(ws, definicao.titulo.toUpperCase(), totalColunas);

        // Subtítulo com data de geração e filtros aplicados
        const filtrosAplicados = definicao.filtros
            .filter(f => req.query[f])
            .map(f => `${humanizar(f)}: ${req.query[f]}`)
            .join('  |  ');
        const subTexto = filtrosAplicados
            ? `Gerado em ${new Date().toLocaleString('pt-BR')}  |  ${filtrosAplicados}`
            : `Gerado em ${new Date().toLocaleString('pt-BR')}`;
        ws.mergeCells(2, 1, 2, totalColunas);
        const celSub = ws.getCell(2, 1);
        celSub.value = subTexto;
        celSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF6B7280' } };
        celSub.alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getRow(2).height = 20;

        let linhaAtual = 3;

        // Resumo em cards
        if (resumo && Object.keys(resumo).length > 0) {
            aplicarSubtitulo(ws, linhaAtual, 'RESUMO', totalColunas);
            linhaAtual += 1;
            const entradas = Object.entries(resumo);
            const porLinha = Math.min(entradas.length, totalColunas);
            const largura = Math.floor(totalColunas / porLinha);

            for (let i = 0; i < entradas.length; i += porLinha) {
                const grupoRotulo = ws.getRow(linhaAtual);
                const grupoValor = ws.getRow(linhaAtual + 1);
                let colInicio = 1;
                for (let j = 0; j < porLinha && (i + j) < entradas.length; j++) {
                    const [chave, valor] = entradas[i + j];
                    const colFim = Math.min(colInicio + largura - 1, totalColunas);

                    ws.mergeCells(linhaAtual, colInicio, linhaAtual, colFim);
                    const celRotulo = grupoRotulo.getCell(colInicio);
                    celRotulo.value = humanizar(chave).toUpperCase();
                    celRotulo.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FF6B7280' } };
                    celRotulo.fill = preenchimento(CORES.cinzaClaro);
                    celRotulo.alignment = { vertical: 'middle', horizontal: 'center' };
                    celRotulo.border = bordaFina(CORES.cinzaMedio);

                    ws.mergeCells(linhaAtual + 1, colInicio, linhaAtual + 1, colFim);
                    const celValor = grupoValor.getCell(colInicio);
                    celValor.value = prepararValorCelula(chave, valor);
                    celValor.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: CORES.primaria } };
                    celValor.fill = preenchimento(CORES.primariaClara);
                    celValor.alignment = { vertical: 'middle', horizontal: 'center' };
                    celValor.border = bordaFina(CORES.cinzaMedio);
                    const fmt = formatadorPorColuna(chave);
                    if (fmt.numFmt) celValor.numFmt = fmt.numFmt;

                    colInicio = colFim + 1;
                }
                grupoRotulo.height = 18;
                grupoValor.height = 26;
                linhaAtual += 2;
            }
            linhaAtual += 1;
        }

        // Tabela de dados
        aplicarSubtitulo(ws, linhaAtual, 'DETALHAMENTO', totalColunas);
        linhaAtual += 1;

        // Larguras de coluna (usando getColumn para não conflitar com células já mescladas acima)
        colunas.forEach((chave, idx) => {
            ws.getColumn(idx + 1).width = formatadorPorColuna(chave).largura;
        });

        // Cabeçalho da tabela
        const linhaCabecalhoTabela = linhaAtual;
        const cabecalhoRow = ws.getRow(linhaCabecalhoTabela);
        colunas.forEach((chave, idx) => {
            cabecalhoRow.getCell(idx + 1).value = humanizar(chave);
        });
        aplicarEstiloCabecalho(cabecalhoRow);
        linhaAtual += 1;

        // Linhas de dados
        let ultimaLinhaDados = linhaCabecalhoTabela;
        if (dados.length === 0) {
            ws.mergeCells(linhaAtual, 1, linhaAtual, totalColunas);
            const cel = ws.getCell(linhaAtual, 1);
            cel.value = 'Nenhum dado disponível para o período selecionado.';
            cel.font = { ...FONTES.corpo, italic: true, color: { argb: 'FF6B7280' } };
            cel.alignment = { vertical: 'middle', horizontal: 'center' };
            cel.border = bordaFina(CORES.cinzaMedio);
            ws.getRow(linhaAtual).height = 28;
            linhaAtual += 1;
        } else {
            const alinhamentos = {};
            colunas.forEach((chave, idx) => {
                alinhamentos[idx + 1] = formatadorPorColuna(chave).alignment;
            });

            dados.forEach((item, idx) => {
                const row = ws.getRow(linhaAtual);
                colunas.forEach((chave, colIdx) => {
                    row.getCell(colIdx + 1).value = prepararValorCelula(chave, item[chave]);
                });
                aplicarEstiloLinha(row, { zebrada: idx % 2 === 1, alinhamentos });

                colunas.forEach((chave, colIdx) => {
                    const fmt = formatadorPorColuna(chave);
                    const cel = row.getCell(colIdx + 1);
                    if (fmt.numFmt) cel.numFmt = fmt.numFmt;

                    if (chave === 'status') {
                        const cor = corPorStatus(item[chave]);
                        if (cor) {
                            cel.fill = preenchimento(cor.bg);
                            cel.font = { ...FONTES.corpo, bold: true, color: { argb: cor.cor } };
                        }
                    }
                });
                linhaAtual += 1;
            });
            ultimaLinhaDados = linhaAtual - 1;

            // Linha de totais para colunas numéricas
            const colunasNumericas = colunas
                .map((chave, i) => ({ chave, idx: i + 1 }))
                .filter(({ chave }) => COLUNAS_MOEDA.has(chave) || COLUNAS_INTEIRAS.has(chave));

            if (colunasNumericas.length > 0 && dados.length > 1) {
                const rowTotal = ws.getRow(linhaAtual);
                rowTotal.getCell(1).value = 'TOTAL';
                rowTotal.getCell(1).font = { ...FONTES.total, color: { argb: CORES.branco } };
                rowTotal.getCell(1).fill = preenchimento(CORES.primaria);
                rowTotal.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
                rowTotal.getCell(1).border = bordaFina();

                for (let c = 2; c <= colunas.length; c++) {
                    const cel = rowTotal.getCell(c);
                    const colMeta = colunasNumericas.find(cn => cn.idx === c);
                    if (colMeta) {
                        const soma = dados.reduce((s, d) => s + (Number(d[colMeta.chave]) || 0), 0);
                        cel.value = soma;
                        cel.numFmt = formatadorPorColuna(colMeta.chave).numFmt;
                    } else {
                        cel.value = '';
                    }
                    cel.font = { ...FONTES.total, color: { argb: CORES.branco } };
                    cel.fill = preenchimento(CORES.primaria);
                    cel.alignment = { vertical: 'middle', horizontal: formatadorPorColuna(colunas[c - 1]).alignment };
                    cel.border = bordaFina();
                }
                rowTotal.height = 24;
                linhaAtual += 1;
            }
        }

        // Auto filtro na tabela de dados
        if (dados.length > 0) {
            try {
                ws.autoFilter = {
                    from: { row: linhaCabecalhoTabela, column: 1 },
                    to: { row: ultimaLinhaDados, column: colunas.length }
                };
            } catch (_) { /* autofilter é opcional */ }
        }

        ajustarLarguraColunas(ws, { min: 10, max: 55, padding: 3 });

        const nomeArquivo = formatarNomeArquivo(definicao.titulo, 'xlsx');
        await enviarXLSX(res, workbook, nomeArquivo);
    } catch (erro) {
        if (connection) try { connection.release(); } catch (_) {}
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar XLSX', erro: erro.message });
    }
};
