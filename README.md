# Ideart ERP - Sistema de Gerenciamento Empresarial

## 🎯 Sobre o Projeto

Ideart ERP é um sistema completo de gerenciamento empresarial desenvolvido com:
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js + Express.js
- **Banco de Dados:** MySQL
- **Autenticação:** Sistema de login integrado com sessão

O sistema inclui 8 módulos principais: Produtos, Orçamentos, Pedidos, Clientes, Profissionais, Logística, Documentos e Relatórios.

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 5.7 ou superior
- Navegador web moderno

### Instalação

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente** — copie `.env.example` para `.env` e preencha os valores:
```bash
cp .env.example .env
```

Gere um `JWT_SECRET` forte com:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

3. **Configurar banco de dados** — veja a seção [Configuração do Banco de Dados](#-configuração-do-banco-de-dados) abaixo.

4. **Iniciar o servidor**
```bash
npm start      # produção
npm run dev    # desenvolvimento (com auto-reload)
```

5. **Acessar a aplicação**
```
http://localhost:3000
```

## 🗄️ Configuração do Banco de Dados

Toda a configuração do schema está consolidada em **um único script idempotente**: [`setup.sql`](setup.sql). Ele cria as tabelas, índices, usuários iniciais e aplica automaticamente as migrações necessárias caso o banco já tenha sido criado em uma versão anterior.

### Passo a passo

**1. Criar a base de dados** (uma única vez):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ideart_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**2. Executar o setup**:

```bash
mysql -u root -p ideart_erp < setup.sql
```

Isto cria ou atualiza:
- Todas as tabelas de negócio (`clientes`, `produtos`, `orcamentos`, `pedidos`, `pedido_itens`, `orcamento_itens`, `profissionais`, `logistica`, `documentos`, `empresa_config`)
- Tabelas de autenticação (`usuarios`, `sessoes`, `logs_acesso`, `tokens_recuperacao_senha`)
- Índices de performance
- Registro inicial em `empresa_config`
- 1 usuário administrador inicial: `admin` / `IdeartAdmin@2026` — **troque esta senha no primeiro login** pelo menu "Alterar Senha"

**3. (Opcional) Popular com dados fictícios para testes**:

Em ambientes de desenvolvimento/demo, configure `SEED_EXAMPLE_DATA=true` no `.env` para que a aplicação insira produtos, clientes, pedidos e logística fictícios na primeira vez que subir o servidor com o banco vazio. Em produção, mantenha `SEED_EXAMPLE_DATA=false`.

### Re-executar o setup

O `setup.sql` pode ser executado novamente a qualquer momento para aplicar novas migrações sem perder dados existentes. Ele verifica o estado atual do banco via `information_schema` antes de cada alteração.

### Arquivos SQL do projeto

| Arquivo | Papel |
|---------|-------|
| [`setup.sql`](setup.sql) | **Obrigatório.** Schema completo + migrações + seeds essenciais (usuários, empresa). |
| [`setup-dados-exemplo.sql`](setup-dados-exemplo.sql) | Opcional. Dados fictícios para desenvolvimento/testes. |

## 🔐 Login

O `setup.sql` cria apenas um usuário administrador inicial:

| Usuário | Senha inicial |
|---------|--------------|
| `admin` | `IdeartAdmin@2026` |

⚠️ **Troque a senha no primeiro login** através do menu "Alterar Senha" no canto superior direito. Depois, cadastre os demais usuários pela aplicação.

A senha mínima do sistema é 10 caracteres.

## 📚 Documentação da API

Em desenvolvimento, a documentação OpenAPI fica em `http://localhost:3000/api-docs`. Em produção (`NODE_ENV=production`) o endpoint é desabilitado automaticamente.

## 📂 Estrutura do Projeto

```
ideart-erp-node/
├── public/
│   ├── login.html              # Página de login
│   ├── index.html              # Dashboard principal
│   ├── css/
│   │   ├── style.css           # Estilos principais
│   │   ├── login.css           # Estilos de login
│   │   └── sidebar.css         # Estilos da sidebar
│   └── js/
│       ├── app.js              # Lógica da aplicação
│       └── login.js            # Lógica de autenticação
│
├── src/
│   ├── server.js               # Servidor Express
│   ├── config/
│   │   └── database.js         # Configuração do banco
│   ├── controllers/
│   │   └── exemplo.controller.js
│   ├── models/                 # Modelos de dados
│   └── routes/                 # Rotas da API
│       ├── clientes.js
│       ├── produtos.js
│       ├── pedidos.js
│       ├── orcamentos.js
│       ├── profissionais.js
│       ├── logistica.js
│       ├── documentos.js
│       └── relatorios.js
│
├── package.json                # Dependências do projeto
├── setup.sql                   # Script SQL único (schema + migrações + seeds)
├── setup-dados-exemplo.sql     # Dados fictícios (opcional)
└── README.md                   # Este arquivo
```

## ✨ Funcionalidades Principais

### Autenticação e Segurança
- ✅ Login com username/senha
- ✅ Armazenamento seguro de credenciais
- ✅ Account lockout (5 tentativas = 15 min)
- ✅ Sessão com expiração (8 horas)
- ✅ Recurso "Lembrar-me" (30 dias)
- ✅ Proteção de rotas

### Interface de Usuário
- ✅ Dashboard responsivo
- ✅ Sidebar com 8 módulos
- ✅ Perfil de usuário personalizado
- ✅ Dropdown menu
- ✅ Dark mode automático
- ✅ Acessibilidade garantida

### Módulos do Sistema
1. **Dashboard** - Estatísticas e atividades
2. **Produtos** - Gerenciamento de produtos
3. **Orçamentos** - Controle de orçamentos
4. **Pedidos** - Gestão de pedidos
5. **Clientes** - Cadastro de clientes
6. **Profissionais** - Gestão de profissionais
7. **Logística** - Controle de entrega
8. **Documentos** - Armazenamento de documentos
9. **Relatórios** - Geração de relatórios

## 🎨 Design e UX

### Cores
- Primária: #0066cc (Azul)
- Secundária: #003d99 (Azul escuro)
- Destaque: #06a77d (Verde)
- Erro: #d32f2f (Vermelho)

### Responsividade
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (< 768px)

## 🔧 Configuração

### Variáveis de ambiente

Veja [`.env.example`](.env.example) para a lista completa. Todas as variáveis abaixo são **obrigatórias** — o servidor recusa subir sem elas.

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | `development` ou `production` |
| `PORT` | Porta HTTP do Node (padrão 3000) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão MySQL |
| `JWT_SECRET` | Chave de assinatura do JWT (mín. 48 caracteres aleatórios) |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula |
| `APP_BASE_URL` | (opcional) URL pública da API, usada no Swagger |
| `SEED_EXAMPLE_DATA` | (opcional) `true` para popular dados fictícios em dev |

## 📝 Scripts Disponíveis

```bash
npm start        # produção
npm run dev      # desenvolvimento com auto-reload
npm run db:setup # roda setup.sql no banco configurado em .env
```

## 🐛 Troubleshooting

### Erro: "Porta 3000 já está em uso"
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Módulos não encontrados"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Conexão com banco de dados"
Verifique credenciais em `.env` e se MySQL está rodando.

## 🔐 Segurança

### Implementado
- ✅ Autenticação JWT em todas as rotas protegidas
- ✅ Bcrypt (salt rounds = 10) para hash de senhas
- ✅ Rate limiting nos endpoints de login e recuperação de senha
- ✅ Helmet (headers de segurança: X-Frame-Options, HSTS, etc.)
- ✅ CORS com allowlist configurável por `CORS_ORIGIN`
- ✅ Queries SQL parametrizadas (proteção contra SQL injection)
- ✅ Senha mínima de 10 caracteres
- ✅ Swagger desabilitado em `NODE_ENV=production`
- ✅ Validação de variáveis de ambiente obrigatórias no startup
- ✅ Middleware global de erro (sem vazar stack trace em produção)
- ✅ Graceful shutdown (SIGTERM/SIGINT)

### Para deploy público, ainda é sua responsabilidade
- Configurar HTTPS via reverse proxy (Nginx/Caddy + Let's Encrypt)
- Criar um usuário MySQL dedicado (não use `root`)
- Configurar backup periódico do banco (ver seção Deploy)
- Manter dependências atualizadas (`npm audit` regularmente)

## 🚢 Deploy em produção

Este guia cobre o cenário recomendado: **VPS Linux + Nginx + PM2 + MySQL**, com aplicação exposta via HTTPS num domínio público.

### 1. Preparar o servidor

```bash
# Ubuntu 22.04
sudo apt update && sudo apt install -y nginx mysql-server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Criar o banco e o usuário MySQL dedicado

```sql
CREATE DATABASE ideart_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ideart_erp'@'localhost' IDENTIFIED BY '<senha-forte-aqui>';
GRANT ALL PRIVILEGES ON ideart_erp.* TO 'ideart_erp'@'localhost';
FLUSH PRIVILEGES;
```

Depois carregue o schema:
```bash
mysql -u ideart_erp -p ideart_erp < setup.sql
```

### 3. Configurar a aplicação

```bash
git clone <repo-url> /opt/ideart-erp
cd /opt/ideart-erp
npm ci --omit=dev
cp .env.example .env
# edite .env com os valores de produção:
# NODE_ENV=production
# DB_USER=ideart_erp
# DB_PASSWORD=<a senha criada acima>
# JWT_SECRET=<gerar com crypto.randomBytes(48).toString('hex')>
# CORS_ORIGIN=https://erp.seudominio.com.br
# APP_BASE_URL=https://erp.seudominio.com.br
# SEED_EXAMPLE_DATA=false
```

### 4. Subir com PM2

```bash
pm2 start src/server.js --name ideart-erp
pm2 save
pm2 startup    # siga as instruções que aparecerem
```

Rotação de logs (evita encher o disco):
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
```

### 5. Nginx + HTTPS (Let's Encrypt)

Arquivo `/etc/nginx/sites-available/ideart-erp`:
```nginx
server {
    listen 80;
    server_name erp.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative e emita o certificado:
```bash
sudo ln -s /etc/nginx/sites-available/ideart-erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d erp.seudominio.com.br
```

### 6. Backup diário

Crie `/opt/ideart-erp/backup.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
DEST=/opt/backups/ideart-erp
mkdir -p "$DEST"
STAMP=$(date +%Y%m%d-%H%M%S)
mysqldump -u ideart_erp -p"$DB_PASSWORD" ideart_erp | gzip > "$DEST/ideart_erp-$STAMP.sql.gz"
# mantém 14 dias
find "$DEST" -name '*.sql.gz' -mtime +14 -delete
```

Torne executável e adicione ao crontab:
```bash
chmod +x /opt/ideart-erp/backup.sh
(crontab -l 2>/dev/null; echo "0 3 * * * DB_PASSWORD='<senha>' /opt/ideart-erp/backup.sh") | crontab -
```

**Teste o restore periodicamente** — backup que nunca foi restaurado não é backup. Recomenda-se enviar cópia dos dumps para um bucket S3/B2 off-site.

### 7. Health check

`GET /health` retorna `200` se o Node e o MySQL estão respondendo. Use no monitoramento do Nginx ou em um uptime checker externo (ex: UptimeRobot gratuito).

### 8. Atualizações

```bash
cd /opt/ideart-erp
git pull
npm ci --omit=dev
mysql -u ideart_erp -p ideart_erp < setup.sql  # idempotente — aplica migrações
pm2 reload ideart-erp
```

## 📄 Licença

Este projeto está sob a licença MIT.