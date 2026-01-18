const express = require('express');
const router = express.Router();
const logisticaController = require('../controllers/logistica.controller');

router.get('/', logisticaController.listar);
router.get('/:id', logisticaController.buscarPorId);
router.post('/', logisticaController.criar);
router.put('/:id', logisticaController.atualizar);
router.delete('/:id', logisticaController.deletar);

module.exports = router;
