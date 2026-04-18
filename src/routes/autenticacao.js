const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacao.controller');
console.log('Rota de autenticação carregada.');

/**
 * @openapi
 * /api/autenticacao/login:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Autentica o usuário e retorna um token
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
 *     summary: Encerra a sessão do usuário atual
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       500:
 *         description: Erro ao fazer logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/logout', autenticacaoController.logout);

/**
 * @openapi
 * /api/autenticacao/usuarios:
 *   get:
 *     tags: [Autenticacao]
 *     summary: Lista todos os usuários cadastrados
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaUsuariosResponse'
 *       500:
 *         description: Erro ao listar usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/usuarios', autenticacaoController.listarUsuarios);

/**
 * @openapi
 * /api/autenticacao/usuarios/{id}:
 *   get:
 *     tags: [Autenticacao]
 *     summary: Obtém um usuário pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao obter usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/usuarios/:id', autenticacaoController.obterUsuario);

// Obter dados do usuário logado (usando ID do frontend)
router.get('/user/me', autenticacaoController.obterUsuarioLogado);

/**
 * @openapi
 * /api/autenticacao/forgot-password:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Solicita um link de redefinição de senha
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *                 description: Username ou email do usuário
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               novaSenha:
 *                 type: string
 */
router.post('/reset-password', autenticacaoController.redefinirSenha);

/**
 * @openapi
 * /api/autenticacao/change-password:
 *   post:
 *     tags: [Autenticacao]
 *     summary: Altera a senha de um usuário logado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: integer
 *               senhaAtual:
 *                 type: string
 *               novaSenha:
 *                 type: string
 */
router.post('/change-password', autenticacaoController.alterarSenha);

module.exports = router;
