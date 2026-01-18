// Controller de Profissionais
const pool = require('../config/database');

// GET - Listar todos os profissionais
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', especialidade = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM profissionais WHERE 1=1';
        let params = [];

        if (busca) {
            query += ' AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
        }

        if (especialidade) {
            query += ' AND especialidade = ?';
            params.push(especialidade);
        }

        const [countResult] = await connection.execute(
            query.replace('SELECT *', 'SELECT COUNT(*) as total'),
            params
        );
        const totalRegistros = countResult[0].total;

        query += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [profissionais] = await connection.execute(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Profissionais listados com sucesso',
            dados: profissionais,
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
            mensagem: 'Erro ao listar profissionais',
            erro: erro.message
        });
    }
};

// GET - Buscar profissional por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [profissionais] = await connection.execute(
            'SELECT * FROM profissionais WHERE id = ?',
            [id]
        );

        connection.release();

        if (profissionais.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Profissional não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Profissional encontrado',
            dados: profissionais[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar profissional',
            erro: erro.message
        });
    }
};

// POST - Criar novo profissional
exports.criar = async (req, res) => {
    try {
        const { nome, especialidade, email, telefone, cpf, data_admissao, salario } = req.body;

        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome do profissional é obrigatório'
            });
        }

        const connection = await pool.getConnection();

        if (email) {
            const [existente] = await connection.execute(
                'SELECT id FROM profissionais WHERE email = ?',
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

        if (cpf) {
            const [existenteCpf] = await connection.execute(
                'SELECT id FROM profissionais WHERE cpf = ?',
                [cpf]
            );

            if (existenteCpf.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este CPF já está cadastrado'
                });
            }
        }

        const [result] = await connection.execute(
            `INSERT INTO profissionais (nome, especialidade, email, telefone, cpf, data_admissao, salario, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [nome, especialidade || null, email || null, telefone || null, cpf || null, data_admissao || null, salario || 0]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Profissional criado com sucesso',
            id: result.insertId
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar profissional',
            erro: erro.message
        });
    }
};

// PUT - Atualizar profissional
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, especialidade, email, telefone, cpf, data_admissao, salario } = req.body;

        const connection = await pool.getConnection();

        const [existe] = await connection.execute(
            'SELECT id FROM profissionais WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Profissional não encontrado'
            });
        }

        if (email) {
            const [emailExiste] = await connection.execute(
                'SELECT id FROM profissionais WHERE email = ? AND id != ?',
                [email, id]
            );

            if (emailExiste.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este email já está cadastrado para outro profissional'
                });
            }
        }

        await connection.execute(
            `UPDATE profissionais SET nome = ?, especialidade = ?, email = ?, telefone = ?, cpf = ?, data_admissao = ?, salario = ?, atualizado_em = NOW()
            WHERE id = ?`,
            [nome || null, especialidade || null, email || null, telefone || null, cpf || null, data_admissao || null, salario || 0, id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Profissional atualizado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar profissional',
            erro: erro.message
        });
    }
};

// DELETE - Deletar profissional
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.execute(
            'DELETE FROM profissionais WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Profissional não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Profissional deletado com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar profissional',
            erro: erro.message
        });
    }
};
