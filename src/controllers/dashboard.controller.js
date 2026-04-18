// Controller do Dashboard — agrega dados para visão executiva
const pool = require('../config/database');

const ESTOQUE_CRITICO_LIMITE = 10;
const PERIODOS_VALIDOS = { 7: 7, 30: 30, 90: 90 };

exports.resumo = async (req, res) => {
    const dias = PERIODOS_VALIDOS[Number(req.query.periodo)] || 30;
    const connection = await pool.getConnection();
    try {
        // ===== KPIs =====

        // Receita do mês atual (pedidos entregues)
        const [[receitaMes]] = await connection.query(`
            SELECT COALESCE(SUM(valor_total - IFNULL(desconto, 0)), 0) AS total,
                   COUNT(*) AS qtd_pedidos
            FROM pedidos
            WHERE status = 'entregue'
              AND YEAR(data_pedido) = YEAR(CURRENT_DATE)
              AND MONTH(data_pedido) = MONTH(CURRENT_DATE)
        `);

        // Receita do mês anterior (MoM — month-over-month)
        const [[receitaMesAnterior]] = await connection.query(`
            SELECT COALESCE(SUM(valor_total - IFNULL(desconto, 0)), 0) AS total
            FROM pedidos
            WHERE status = 'entregue'
              AND data_pedido >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
              AND data_pedido < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
        `);

        // Receita do mesmo mês ano anterior (YoY — year-over-year)
        const [[receitaAnoAnterior]] = await connection.query(`
            SELECT COALESCE(SUM(valor_total - IFNULL(desconto, 0)), 0) AS total
            FROM pedidos
            WHERE status = 'entregue'
              AND YEAR(data_pedido) = YEAR(CURRENT_DATE) - 1
              AND MONTH(data_pedido) = MONTH(CURRENT_DATE)
        `);

        // Pedidos em andamento
        const [[pedidosAndamento]] = await connection.query(`
            SELECT COUNT(*) AS total
            FROM pedidos
            WHERE status IN ('pendente', 'processando', 'enviado')
        `);

        // Ticket médio do período selecionado
        const [[ticket]] = await connection.query(`
            SELECT COALESCE(AVG(valor_total), 0) AS valor
            FROM pedidos
            WHERE status <> 'cancelado'
              AND data_pedido >= CURRENT_DATE - INTERVAL ? DAY
        `, [dias]);

        // Taxa de conversão de orçamentos do período
        const [[conversao]] = await connection.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN status IN ('aprovado', 'convertido') THEN 1 ELSE 0 END) AS convertidos
            FROM orcamentos
            WHERE data_criacao >= CURRENT_DATE - INTERVAL ? DAY
        `, [dias]);

        const [[totalClientes]] = await connection.query(`SELECT COUNT(*) AS total FROM clientes`);
        const [[totalProdutos]] = await connection.query(`SELECT COUNT(*) AS total FROM produtos WHERE ativo = 1`);

        // ===== Gráficos =====

        // Receita diária no período
        const [receitaDiaria] = await connection.query(`
            SELECT DATE(data_pedido) AS data,
                   COALESCE(SUM(valor_total - IFNULL(desconto, 0)), 0) AS valor,
                   COUNT(*) AS pedidos
            FROM pedidos
            WHERE status <> 'cancelado'
              AND data_pedido >= CURRENT_DATE - INTERVAL ? DAY
            GROUP BY DATE(data_pedido)
            ORDER BY data ASC
        `, [dias]);

        // Pedidos por status (snapshot geral)
        const [pedidosPorStatus] = await connection.query(`
            SELECT status, COUNT(*) AS total
            FROM pedidos
            GROUP BY status
        `);

        // Orçamentos por status (snapshot geral)
        const [orcamentosPorStatus] = await connection.query(`
            SELECT status, COUNT(*) AS total, COALESCE(SUM(valor_total), 0) AS valor
            FROM orcamentos
            GROUP BY status
        `);

        // Top 5 produtos no período
        const [topProdutos] = await connection.query(`
            SELECT pi.produto_id AS id,
                   pr.nome,
                   pr.categoria,
                   SUM(pi.quantidade) AS quantidade,
                   SUM(pi.subtotal) AS valor
            FROM pedido_itens pi
            INNER JOIN pedidos p ON pi.pedido_id = p.id
            LEFT JOIN produtos pr ON pi.produto_id = pr.id
            WHERE p.status <> 'cancelado'
              AND p.data_pedido >= CURRENT_DATE - INTERVAL ? DAY
              AND pi.produto_id IS NOT NULL
            GROUP BY pi.produto_id, pr.nome, pr.categoria
            ORDER BY valor DESC
            LIMIT 5
        `, [dias]);

        // Top 5 clientes no período
        const [topClientes] = await connection.query(`
            SELECT c.id,
                   c.nome,
                   COUNT(p.id) AS pedidos,
                   COALESCE(SUM(p.valor_total - IFNULL(p.desconto, 0)), 0) AS valor
            FROM pedidos p
            INNER JOIN clientes c ON p.cliente_id = c.id
            WHERE p.status <> 'cancelado'
              AND p.data_pedido >= CURRENT_DATE - INTERVAL ? DAY
            GROUP BY c.id, c.nome
            ORDER BY valor DESC
            LIMIT 5
        `, [dias]);

        // ===== Alertas =====

        const [estoqueCritico] = await connection.query(`
            SELECT id, nome, categoria, estoque, preco_venda
            FROM produtos
            WHERE ativo = 1 AND estoque <= ?
            ORDER BY estoque ASC
            LIMIT 10
        `, [ESTOQUE_CRITICO_LIMITE]);

        const [pedidosAtrasados] = await connection.query(`
            SELECT p.id, p.numero, c.nome AS cliente,
                   p.data_entrega_prevista,
                   DATEDIFF(CURRENT_DATE, p.data_entrega_prevista) AS dias_atraso,
                   p.status, p.valor_total
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.data_entrega_prevista IS NOT NULL
              AND p.data_entrega_prevista < CURRENT_DATE
              AND p.status NOT IN ('entregue', 'cancelado')
            ORDER BY p.data_entrega_prevista ASC
            LIMIT 10
        `);

        const [orcamentosVencendo] = await connection.query(`
            SELECT o.id, o.numero, c.nome AS cliente,
                   o.data_validade,
                   DATEDIFF(o.data_validade, CURRENT_DATE) AS dias_restantes,
                   o.valor_total
            FROM orcamentos o
            LEFT JOIN clientes c ON o.cliente_id = c.id
            WHERE o.status = 'pendente'
              AND o.data_validade IS NOT NULL
              AND o.data_validade >= CURRENT_DATE
              AND o.data_validade <= CURRENT_DATE + INTERVAL 7 DAY
            ORDER BY o.data_validade ASC
            LIMIT 10
        `);

        // Variações
        const receitaAtual = Number(receitaMes.total) || 0;
        const receitaAnterior = Number(receitaMesAnterior.total) || 0;
        const receitaYoY = Number(receitaAnoAnterior.total) || 0;

        const variacaoMoM = receitaAnterior > 0
            ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100
            : null;

        const variacaoYoY = receitaYoY > 0
            ? ((receitaAtual - receitaYoY) / receitaYoY) * 100
            : null;

        const totalOrc = Number(conversao.total) || 0;
        const taxaConversao = totalOrc > 0 ? (Number(conversao.convertidos) / totalOrc) * 100 : 0;

        res.json({
            sucesso: true,
            dados: {
                periodo_dias: dias,
                kpis: {
                    receita_mes: receitaAtual,
                    receita_mes_anterior: receitaAnterior,
                    receita_ano_anterior: receitaYoY,
                    variacao_mom: variacaoMoM,
                    variacao_yoy: variacaoYoY,
                    pedidos_mes: Number(receitaMes.qtd_pedidos) || 0,
                    pedidos_em_andamento: Number(pedidosAndamento.total) || 0,
                    ticket_medio: Number(ticket.valor) || 0,
                    taxa_conversao_orcamentos: taxaConversao,
                    total_clientes: Number(totalClientes.total) || 0,
                    total_produtos: Number(totalProdutos.total) || 0
                },
                receita_diaria: receitaDiaria,
                pedidos_por_status: pedidosPorStatus,
                orcamentos_por_status: orcamentosPorStatus,
                top_produtos: topProdutos,
                top_clientes: topClientes,
                alertas: {
                    estoque_critico: estoqueCritico,
                    pedidos_atrasados: pedidosAtrasados,
                    orcamentos_vencendo: orcamentosVencendo
                }
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao carregar dashboard',
            erro: erro.message
        });
    } finally {
        connection.release();
    }
};
