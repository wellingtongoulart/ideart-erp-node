const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

/**
 * @openapi
 * /api/dashboard/resumo:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna KPIs, séries temporais e alertas para a tela inicial
 *     responses:
 *       200:
 *         description: Resumo do dashboard
 *       500:
 *         description: Erro ao carregar dashboard
 */
router.get('/resumo', dashboardController.resumo);

module.exports = router;
