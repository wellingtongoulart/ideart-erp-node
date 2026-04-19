const pool = require('../config/database');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '8h';
const TOKEN_VALIDADE_MINUTOS = 60;
const SENHA_MIN_CARACTERES = 10;

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

        const [usuarios] = await connection.execute(
            'SELECT id, nome, username, email, senha, funcao FROM usuarios WHERE (username = ? OR email = ?) AND ativo = TRUE',
            [username, username]
        );

        connection.release();

        if (usuarios.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(password, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, funcao: usuario.funcao },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                nome: usuario.nome,
                funcao: usuario.funcao
            }
        });
    } catch (erro) {
        console.error('Erro em login:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao processar login'
        });
    }
}

// ===== LOGOUT =====
async function logout(req, res) {
    // Com JWT stateless o logout é client-side (descartar token).
    return res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
}

// ===== LISTAR USUÁRIOS =====
async function listarUsuarios(req, res) {
    try {
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query(
            'SELECT id, nome, username, email, funcao, ativo FROM usuarios'
        );
        connection.release();

        return res.json({ sucesso: true, usuarios });
    } catch (erro) {
        console.error('Erro em listarUsuarios:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar usuários' });
    }
}

// ===== OBTER USUÁRIO =====
async function obterUsuario(req, res) {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query(
            'SELECT id, nome, username, email, funcao FROM usuarios WHERE id = ?',
            [id]
        );
        connection.release();

        if (usuarios.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
        }

        return res.json({ sucesso: true, usuario: usuarios[0] });
    } catch (erro) {
        console.error('Erro em obterUsuario:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter usuário' });
    }
}

// ===== OBTER USUÁRIO LOGADO =====
async function obterUsuarioLogado(req, res) {
    try {
        const connection = await pool.getConnection();
        const [usuarios] = await connection.query(
            'SELECT id, nome, username, email, funcao FROM usuarios WHERE id = ?',
            [req.user.id]
        );
        connection.release();

        if (usuarios.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
        }

        return res.json({ sucesso: true, usuario: usuarios[0] });
    } catch (erro) {
        console.error('Erro em obterUsuarioLogado:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter usuário' });
    }
}

// ===== SOLICITAR RECUPERAÇÃO DE SENHA =====
async function solicitarRecuperacaoSenha(req, res) {
    try {
        const { identificador = '' } = req.body;
        const valor = String(identificador).trim();

        if (!valor) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe seu usuário ou email'
            });
        }

        const connection = await pool.getConnection();
        try {
            const [usuarios] = await connection.execute(
                'SELECT id, nome, email, username FROM usuarios WHERE (username = ? OR email = ?) AND ativo = TRUE',
                [valor, valor]
            );

            if (usuarios.length > 0) {
                const usuario = usuarios[0];
                const token = crypto.randomBytes(32).toString('hex');
                const expiracao = new Date(Date.now() + TOKEN_VALIDADE_MINUTOS * 60 * 1000);

                await connection.execute(
                    'UPDATE tokens_recuperacao_senha SET usado = TRUE WHERE usuario_id = ? AND usado = FALSE',
                    [usuario.id]
                );

                await connection.execute(
                    'INSERT INTO tokens_recuperacao_senha (usuario_id, token, data_expiracao) VALUES (?, ?, ?)',
                    [usuario.id, token, expiracao]
                );

                const protocolo = req.protocol;
                const host = req.get('host');
                const resetUrl = `${protocolo}://${host}/reset-password.html?token=${token}`;

                // Enquanto o envio por email não estiver configurado, registra o link
                // apenas nos logs do servidor. NUNCA retornar o token na resposta HTTP.
                console.log(`[recuperacao-senha] Link gerado para ${usuario.email}: ${resetUrl}`);
            }

            // Resposta genérica para evitar enumeração de usuários.
            return res.json({
                sucesso: true,
                mensagem: 'Se a conta existir, um link de redefinição foi enviado para o email cadastrado.'
            });
        } finally {
            connection.release();
        }
    } catch (erro) {
        console.error('Erro em solicitarRecuperacaoSenha:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao processar solicitação'
        });
    }
}

