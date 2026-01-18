// Controller de Orçamentos
const pool = require('../config/database');

// GET - Listar todos os orçamentos
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, status = '', cliente_id = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT o.*, c.nome as cliente_nome FROM orcamentos o LEFT JOIN clientes c ON o.cliente_id = c.id WHERE 1=1';
        let params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        if (cliente_id) {
            query += ' AND o.cliente_id = ?';
            params.push(cliente_id);
        }

        const [countResult] = await connection.execute(
            query.replace('SELECT o.*', 'SELECT COUNT(*) as total').replace(', c.nome as cliente_nome', ''),
            params
        );
        const totalRegistros = countResult[0].total;

        query += ' ORDER BY o.criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [orcamentos] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamentos listados com sucesso',
            dados: orcamentos,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total: totalRegistros,
                totalPaginas: Math.ceil(totalRegistros / limite)
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar orçamentos',
            erro: erro.message
        });
    }
};

// GET - Buscar orçamento por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            'SELECT o.*, c.nome as cliente_nome FROM orcamentos o LEFT JOIN clientes c ON o.cliente_id = c.id WHERE o.id = ?',
            [id]
        );

        connection.release();

        if (orcamentos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Orçamento não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Orçamento encontrado',
            dados: orcamentos[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar orçamento',
            erro: erro.message
        });
    }
};

// POST - Criar novo orçamento
exports.criar = async (req, res) => {
    try {
        const { numero, cliente_id, data_criacao, data_validade, valor_total, desconto = 0, status = 'pendente', observacoes = '' } = req.body;

        if (!numero || !cliente_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Número e Cliente são obrigatórios'
            });
        }

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM orcamentos WHERE numero = ?',
            [numero]
        );

        if (existe.length > 0) {
            connection.release();
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este número de orçamento já existe'
            });
        }

        const [result] = await connection.execute(
            `INSERT INTO orcamentos (numero, cliente_id, data_criacao, data_validade, valor_total, desconto, status, observacoes, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [numero, cliente_id, data_criacao || null, data_validade || null, valor_total || 0, desconto || 0, status, observacoes]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Orçamento criado com sucesso',
            id: result.insertId
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar orçamento',
            erro: erro.message
        });
    }
};

// PUT - Atualizar orçamento
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, cliente_id, data_criacao, data_validade, valor_total, desconto, status, observacoes } = req.body;

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM orcamentos WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Orçamento não encontrado'
            });
        }

        await connection.execute(
            `UPDATE orcamentos SET numero = ?, cliente_id = ?, data_criacao = ?, data_validade = ?, valor_total = ?, desconto = ?, status = ?, observacoes = ?, atualizado_em = NOW()
            WHERE id = ?`,
            [numero || null, cliente_id || null, data_criacao || null, data_validade || null, valor_total || 0, desconto || 0, status || 'pendente', observacoes || null, id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamento atualizado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar orçamento',
            erro: erro.message
        });
    }
};

// DELETE - Deletar orçamento
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            'DELETE FROM orcamentos WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Orçamento não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Orçamento deletado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar orçamento',
            erro: erro.message
        });
    }
};
