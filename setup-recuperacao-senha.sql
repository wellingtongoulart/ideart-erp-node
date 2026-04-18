-- =====================================================
-- TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA - Ideart ERP
-- =====================================================
-- Armazena tokens temporários para redefinição de senha.
-- Criada automaticamente pelo servidor na inicialização
-- (src/config/inicializar-dados.js), mas mantida aqui
-- como referência e para setup manual quando necessário.

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens para recuperação de senha';
