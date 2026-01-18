// Controller de Relatórios
const pool = require('../config/database');

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

        query += ' GROUP BY DATE(p.data_pedido) ORDER BY p.data_pedido DESC';

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
            quantidade_total: estoque.reduce((sum, p) => sum + p.estoque, 0),
            valor_total: estoque.reduce((sum, p) => sum + (p.valor_total || 0), 0)
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
