const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

/**
 * @openapi
 * /api/pedidos:
 *   get:
 *     tags: [Pedidos]
 *     summary: Lista pedidos com paginação e filtros
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
 *         description: Busca por número do pedido ou nome do cliente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, processando, enviado, entregue, cancelado]
 *         description: Filtrar por status do pedido
 *       - in: query
 *         name: cliente_id
 *         schema: { type: integer }
 *         description: Filtrar pedidos de um cliente específico
 *     responses:
 *       200:
 *         description: Pedidos listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaPedidosResponse'
 *       500:
 *         description: Erro ao listar pedidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', pedidosController.listar);

/**
 * @openapi
 * /api/pedidos/relatorio/geral:
 *   get:
 *     tags: [Pedidos]
 *     summary: Gera relatório geral de pedidos para dashboard
 *     description: Retorna contagem por status, faturamento total (pedidos entregues), pedidos pendentes e últimos 5 pedidos.
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioPedidosResponse'
 *       500:
 *         description: Erro ao gerar relatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/relatorio/geral', pedidosController.relatorio);

/**
 * @openapi
 * /api/pedidos/{id}:
 *   get:
 *     tags: [Pedidos]
 *     summary: Busca um pedido pelo ID com itens e logística
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoResponse'
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', pedidosController.buscarPorId);

/**
 * @openapi
 * /api/pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Cria um novo pedido com seus itens
 *     description: Cria o pedido, insere itens em pedido_itens e decrementa o estoque dos produtos em uma única transação. O número do pedido é gerado automaticamente (PED + timestamp).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoCriadoResponse'
 *       400:
 *         description: Cliente obrigatório ou pedido sem itens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', pedidosController.criar);

/**
 * @openapi
 * /api/pedidos/{id}:
 *   put:
 *     tags: [Pedidos]
 *     summary: Atualiza um pedido existente
 *     description: Atualiza campos do pedido. Quando o status muda para enviado ou entregue, as datas correspondentes são registradas automaticamente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoUpdateInput'
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoAtualizadoResponse'
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', pedidosController.atualizar);

/**
 * @openapi
 * /api/pedidos/{id}:
 *   delete:
 *     tags: [Pedidos]
 *     summary: Cancela um pedido e restaura estoque
 *     description: Define o status do pedido como cancelado, restaura o estoque dos produtos e anexa o motivo às observações. Não permite cancelar pedidos já entregues.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do pedido
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoCancelamentoInput'
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoCanceladoResponse'
 *       400:
 *         description: Não é possível cancelar um pedido entregue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       404:
 *         description: Pedido não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao cancelar pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', pedidosController.cancelar);

module.exports = router;
