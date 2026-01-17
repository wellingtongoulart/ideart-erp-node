// Exemplo de Controller com conexão ao banco de dados
// Copie e adapte este arquivo para cada módulo

const pool = require('../config/database');

// GET - Listar todos com busca e paginação
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM tabela WHERE 1=1';
        let params = [];

        // Adicionar filtro de busca se fornecido
        if (busca) {
            query += ' AND nome LIKE ?';
            params.push(`%${busca}%`);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [dados] = await connection.execute(query, params);
        
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Dados listados com sucesso',
            dados: dados,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total: dados.length
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar dados',
            erro: erro.message
        });
    }
};

// GET - Buscar por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const query = 'SELECT * FROM tabela WHERE id = ?';
        const [dados] = await connection.execute(query, [id]);

        connection.release();

        if (dados.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Registro encontrado',
            dados: dados[0]
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
        const { nome, email, telefone } = req.body;

        // Validação básica
        if (!nome || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e email são obrigatórios'
            });
        }

        const connection = await pool.getConnection();

        const query = `
            INSERT INTO tabela (nome, email, telefone, criado_em, atualizado_em)
            VALUES (?, ?, ?, NOW(), NOW())
        `;
        
        const [resultado] = await connection.execute(query, [nome, email, telefone]);

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Registro criado com sucesso',
            id: resultado.insertId,
            dados: {
                id: resultado.insertId,
                nome,
                email,
                telefone
            }
        });
    } catch (erro) {
        // Verificar duplicação de email
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email já cadastrado'
            });
        }

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
        const { nome, email, telefone } = req.body;

        const connection = await pool.getConnection();

        // Verificar se existe
        const [existe] = await connection.execute(
            'SELECT id FROM tabela WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro não encontrado'
            });
        }

        const query = `
            UPDATE tabela 
            SET nome = ?, email = ?, telefone = ?, atualizado_em = NOW()
            WHERE id = ?
        `;

        await connection.execute(query, [nome, email, telefone, id]);

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Registro atualizado com sucesso',
            dados: {
                id,
                nome,
                email,
                telefone
            }
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

        // Verificar se existe
        const [existe] = await connection.execute(
            'SELECT id FROM tabela WHERE id = ?',
            [id]
        );

        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Registro não encontrado'
            });
        }

        const query = 'DELETE FROM tabela WHERE id = ?';
        await connection.execute(query, [id]);

        connection.release();

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

module.exports = exports;
