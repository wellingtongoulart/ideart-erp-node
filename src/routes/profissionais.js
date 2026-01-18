const express = require('express');
const router = express.Router();
const profissionaisController = require('../controllers/profissionais.controller');

router.get('/', profissionaisController.listar);
router.get('/:id', profissionaisController.buscarPorId);
router.post('/', profissionaisController.criar);
router.put('/:id', profissionaisController.atualizar);
router.delete('/:id', profissionaisController.deletar);

module.exports = router;
