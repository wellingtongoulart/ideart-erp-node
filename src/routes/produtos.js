const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');

// GET - Listar todos os produtos
router.get('/', produtosController.listar);

// GET - Listar categorias
router.get('/categorias/lista', produtosController.categorias);

// GET - Buscar produto por ID
router.get('/:id', produtosController.buscarPorId);

// POST - Criar novo produto
router.post('/', produtosController.criar);

// PUT - Atualizar produto
router.put('/:id', produtosController.atualizar);

// DELETE - Deletar produto
router.delete('/:id', produtosController.deletar);

module.exports = router;
