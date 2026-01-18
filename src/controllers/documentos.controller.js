// Controller de Documentos
const pool = require('../config/database');

// GET - Listar todos os documentos
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, tipo = '', referencia_tipo = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM documentos WHERE 1=1';
        let params = [];

        if (tipo) {
            query += ' AND tipo = ?';
            params.push(tipo);
        }

        if (referencia_tipo) {
            query += ' AND referencia_tipo = ?';
            params.push(referencia_tipo);
        }

        const [countResult] = await connection.execute(
            query.replace('SELECT *', 'SELECT COUNT(*) as total'),
            params
        );
        const totalRegistros = countResult[0].total;

        query += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [documentos] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Documentos listados com sucesso',
            dados: documentos,
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
            mensagem: 'Erro ao listar documentos',
            erro: erro.message
        });
    }
};

// GET - Buscar documento por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [documentos] = await connection.execute(
            'SELECT * FROM documentos WHERE id = ?',
            [id]
        );

        connection.release();

        if (documentos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Documento não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Documento encontrado',
            dados: documentos[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar documento',
            erro: erro.message
        });
    }
};

// POST - Criar novo documento
exports.criar = async (req, res) => {
    try {
        const { nome, tipo, referencia_id, referencia_tipo, caminho_arquivo, data_criacao } = req.body;

        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome do documento é obrigatório'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            `INSERT INTO documentos (nome, tipo, referencia_id, referencia_tipo, caminho_arquivo, data_criacao, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [nome, tipo || null, referencia_id || null, referencia_tipo || null, caminho_arquivo || null, data_criacao || null]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Documento criado com sucesso',
            id: result.insertId
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar documento',
            erro: erro.message
        });
    }
};

// PUT - Atualizar documento
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, referencia_id, referencia_tipo, caminho_arquivo, data_criacao } = req.body;

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM documentos WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Documento não encontrado'
            });
        }

        await connection.execute(
            `UPDATE documentos SET nome = ?, tipo = ?, referencia_id = ?, referencia_tipo = ?, caminho_arquivo = ?, data_criacao = ?, atualizado_em = NOW()
            WHERE id = ?`,
            [nome || null, tipo || null, referencia_id || null, referencia_tipo || null, caminho_arquivo || null, data_criacao || null, id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Documento atualizado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar documento',
            erro: erro.message
        });
    }
};

// DELETE - Deletar documento
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            'DELETE FROM documentos WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Documento não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Documento deletado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar documento',
            erro: erro.message
        });
    }
};