// ===== VALIDAR TOKEN DE RECUPERAÇÃO =====
async function validarTokenRecuperacao(req, res) {
    try {
        const { token = '' } = req.query;
        if (!token) {
            return res.status(400).json({ sucesso: false, mensagem: 'Token ausente' });
        }

        const connection = await pool.getConnection();
        try {
            const [tokens] = await connection.execute(
                `SELECT t.id, t.usuario_id, t.usado, t.data_expiracao, u.nome, u.email
                 FROM tokens_recuperacao_senha t
                 JOIN usuarios u ON u.id = t.usuario_id
                 WHERE t.token = ?`,
                [token]
            );

            if (tokens.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Token inválido' });
            }

            const registro = tokens[0];
            if (registro.usado) {
                return res.status(400).json({ sucesso: false, mensagem: 'Token já utilizado' });
            }
            if (new Date(registro.data_expiracao) < new Date()) {
                return res.status(400).json({ sucesso: false, mensagem: 'Token expirado' });
            }

            return res.json({
                sucesso: true,
                usuario: { nome: registro.nome, email: registro.email }
            });
        } finally {
            connection.release();
        }
    } catch (erro) {
        console.error('Erro em validarTokenRecuperacao:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao validar token' });
    }
}

// ===== REDEFINIR SENHA COM TOKEN =====
async function redefinirSenha(req, res) {
    try {
        const { token = '', novaSenha = '' } = req.body;

        if (!token || !novaSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Token e nova senha são obrigatórios'
            });
        }
        if (String(novaSenha).length < SENHA_MIN_CARACTERES) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres`
            });
        }

        const connection = await pool.getConnection();
        try {
            const [tokens] = await connection.execute(
                'SELECT id, usuario_id, usado, data_expiracao FROM tokens_recuperacao_senha WHERE token = ?',
                [token]
            );

            if (tokens.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Token inválido' });
            }

            const registro = tokens[0];
            if (registro.usado) {
                return res.status(400).json({ sucesso: false, mensagem: 'Token já utilizado' });
            }
            if (new Date(registro.data_expiracao) < new Date()) {
                return res.status(400).json({ sucesso: false, mensagem: 'Token expirado' });
            }

            const novaSenhaHash = await bcrypt.hash(novaSenha, BCRYPT_SALT_ROUNDS);

            await connection.beginTransaction();
            try {
                await connection.execute(
                    'UPDATE usuarios SET senha = ?, tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = ?',
                    [novaSenhaHash, registro.usuario_id]
                );
                await connection.execute(
                    'UPDATE tokens_recuperacao_senha SET usado = TRUE WHERE id = ?',
                    [registro.id]
                );
                await connection.commit();
            } catch (erroTx) {
                await connection.rollback();
                throw erroTx;
            }

            return res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso' });
        } finally {
            connection.release();
        }
    } catch (erro) {
        console.error('Erro em redefinirSenha:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao redefinir senha' });
    }
}

// ===== ALTERAR SENHA (USUÁRIO LOGADO) =====
async function alterarSenha(req, res) {
    try {
        const { senhaAtual = '', novaSenha = '' } = req.body;
        const usuarioId = req.user.id;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Senha atual e nova senha são obrigatórias'
            });
        }
        if (String(novaSenha).length < SENHA_MIN_CARACTERES) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `A nova senha deve ter pelo menos ${SENHA_MIN_CARACTERES} caracteres`
            });
        }
        if (senhaAtual === novaSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A nova senha deve ser diferente da atual'
            });
        }

        const connection = await pool.getConnection();
        try {
            const [usuarios] = await connection.execute(
                'SELECT id, senha FROM usuarios WHERE id = ? AND ativo = TRUE',
                [usuarioId]
            );

            if (usuarios.length === 0) {
                return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
            }

            const senhaAtualValida = await bcrypt.compare(senhaAtual, usuarios[0].senha);
            if (!senhaAtualValida) {
                return res.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta' });
            }

            const novaSenhaHash = await bcrypt.hash(novaSenha, BCRYPT_SALT_ROUNDS);
            await connection.execute(
                'UPDATE usuarios SET senha = ? WHERE id = ?',
                [novaSenhaHash, usuarioId]
            );

            return res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
        } finally {
            connection.release();
        }
    } catch (erro) {
        console.error('Erro em alterarSenha:', erro);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar senha' });
    }
}

module.exports = {
    login,
    logout,
    listarUsuarios,
    obterUsuario,
    obterUsuarioLogado,
    solicitarRecuperacaoSenha,
    validarTokenRecuperacao,
    redefinirSenha,
    alterarSenha
};
