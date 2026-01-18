const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatorios.controller');

router.get('/vendas', relatoriosController.vendas);
router.get('/estoque', relatoriosController.estoque);
router.get('/financeiro', relatoriosController.financeiro);
router.get('/clientes', relatoriosController.clientes);
router.get('/pedidos', relatoriosController.pedidos);
router.get('/logistica', relatoriosController.logistica);

module.exports = router;
