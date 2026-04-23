-- =====================================================================
-- Ideart ERP — Setup completo e idempotente do banco de dados
-- =====================================================================
-- Este script cria TODO o schema necessário para rodar o sistema
-- (tabelas, índices, usuários iniciais e configuração da empresa).
--
-- É idempotente: pode ser executado várias vezes no mesmo banco
-- sem quebrar nada. Também migra bancos criados em versões anteriores
-- (adiciona colunas novas, ajusta ENUMs e índices).
--
-- Uso:
--   1) Crie o banco (uma vez):
--        mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ideart_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--   2) Execute este arquivo:
--        mysql -u root -p ideart_erp < setup.sql
--   3) (Opcional) Popule dados fictícios:
--        mysql -u root -p ideart_erp < setup-dados-exemplo.sql
-- =====================================================================

USE ideart_erp;

-- =====================================================================
-- 1. TABELAS PRINCIPAIS
-- =====================================================================

CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(8),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profissionais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(11) UNIQUE,
    data_admissao DATE,
    salario DECIMAL(10, 2),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    preco_custo DECIMAL(10, 2),
    preco_venda DECIMAL(10, 2) NOT NULL,
    estoque INT DEFAULT 0,
    sku VARCHAR(100),
    fornecedor VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_produtos_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orcamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(50) UNIQUE,
    cliente_id INT NOT NULL,
    profissional_id INT NULL,
    data_criacao DATE,
    data_validade DATE,
    valor_total DECIMAL(12, 2),
    desconto DECIMAL(10, 2) DEFAULT 0,
    status ENUM('pendente', 'aprovado', 'recusado', 'expirado', 'convertido') DEFAULT 'pendente',
    observacoes TEXT,
    forma_pagamento VARCHAR(50) NULL,
    assinatura VARCHAR(255) NULL,
    pedido_id INT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orcamento_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orcamento_id INT NOT NULL,
    ambiente VARCHAR(100) NULL,
    produto_id INT NULL,
    nome_customizado VARCHAR(255) NULL,
    codigo_customizado VARCHAR(100) NULL,
    descricao_customizada TEXT NULL,
    tamanho VARCHAR(100) NULL,
    cor VARCHAR(100) NULL,
    quantidade INT,
    preco_unitario DECIMAL(10, 2),
    subtotal DECIMAL(12, 2),
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(50) UNIQUE,
    cliente_id INT NOT NULL,
    orcamento_id INT NULL,
    data_pedido DATE,
    data_entrega_prevista DATE,
    data_entrega_real DATE,
    valor_total DECIMAL(12, 2),
    desconto DECIMAL(10, 2) DEFAULT 0,
    status ENUM('pendente', 'processando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    observacoes TEXT,
    forma_pagamento VARCHAR(50) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    ambiente VARCHAR(100) NULL,
    produto_id INT NULL,
    nome_customizado VARCHAR(255) NULL,
    codigo_customizado VARCHAR(100) NULL,
    descricao_customizada TEXT NULL,
    tamanho VARCHAR(100) NULL,
    cor VARCHAR(100) NULL,
    quantidade INT,
    preco_unitario DECIMAL(10, 2),
    subtotal DECIMAL(12, 2),
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logistica (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_rastreamento VARCHAR(100) UNIQUE,
    pedido_id INT NOT NULL,
    transportadora VARCHAR(100),
    endereco_origem VARCHAR(255),
    endereco_destino VARCHAR(255),
    data_envio DATE,
    data_entrega_prevista DATE,
    data_entrega_real DATE,
    status ENUM('aguardando', 'emtrancito', 'saiu_entrega', 'entregue', 'problema') DEFAULT 'aguardando',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    referencia_id INT,
    referencia_tipo VARCHAR(50),
    caminho_arquivo VARCHAR(255),
    data_criacao DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. AUTENTICAÇÃO E SESSÕES
-- =====================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    funcao VARCHAR(100) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    tentativas_falhas INT DEFAULT 0,
    bloqueado_ate DATETIME NULL,
    ultimo_acesso DATETIME NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabela de usuários do sistema Ideart ERP';

CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    ip_endereco VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_ativa (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabela de sessões de autenticação';

CREATE TABLE IF NOT EXISTS logs_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    ip_endereco VARCHAR(45),
    user_agent TEXT,
    resultado ENUM('sucesso', 'falha') DEFAULT 'sucesso',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_resultado (resultado),
    INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Log de acessos e ações do sistema';

CREATE TABLE IF NOT EXISTS tokens_recuperacao_senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(128) UNIQUE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_usado (usado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tokens para recuperação de senha';

CREATE TABLE IF NOT EXISTS filtros_salvos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contexto VARCHAR(100) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    valores JSON NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_filtros_contexto_nome (contexto, nome),
    INDEX idx_contexto (contexto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Conjuntos de filtros nomeados, compartilhados entre todos os usuários';

-- =====================================================================
-- 3. MIGRAÇÕES IDEMPOTENTES (bancos criados em versões anteriores)
-- =====================================================================
-- Cada bloco abaixo verifica o estado atual via information_schema
-- e só aplica o ALTER se for necessário. Seguro para rodar múltiplas vezes.

-- 3.1 produtos.fornecedor — adicionar coluna se não existir
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND COLUMN_NAME = 'fornecedor');
SET @sql := IF(@existe = 0,
    'ALTER TABLE produtos ADD COLUMN fornecedor VARCHAR(255) AFTER sku',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.2 produtos — garantir UNIQUE apenas em sku (descartar índices antigos se existirem)
SET @uk_legado := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'sku');
SET @sql := IF(@uk_legado > 0,
    'ALTER TABLE produtos DROP INDEX sku',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uk_composto := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'uk_produtos_sku_fornecedor');
SET @sql := IF(@uk_composto > 0,
    'ALTER TABLE produtos DROP INDEX uk_produtos_sku_fornecedor',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @uk_novo := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'uk_produtos_sku');
SET @sql := IF(@uk_novo = 0,
    'ALTER TABLE produtos ADD UNIQUE KEY uk_produtos_sku (sku)',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.3 orcamentos — colunas novas
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'profissional_id');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamentos ADD COLUMN profissional_id INT NULL AFTER cliente_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'forma_pagamento');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamentos ADD COLUMN forma_pagamento VARCHAR(50) NULL AFTER observacoes',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'assinatura');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamentos ADD COLUMN assinatura VARCHAR(255) NULL AFTER forma_pagamento',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'pedido_id');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamentos ADD COLUMN pedido_id INT NULL AFTER assinatura',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.4 orcamentos.status — garantir ENUM atualizado (ignora erro caso já esteja)
ALTER TABLE orcamentos
    MODIFY COLUMN status ENUM('pendente','aprovado','recusado','expirado','convertido') DEFAULT 'pendente';

-- 3.5 orcamento_itens — colunas customizadas + produto_id opcional
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'nome_customizado');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN nome_customizado VARCHAR(255) NULL AFTER produto_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'descricao_customizada');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN descricao_customizada TEXT NULL AFTER nome_customizado',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'ordem');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN ordem INT DEFAULT 0 AFTER subtotal',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE orcamento_itens MODIFY COLUMN produto_id INT NULL;

