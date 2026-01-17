// Controller de Pedidos
const pool = require('../config/database');

// GET - Listar todos os pedidos com filtros e paginação
exports.listar = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, busca = '', status = '', cliente_id = '' } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();
        
        let query = `
            SELECT p.*, c.nome as cliente_nome
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE 1=1
        `;
        let params = [];

        // Filtro por número ou cliente
        if (busca) {
            query += ' AND (p.numero LIKE ? OR c.nome LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // Filtro por status
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }

        // Filtro por cliente
        if (cliente_id) {
            query += ' AND p.cliente_id = ?';
            params.push(cliente_id);
        }

        // Contar total de registros para paginação
        const [countResult] = await connection.execute(
            query.replace('SELECT p.*, c.nome as cliente_nome', 'SELECT COUNT(*) as total'),
            params
        );
        const totalRegistros = countResult[0].total;

        // Buscar dados com paginação
        query += ' ORDER BY p.criado_em DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limite), offset);

        const [pedidos] = await connection.execute(query, params);
        
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Pedidos listados com sucesso',
            dados: pedidos,
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
            mensagem: 'Erro ao listar pedidos',
            erro: erro.message
        });
    }
};

// GET - Buscar pedido por ID com seus itens
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        // Buscar pedido
        const [pedidos] = await connection.execute(
            `SELECT p.*, c.nome as cliente_nome, c.email as cliente_email, c.telefone as cliente_telefone, c.endereco
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            WHERE p.id = ?`,
            [id]
        );

        if (pedidos.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pedido não encontrado'
            });
        }

        const pedido = pedidos[0];

        // Buscar itens do pedido
        const [itens] = await connection.execute(
            `SELECT pi.*, pr.nome as produto_nome, pr.descricao
            FROM pedido_itens pi
            LEFT JOIN produtos pr ON pi.produto_id = pr.id
            WHERE pi.pedido_id = ?`,
            [id]
        );

        // Buscar informações de logística se existirem
        const [logistica] = await connection.execute(
            `SELECT * FROM logistica WHERE pedido_id = ?`,
            [id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Pedido encontrado',
            dados: {
                pedido: pedido,
                itens: itens,
                logistica: logistica[0] || null
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar pedido',
            erro: erro.message
        });
    }
};

// POST - Criar novo pedido
exports.criar = async (req, res) => {
    try {
        const { cliente_id, data_pedido, data_entrega_prevista, itens = [], desconto = 0, observacoes = '' } = req.body;

        // Validação básica
        if (!cliente_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Cliente é obrigatório'
            });
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Pedido deve conter pelo menos um item'
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Gerar número do pedido único (PED + timestamp)
            const numero = `PED${Date.now()}`;
            
            // Calcular valor total
            let valor_total = 0;
            for (const item of itens) {
                valor_total += (item.quantidade * item.preco_unitario);
            }
            valor_total -= desconto;

            // Inserir pedido
            const [resultPedido] = await connection.execute(
                `INSERT INTO pedidos (numero, cliente_id, data_pedido, data_entrega_prevista, valor_total, desconto, status, observacoes, criado_em, atualizado_em)
                VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, NOW(), NOW())`,
                [numero, cliente_id, data_pedido || new Date().toISOString().split('T')[0], data_entrega_prevista || null, valor_total, desconto, observacoes]
            );

            const pedido_id = resultPedido.insertId;

            // Inserir itens do pedido
            for (const item of itens) {
                const subtotal = item.quantidade * item.preco_unitario;
                
                await connection.execute(
                    `INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario, subtotal, criado_em)
                    VALUES (?, ?, ?, ?, ?, NOW())`,
                    [pedido_id, item.produto_id, item.quantidade, item.preco_unitario, subtotal]
                );

                // Atualizar estoque do produto (diminuir)
                await connection.execute(
                    `UPDATE produtos SET estoque = estoque - ? WHERE id = ?`,
                    [item.quantidade, item.produto_id]
                );
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                sucesso: true,
                mensagem: 'Pedido criado com sucesso',
                dados: {
                    id: pedido_id,
                    numero: numero,
                    valor_total: valor_total
                }
            });
        } catch (erro) {
            await connection.rollback();
            connection.release();
            throw erro;
        }
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar pedido',
            erro: erro.message
        });
    }
};

