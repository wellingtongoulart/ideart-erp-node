const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');

/**
 * @openapi
 * /api/clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista clientes com paginação e filtros
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
 *         description: Busca em nome, email ou telefone
 *       - in: query
 *         name: cidade
 *         schema: { type: string }
 *         description: Filtrar por cidade exata
 *     responses:
 *       200:
 *         description: Clientes listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaClientesResponse'
 *       500:
 *         description: Erro ao listar clientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', clientesController.listar);

/**
 * @openapi
 * /api/clientes/estados/lista:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista estados únicos de clientes
 */
router.get('/estados/lista', clientesController.estados);

/**
 * @openapi
 * /api/clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca um cliente pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteResponse'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', clientesController.buscarPorId);

/**
 * @openapi
 * /api/clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Cria um novo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteCriadoResponse'
 *       400:
 *         description: Nome obrigatório ou email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', clientesController.criar);

/**
 * @openapi
 * /api/clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Atualiza um cliente existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         description: Email já cadastrado para outro cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', clientesController.atualizar);

/**
 * @openapi
 * /api/clientes/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Remove um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', clientesController.deletar);

module.exports = router;
