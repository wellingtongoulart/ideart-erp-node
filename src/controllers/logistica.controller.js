// Controller de Logística
const pool = require('../config/database');

// GET - Listar todos os registros de logística
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, status = '', pedido_id = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT l.*, p.numero as pedido_numero FROM logistica l LEFT JOIN pedidos p ON l.pedido_id = p.id WHERE 1=1';
        let params = [];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        if (pedido_id) {
            query += ' AND l.pedido_id = ?';
            params.push(pedido_id);
        }

        const [countResult] = await connection.execute(
            query.replace('SELECT l.*', 'SELECT COUNT(*) as total').replace(', p.numero as pedido_numero', ''),
            params
        );
        const totalRegistros = countResult[0].total;

        query += ' ORDER BY l.criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [logistica] = await connection.query(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Registros de logística listados com sucesso',
            dados: logistica,
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
            mensagem: 'Erro ao listar logística',
            erro: erro.message
        });
    }
};

// GET - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [resultado] = await connection.execute(
            'SELECT l.*, p.numero as pedido_numero FROM logistica l LEFT JOIN pedidos p ON l.pedido_id = p.id WHERE l.id = ?',
            [id]
        );

        connection.release();

        if (resultado.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro de logística não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Registro encontrado',
            dados: resultado[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar registro',
            erro: erro.message
        });
    }
};

// POST - Criar novo registro
exports.criar = async (req, res) => {
    try {
        const { numero_rastreamento, pedido_id, transportadora, endereco_origem, endereco_destino, data_envio, data_entrega_prevista, status = 'aguardando', observacoes = '' } = req.body;

        if (!numero_rastreamento || !pedido_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Número de rastreamento e Pedido são obrigatórios'
            });
        }

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM logistica WHERE numero_rastreamento = ?',
            [numero_rastreamento]
        );

        if (existe.length > 0) {
            connection.release();
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Este número de rastreamento já existe'
            });
        }

        const [result] = await connection.execute(
            `INSERT INTO logistica (numero_rastreamento, pedido_id, transportadora, endereco_origem, endereco_destino, data_envio, data_entrega_prevista, status, observacoes, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [numero_rastreamento, pedido_id, transportadora || null, endereco_origem || null, endereco_destino || null, data_envio || null, data_entrega_prevista || null, status, observacoes]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Registro criado com sucesso',
            id: result.insertId
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar registro',
            erro: erro.message
        });
    }
};

// PUT - Atualizar registro
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero_rastreamento, pedido_id, transportadora, endereco_origem, endereco_destino, data_envio, data_entrega_prevista, data_entrega_real, status, observacoes } = req.body;

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM logistica WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro não encontrado'
            });
        }

        let query = 'UPDATE logistica SET atualizado_em = NOW()';
        const params = [];
        if (numero_rastreamento !== undefined)   { query += ', numero_rastreamento = ?';   params.push(numero_rastreamento); }
        if (pedido_id !== undefined)             { query += ', pedido_id = ?';             params.push(pedido_id); }
        if (transportadora !== undefined)        { query += ', transportadora = ?';        params.push(transportadora); }
        if (endereco_origem !== undefined)       { query += ', endereco_origem = ?';       params.push(endereco_origem); }
        if (endereco_destino !== undefined)      { query += ', endereco_destino = ?';      params.push(endereco_destino); }
        if (data_envio !== undefined)            { query += ', data_envio = ?';            params.push(data_envio); }
        if (data_entrega_prevista !== undefined) { query += ', data_entrega_prevista = ?'; params.push(data_entrega_prevista); }
        if (data_entrega_real !== undefined)     { query += ', data_entrega_real = ?';     params.push(data_entrega_real); }
        if (status !== undefined)                { query += ', status = ?';                params.push(status); }
        if (observacoes !== undefined)           { query += ', observacoes = ?';           params.push(observacoes); }
        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Registro atualizado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar registro',
            erro: erro.message
        });
    }
};

// DELETE - Deletar registro
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            'DELETE FROM logistica WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Registro deletado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar registro',
            erro: erro.message
        });
    }
};
