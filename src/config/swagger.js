const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const schemasBase = require('./swagger-schemas');
const schemasComercial = require('./swagger-schemas-comercial');
const schemasOperacional = require('./swagger-schemas-operacional');

const schemas = { ...schemasBase, ...schemasComercial, ...schemasOperacional };

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Ideart ERP API',
            version: '1.0.0',
            description:
                'API do sistema Ideart ERP — gerenciamento de clientes, produtos, pedidos, ' +
                'orçamentos, profissionais, logística, documentos e relatórios.'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'Token',
                    description:
                        'Token retornado pelo endpoint POST /api/autenticacao/login. ' +
                        'Envie no header Authorization: Bearer <token>.'
                }
            },
            schemas
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Autenticacao', description: 'Login, logout e gestão de usuários' },
            { name: 'Clientes', description: 'Cadastro e consulta de clientes' },
            { name: 'Produtos' },
            { name: 'Pedidos' },
            { name: 'Orcamentos' },
            { name: 'Profissionais' },
            { name: 'Logistica' },
            { name: 'Documentos' },
            { name: 'Relatorios' }
        ]
    },
    apis: [path.join(__dirname, '../routes/*.js')]
};

module.exports = swaggerJsdoc(options);
