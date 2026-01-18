const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');

router.get('/', documentosController.listar);
router.get('/:id', documentosController.buscarPorId);
router.post('/', documentosController.criar);
router.put('/:id', documentosController.atualizar);
router.delete('/:id', documentosController.deletar);

module.exports = router;
