const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const inicializarDados = require('./config/inicializar-dados');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
const produtosRoutes = require('./routes/produtos');
const orcamentosRoutes = require('./routes/orcamentos');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');
const profissionaisRoutes = require('./routes/profissionais');
const logisticaRoutes = require('./routes/logistica');
const documentosRoutes = require('./routes/documentos');
const relatoriosRoutes = require('./routes/relatorios');
const autenticacaoRoutes = require('./routes/autenticacao');

app.use('/api/produtos', produtosRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/logistica', logisticaRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/autenticacao', autenticacaoRoutes);

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Ideart ERP rodando em http://localhost:${PORT}`);
    
    // Inicializar dados de exemplo (não bloqueia a inicialização se falhar)
    inicializarDados().catch(erro => {
        console.warn('⚠ Não foi possível carregar dados de exemplo (verifique a conexão com MySQL)');
    });
});

module.exports = app;
