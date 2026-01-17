const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

// GET - Listar todos os pedidos
router.get('/', pedidosController.listar);

// GET - Relatório de pedidos
router.get('/relatorio/geral', pedidosController.relatorio);

// GET - Buscar pedido por ID
router.get('/:id', pedidosController.buscarPorId);

// POST - Criar novo pedido
router.post('/', pedidosController.criar);

// PUT - Atualizar pedido
router.put('/:id', pedidosController.atualizar);

// DELETE - Cancelar pedido
router.delete('/:id', pedidosController.cancelar);

module.exports = router;