-- 3.5.1 orcamento_itens — ambiente / tamanho / cor / codigo_customizado (opcionais; aparecem no PDF/Excel)
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'ambiente');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN ambiente VARCHAR(100) NULL AFTER orcamento_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'codigo_customizado');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN codigo_customizado VARCHAR(100) NULL AFTER nome_customizado',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'tamanho');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN tamanho VARCHAR(100) NULL AFTER descricao_customizada',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND COLUMN_NAME = 'cor');
SET @sql := IF(@existe = 0,
    'ALTER TABLE orcamento_itens ADD COLUMN cor VARCHAR(100) NULL AFTER tamanho',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.6 pedidos — colunas novas
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'orcamento_id');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedidos ADD COLUMN orcamento_id INT NULL AFTER cliente_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'forma_pagamento');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedidos ADD COLUMN forma_pagamento VARCHAR(50) NULL AFTER observacoes',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.7 pedido_itens — colunas customizadas + produto_id opcional
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'nome_customizado');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN nome_customizado VARCHAR(255) NULL AFTER produto_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'descricao_customizada');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN descricao_customizada TEXT NULL AFTER nome_customizado',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'ordem');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN ordem INT DEFAULT 0 AFTER subtotal',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE pedido_itens MODIFY COLUMN produto_id INT NULL;

