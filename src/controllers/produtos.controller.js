// Controller de Produtos
const pool = require('../config/database');
const { montarOrderBy } = require('../utils/ordenacao');

const COLUNAS_ORDENACAO_PRODUTOS = {
    id: 'id',
    nome: 'nome',
    categoria: 'categoria',
    fornecedor: 'fornecedor',
    preco_venda: 'preco_venda',
    preco_custo: 'preco_custo',
    estoque: 'estoque',
    sku: 'sku',
    ativo: 'ativo',
    criado_em: 'criado_em'
};

// GET - Listar todos os produtos com filtros e paginação
exports.listar = async (req, res) => {
    try {
        const {
            pagina = 1, limite = 10,
            busca = '', categoria = '', fornecedor = '', ativo = '',
            preco_min = '', preco_max = '',
            estoque_min = '', estoque_max = '',
            ordenarPor, ordem
        } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();

        let query = 'SELECT * FROM produtos WHERE 1=1';
        let params = [];

        // Filtro de busca por nome ou SKU
        if (busca) {
            query += ' AND (nome LIKE ? OR sku LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // Filtro por categoria
        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        // Filtro por fornecedor
        if (fornecedor) {
            query += ' AND fornecedor = ?';
            params.push(fornecedor);
        }

        // Filtro por ativo/inativo
        if (ativo !== '') {
            query += ' AND ativo = ?';
            params.push(ativo === 'true' ? 1 : 0);
        }

        // Faixa de preço (preco_venda)
        if (preco_min !== '' && !isNaN(Number(preco_min))) {
            query += ' AND preco_venda >= ?';
            params.push(Number(preco_min));
        }
        if (preco_max !== '' && !isNaN(Number(preco_max))) {
            query += ' AND preco_venda <= ?';
            params.push(Number(preco_max));
        }

        // Faixa de estoque
        if (estoque_min !== '' && !isNaN(Number(estoque_min))) {
            query += ' AND estoque >= ?';
            params.push(Number(estoque_min));
        }
        if (estoque_max !== '' && !isNaN(Number(estoque_max))) {
            query += ' AND estoque <= ?';
            params.push(Number(estoque_max));
        }

        // Contar total de registros
        const [countResult] = await connection.execute(
            query.replace('SELECT *', 'SELECT COUNT(*) as total'),
            params
        );
        const totalRegistros = countResult[0].total;

        // Buscar dados com paginação e ordenação
        const orderBy = montarOrderBy({
            ordenarPor, ordem,
            colunasPermitidas: COLUNAS_ORDENACAO_PRODUTOS,
            padrao: 'criado_em DESC'
        });
        query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const [produtos] = await connection.query(query, params);
        
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Produtos listados com sucesso',
            dados: produtos,
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
            mensagem: 'Erro ao listar produtos',
            erro: erro.message
        });
    }
};

// GET - Buscar produto por ID
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [produtos] = await connection.execute(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        connection.release();

        if (produtos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Produto não encontrado'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Produto encontrado',
            dados: produtos[0]
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar produto',
            erro: erro.message
        });
    }
};

// POST - Criar novo produto
exports.criar = async (req, res) => {
    try {
        const { nome, descricao = '', categoria = '', preco_custo = 0, preco_venda, estoque = 0, sku = '', fornecedor = '' } = req.body;

        // Validação
        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome do produto é obrigatório'
            });
        }

        if (!preco_venda) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preço de venda é obrigatório'
            });
        }

        const connection = await pool.getConnection();

        // Verificar se SKU já existe (unicidade global)
        if (sku) {
            const [existente] = await connection.execute(
                'SELECT id FROM produtos WHERE sku = ?',
                [sku]
            );

            if (existente.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este SKU já está cadastrado'
                });
            }
        }

        // Inserir produto
        const skuFinal = sku || `PROD${Date.now()}`;
        const [result] = await connection.execute(
            `INSERT INTO produtos (nome, descricao, categoria, preco_custo, preco_venda, estoque, sku, fornecedor, ativo, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
            [nome, descricao, categoria, preco_custo, preco_venda, estoque, skuFinal, fornecedor]
        );

        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Produto criado com sucesso',
            dados: {
                id: result.insertId,
                nome: nome,
                preco_venda: preco_venda,
                sku: skuFinal
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao criar produto',
            erro: erro.message
        });
    }
};

// PUT - Atualizar produto
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, categoria, preco_custo, preco_venda, estoque, sku, fornecedor, ativo } = req.body;

        const connection = await pool.getConnection();

        // Verificar se produto existe
        const [produtoExistente] = await connection.execute(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        if (produtoExistente.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Produto não encontrado'
            });
        }

        // Verificar se novo SKU já está em uso por outro produto (unicidade global)
        if (sku !== undefined && sku !== null && sku !== '') {
            const [conflito] = await connection.execute(
                'SELECT id FROM produtos WHERE sku = ? AND id <> ?',
                [sku, id]
            );

            if (conflito.length > 0) {
                connection.release();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Este SKU já está cadastrado em outro produto'
                });
            }
        }

        // Montar query dinâmica
        let query = 'UPDATE produtos SET atualizado_em = NOW()';
        let params = [];

        if (nome !== undefined) {
            query += ', nome = ?';
            params.push(nome);
        }

        if (descricao !== undefined) {
            query += ', descricao = ?';
            params.push(descricao);
        }

        if (categoria !== undefined) {
            query += ', categoria = ?';
            params.push(categoria);
        }

        if (preco_custo !== undefined) {
            query += ', preco_custo = ?';
            params.push(preco_custo);
        }

        if (preco_venda !== undefined) {
            query += ', preco_venda = ?';
            params.push(preco_venda);
        }

        if (estoque !== undefined) {
            query += ', estoque = ?';
            params.push(estoque);
        }

        if (sku !== undefined) {
            query += ', sku = ?';
            params.push(sku);
        }

        if (fornecedor !== undefined) {
            query += ', fornecedor = ?';
            params.push(fornecedor);
        }

        if (ativo !== undefined) {
            query += ', ativo = ?';
            params.push(ativo);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await connection.execute(query, params);

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Produto atualizado com sucesso',
            dados: {
                id: id
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar produto',
            erro: erro.message
        });
    }
};

// DELETE - Deletar produto
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        // Verificar se produto existe
        const [produtoExistente] = await connection.execute(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        if (produtoExistente.length === 0) {
            connection.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Produto não encontrado'
            });
        }

        // Deletar produto
        await connection.execute(
            'DELETE FROM produtos WHERE id = ?',
            [id]
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Produto deletado com sucesso',
            dados: {
                id: id
            }
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao deletar produto',
            erro: erro.message
        });
    }
};

// GET - Listar categorias únicas
exports.categorias = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [categorias] = await connection.execute(
            'SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria'
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Categorias listadas com sucesso',
            dados: categorias.map(c => c.categoria)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar categorias',
            erro: erro.message
        });
    }
};

// GET - Listar fornecedores únicos
exports.fornecedores = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [fornecedores] = await connection.execute(
            'SELECT DISTINCT fornecedor FROM produtos WHERE fornecedor IS NOT NULL AND fornecedor != "" ORDER BY fornecedor'
        );

        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Fornecedores listados com sucesso',
            dados: fornecedores.map(f => f.fornecedor)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar fornecedores',
            erro: erro.message
        });
    }
};
