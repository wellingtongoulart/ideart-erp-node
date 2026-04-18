-- Migração: refatoração das telas de Orçamentos e Pedidos
-- Adiciona campos e tabelas necessárias para o novo fluxo

USE ideart_erp;

-- ========================================
-- Ajustes em ORÇAMENTOS
-- ========================================

-- Adicionar novos campos se não existirem
ALTER TABLE orcamentos
    ADD COLUMN IF NOT EXISTS profissional_id INT NULL AFTER cliente_id,
    ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) NULL AFTER observacoes,
    ADD COLUMN IF NOT EXISTS assinatura VARCHAR(255) NULL AFTER forma_pagamento,
    ADD COLUMN IF NOT EXISTS pedido_id INT NULL AFTER assinatura;

-- Ajustar ENUM de status para incluir 'expirado'
ALTER TABLE orcamentos
    MODIFY COLUMN status ENUM('pendente', 'aprovado', 'recusado', 'expirado', 'convertido') DEFAULT 'pendente';

-- FK para profissional (best effort; ignora se tabela não existir)
-- Necessário que a tabela profissionais exista
-- ALTER TABLE orcamentos ADD CONSTRAINT fk_orc_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id);

-- ========================================
-- Ajustes em ORCAMENTO_ITENS
-- ========================================

-- Adicionar campos para produtos/serviços customizados (não cadastrados)
ALTER TABLE orcamento_itens
    ADD COLUMN IF NOT EXISTS nome_customizado VARCHAR(255) NULL AFTER produto_id,
    ADD COLUMN IF NOT EXISTS descricao_customizada TEXT NULL AFTER nome_customizado,
    ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0 AFTER subtotal;

-- Permitir produto_id nulo (para itens customizados)
ALTER TABLE orcamento_itens
    MODIFY COLUMN produto_id INT NULL;

-- ========================================
-- Ajustes em PEDIDOS
-- ========================================

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS orcamento_id INT NULL AFTER cliente_id,
    ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) NULL AFTER observacoes;

-- ========================================
-- Ajustes em PEDIDO_ITENS
-- ========================================

ALTER TABLE pedido_itens
    ADD COLUMN IF NOT EXISTS nome_customizado VARCHAR(255) NULL AFTER produto_id,
    ADD COLUMN IF NOT EXISTS descricao_customizada TEXT NULL AFTER nome_customizado,
    ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0 AFTER subtotal;

ALTER TABLE pedido_itens
    MODIFY COLUMN produto_id INT NULL;

-- ========================================
-- Tabela de configuração da empresa (para cabeçalho do PDF)
-- ========================================

CREATE TABLE IF NOT EXISTS empresa_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    logo_url VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed padrão da Ideart (executar apenas se tabela estiver vazia)
INSERT INTO empresa_config (nome_fantasia, razao_social, email, telefone, endereco, cidade, estado)
SELECT 'Ideart', 'Ideart Comércio Ltda.', 'contato@ideart.com.br', '(11) 0000-0000', 'Endereço da empresa', 'São Paulo', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM empresa_config);

-- Índices
CREATE INDEX idx_orcamento_itens_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX idx_pedido_itens_pedido ON pedido_itens(pedido_id);
