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
- Node.js 14+ instalado
- npm ou yarn
- Navegador web moderno

### Instalação

1. **Clonar o repositório**
```bash
cd ideart-erp-node
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar banco de dados** — veja a seção [Configuração do Banco de Dados](#-configuração-do-banco-de-dados) abaixo.

4. **Configurar variáveis de ambiente** — criar um arquivo `.env` na raiz (ver [Environment Variables](#environment-variables)).

5. **Iniciar o servidor**
```bash
npm start
```

6. **Acessar a aplicação**
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
- 3 usuários padrão: `admin`, `vendedor`, `gerente`

**3. (Opcional) Popular com dados fictícios para testes**:

```bash
mysql -u root -p ideart_erp < setup-dados-exemplo.sql
```

Insere produtos, clientes, profissionais, orçamentos, pedidos e logística de exemplo. Também é idempotente (usa `INSERT IGNORE`).

### Re-executar o setup

O `setup.sql` pode ser executado novamente a qualquer momento para aplicar novas migrações sem perder dados existentes. Ele verifica o estado atual do banco via `information_schema` antes de cada alteração.

### Arquivos SQL do projeto

| Arquivo | Papel |
|---------|-------|
| [`setup.sql`](setup.sql) | **Obrigatório.** Schema completo + migrações + seeds essenciais (usuários, empresa). |
| [`setup-dados-exemplo.sql`](setup-dados-exemplo.sql) | Opcional. Dados fictícios para desenvolvimento/testes. |

## 🔐 Login

O `setup.sql` cria três usuários padrão: `admin`, `vendedor` e `gerente`. As senhas iniciais estão com hash bcrypt no script — consulte a equipe do projeto para obter as senhas em claro, ou redefina-as via fluxo de recuperação de senha.

## 📚 Documentação

### Documentos Principais
- [LOGIN_INTEGRACAO.md](LOGIN_INTEGRACAO.md) - Documentação técnica do sistema de login
- [GUIA_LOGIN.md](GUIA_LOGIN.md) - Guia de uso da tela de login
- [STATUS_FINAL.md](STATUS_FINAL.md) - Status e checklist de implementação
- [RESUMO_LOGIN.md](RESUMO_LOGIN.md) - Resumo executivo da implementação

### Outros Documentos
- [GUIA_USO.md](GUIA_USO.md) - Guia completo de uso do sistema
- [INICIO_RAPIDO.md](INICIO_RAPIDO.md) - Início rápido
- [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md) - Guia de desenvolvimento
- [TESTES_API.md](TESTES_API.md) - Testes de API

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

### Environment Variables
Criar arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ideart_erp
```

## 📝 Scripts Disponíveis

```bash
# Iniciar servidor em desenvolvimento
npm start

# Iniciar com nodemon (auto-reload)
npm run dev

# Executar testes
npm test
```

## 🧪 Testando a Aplicação

### Teste de Login
1. Acesse http://localhost:3000
2. Use credenciais: admin / 123456
3. Você deve ser redirecionado para o dashboard

### Teste de "Lembrar-me"
1. Na página de login, marque "Lembrar-me"
2. Faça login
3. Faça logout
4. Volte para login.html
5. O username deve estar pré-preenchido

### Teste de Account Lockout
1. Tente fazer login com senha errada 5 vezes
2. A conta deve ser bloqueada por 15 minutos

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
- ✅ Validação de entrada
- ✅ Account lockout
- ✅ Session timeout
- ✅ Codificação base64 para credenciais
- ✅ Proteção de rotas

### Recomendado para Produção
- [ ] HTTPS obrigatório
- [ ] JWT tokens
- [ ] httpOnly cookies
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] SQL injection prevention
- [ ] 2FA (Two-Factor Authentication)

## 📊 Estatísticas do Projeto

| Item | Quantidade |
|------|-----------|
| Arquivos criados | 3 |
| Arquivos modificados | 2 |
| Linhas de código | 1800+ |
| Documentação | 7 arquivos |
| Módulos | 8 |
| Tabelas (DB) | 9 |

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ usando:
- Node.js
- Express.js
- MySQL
- Vanilla JavaScript

## 📞 Suporte

Para dúvidas ou sugestões, consulte:
- Documentação: Verifique os arquivos `.md` na pasta raiz
- Código: Veja comentários no código-fonte
- Issues: Abra uma issue com sua dúvida

## 🗺️ Roadmap

### v1.0 (Atual)
- ✅ Sistema de login com autenticação
- ✅ Dashboard com 8 módulos
- ✅ Interface responsiva
- ✅ Dark mode
- ✅ Documentação completa

### v1.1 (Próximo)
- [ ] Página de "Esqueci a Senha"
- [ ] Edição de perfil de usuário
- [ ] Configurações pessoais
- [ ] Backend de autenticação real

### v2.0 (Futuro)
- [ ] JWT tokens
- [ ] 2FA
- [ ] API REST completa
- [ ] Relatórios avançados
- [ ] Mobile app

## 🙏 Agradecimentos

Obrigado por usar o Ideart ERP!

---

**Versão:** 1.0  
**Última Atualização:** 17 de Janeiro de 2024  
**Status:** ✅ Funcional