// Controller de Profissionais
const pool = require('../config/database');
const { montarOrderBy } = require('../utils/ordenacao');

const COLUNAS_ORDENACAO_PROFISSIONAIS = {
    id: 'id',
    nome: 'nome',
    especialidade: 'especialidade',
    email: 'email',
    telefone: 'telefone',
    cpf: 'cpf',
    data_admissao: 'data_admissao',
    salario: 'salario',
    criado_em: 'criado_em'
};

// GET - Listar todos os profissionais
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', especialidade = '', ordenarPor, ordem } = req.query;
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

        const orderBy = montarOrderBy({
            ordenarPor, ordem,
            colunasPermitidas: COLUNAS_ORDENACAO_PROFISSIONAIS,
            padrao: 'criado_em DESC'
        });
        query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const [profissionais] = await connection.query(query, params);
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

        let query = 'UPDATE profissionais SET atualizado_em = NOW()';
        const params = [];
        if (nome !== undefined)          { query += ', nome = ?';          params.push(nome); }
        if (especialidade !== undefined) { query += ', especialidade = ?'; params.push(especialidade); }
        if (email !== undefined)         { query += ', email = ?';         params.push(email); }
        if (telefone !== undefined)      { query += ', telefone = ?';      params.push(telefone); }
        if (cpf !== undefined)           { query += ', cpf = ?';           params.push(cpf); }
        if (data_admissao !== undefined) { query += ', data_admissao = ?'; params.push(data_admissao); }
        if (salario !== undefined)       { query += ', salario = ?';       params.push(salario); }
        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);

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

// GET - Listar especialidades únicas
exports.especialidades = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [especialidades] = await connection.execute(
            'SELECT DISTINCT especialidade FROM profissionais WHERE especialidade IS NOT NULL AND especialidade != "" ORDER BY especialidade'
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Especialidades listadas com sucesso',
            dados: especialidades.map(e => e.especialidade)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar especialidades',
            erro: erro.message
        });
    }
};