-- 3.7.1 pedido_itens — ambiente / tamanho / cor / codigo_customizado (replicados do orçamento de origem)
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'ambiente');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN ambiente VARCHAR(100) NULL AFTER pedido_id',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'codigo_customizado');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN codigo_customizado VARCHAR(100) NULL AFTER nome_customizado',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'tamanho');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN tamanho VARCHAR(100) NULL AFTER descricao_customizada',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND COLUMN_NAME = 'cor');
SET @sql := IF(@existe = 0,
    'ALTER TABLE pedido_itens ADD COLUMN cor VARCHAR(100) NULL AFTER tamanho',
    'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =====================================================================
-- 4. ÍNDICES (idempotentes)
-- =====================================================================

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clientes' AND INDEX_NAME = 'idx_cliente_email');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_cliente_email ON clientes(email)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = 'idx_produto_categoria');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_produto_categoria ON produtos(categoria)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamentos' AND INDEX_NAME = 'idx_orcamento_cliente');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_orcamento_cliente ON orcamentos(cliente_id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedidos' AND INDEX_NAME = 'idx_pedido_cliente');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_pedido_cliente ON pedidos(cliente_id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'logistica' AND INDEX_NAME = 'idx_logistica_pedido');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_logistica_pedido ON logistica(pedido_id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orcamento_itens' AND INDEX_NAME = 'idx_orcamento_itens_orcamento');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_orcamento_itens_orcamento ON orcamento_itens(orcamento_id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pedido_itens' AND INDEX_NAME = 'idx_pedido_itens_pedido');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_pedido_itens_pedido ON pedido_itens(pedido_id)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND INDEX_NAME = 'idx_username_ativo');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_username_ativo ON usuarios(username, ativo)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe := (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND INDEX_NAME = 'idx_email_ativo');
SET @sql := IF(@existe = 0, 'CREATE INDEX idx_email_ativo ON usuarios(email, ativo)', 'DO 0');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =====================================================================
-- 5. SEEDS
-- =====================================================================

-- 5.1 empresa_config — registro padrão (só insere se tabela estiver vazia)
INSERT INTO empresa_config (nome_fantasia, razao_social, email, telefone, endereco, cidade, estado)
SELECT 'Ideart', 'Ideart Comércio Ltda.', 'contato@ideart.com.br', '(11) 0000-0000',
       'Endereço da empresa', 'São Paulo', 'SP'
WHERE NOT EXISTS (SELECT 1 FROM empresa_config);

-- 5.2 Usuário administrador inicial
-- Senha inicial: "IdeartAdmin@2026" (bcrypt abaixo). O administrador DEVE trocar
-- a senha no primeiro acesso através do menu "Alterar Senha".
-- Cadastre os demais usuários pela aplicação depois de logar como admin.
INSERT IGNORE INTO usuarios (nome, email, username, senha, funcao, ativo) VALUES
('Administrador', 'admin@ideart.com', 'admin',
 '$2b$10$fpGthemVLIQgvIYc9mRGMu76krFxvi/5x5E9ZDu/WwacEZP4PZiia',
 'administrador', TRUE);
