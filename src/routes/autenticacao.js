const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacao.controller');
const autenticar = require('../middlewares/autenticar');

/**
 * @openapi
 * /api/autenticacao/login:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Autentica o usuário e retorna um JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       401:
 *         description: Usuário ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/login', autenticacaoController.login);

/**
 * @openapi
 * /api/autenticacao/logout:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Encerra a sessão do usuário atual (client-side)
 *     security: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', autenticacaoController.logout);

/**
 * @openapi
 * /api/autenticacao/forgot-password:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Solicita um link de redefinição de senha
 *     security: []
 */
router.post('/forgot-password', autenticacaoController.solicitarRecuperacaoSenha);

/**
 * @openapi
 * /api/autenticacao/validate-reset-token:
 *   get:
 *     tags: [Autenticacao]
 *     summary: Valida um token de redefinição de senha
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/validate-reset-token', autenticacaoController.validarTokenRecuperacao);

/**
 * @openapi
 * /api/autenticacao/reset-password:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Redefine a senha usando um token válido
 *     security: []
 */
router.post('/reset-password', autenticacaoController.redefinirSenha);

// === A partir daqui, todos os endpoints exigem JWT válido ===

/**
 * @openapi
 * /api/autenticacao/usuarios:
 *   get:
 *     tags: [Autenticacao]
 *     summary: Lista todos os usuários cadastrados
 */
router.get('/usuarios', autenticar, autenticacaoController.listarUsuarios);

/**
 * @openapi
 * /api/autenticacao/usuarios/{id}:
 *   get:
 *     tags: [Autenticacao]
 *     summary: Obtém um usuário pelo ID
 */
router.get('/usuarios/:id', autenticar, autenticacaoController.obterUsuario);

// Obter dados do usuário logado (ID vem do JWT, não mais da query string)
router.get('/user/me', autenticar, autenticacaoController.obterUsuarioLogado);

/**
 * @openapi
 * /api/autenticacao/change-password:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Altera a senha do usuário autenticado
 */
router.post('/change-password', autenticar, autenticacaoController.alterarSenha);

module.exports = router;
