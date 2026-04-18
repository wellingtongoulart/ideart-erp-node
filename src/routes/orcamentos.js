const express = require('express');
const router = express.Router();
const orcamentosController = require('../controllers/orcamentos.controller');

/**
 * @openapi
 * /api/orcamentos:
 *   get:
 *     tags: [Orcamentos]
 *     summary: Lista orçamentos com paginação e filtros
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, aprovado, recusado, expirado]
 *         description: Filtrar por status do orçamento
 *       - in: query
 *         name: cliente_id
 *         schema: { type: integer }
 *         description: Filtrar orçamentos de um cliente específico
 *     responses:
 *       200:
 *         description: Orçamentos listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaOrcamentosResponse'
 *       500:
 *         description: Erro ao listar orçamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', orcamentosController.listar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   get:
 *     tags: [Orcamentos]
 *     summary: Busca um orçamento pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do orçamento
 *     responses:
 *       200:
 *         description: Orçamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoResponse'
 *       404:
 *         description: Orçamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar orçamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', orcamentosController.buscarPorId);

/**
 * @openapi
 * /api/orcamentos:
 *   post:
 *     tags: [Orcamentos]
 *     summary: Cria um novo orçamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrcamentoInput'
 *     responses:
 *       201:
 *         description: Orçamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrcamentoCriadoResponse'
 *       400:
 *         description: Número e cliente obrigatórios, ou número já existente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar orçamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', orcamentosController.criar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   put:
 *     tags: [Orcamentos]
 *     summary: Atualiza um orçamento existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do orçamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrcamentoInput'
 *     responses:
 *       200:
 *         description: Orçamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Orçamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar orçamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', orcamentosController.atualizar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   delete:
 *     tags: [Orcamentos]
 *     summary: Remove um orçamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do orçamento
 *     responses:
 *       200:
 *         description: Orçamento deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Orçamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar orçamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', orcamentosController.deletar);

module.exports = router;
