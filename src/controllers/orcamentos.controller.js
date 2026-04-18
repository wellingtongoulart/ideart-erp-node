// Controller de Orçamentos
const pool = require('../config/database');
const { montarOrderBy } = require('../utils/ordenacao');

const COLUNAS_ORDENACAO_ORCAMENTOS = {
    id: 'o.id',
    numero: 'o.numero',
    cliente_nome: 'c.nome',
    data_criacao: 'o.data_criacao',
    data_validade: 'o.data_validade',
    valor_total: 'o.valor_total',
    status: 'o.status',
    criado_em: 'o.criado_em'
};

function gerarNumeroOrcamento() {
    return `ORC${Date.now()}`;
}

function gerarNumeroPedido() {
    return `PED${Date.now()}`;
}

async function carregarItensOrcamento(connection, orcamentoId) {
    const [itens] = await connection.execute(
        `SELECT oi.*, p.nome AS produto_nome, p.sku, p.categoria, p.descricao AS produto_descricao
         FROM orcamento_itens oi
         LEFT JOIN produtos p ON oi.produto_id = p.id
         WHERE oi.orcamento_id = ?
         ORDER BY oi.ordem ASC, oi.id ASC`,
        [orcamentoId]
    );
    return itens;
}

async function substituirItensOrcamento(connection, orcamentoId, itens) {
    await connection.execute('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [orcamentoId]);

    let total = 0;
    for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const quantidade = Number(item.quantidade) || 0;
        const preco = Number(item.preco_unitario) || 0;
        const subtotal = quantidade * preco;
        total += subtotal;

        await connection.execute(
            `INSERT INTO orcamento_itens
             (orcamento_id, produto_id, nome_customizado, descricao_customizada, quantidade, preco_unitario, subtotal, ordem, criado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                orcamentoId,
                item.produto_id || null,
                item.nome_customizado || null,
                item.descricao_customizada || null,
                quantidade,
                preco,
                subtotal,
                i
            ]
        );
    }
    return total;
}

// GET - Listar orçamentos com paginação e filtros
exports.listar = async (req, res) => {
    try {
        const {
            pagina = 1, limite = 10,
            status = '', cliente_id = '', busca = '',
            data_criacao_inicio = '', data_criacao_fim = '',
            data_validade_inicio = '', data_validade_fim = '',
            valor_min = '', valor_max = '',
            ordenarPor, ordem
        } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();

        let query = `
            SELECT o.*, c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone
            FROM orcamentos o
            LEFT JOIN clientes c ON o.cliente_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        if (cliente_id) {
            query += ' AND o.cliente_id = ?';
            params.push(cliente_id);
        }
        if (busca) {
            query += ' AND (o.numero LIKE ? OR c.nome LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // Faixa de data de criação
        if (data_criacao_inicio) {
            query += ' AND o.data_criacao >= ?';
            params.push(data_criacao_inicio);
        }
        if (data_criacao_fim) {
            query += ' AND o.data_criacao <= ?';
            params.push(data_criacao_fim);
        }

        // Faixa de validade
        if (data_validade_inicio) {
            query += ' AND o.data_validade >= ?';
            params.push(data_validade_inicio);
        }
        if (data_validade_fim) {
            query += ' AND o.data_validade <= ?';
            params.push(data_validade_fim);
        }

        // Faixa de valor total
        if (valor_min !== '' && !isNaN(Number(valor_min))) {
            query += ' AND o.valor_total >= ?';
            params.push(Number(valor_min));
        }
        if (valor_max !== '' && !isNaN(Number(valor_max))) {
            query += ' AND o.valor_total <= ?';
            params.push(Number(valor_max));
        }

        const countQuery = query
            .replace(/SELECT o\.\*, c\.nome AS cliente_nome, c\.email AS cliente_email, c\.telefone AS cliente_telefone/, 'SELECT COUNT(*) AS total');
        const [countResult] = await connection.execute(countQuery, params);
        const totalRegistros = countResult[0].total;

        const orderBy = montarOrderBy({
            ordenarPor, ordem,
            colunasPermitidas: COLUNAS_ORDENACAO_ORCAMENTOS,
            padrao: 'o.criado_em DESC'
        });
        query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const [orcamentos] = await connection.query(query, params);
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
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar orçamentos', erro: erro.message });
    }
};

// GET - Buscar orçamento por ID (com itens, cliente e profissional)
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            `SELECT o.*,
                    c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                    c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.estado AS cliente_estado,
                    pr.nome AS profissional_nome, pr.especialidade AS profissional_especialidade
             FROM orcamentos o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN profissionais pr ON o.profissional_id = pr.id
             WHERE o.id = ?`,
            [id]
        );

        if (orcamentos.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const itens = await carregarItensOrcamento(connection, id);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamento encontrado',
            dados: { ...orcamentos[0], itens }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar orçamento', erro: erro.message });
    }
};

