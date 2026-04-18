const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');

/**
 * @openapi
 * /api/documentos:
 *   get:
 *     tags: [Documentos]
 *     summary: Lista documentos com paginação e filtros
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *         description: Página atual (inicia em 1)
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *         description: Quantidade de registros por página
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *         description: Filtrar por tipo do documento (ex. contrato, nota_fiscal, orcamento)
 *       - in: query
 *         name: referencia_tipo
 *         schema: { type: string }
 *         description: Filtrar pelo tipo da entidade relacionada (ex. cliente, pedido, orcamento)
 *     responses:
 *       200:
 *         description: Documentos listados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListaDocumentosResponse'
 *       500:
 *         description: Erro ao listar documentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/', documentosController.listar);

/**
 * @openapi
 * /api/documentos/{id}:
 *   get:
 *     tags: [Documentos]
 *     summary: Busca um documento pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentoResponse'
 *       404:
 *         description: Documento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao buscar documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.get('/:id', documentosController.buscarPorId);

/**
 * @openapi
 * /api/documentos:
 *   post:
 *     tags: [Documentos]
 *     summary: Cria um novo documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentoInput'
 *     responses:
 *       201:
 *         description: Documento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentoCriadoResponse'
 *       400:
 *         description: Nome obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao criar documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.post('/', documentosController.criar);

/**
 * @openapi
 * /api/documentos/{id}:
 *   put:
 *     tags: [Documentos]
 *     summary: Atualiza um documento existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentoInput'
 *     responses:
 *       200:
 *         description: Documento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Documento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao atualizar documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.put('/:id', documentosController.atualizar);

/**
 * @openapi
 * /api/documentos/{id}:
 *   delete:
 *     tags: [Documentos]
 *     summary: Remove um documento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID do documento
 *     responses:
 *       200:
 *         description: Documento deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       404:
 *         description: Documento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 *       500:
 *         description: Erro ao deletar documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroResposta'
 */
router.delete('/:id', documentosController.deletar);

module.exports = router;
