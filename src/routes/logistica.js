const express = require('express');
const router = express.Router();
const logisticaController = require('../controllers/logistica.controller');

/**
 * @openapi
 * /api/logistica:
 *   get:
 *     tags: [Logistica]
 *     summary: Lista registros de logística com paginação e filtros
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
 *         schema: { type: string }
 *         description: Filtrar por status do envio (ex. aguardando, em_transito, entregue, cancelado)
 *       - in: query
 *         name: pedido_id
 *         schema: { type: integer }
 *         description: Filtrar por ID do pedido
 *     responses:
 *       200:
 *         description: Registros de logística listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaLogisticaResponse'
 *       500:
 *         description: Erro ao listar registros de logística
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', logisticaController.listar);

/**
 * @openapi
 * /api/logistica/transportadoras/lista:
 *   get:
 *     tags: [Logistica]
 *     summary: Lista transportadoras únicas
 */
router.get('/transportadoras/lista', logisticaController.transportadoras);

/**
 * @openapi
 * /api/logistica/{id}:
 *   get:
 *     tags: [Logistica]
 *     summary: Busca um registro de logística pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do registro de logística
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogisticaResponse'
 *       404:
 *         description: Registro de logística não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', logisticaController.buscarPorId);

/**
 * @openapi
 * /api/logistica:
 *   post:
 *     tags: [Logistica]
 *     summary: Cria um novo registro de logística
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogisticaInput'
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogisticaCriadoResponse'
 *       400:
 *         description: Campos obrigatórios ausentes ou número de rastreamento duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', logisticaController.criar);

/**
 * @openapi
 * /api/logistica/{id}:
 *   put:
 *     tags: [Logistica]
 *     summary: Atualiza um registro de logística existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do registro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogisticaInput'
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', logisticaController.atualizar);

/**
 * @openapi
 * /api/logistica/{id}:
 *   delete:
 *     tags: [Logistica]
 *     summary: Remove um registro de logística
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do registro
 *     responses:
 *       200:
 *         description: Registro deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Registro não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', logisticaController.deletar);

module.exports = router;
