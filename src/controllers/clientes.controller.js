// Controller de Clientes
const pool = require('../config/database');

// GET - Listar todos os clientes
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', cidade = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM clientes WHERE 1=1';
        let params = [];

        if (busca) {
            query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
        }

        if (cidade) {
            query += ' AND cidade = ?';
            params.push(cidade);
        }

        const [countResult] = await connection.execute(
            query.replace('SELECT *', 'SELECT COUNT(*) as total'),
            params
        );
        const totalRegistros = countResult[0].total;

        query += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [clientes] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Clientes listados com sucesso',
            dados: clientes,
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
            mensagem: 'Erro ao listar clientes',
            erro: erro.message
        });
    }
};

// GET - Buscar cliente por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [clientes] = await connection.execute(
            'SELECT * FROM clientes WHERE id = ?',
            [id]
        );

        connection.release();

        if (clientes.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Cliente encontrado',
            dados: clientes[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar cliente',
            erro: erro.message
        });
    }
};

// POST - Criar novo cliente
exports.criar = async (req, res) => {
    try {
        const { nome, email, telefone, endereco, cidade, estado, cep } = req.body;

        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome do cliente é obrigatório'
            });
        }

        const connection = await pool.getConnection();

        if (email) {
            const [existente] = await connection.execute(
                'SELECT id FROM clientes WHERE email = ?',
                [email]
            );

            if (existente.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este email já está cadastrado'
                });
            }
        }

        const [result] = await connection.execute(
            `INSERT INTO clientes (nome, email, telefone, endereco, cidade, estado, cep, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [nome, email || null, telefone || null, endereco || null, cidade || null, estado || null, cep || null]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Cliente criado com sucesso',
            id: result.insertId
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar cliente',
            erro: erro.message
        });
    }
};

// PUT - Atualizar cliente
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco, cidade, estado, cep } = req.body;

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM clientes WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado'
            });
        }

        if (email) {
            const [emailExiste] = await connection.execute(
                'SELECT id FROM clientes WHERE email = ? AND id != ?',
                [email, id]
            );

            if (emailExiste.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este email já está cadastrado para outro cliente'
                });
            }
        }

        await connection.execute(
            `UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ?, atualizado_em = NOW()
            WHERE id = ?`,
            [nome || null, email || null, telefone || null, endereco || null, cidade || null, estado || null, cep || null, id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Cliente atualizado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar cliente',
            erro: erro.message
        });
    }
};

// DELETE - Deletar cliente
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Cliente deletado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar cliente',
            erro: erro.message
        });
    }
};
