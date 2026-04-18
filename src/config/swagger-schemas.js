module.exports = {
    Usuario: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', format: 'email', example: 'admin@ideart.com' },
            funcao: { type: 'string', example: 'administrador' }
        }
    },

    LoginInput: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: {
                type: 'string',
                description: 'Nome de usuário ou email',
                example: 'admin'
            },
            password: { type: 'string', format: 'password', example: 'senha123' }
        }
    },

    LoginResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Login realizado com sucesso' },
            token: {
                type: 'string',
                example: 'a1b2c3d4e5f67890a1b2c3d4e5f67890'
            },
            usuario: { $ref: '#/components/schemas/Usuario' }
        }
    },

    ListaUsuariosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            usuarios: {
                type: 'array',
                items: { $ref: '#/components/schemas/Usuario' }
            }
        }
    },

    UsuarioResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            usuario: { $ref: '#/components/schemas/Usuario' }
        }
    },

    Cliente: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 10 },
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', nullable: true, example: 'joao@exemplo.com' },
            telefone: { type: 'string', nullable: true, example: '(11) 99999-0000' },
            endereco: { type: 'string', nullable: true, example: 'Rua das Flores, 123' },
            cidade: { type: 'string', nullable: true, example: 'São Paulo' },
            estado: { type: 'string', nullable: true, example: 'SP' },
            cep: { type: 'string', nullable: true, example: '01234-567' },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    ClienteInput: {
        type: 'object',
        required: ['nome'],
        properties: {
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
            telefone: { type: 'string', example: '(11) 99999-0000' },
            endereco: { type: 'string', example: 'Rua das Flores, 123' },
            cidade: { type: 'string', example: 'São Paulo' },
            estado: { type: 'string', example: 'SP' },
            cep: { type: 'string', example: '01234-567' }
        }
    },

    Paginacao: {
        type: 'object',
        properties: {
            pagina: { type: 'integer', example: 1 },
            limite: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPaginas: { type: 'integer', example: 5 }
        }
    },

    ListaClientesResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Clientes listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Cliente' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    ClienteResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Cliente encontrado' },
            dados: { $ref: '#/components/schemas/Cliente' }
        }
    },

    ClienteCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Cliente criado com sucesso' },
            id: { type: 'integer', example: 42 }
        }
    },

    RespostaSucesso: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Operação realizada com sucesso' }
        }
    },

    ErroResposta: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: false },
            mensagem: { type: 'string', example: 'Descrição do erro' },
            erro: {
                type: 'string',
                nullable: true,
                description: 'Mensagem técnica do erro (presente apenas em 500)'
            }
        }
    }
};