// PUT - Atualizar pedido
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_entrega_prevista, status, observacoes, desconto } = req.body;

        const connection = await pool.getConnection();

        // Verificar se pedido existe
        const [pedidoExistente] = await connection.execute(
            'SELECT * FROM pedidos WHERE id = ?',
            [id]
        );

        if (pedidoExistente.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Pedido não encontrado'
            });
        }

        // Se está mudando de "processando" para "enviado", registrar data de envio
        let dataEnvio = null;
        if (status === 'enviado' && pedidoExistente[0].status !== 'enviado') {
            dataEnvio = new Date().toISOString().split('T')[0];
        }

        // Se está mudando para "entregue", registrar data de entrega
        let dataEntrega = null;
        if (status === 'entregue' && pedidoExistente[0].status !== 'entregue') {
            dataEntrega = new Date().toISOString().split('T')[0];
        }

        // Montar query dinâmica
        let query = 'UPDATE pedidos SET atualizado_em = NOW()';
        let params = [];

        if (data_entrega_prevista !== undefined) {
            query += ', data_entrega_prevista = ?';
            params.push(data_entrega_prevista);
        }

        if (status !== undefined) {
            query += ', status = ?';
            params.push(status);
        }

        if (observacoes !== undefined) {
            query += ', observacoes = ?';
            params.push(observacoes);
        }

        if (desconto !== undefined) {
            query += ', desconto = ?';
            params.push(desconto);
        }

        if (dataEntrega) {
            query += ', data_entrega_real = ?';
            params.push(dataEntrega);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Pedido atualizado com sucesso',
            dados: {
                id: id
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar pedido',
            erro: erro.message
        });
    }
};

// DELETE - Cancelar pedido
exports.cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo = '' } = req.body;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Buscar pedido
            const [pedidos] = await connection.execute(
                'SELECT * FROM pedidos WHERE id = ?',
                [id]
            );

            if (pedidos.length === 0) {
                connection.release();
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Pedido não encontrado'
                });
            }

            const pedido = pedidos[0];

            // Não permitir cancelar se já foi entregue
            if (pedido.status === 'entregue') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Não é possível cancelar um pedido entregue'
                });
            }

            // Buscar itens do pedido para restaurar estoque
            const [itens] = await connection.execute(
                'SELECT * FROM pedido_itens WHERE pedido_id = ?',
                [id]
            );

            // Restaurar estoque
            for (const item of itens) {
                await connection.execute(
                    'UPDATE produtos SET estoque = estoque + ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }

            // Atualizar status do pedido
            const observacoesAtualizadas = (pedido.observacoes || '') + `\n[Cancelado: ${motivo || 'Sem motivo informado'}]`;
            
            await connection.execute(
                'UPDATE pedidos SET status = ?, observacoes = ?, atualizado_em = NOW() WHERE id = ?',
                ['cancelado', observacoesAtualizadas, id]
            );

            await connection.commit();
            connection.release();

            res.json({
                sucesso: true,
                mensagem: 'Pedido cancelado com sucesso',
                dados: {
                    id: id,
                    status: 'cancelado'
                }
            });
        } catch (erro) {
            await connection.rollback();
            connection.release();
            throw erro;
        }
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cancelar pedido',
            erro: erro.message
        });
    }
};

// GET - Relatório de pedidos (para dashboard)
exports.relatorio = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Total de pedidos por status
        const [statusCount] = await connection.execute(
            `SELECT status, COUNT(*) as total FROM pedidos GROUP BY status`
        );

        // Faturamento total
        const [faturamento] = await connection.execute(
            `SELECT SUM(valor_total) as total FROM pedidos WHERE status = 'entregue'`
        );

        // Pedidos pendentes
        const [pedidosPendentes] = await connection.execute(
            `SELECT COUNT(*) as total FROM pedidos WHERE status IN ('pendente', 'processando')`
        );

        // Últimos 5 pedidos
        const [ultimosPedidos] = await connection.execute(
            `SELECT p.id, p.numero, c.nome as cliente_nome, p.valor_total, p.status, p.data_pedido
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ORDER BY p.criado_em DESC
            LIMIT 5`
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Relatório gerado com sucesso',
            dados: {
                statusCount: statusCount,
                faturamentoTotal: faturamento[0].total || 0,
                pedidosPendentes: pedidosPendentes[0].total,
                ultimosPedidos: ultimosPedidos
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório',
            erro: erro.message
        });
    }
};
