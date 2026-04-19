-- =====================================================================
-- Ideart ERP — Dados de exemplo (OPCIONAL)
-- =====================================================================
-- Popula o banco com produtos, clientes, profissionais, orçamentos,
-- pedidos e logística fictícios para facilitar testes manuais.
--
-- Pré-requisito: rodar setup.sql antes.
-- Uso:
--   mysql -u root -p ideart_erp < setup-dados-exemplo.sql
--
-- Idempotente: INSERT IGNORE evita duplicar registros já cadastrados.
-- =====================================================================

USE ideart_erp;

-- Produtos
INSERT IGNORE INTO produtos (nome, descricao, categoria, preco_custo, preco_venda, estoque, sku, fornecedor, ativo) VALUES
('Notebook Dell XPS 13',       'Notebook de alta performance com processador Intel Core i7, 16GB RAM, 512GB SSD', 'Eletrônicos', 2500.00, 4500.00, 15, 'DELL-XPS13-001',    'Dell',     TRUE),
('Monitor LG 27 polegadas',    'Monitor LED 27 polegadas, resolução 4K, painel IPS',                             'Eletrônicos',  800.00, 1200.00,  8, 'LG-MON27-002',      'LG',       TRUE),
('Teclado Mecânico RGB',       'Teclado mecânico com iluminação RGB, switches Blue, USB',                        'Periféricos',  150.00,  299.99, 25, 'MECAN-RGB-003',     'Redragon', TRUE),
('Mouse Gamer Logitech',       'Mouse gamer wireless com bateria de longa duração, 8 botões programáveis',       'Periféricos',   80.00,  199.99, 30, 'LOGIT-MOUSE-004',   'Logitech', TRUE),
('Webcam Full HD',             'Webcam Full HD com microfone integrado para streaming',                          'Periféricos',  100.00,  249.99, 12, 'WEBCAM-FHD-005',    'Logitech', TRUE),
('SSD 1TB Samsung',            'SSD 1TB NVMe M.2, leitura até 3500MB/s',                                         'Armazenamento',300.00,  499.99, 20, 'SAMSUNG-1TB-006',   'Samsung',  TRUE),
('Memória RAM 16GB',           'Memória RAM DDR4 16GB 3200MHz, para desktop',                                    'Componentes',  200.00,  350.00, 18, 'RAM-DDR4-16GB-007', 'Kingston', TRUE),
('Gabinete Gamer',             'Gabinete ATX com vidro temperado, suporte para até 6 ventiladores',              'Componentes',  250.00,  499.99, 10, 'GABINETE-007-008',  'Cooler Master', TRUE),
('Headset HyperX Cloud',       'Headset wireless com microfone redução de ruído, 50h de bateria',                'Áudio',        120.00,  349.99, 14, 'HYPERX-CLOUD-009',  'HyperX',   TRUE),
('Mousepad Grande XL',         'Mousepad XXL com base antiderrapante, 800x300mm',                                'Periféricos',   30.00,   79.99, 50, 'MOUSEPAD-XL-010',   'Redragon', TRUE),
('Notebook Lenovo ThinkPad',   'Notebook ThinkPad com processador AMD Ryzen 5, 8GB RAM, 256GB SSD',              'Eletrônicos', 1800.00, 2999.99,  7, 'LENOVO-TP-011',     'Lenovo',   TRUE),
('Monitor 144Hz Gaming',       'Monitor gaming 24 polegadas, 144Hz, tempo de resposta 1ms',                      'Eletrônicos',  600.00,  999.99,  6, 'GAMIN-144HZ-012',   'AOC',      TRUE);

-- Clientes
INSERT IGNORE INTO clientes (nome, email, telefone, endereco, cidade, estado, cep) VALUES
('João Silva',     'joao@email.com',   '(11) 98765-4321', 'Rua A, 123', 'São Paulo',      'SP', '01310100'),
('Maria Santos',   'maria@email.com',  '(11) 99876-5432', 'Rua B, 456', 'São Paulo',      'SP', '01310200'),
('Pedro Oliveira', 'pedro@email.com',  '(21) 98765-1234', 'Rua C, 789', 'Rio de Janeiro', 'RJ', '20040020'),
('Ana Costa',      'ana@email.com',    '(31) 97654-3210', 'Rua D, 321', 'Belo Horizonte', 'MG', '30140071'),
('Carlos Mendes',  'carlos@email.com', '(41) 96543-2109', 'Rua E, 654', 'Curitiba',       'PR', '80010000');

-- Profissionais
INSERT IGNORE INTO profissionais (nome, especialidade, email, telefone, cpf, data_admissao, salario) VALUES
('Carlos Developer', 'Desenvolvimento', 'carlos@empresa.com',   '(11) 98765-4321', '12345678901', '2023-01-15', 6000.00),
('Ana Designer',     'Design',          'ana@empresa.com',      '(11) 99876-5432', '23456789012', '2023-02-01', 5000.00),
('Roberto Gerente',  'Gestão',          'roberto@empresa.com',  '(21) 98765-1234', '34567890123', '2022-11-10', 7000.00),
('Fernanda QA',      'Testes',          'fernanda@empresa.com', '(31) 97654-3210', '45678901234', '2023-03-20', 4500.00),
('Lucas DevOps',     'Infraestrutura',  'lucas@empresa.com',    '(41) 96543-2109', '56789012345', '2023-04-05', 6500.00);

-- Orçamentos
INSERT IGNORE INTO orcamentos (numero, cliente_id, data_criacao, data_validade, valor_total, desconto, status) VALUES
('ORC-2026-001', 1, '2026-01-15', '2026-02-15', 5000.00, 500.00, 'pendente'),
('ORC-2026-002', 2, '2026-01-16', '2026-02-16', 3200.00,   0.00, 'aprovado'),
('ORC-2026-003', 3, '2026-01-13', '2026-02-13', 7500.00, 750.00, 'recusado');

-- Pedidos
INSERT IGNORE INTO pedidos (numero, cliente_id, data_pedido, data_entrega_prevista, valor_total, desconto, status) VALUES
('PED-2026-001', 1, '2026-01-17', '2026-02-17', 4500.00,   0.00, 'processando'),
('PED-2026-002', 2, '2026-01-16', '2026-02-16', 2300.00,   0.00, 'entregue'),
('PED-2026-003', 3, '2026-01-15', '2026-02-15', 6800.00, 500.00, 'enviado');

-- Logística
INSERT IGNORE INTO logistica (numero_rastreamento, pedido_id, transportadora, endereco_origem, endereco_destino, data_envio, data_entrega_prevista, status) VALUES
('SEDEX-2026-001', 1, 'Sedex', 'São Paulo, SP', 'Rio de Janeiro, RJ',  '2026-01-17', '2026-02-17', 'emtrancito'),
('PAC-2026-002',   2, 'PAC',   'São Paulo, SP', 'Belo Horizonte, MG',  '2026-01-15', '2026-02-16', 'entregue'),
('LOGGI-2026-003', 3, 'Loggi', 'São Paulo, SP', 'Brasília, DF',        '2026-01-15', '2026-02-15', 'saiu_entrega');
