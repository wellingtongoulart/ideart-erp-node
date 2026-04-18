const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');

/**
 * @openapi
 * /api/produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista produtos com paginação e filtros
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *         description: Página atual (inicia em 1)
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *         description: Quantidade de registros por página
 *       - in: query
 *         name: busca
 *         schema: { type: string }
 *         description: Busca em nome ou SKU
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *         description: Filtrar por categoria exata
 *       - in: query
 *         name: ativo
 *         schema: { type: string, enum: ['true', 'false'] }
 *         description: Filtrar por status ativo/inativo
 *     responses:
 *       200:
 *         description: Produtos listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaProdutosResponse'
 *       500:
 *         description: Erro ao listar produtos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', produtosController.listar);

/**
 * @openapi
 * /api/produtos/categorias/lista:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista categorias únicas de produtos
 *     responses:
 *       200:
 *         description: Categorias listadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriasProdutoResponse'
 *       500:
 *         description: Erro ao listar categorias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/categorias/lista', produtosController.categorias);

/**
 * @openapi
 * /api/produtos/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Busca um produto pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', produtosController.buscarPorId);

/**
 * @openapi
 * /api/produtos:
 *   post:
 *     tags: [Produtos]
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoCriadoResponse'
 *       400:
 *         description: Nome ou preço de venda obrigatórios, ou SKU já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', produtosController.criar);

/**
 * @openapi
 * /api/produtos/{id}:
 *   put:
 *     tags: [Produtos]
 *     summary: Atualiza um produto existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoUpdateInput'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProdutoAtualizadoResponse'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', produtosController.atualizar);

/**
 * @openapi
 * /api/produtos/{id}:
 *   delete:
 *     tags: [Produtos]
 *     summary: Remove um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', produtosController.deletar);

module.exports = router;
