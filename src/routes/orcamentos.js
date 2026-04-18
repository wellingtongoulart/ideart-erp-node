const express = require('express');
const router = express.Router();
const orcamentosController = require('../controllers/orcamentos.controller');

/**
 * @openapi
 * /api/orcamentos:
 *   get:
 *     tags: [Orcamentos]
 *     summary: Lista orçamentos com paginação e filtros
 */
router.get('/', orcamentosController.listar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   get:
 *     tags: [Orcamentos]
 *     summary: Busca um orçamento pelo ID com itens
 */
router.get('/:id', orcamentosController.buscarPorId);

/**
 * @openapi
 * /api/orcamentos/{id}/exportacao:
 *   get:
 *     tags: [Orcamentos]
 *     summary: Retorna dados consolidados para exportação (cabeçalho empresa + cliente + itens)
 */
router.get('/:id/exportacao', orcamentosController.dadosExportacao);

/**
 * @openapi
 * /api/orcamentos:
 *   post:
 *     tags: [Orcamentos]
 *     summary: Cria um novo orçamento com itens
 */
router.post('/', orcamentosController.criar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   put:
 *     tags: [Orcamentos]
 *     summary: Atualiza um orçamento existente (com itens)
 */
router.put('/:id', orcamentosController.atualizar);

/**
 * @openapi
 * /api/orcamentos/{id}/aprovar:
 *   post:
 *     tags: [Orcamentos]
 *     summary: Aprova o orçamento e gera um pedido vinculado
 */
router.post('/:id/aprovar', orcamentosController.aprovar);

/**
 * @openapi
 * /api/orcamentos/{id}/recusar:
 *   post:
 *     tags: [Orcamentos]
 *     summary: Recusa o orçamento
 */
router.post('/:id/recusar', orcamentosController.recusar);

/**
 * @openapi
 * /api/orcamentos/{id}:
 *   delete:
 *     tags: [Orcamentos]
 *     summary: Remove um orçamento
 */
router.delete('/:id', orcamentosController.deletar);

module.exports = router;
