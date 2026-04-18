const express = require('express');
const router = express.Router();
const profissionaisController = require('../controllers/profissionais.controller');

/**
 * @openapi
 * /api/profissionais:
 *   get:
 *     tags: [Profissionais]
 *     summary: Lista profissionais com paginação e filtros
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
 *         description: Busca em nome, email ou CPF
 *       - in: query
 *         name: especialidade
 *         schema: { type: string }
 *         description: Filtrar por especialidade exata
 *     responses:
 *       200:
 *         description: Profissionais listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaProfissionaisResponse'
 *       500:
 *         description: Erro ao listar profissionais
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', profissionaisController.listar);

/**
 * @openapi
 * /api/profissionais/{id}:
 *   get:
 *     tags: [Profissionais]
 *     summary: Busca um profissional pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Profissional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfissionalResponse'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', profissionaisController.buscarPorId);

/**
 * @openapi
 * /api/profissionais:
 *   post:
 *     tags: [Profissionais]
 *     summary: Cria um novo profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfissionalInput'
 *     responses:
 *       201:
 *         description: Profissional criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfissionalCriadoResponse'
 *       400:
 *         description: Nome obrigatório, email já cadastrado ou CPF já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', profissionaisController.criar);

/**
 * @openapi
 * /api/profissionais/{id}:
 *   put:
 *     tags: [Profissionais]
 *     summary: Atualiza um profissional existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do profissional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfissionalInput'
 *     responses:
 *       200:
 *         description: Profissional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: Email já cadastrado para outro profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', profissionaisController.atualizar);

/**
 * @openapi
 * /api/profissionais/{id}:
 *   delete:
 *     tags: [Profissionais]
 *     summary: Remove um profissional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do profissional
 *     responses:
 *       200:
 *         description: Profissional deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', profissionaisController.deletar);

module.exports = router;
