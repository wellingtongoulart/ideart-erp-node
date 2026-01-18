const pool = require('../config/database');
const crypto = require('crypto');

// ===== LOGIN =====
async function login(req, res) {
    try {
        const { username = '', password = '' } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Usuário e senha são obrigatórios'
            });
        }

        const connection = await pool.getConnection();

        // Buscar usuário
        const [usuarios] = await connection.execute(
            'SELECT id, username, email, senha, funcao FROM usuarios WHERE username = ? OR email = ?',
            [username, username]
        );

        connection.release();

        if (usuarios.length === 0) {
            console.log('Nenhum usuário encontrado com o nome de usuário ou email fornecido.');
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        const usuario = usuarios[0];

        // Comparação simples de senha
        if (usuario.senha !== password) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        // Gerar token simples
        const token = crypto.randomBytes(16).toString('hex');

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token: token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                funcao: usuario.funcao
            }
        });
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao processar login'
        });
    }
}

// ===== LOGOUT =====
async function logout(req, res) {
    try {
        return res.json({
            sucesso: true,
            mensagem: 'Logout realizado com sucesso'
        });
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao fazer logout'
        });
    }
}

// ===== LISTAR USUÁRIOS =====
async function listarUsuarios(req, res) {
    try {
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query(
            'SELECT id, username, email, funcao FROM usuarios'
        );
        connection.release();

        return res.json({
            sucesso: true,
            usuarios: usuarios
        });
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar usuários'
        });
    }
}

// ===== OBTER USUÁRIO =====
async function obterUsuario(req, res) {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query(
            'SELECT id, username, email, funcao FROM usuarios WHERE id = ?',
            [id]
        );
        connection.release();

        if (usuarios.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            });
        }

        return res.json({
            sucesso: true,
            usuario: usuarios[0]
        });
    } catch (erro) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao obter usuário'
        });
    }
}

module.exports = {
    login,
    logout,
    listarUsuarios,
    obterUsuario
};