// POST - Criar orçamento com itens
exports.criar = async (req, res) => {
    const {
        cliente_id,
        profissional_id = null,
        data_criacao,
        data_validade,
        desconto = 0,
        status = 'pendente',
        observacoes = '',
        forma_pagamento = '',
        assinatura = '',
        itens = []
    } = req.body;

    if (!cliente_id) {
        return res.status(400).json({ sucesso: false, mensagem: 'Cliente é obrigatório' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const numero = gerarNumeroOrcamento();

        const [result] = await connection.execute(
            `INSERT INTO orcamentos
             (numero, cliente_id, profissional_id, data_criacao, data_validade, valor_total, desconto,
              status, observacoes, forma_pagamento, assinatura, criado_em, atualizado_em)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                numero, cliente_id, profissional_id,
                data_criacao || new Date().toISOString().split('T')[0],
                data_validade || null,
                desconto, status, observacoes, forma_pagamento, assinatura
            ]
        );

        const orcamentoId = result.insertId;
        const total = await substituirItensOrcamento(connection, orcamentoId, Array.isArray(itens) ? itens : []);

        await connection.execute('UPDATE orcamentos SET valor_total = ? WHERE id = ?', [total, orcamentoId]);

        await connection.commit();
        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Orçamento criado com sucesso',
            dados: { id: orcamentoId, numero, valor_total: total }
        });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar orçamento', erro: erro.message });
    }
};

// PUT - Atualizar orçamento completo (incluindo itens)
exports.atualizar = async (req, res) => {
    const { id } = req.params;
    const {
        cliente_id,
        profissional_id,
        data_criacao,
        data_validade,
        desconto,
        status,
        observacoes,
        forma_pagamento,
        assinatura,
        itens
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existe] = await connection.execute('SELECT id FROM orcamentos WHERE id = ?', [id]);
        if (existe.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const campos = [];
        const params = [];
        const add = (col, val) => { if (val !== undefined) { campos.push(`${col} = ?`); params.push(val); } };

        add('cliente_id', cliente_id);
        add('profissional_id', profissional_id);
        add('data_criacao', data_criacao);
        add('data_validade', data_validade);
        add('desconto', desconto);
        add('status', status);
        add('observacoes', observacoes);
        add('forma_pagamento', forma_pagamento);
        add('assinatura', assinatura);

        if (campos.length > 0) {
            campos.push('atualizado_em = NOW()');
            await connection.execute(
                `UPDATE orcamentos SET ${campos.join(', ')} WHERE id = ?`,
                [...params, id]
            );
        }

        if (Array.isArray(itens)) {
            const total = await substituirItensOrcamento(connection, id, itens);
            await connection.execute('UPDATE orcamentos SET valor_total = ? WHERE id = ?', [total, id]);
        }

        await connection.commit();
        connection.release();

        res.json({ sucesso: true, mensagem: 'Orçamento atualizado com sucesso' });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar orçamento', erro: erro.message });
    }
};

// POST - Aprovar orçamento (cria pedido vinculado)
exports.aprovar = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orcamentos] = await connection.execute('SELECT * FROM orcamentos WHERE id = ?', [id]);
        if (orcamentos.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const orcamento = orcamentos[0];

        if (orcamento.status === 'aprovado' || orcamento.status === 'convertido') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ sucesso: false, mensagem: 'Este orçamento já foi aprovado' });
        }

        const [itens] = await connection.execute(
            'SELECT * FROM orcamento_itens WHERE orcamento_id = ? ORDER BY ordem ASC, id ASC',
            [id]
        );

        const numeroPedido = gerarNumeroPedido();
        const [resPedido] = await connection.execute(
            `INSERT INTO pedidos
             (numero, cliente_id, orcamento_id, data_pedido, valor_total, desconto, status, observacoes, forma_pagamento, criado_em, atualizado_em)
             VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?, NOW(), NOW())`,
            [
                numeroPedido,
                orcamento.cliente_id,
                orcamento.id,
                new Date().toISOString().split('T')[0],
                orcamento.valor_total,
                orcamento.desconto,
                orcamento.observacoes || '',
                orcamento.forma_pagamento || ''
            ]
        );
        const pedidoId = resPedido.insertId;

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            await connection.execute(
                `INSERT INTO pedido_itens
                 (pedido_id, produto_id, nome_customizado, descricao_customizada, quantidade, preco_unitario, subtotal, ordem, criado_em)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    pedidoId, item.produto_id || null, item.nome_customizado || null, item.descricao_customizada || null,
                    item.quantidade, item.preco_unitario, item.subtotal, i
                ]
            );

            if (item.produto_id) {
                await connection.execute(
                    'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }
        }

        await connection.execute(
            `UPDATE orcamentos SET status = 'aprovado', pedido_id = ?, atualizado_em = NOW() WHERE id = ?`,
            [pedidoId, id]
        );

        await connection.commit();
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamento aprovado e pedido criado',
            dados: { orcamento_id: id, pedido_id: pedidoId, pedido_numero: numeroPedido }
        });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao aprovar orçamento', erro: erro.message });
    }
};

