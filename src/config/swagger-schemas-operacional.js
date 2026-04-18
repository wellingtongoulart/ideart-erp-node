module.exports = {
    // ==========================
    // Profissionais
    // ==========================
    Profissional: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 7 },
            nome: { type: 'string', example: 'Maria Souza' },
            especialidade: { type: 'string', nullable: true, example: 'Marceneira' },
            email: { type: 'string', format: 'email', nullable: true, example: 'maria@ideart.com' },
            telefone: { type: 'string', nullable: true, example: '(11) 98888-7777' },
            cpf: { type: 'string', nullable: true, example: '123.456.789-00' },
            data_admissao: { type: 'string', format: 'date', nullable: true, example: '2024-03-15' },
            salario: { type: 'number', format: 'float', nullable: true, example: 3500.00 },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    ProfissionalInput: {
        type: 'object',
        required: ['nome'],
        properties: {
            nome: { type: 'string', example: 'Maria Souza' },
            especialidade: { type: 'string', example: 'Marceneira' },
            email: { type: 'string', format: 'email', example: 'maria@ideart.com' },
            telefone: { type: 'string', example: '(11) 98888-7777' },
            cpf: { type: 'string', example: '123.456.789-00' },
            data_admissao: { type: 'string', format: 'date', example: '2024-03-15' },
            salario: { type: 'number', format: 'float', example: 3500.00 }
        }
    },

    ListaProfissionaisResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Profissionais listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Profissional' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    ProfissionalResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Profissional encontrado' },
            dados: { $ref: '#/components/schemas/Profissional' }
        }
    },

    ProfissionalCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Profissional criado com sucesso' },
            id: { type: 'integer', example: 42 }
        }
    },

    // ==========================
    // Logística
    // ==========================
    Logistica: {
        type: 'object',
        description: 'Registro de logística (rastreamento de envio) associado a um pedido.',
        properties: {
            id: { type: 'integer', example: 3 },
            numero_rastreamento: { type: 'string', example: 'BR123456789' },
            pedido_id: { type: 'integer', example: 15 },
            pedido_numero: {
                type: 'string',
                nullable: true,
                description: 'Número do pedido relacionado (JOIN com a tabela pedidos)',
                example: 'PED-2026-0015'
            },
            transportadora: { type: 'string', nullable: true, example: 'Correios' },
            endereco_origem: { type: 'string', nullable: true, example: 'Av. Paulista, 1000 - São Paulo/SP' },
            endereco_destino: { type: 'string', nullable: true, example: 'Rua das Flores, 123 - Curitiba/PR' },
            data_envio: { type: 'string', format: 'date', nullable: true, example: '2026-04-10' },
            data_entrega_prevista: { type: 'string', format: 'date', nullable: true, example: '2026-04-18' },
            data_entrega_real: { type: 'string', format: 'date', nullable: true, example: '2026-04-17' },
            status: {
                type: 'string',
                example: 'aguardando',
                description: 'Status atual do envio (ex: aguardando, em_transito, entregue, cancelado)'
            },
            observacoes: { type: 'string', nullable: true, example: 'Entregar no horário comercial' },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    LogisticaInput: {
        type: 'object',
        required: ['numero_rastreamento', 'pedido_id'],
        properties: {
            numero_rastreamento: { type: 'string', example: 'BR123456789' },
            pedido_id: { type: 'integer', example: 15 },
            transportadora: { type: 'string', example: 'Correios' },
            endereco_origem: { type: 'string', example: 'Av. Paulista, 1000 - São Paulo/SP' },
            endereco_destino: { type: 'string', example: 'Rua das Flores, 123 - Curitiba/PR' },
            data_envio: { type: 'string', format: 'date', example: '2026-04-10' },
            data_entrega_prevista: { type: 'string', format: 'date', example: '2026-04-18' },
            data_entrega_real: {
                type: 'string',
                format: 'date',
                description: 'Aceito apenas na atualização (PUT)',
                example: '2026-04-17'
            },
            status: {
                type: 'string',
                example: 'aguardando',
                description: 'Status do envio. Default: aguardando'
            },
            observacoes: { type: 'string', example: 'Entregar no horário comercial' }
        }
    },

    ListaLogisticaResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Registros de logística listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Logistica' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    LogisticaResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Registro encontrado' },
            dados: { $ref: '#/components/schemas/Logistica' }
        }
    },

    LogisticaCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Registro criado com sucesso' },
            id: { type: 'integer', example: 42 }
        }
    },

    // ==========================
    // Documentos
    // ==========================
    Documento: {
        type: 'object',
        description: 'Arquivo/documento anexado a uma entidade do sistema (pedido, cliente, orçamento etc.).',
        properties: {
            id: { type: 'integer', example: 5 },
            nome: { type: 'string', example: 'Contrato-Cliente-001.pdf' },
            tipo: {
                type: 'string',
                nullable: true,
                description: 'Tipo do documento (ex: contrato, nota_fiscal, orcamento, foto)',
                example: 'contrato'
            },
            referencia_id: {
                type: 'integer',
                nullable: true,
                description: 'ID da entidade relacionada (cliente, pedido, etc.)',
                example: 10
            },
            referencia_tipo: {
                type: 'string',
                nullable: true,
                description: 'Tipo da entidade relacionada (ex: cliente, pedido, orcamento)',
                example: 'cliente'
            },
            caminho_arquivo: {
                type: 'string',
                nullable: true,
                description: 'Caminho/URL do arquivo armazenado',
                example: '/uploads/contratos/contrato-001.pdf'
            },
            data_criacao: { type: 'string', format: 'date', nullable: true, example: '2026-04-18' },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    DocumentoInput: {
        type: 'object',
        required: ['nome'],
        properties: {
            nome: { type: 'string', example: 'Contrato-Cliente-001.pdf' },
            tipo: { type: 'string', example: 'contrato' },
            referencia_id: { type: 'integer', example: 10 },
            referencia_tipo: { type: 'string', example: 'cliente' },
            caminho_arquivo: { type: 'string', example: '/uploads/contratos/contrato-001.pdf' },
            data_criacao: { type: 'string', format: 'date', example: '2026-04-18' }
        }
    },

    ListaDocumentosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Documentos listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Documento' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    DocumentoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Documento encontrado' },
            dados: { $ref: '#/components/schemas/Documento' }
        }
    },

    DocumentoCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Documento criado com sucesso' },
            id: { type: 'integer', example: 42 }
        }
    },

    // ==========================
    // Relatórios
    // ==========================
    RelatorioVendasItem: {
        type: 'object',
        description: 'Vendas agregadas por dia.',
        properties: {
            data: { type: 'string', format: 'date', example: '2026-04-15' },
            total_pedidos: { type: 'integer', example: 8 },
            valor_total: { type: 'number', format: 'float', example: 12850.75 }
        }
    },

    RelatorioVendasResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório de vendas gerado com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/RelatorioVendasItem' }
            }
        }
    },

    RelatorioEstoqueItem: {
        type: 'object',
        description: 'Linha do relatório de estoque (um produto).',
        properties: {
            id: { type: 'integer', example: 23 },
            nome: { type: 'string', example: 'Mesa Carvalho 1,60m' },
            categoria: { type: 'string', nullable: true, example: 'Mesas' },
            estoque: { type: 'integer', example: 12 },
            preco_venda: { type: 'number', format: 'float', example: 1299.90 },
            valor_total: {
                type: 'number',
                format: 'float',
                description: 'estoque * preco_venda',
                example: 15598.80
            }
        }
    },

    RelatorioEstoqueResumo: {
        type: 'object',
        properties: {
            total_itens: { type: 'integer', example: 45 },
            quantidade_total: { type: 'integer', example: 320 },
            valor_total: { type: 'number', format: 'float', example: 184250.00 }
        }
    },

    RelatorioEstoqueResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório de estoque gerado com sucesso' },
            resumo: { $ref: '#/components/schemas/RelatorioEstoqueResumo' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/RelatorioEstoqueItem' }
            }
        }
    },

    RelatorioFinanceiroDados: {
        type: 'object',
        description: 'Totalizadores financeiros no período (somente pedidos com status = entregue).',
        properties: {
            total_pedidos: { type: 'integer', example: 120 },
            receita_bruta: { type: 'number', format: 'float', example: 185450.00 },
            desconto_total: { type: 'number', format: 'float', example: 3500.00 },
            receita_liquida: { type: 'number', format: 'float', example: 181950.00 }
        }
    },

    RelatorioFinanceiroResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório financeiro gerado com sucesso' },
            dados: { $ref: '#/components/schemas/RelatorioFinanceiroDados' }
        }
    },

    RelatorioClientesItem: {
        type: 'object',
        description: 'Cliente com agregação de pedidos.',
        properties: {
            id: { type: 'integer', example: 10 },
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', nullable: true, example: 'joao@exemplo.com' },
            telefone: { type: 'string', nullable: true, example: '(11) 99999-0000' },
            cidade: { type: 'string', nullable: true, example: 'São Paulo' },
            total_pedidos: { type: 'integer', example: 5 },
            valor_total_gasto: { type: 'number', format: 'float', nullable: true, example: 8750.00 }
        }
    },

    RelatorioClientesResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório de clientes gerado com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/RelatorioClientesItem' }
            }
        }
    },

    RelatorioPedidosItem: {
        type: 'object',
        description: 'Pedido com resumo (nome do cliente e total de itens).',
        properties: {
            id: { type: 'integer', example: 42 },
            numero: { type: 'string', example: 'PED-2026-0042' },
            cliente: { type: 'string', nullable: true, example: 'João da Silva' },
            data_pedido: { type: 'string', format: 'date-time', example: '2026-04-10T14:30:00Z' },
            status: { type: 'string', example: 'entregue' },
            valor_total: { type: 'number', format: 'float', example: 1899.90 },
            total_itens: { type: 'integer', example: 3 }
        }
    },

    RelatorioPedidosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório de pedidos gerado com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/RelatorioPedidosItem' }
            }
        }
    },

    RelatorioLogisticaItem: {
        type: 'object',
        description: 'Envio consolidado para relatório de logística.',
        properties: {
            id: { type: 'integer', example: 3 },
            numero_rastreamento: { type: 'string', example: 'BR123456789' },
            transportadora: { type: 'string', nullable: true, example: 'Correios' },
            status: { type: 'string', example: 'em_transito' },
            data_envio: { type: 'string', format: 'date', nullable: true, example: '2026-04-10' },
            data_entrega_prevista: { type: 'string', format: 'date', nullable: true, example: '2026-04-18' },
            data_entrega_real: { type: 'string', format: 'date', nullable: true, example: '2026-04-17' },
            pedido_numero: { type: 'string', nullable: true, example: 'PED-2026-0015' }
        }
    },

    RelatorioLogisticaResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório de logística gerado com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/RelatorioLogisticaItem' }
            }
        }
    }
};
