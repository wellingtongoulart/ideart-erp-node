const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatorios.controller');

// Exportações filtradas podem carregar datasets grandes no corpo da requisição.
const jsonGrande = express.json({ limit: '10mb' });

/**
 * @openapi
 * /api/relatorios/vendas:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório de vendas agregado por dia
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD). Filtra pedidos a partir desta data.
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD). Filtra pedidos até esta data.
 *     responses:
 *       200:
 *         description: Relatório de vendas gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioVendasResponse'
 *       500:
 *         description: Erro ao gerar relatório de vendas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/vendas', relatoriosController.vendas);

/**
 * @openapi
 * /api/relatorios/estoque:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório de estoque com totais por produto
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *         description: Filtrar produtos por categoria
 *     responses:
 *       200:
 *         description: Relatório de estoque gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioEstoqueResponse'
 *       500:
 *         description: Erro ao gerar relatório de estoque
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/estoque', relatoriosController.estoque);

/**
 * @openapi
 * /api/relatorios/financeiro:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório financeiro com receita bruta, descontos e receita líquida
 *     description: Considera apenas pedidos com status "entregue" no período informado.
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório financeiro gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioFinanceiroResponse'
 *       500:
 *         description: Erro ao gerar relatório financeiro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/financeiro', relatoriosController.financeiro);

/**
 * @openapi
 * /api/relatorios/clientes:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório de clientes com total de pedidos e valor gasto
 *     parameters:
 *       - in: query
 *         name: cidade
 *         schema: { type: string }
 *         description: Filtrar clientes por cidade exata
 *     responses:
 *       200:
 *         description: Relatório de clientes gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioClientesResponse'
 *       500:
 *         description: Erro ao gerar relatório de clientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/clientes', relatoriosController.clientes);

/**
 * @openapi
 * /api/relatorios/pedidos:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório de pedidos com cliente e total de itens
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Filtrar por status do pedido (ex. pendente, aprovado, entregue, cancelado)
 *       - in: query
 *         name: data_inicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: data_fim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Relatório de pedidos gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioPedidosResponse'
 *       500:
 *         description: Erro ao gerar relatório de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/pedidos', relatoriosController.pedidos);

/**
 * @openapi
 * /api/relatorios/logistica:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera relatório de logística com envios e datas de entrega
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: Filtrar por status do envio (ex. aguardando, em_transito, entregue)
 *     responses:
 *       200:
 *         description: Relatório de logística gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RelatorioLogisticaResponse'
 *       500:
 *         description: Erro ao gerar relatório de logística
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/logistica', relatoriosController.logistica);

/**
 * @openapi
 * /api/relatorios/{tipo}/exportar-xlsx:
 *   get:
 *     tags: [Relatorios]
 *     summary: Gera e retorna o arquivo XLSX estilizado do relatório
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema: { type: string, enum: [vendas, estoque, financeiro, clientes, pedidos, logistica] }
 *         description: Tipo de relatório a ser exportado
 */
router.get('/:tipo/exportar-xlsx', relatoriosController.exportarXLSX);

/**
 * @openapi
 * /api/relatorios/{tipo}/exportar-xlsx:
 *   post:
 *     tags: [Relatorios]
 *     summary: Exporta um XLSX estilizado a partir de dados já filtrados no cliente
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema: { type: string, enum: [vendas, estoque, financeiro, clientes, pedidos, logistica] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dados:
 *                 type: array
 *                 items: { type: object }
 *               resumo:
 *                 type: object
 */
router.post('/:tipo/exportar-xlsx', jsonGrande, relatoriosController.exportarXLSXFiltrado);

module.exports = router;
