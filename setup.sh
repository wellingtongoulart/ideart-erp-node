#!/bin/bash

# Script de Setup Rápido para Ideart ERP
# Execute: bash setup.sh (no terminal/git bash)

echo "=========================================="
echo "   Ideart - Setup Rápido"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}1. Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "   Baixe em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado: $(node -v)${NC}"

# 2. Verificar npm
echo ""
echo -e "${YELLOW}2. Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm encontrado: $(npm -v)${NC}"

# 3. Verificar MySQL
echo ""
echo -e "${YELLOW}3. Verificando MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}⚠️  MySQL não encontrado no PATH${NC}"
    echo "   Certifique-se que MySQL está instalado e rodando"
else
    echo -e "${GREEN}✅ MySQL encontrado${NC}"
fi

# 4. Instalar dependências
echo ""
echo -e "${YELLOW}4. Instalando dependências npm...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

# 5. Verificar .env
echo ""
echo -e "${YELLOW}5. Verificando configuração .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo "   Criando .env padrão..."
    cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ideart_erp
PORT=3000
EOF
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    echo "   ⚠️  Edite o arquivo .env com suas credenciais MySQL"
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
fi

# 6. Instruções finais
echo ""
echo "=========================================="
echo -e "${GREEN}Setup concluído com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure o arquivo .env com suas credenciais MySQL:"
echo "   nano .env  (ou use seu editor favorito)"
echo ""
echo "2. Crie a base de dados no MySQL:"
echo "   mysql -u root -p"
echo "   > CREATE DATABASE ideart_erp;"
echo ""
echo "3. Execute o script de setup:"
echo "   mysql -u root -p ideart_erp < setup.sql"
echo ""
echo "4. Inicie o servidor:"
echo "   npm start     (produção)"
echo "   npm run dev   (desenvolvimento com auto-reload)"
echo ""
echo "5. Acesse no navegador:"
echo "   http://localhost:3000"
echo ""
echo "=========================================="
