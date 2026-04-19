// Controller de Filtros Salvos (compartilhados entre todos os usuários)
const pool = require('../config/database');

function validarContexto(contexto) {
    return typeof contexto === 'string' && /^[a-z0-9_-]{1,100}$/i.test(contexto);
}

function validarNome(nome) {
    return typeof nome === 'string' && nome.trim().length > 0 && nome.length <= 150;
}

exports.listar = async (req, res) => {
    try {
        const { contexto } = req.params;
        if (!validarContexto(contexto)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Contexto inválido' });
        }
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id, nome, valores, criado_em, atualizado_em FROM filtros_salvos WHERE contexto = ? ORDER BY nome',
            [contexto]
        );
        connection.release();
        const dados = rows.map(r => ({
            id: r.id,
            nome: r.nome,
            valores: typeof r.valores === 'string' ? JSON.parse(r.valores) : r.valores,
            criado_em: r.criado_em,
            atualizado_em: r.atualizado_em
        }));
        res.json({ sucesso: true, dados });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar filtros salvos', erro: erro.message });
    }
};

exports.salvar = async (req, res) => {
    try {
        const { contexto } = req.params;
        const { nome, valores } = req.body || {};
        if (!validarContexto(contexto)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Contexto inválido' });
        }
        if (!validarNome(nome)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nome obrigatório (até 150 caracteres)' });
        }
        if (!valores || typeof valores !== 'object' || Array.isArray(valores)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Valores devem ser um objeto JSON' });
        }

        const connection = await pool.getConnection();
        const json = JSON.stringify(valores);
        await connection.execute(
            `INSERT INTO filtros_salvos (contexto, nome, valores) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE valores = VALUES(valores)`,
            [contexto, nome.trim(), json]
        );
        const [rows] = await connection.execute(
            'SELECT id, nome, valores, criado_em, atualizado_em FROM filtros_salvos WHERE contexto = ? AND nome = ?',
            [contexto, nome.trim()]
        );
        connection.release();
        const r = rows[0];
        res.json({
            sucesso: true,
            mensagem: 'Filtro salvo',
            dados: {
                id: r.id,
                nome: r.nome,
                valores: typeof r.valores === 'string' ? JSON.parse(r.valores) : r.valores,
                criado_em: r.criado_em,
                atualizado_em: r.atualizado_em
            }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao salvar filtro', erro: erro.message });
    }
};

exports.remover = async (req, res) => {
    try {
        const { contexto, id } = req.params;
        if (!validarContexto(contexto)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Contexto inválido' });
        }
        const idNum = parseInt(id, 10);
        if (!Number.isFinite(idNum)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido' });
        }
        const connection = await pool.getConnection();
        const [resultado] = await connection.execute(
            'DELETE FROM filtros_salvos WHERE contexto = ? AND id = ?',
            [contexto, idNum]
        );
        connection.release();
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Filtro não encontrado' });
        }
        res.json({ sucesso: true, mensagem: 'Filtro removido' });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover filtro', erro: erro.message });
    }
};