// POST - Recusar orçamento
exports.recusar = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo = '' } = req.body;
        const connection = await pool.getConnection();

        const [existe] = await connection.execute('SELECT status, observacoes FROM orcamentos WHERE id = ?', [id]);
        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const novaObs = (existe[0].observacoes || '') + (motivo ? `\n[Recusado: ${motivo}]` : '');
        await connection.execute(
            `UPDATE orcamentos SET status = 'recusado', observacoes = ?, atualizado_em = NOW() WHERE id = ?`,
            [novaObs, id]
        );
        connection.release();

        res.json({ sucesso: true, mensagem: 'Orçamento recusado' });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao recusar orçamento', erro: erro.message });
    }
};

// GET - Retornar dados consolidados para exportação (PDF/Excel)
exports.dadosExportacao = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            `SELECT o.*,
                    c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                    c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.estado AS cliente_estado,
                    pr.nome AS profissional_nome, pr.especialidade AS profissional_especialidade
             FROM orcamentos o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN profissionais pr ON o.profissional_id = pr.id
             WHERE o.id = ?`,
            [id]
        );

        if (orcamentos.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const itens = await carregarItensOrcamento(connection, id);

        let empresa = {
            nome_fantasia: 'Ideart',
            email: 'contato@ideart.com.br',
            telefone: '(11) 0000-0000',
            endereco: '',
            cidade: '',
            estado: ''
        };
        try {
            const [empresas] = await connection.execute('SELECT * FROM empresa_config LIMIT 1');
            if (empresas.length > 0) empresa = empresas[0];
        } catch (_) { /* tabela pode não existir ainda */ }

        connection.release();

        res.json({
            sucesso: true,
            dados: { orcamento: orcamentos[0], itens, empresa }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar dados de exportação', erro: erro.message });
    }
};

// DELETE - Deletar orçamento
exports.deletar = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id]);
        const [result] = await connection.execute('DELETE FROM orcamentos WHERE id = ?', [id]);
        await connection.commit();
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }
        res.json({ sucesso: true, mensagem: 'Orçamento deletado com sucesso' });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar orçamento', erro: erro.message });
    }
};
