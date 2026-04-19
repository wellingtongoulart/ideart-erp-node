const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/filtrosSalvos.controller');

/**
 * @openapi
 * /api/filtros-salvos/{contexto}:
 *   get:
 *     tags: [FiltrosSalvos]
 *     summary: Lista os conjuntos de filtros salvos para um contexto (ex. relatorios.vendas)
 *     parameters:
 *       - in: path
 *         name: contexto
 *         required: true
 *         schema: { type: string }
 *   post:
 *     tags: [FiltrosSalvos]
 *     summary: Cria ou atualiza um filtro salvo (upsert por nome dentro do contexto)
 *     parameters:
 *       - in: path
 *         name: contexto
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, valores]
 *             properties:
 *               nome: { type: string }
 *               valores: { type: object }
 *
 * /api/filtros-salvos/{contexto}/{id}:
 *   delete:
 *     tags: [FiltrosSalvos]
 *     summary: Remove um filtro salvo pelo ID dentro de um contexto
 *     parameters:
 *       - in: path
 *         name: contexto
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:contexto', ctrl.listar);
router.post('/:contexto', ctrl.salvar);
router.delete('/:contexto/:id', ctrl.remover);

module.exports = router;
