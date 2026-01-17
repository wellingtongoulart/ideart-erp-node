#!/bin/bash

# 📋 CHECKLIST DE VERIFICAÇÃO - IDEART ERP
# Execute este script para verificar se tudo está funcionando

echo "=========================================="
echo "   Ideart ERP - Checklist de Verificação"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variáveis
passed=0
failed=0

# Função para testar arquivo
test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((passed++))
    else
        echo -e "${RED}❌${NC} $2 (FALTANDO: $1)"
        ((failed++))
    fi
}

# Função para testar diretório
test_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        ((passed++))
    else
        echo -e "${RED}❌${NC} $2 (FALTANDO: $1)"
        ((failed++))
    fi
}

echo -e "${YELLOW}1. Verificando Estrutura de Diretórios...${NC}"
test_dir "public" "Pasta public/"
test_dir "src" "Pasta src/"
test_dir "public/css" "Pasta public/css/"
test_dir "public/js" "Pasta public/js/"
test_dir "src/config" "Pasta src/config/"
test_dir "src/routes" "Pasta src/routes/"
test_dir "src/controllers" "Pasta src/controllers/"
echo ""

echo -e "${YELLOW}2. Verificando Arquivos de Configuração...${NC}"
test_file "package.json" "package.json"
test_file ".env" ".env"
test_file ".gitignore" ".gitignore"
test_file "setup.sql" "setup.sql"
echo ""

echo -e "${YELLOW}3. Verificando Arquivos Frontend...${NC}"
test_file "public/index.html" "public/index.html"
test_file "public/css/style.css" "public/css/style.css"
test_file "public/css/sidebar.css" "public/css/sidebar.css"
test_file "public/js/app.js" "public/js/app.js"
echo ""

echo -e "${YELLOW}4. Verificando Backend...${NC}"
test_file "src/server.js" "src/server.js"
test_file "src/config/database.js" "src/config/database.js"
echo ""

echo -e "${YELLOW}5. Verificando Rotas de API...${NC}"
test_file "src/routes/produtos.js" "src/routes/produtos.js"
test_file "src/routes/orcamentos.js" "src/routes/orcamentos.js"
test_file "src/routes/pedidos.js" "src/routes/pedidos.js"
test_file "src/routes/clientes.js" "src/routes/clientes.js"
test_file "src/routes/profissionais.js" "src/routes/profissionais.js"
test_file "src/routes/logistica.js" "src/routes/logistica.js"
test_file "src/routes/documentos.js" "src/routes/documentos.js"
test_file "src/routes/relatorios.js" "src/routes/relatorios.js"
echo ""

echo -e "${YELLOW}6. Verificando Controllers...${NC}"
test_file "src/controllers/exemplo.controller.js" "src/controllers/exemplo.controller.js"
echo ""

echo -e "${YELLOW}7. Verificando Documentação...${NC}"
test_file "README.md" "README.md"
test_file "INICIO_RAPIDO.md" "INICIO_RAPIDO.md"
test_file "GUIA_USO.md" "GUIA_USO.md"
test_file "DESENVOLVIMENTO.md" "DESENVOLVIMENTO.md"
test_file "TESTES_API.md" "TESTES_API.md"
test_file "CONFIGURACOES_AVANCADAS.md" "CONFIGURACOES_AVANCADAS.md"
test_file "VISUAL_SISTEMA.md" "VISUAL_SISTEMA.md"
test_file "RESUMO_PROJETO.md" "RESUMO_PROJETO.md"
test_file "INVENTARIO.md" "INVENTARIO.md"
test_file "CONCLUSAO.md" "CONCLUSAO.md"
test_file "SUMARIO_EXECUTIVO.md" "SUMARIO_EXECUTIVO.md"
echo ""

echo -e "${YELLOW}8. Verificando Dependências...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} npm dependencies instaladas"
    ((passed++))
else
    echo -e "${YELLOW}⚠️${NC} npm dependencies NÃO instaladas (execute: npm install)"
fi
echo ""

echo -e "${YELLOW}9. Verificando Arquivo .env...${NC}"
if grep -q "DB_HOST" .env 2>/dev/null; then
    echo -e "${GREEN}✅${NC} .env configurado"
    ((passed++))
else
    echo -e "${YELLOW}⚠️${NC} .env não configurado (edite com suas credenciais MySQL)"
fi
echo ""

echo -e "${YELLOW}10. Verificando Integridade de Arquivo...${NC}"
if [ -s "setup.sql" ]; then
    echo -e "${GREEN}✅${NC} setup.sql tem conteúdo"
    ((passed++))
else
    echo -e "${RED}❌${NC} setup.sql está vazio"
    ((failed++))
fi

if [ -s "package.json" ]; then
    echo -e "${GREEN}✅${NC} package.json tem conteúdo"
    ((passed++))
else
    echo -e "${RED}❌${NC} package.json está vazio"
    ((failed++))
fi
echo ""

# Resultado Final
echo "=========================================="
echo -e "${GREEN}✅ PASSARAM: $passed${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}❌ FALHARAM: $failed${NC}"
else
    echo -e "${GREEN}❌ FALHARAM: $failed${NC}"
fi
echo "=========================================="
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 TUDO OK! Sistema pronto para usar!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Configure o arquivo .env com suas credenciais MySQL"
    echo "2. Execute: npm install"
    echo "3. Crie o banco de dados: CREATE DATABASE ideart_erp;"
    echo "4. Execute o script SQL: mysql -u root -p ideart_erp < setup.sql"
    echo "5. Inicie o servidor: npm run dev"
    echo "6. Acesse: http://localhost:3000"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Alguns arquivos estão faltando!${NC}"
    echo ""
    echo "Verifique:"
    echo "- Se o projeto foi clonado/extraído corretamente"
    echo "- Se todos os arquivos estão no lugar correto"
    echo "- Se não houve erro de download"
    echo ""
    exit 1
fi
