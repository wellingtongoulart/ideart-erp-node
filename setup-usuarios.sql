-- =====================================================
-- TABELA DE USUÁRIOS - Ideart ERP
-- =====================================================

-- Criar tabela de usuários
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de usuários do sistema Ideart ERP';

-- =====================================================
-- INSERIR USUÁRIOS DE EXEMPLO
-- =====================================================

-- Usuários de teste (senhas criptografadas com bcrypt)
-- Usuário: admin / Senha: admin@123
INSERT INTO usuarios (nome, email, username, senha, funcao, ativo) VALUES
(
    'Administrador',
    'admin@ideart.com',
    'admin',
    '$2b$10$Pluy2AM7.8GyFdeYEZgl9uINFSl5iYTTo33c.9fEfKKncMD3k7faK',
    'administrador',
    TRUE
);

-- Usuário: vendedor / Senha: vendedor@123
INSERT INTO usuarios (nome, email, username, senha, funcao, ativo) VALUES
(
    'Vendedor Padrão',
    'vendedor@ideart.com',
    'vendedor',
    '$2b$10$yNKgLNLau.RV8OMQoDYKI.c65GAH8Tk/jQlAgCg3GmuI0xfgDbg6.',
    'vendedor',
    TRUE
);

-- Usuário: gerente / Senha: gerente@123
INSERT INTO usuarios (nome, email, username, senha, funcao, ativo) VALUES
(
    'Gerente Sistema',
    'gerente@ideart.com',
    'gerente',
    '$2b$10$qdczowFRzQCVHQ1O8kGobelt1Hzg9W79WaBk4yIWNsWH2qUUxR7Ri',
    'gerente',
    TRUE
);

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices já foram criados na definição da tabela
-- Adicionar índice composto para busca rápida
ALTER TABLE usuarios ADD INDEX idx_username_ativo (username, ativo);
ALTER TABLE usuarios ADD INDEX idx_email_ativo (email, ativo);

-- =====================================================
-- CRIAR TABELA DE SESSÕES (OPCIONAL)
-- =====================================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de sessões de autenticação';

-- =====================================================
-- CRIAR TABELA DE LOGS DE ACESSO
-- =====================================================

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de acessos e ações do sistema';

-- =====================================================
-- QUERIES ÚTEIS PARA MANIPULAÇÃO
-- =====================================================

-- Atualizar senha de um usuário (após criptografia)
-- UPDATE usuarios SET senha = '[senha_criptografada]' WHERE username = 'username';

-- Desbloquear usuário
-- UPDATE usuarios SET tentativas_falhas = 0, bloqueado_ate = NULL WHERE id = 1;

-- Verificar usuários ativos
-- SELECT id, nome, email, username, funcao, ativo, ultimo_acesso FROM usuarios WHERE ativo = TRUE ORDER BY ultimo_acesso DESC;

-- Limpar sessões expiradas
-- DELETE FROM sessoes WHERE data_expiracao < NOW() OR ativo = FALSE;
