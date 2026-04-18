module.exports = {
    // ============================================================
    // Produtos
    // ============================================================
    Produto: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 7 },
            nome: { type: 'string', example: 'Camiseta Branca P' },
            descricao: { type: 'string', nullable: true, example: 'Camiseta 100% algodão, cor branca, tamanho P' },
            categoria: { type: 'string', nullable: true, example: 'Vestuário' },
            fornecedor: { type: 'string', nullable: true, example: 'Fornecedor XYZ' },
            preco_custo: { type: 'number', format: 'float', example: 15.50 },
            preco_venda: { type: 'number', format: 'float', example: 39.90 },
            estoque: { type: 'integer', example: 120 },
            sku: { type: 'string', nullable: true, example: 'PROD1700000000000' },
            ativo: { type: 'boolean', example: true },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    ProdutoInput: {
        type: 'object',
        required: ['nome', 'preco_venda'],
        properties: {
            nome: { type: 'string', example: 'Camiseta Branca P' },
            descricao: { type: 'string', example: 'Camiseta 100% algodão, cor branca, tamanho P' },
            categoria: { type: 'string', example: 'Vestuário' },
            fornecedor: { type: 'string', example: 'Fornecedor XYZ' },
            preco_custo: { type: 'number', format: 'float', example: 15.50 },
            preco_venda: { type: 'number', format: 'float', example: 39.90 },
            estoque: { type: 'integer', example: 120 },
            sku: {
                type: 'string',
                description: 'Se omitido, um SKU é gerado automaticamente (PROD + timestamp)',
                example: 'CAM-BRA-P'
            }
        }
    },

    ProdutoUpdateInput: {
        type: 'object',
        description: 'Todos os campos são opcionais. Só os enviados serão atualizados.',
        properties: {
            nome: { type: 'string', example: 'Camiseta Branca P' },
            descricao: { type: 'string', example: 'Camiseta 100% algodão' },
            categoria: { type: 'string', example: 'Vestuário' },
            preco_custo: { type: 'number', format: 'float', example: 15.50 },
            preco_venda: { type: 'number', format: 'float', example: 39.90 },
            estoque: { type: 'integer', example: 120 },
            sku: { type: 'string', example: 'CAM-BRA-P' },
            ativo: { type: 'boolean', example: true }
        }
    },

    ListaProdutosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Produtos listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Produto' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    ProdutoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Produto encontrado' },
            dados: { $ref: '#/components/schemas/Produto' }
        }
    },

    ProdutoCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Produto criado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 },
                    nome: { type: 'string', example: 'Camiseta Branca P' },
                    preco_venda: { type: 'number', format: 'float', example: 39.90 },
                    sku: { type: 'string', example: 'PROD1700000000000' }
                }
            }
        }
    },

    ProdutoAtualizadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Produto atualizado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 }
                }
            }
        }
    },

    CategoriasProdutoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Categorias listadas com sucesso' },
            dados: {
                type: 'array',
                items: { type: 'string' },
                example: ['Vestuário', 'Calçados', 'Acessórios']
            }
        }
    },

    // ============================================================
    // Pedidos
    // ============================================================
    ItemPedido: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 15 },
            pedido_id: { type: 'integer', example: 3 },
            produto_id: { type: 'integer', example: 7 },
            produto_nome: {
                type: 'string',
                description: 'Nome do produto (vem do JOIN com a tabela produtos)',
                example: 'Camiseta Branca P'
            },
            descricao: { type: 'string', nullable: true, example: 'Camiseta 100% algodão' },
            quantidade: { type: 'integer', example: 2 },
            preco_unitario: { type: 'number', format: 'float', example: 39.90 },
            subtotal: { type: 'number', format: 'float', example: 79.80 },
            criado_em: { type: 'string', format: 'date-time' }
        }
    },

    ItemPedidoInput: {
        type: 'object',
        required: ['produto_id', 'quantidade', 'preco_unitario'],
        properties: {
            produto_id: { type: 'integer', example: 7 },
            quantidade: { type: 'integer', example: 2 },
            preco_unitario: { type: 'number', format: 'float', example: 39.90 }
        }
    },

    Pedido: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 3 },
            numero: { type: 'string', example: 'PED1700000000000' },
            cliente_id: { type: 'integer', example: 10 },
            cliente_nome: {
                type: 'string',
                description: 'Nome do cliente (vem do JOIN com a tabela clientes)',
                example: 'João da Silva'
            },
            data_pedido: { type: 'string', format: 'date', example: '2026-04-18' },
            data_entrega_prevista: { type: 'string', format: 'date', nullable: true, example: '2026-04-25' },
            data_entrega_real: { type: 'string', format: 'date', nullable: true, example: '2026-04-24' },
            valor_total: { type: 'number', format: 'float', example: 159.60 },
            desconto: { type: 'number', format: 'float', example: 0 },
            status: {
                type: 'string',
                enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
                example: 'pendente'
            },
            observacoes: { type: 'string', nullable: true, example: 'Entregar no período da tarde' },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    PedidoDetalhado: {
        type: 'object',
        description: 'Pedido retornado em GET /api/pedidos/{id}, incluindo dados do cliente, itens e logística',
        properties: {
            pedido: {
                allOf: [
                    { $ref: '#/components/schemas/Pedido' },
                    {
                        type: 'object',
                        properties: {
                            cliente_email: { type: 'string', format: 'email', nullable: true, example: 'joao@exemplo.com' },
                            cliente_telefone: { type: 'string', nullable: true, example: '(11) 99999-0000' },
                            endereco: { type: 'string', nullable: true, example: 'Rua das Flores, 123' }
                        }
                    }
                ]
            },
            itens: {
                type: 'array',
                items: { $ref: '#/components/schemas/ItemPedido' }
            },
            logistica: {
                type: 'object',
                nullable: true,
                description: 'Informações de logística associadas ao pedido (null se inexistentes)'
            }
        }
    },

    PedidoInput: {
        type: 'object',
        required: ['cliente_id', 'itens'],
        properties: {
            cliente_id: { type: 'integer', example: 10 },
            data_pedido: {
                type: 'string',
                format: 'date',
                description: 'Se omitida, usa a data atual',
                example: '2026-04-18'
            },
            data_entrega_prevista: { type: 'string', format: 'date', example: '2026-04-25' },
            desconto: { type: 'number', format: 'float', example: 10 },
            observacoes: { type: 'string', example: 'Entregar no período da tarde' },
            itens: {
                type: 'array',
                minItems: 1,
                items: { $ref: '#/components/schemas/ItemPedidoInput' }
            }
        }
    },

    PedidoUpdateInput: {
        type: 'object',
        description: 'Todos os campos são opcionais. Só os enviados serão atualizados.',
        properties: {
            data_entrega_prevista: { type: 'string', format: 'date', example: '2026-04-26' },
            status: {
                type: 'string',
                enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
                example: 'processando'
            },
            observacoes: { type: 'string', example: 'Cliente solicitou adiamento' },
            desconto: { type: 'number', format: 'float', example: 15 }
        }
    },

    PedidoCancelamentoInput: {
        type: 'object',
        properties: {
            motivo: {
                type: 'string',
                description: 'Motivo do cancelamento (anexado às observações)',
                example: 'Cliente desistiu da compra'
            }
        }
    },

    ListaPedidosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Pedidos listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Pedido' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    PedidoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Pedido encontrado' },
            dados: { $ref: '#/components/schemas/PedidoDetalhado' }
        }
    },

    PedidoCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Pedido criado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 },
                    numero: { type: 'string', example: 'PED1700000000000' },
                    valor_total: { type: 'number', format: 'float', example: 159.60 }
                }
            }
        }
    },

    PedidoAtualizadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Pedido atualizado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 }
                }
            }
        }
    },

    PedidoCanceladoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Pedido cancelado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 42 },
                    status: { type: 'string', example: 'cancelado' }
                }
            }
        }
    },

    RelatorioPedidosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Relatório gerado com sucesso' },
            dados: {
                type: 'object',
                properties: {
                    statusCount: {
                        type: 'array',
                        description: 'Total de pedidos agrupados por status',
                        items: {
                            type: 'object',
                            properties: {
                                status: { type: 'string', example: 'pendente' },
                                total: { type: 'integer', example: 12 }
                            }
                        }
                    },
                    faturamentoTotal: {
                        type: 'number',
                        format: 'float',
                        description: 'Soma do valor_total dos pedidos entregues',
                        example: 15430.50
                    },
                    pedidosPendentes: {
                        type: 'integer',
                        description: 'Quantidade de pedidos com status pendente ou processando',
                        example: 8
                    },
                    ultimosPedidos: {
                        type: 'array',
                        description: 'Últimos 5 pedidos criados',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 42 },
                                numero: { type: 'string', example: 'PED1700000000000' },
                                cliente_nome: { type: 'string', example: 'João da Silva' },
                                valor_total: { type: 'number', format: 'float', example: 159.60 },
                                status: { type: 'string', example: 'pendente' },
                                data_pedido: { type: 'string', format: 'date', example: '2026-04-18' }
                            }
                        }
                    }
                }
            }
        }
    },

    // ============================================================
    // Orçamentos
    // ============================================================
    Orcamento: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 5 },
            numero: { type: 'string', example: 'ORC-2026-0001' },
            cliente_id: { type: 'integer', example: 10 },
            cliente_nome: {
                type: 'string',
                description: 'Nome do cliente (vem do JOIN com a tabela clientes)',
                example: 'João da Silva'
            },
            data_criacao: { type: 'string', format: 'date', nullable: true, example: '2026-04-18' },
            data_validade: { type: 'string', format: 'date', nullable: true, example: '2026-05-18' },
            valor_total: { type: 'number', format: 'float', example: 1250.00 },
            desconto: { type: 'number', format: 'float', example: 50 },
            status: {
                type: 'string',
                enum: ['pendente', 'aprovado', 'recusado', 'expirado'],
                example: 'pendente'
            },
            observacoes: { type: 'string', nullable: true, example: 'Valor válido por 30 dias' },
            criado_em: { type: 'string', format: 'date-time' },
            atualizado_em: { type: 'string', format: 'date-time' }
        }
    },

    OrcamentoInput: {
        type: 'object',
        required: ['numero', 'cliente_id'],
        properties: {
            numero: { type: 'string', example: 'ORC-2026-0001' },
            cliente_id: { type: 'integer', example: 10 },
            data_criacao: { type: 'string', format: 'date', example: '2026-04-18' },
            data_validade: { type: 'string', format: 'date', example: '2026-05-18' },
            valor_total: { type: 'number', format: 'float', example: 1250.00 },
            desconto: { type: 'number', format: 'float', example: 50 },
            status: {
                type: 'string',
                enum: ['pendente', 'aprovado', 'recusado', 'expirado'],
                example: 'pendente'
            },
            observacoes: { type: 'string', example: 'Valor válido por 30 dias' }
        }
    },

    ListaOrcamentosResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Orçamentos listados com sucesso' },
            dados: {
                type: 'array',
                items: { $ref: '#/components/schemas/Orcamento' }
            },
            paginacao: { $ref: '#/components/schemas/Paginacao' }
        }
    },

    OrcamentoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Orçamento encontrado' },
            dados: { $ref: '#/components/schemas/Orcamento' }
        }
    },

    OrcamentoCriadoResponse: {
        type: 'object',
        properties: {
            sucesso: { type: 'boolean', example: true },
            mensagem: { type: 'string', example: 'Orçamento criado com sucesso' },
            id: { type: 'integer', example: 42 }
        }
    }
};
