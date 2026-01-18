const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacao.controller');
console.log('Rota de autenticação carregada.');
// Login
router.post('/login', autenticacaoController.login);

// Logout
router.post('/logout', autenticacaoController.logout);

// Listar usuários
router.get('/usuarios', autenticacaoController.listarUsuarios);

// Obter usuário por ID
router.get('/usuarios/:id', autenticacaoController.obterUsuario);

module.exports = router;