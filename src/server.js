require('dotenv').config();

// Validação das variáveis de ambiente obrigatórias — falha rápido no boot
// se o servidor subir em estado inconsistente.
const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'CORS_ORIGIN'];
const faltando = REQUIRED_ENV.filter((k) => !process.env[k]);
if (faltando.length > 0) {
    console.error(`[FATAL] Variáveis de ambiente obrigatórias ausentes: ${faltando.join(', ')}`);
    console.error('Copie .env.example para .env e preencha os valores.');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const inicializarDados = require('./config/inicializar-dados');
const pool = require('./config/database');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: false // o frontend usa CDN (FontAwesome, Chart.js); reforçar depois se quiser
}));

const allowedOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        // requisições same-origin e ferramentas locais (curl/Postman) não enviam Origin
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origem ${origin} não permitida pelo CORS`));
    },
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Rate limit agressivo para tentativas de login e fluxos de senha — o lockout
// por usuário já existe, isso cobre ataques distribuídos ou por IP rotativo.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { sucesso: false, mensagem: 'Muitas tentativas. Tente novamente em alguns minutos.' }
});

// Documentação da API (apenas fora de produção)
if (!isProduction) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
}

// Health check para monitoramento e reverse proxy
app.get('/health', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        await conn.query('SELECT 1');
        conn.release();
        return res.json({ status: 'ok', db: 'ok' });
    } catch (erro) {
        return res.status(503).json({ status: 'degraded', db: 'erro' });
    }
});

// Rotas
const autenticar = require('./middlewares/autenticar');
const produtosRoutes = require('./routes/produtos');
const orcamentosRoutes = require('./routes/orcamentos');
const pedidosRoutes = require('./routes/pedidos');
const clientesRoutes = require('./routes/clientes');
const profissionaisRoutes = require('./routes/profissionais');
const logisticaRoutes = require('./routes/logistica');
const documentosRoutes = require('./routes/documentos');
const relatoriosRoutes = require('./routes/relatorios');
const dashboardRoutes = require('./routes/dashboard');
const autenticacaoRoutes = require('./routes/autenticacao');
const filtrosSalvosRoutes = require('./routes/filtrosSalvos');

// Aplica rate limit nos endpoints públicos de auth (login + recuperação de senha).
// O próprio roteador de autenticação decide, endpoint por endpoint, quais exigem JWT.
app.use('/api/autenticacao', authLimiter, autenticacaoRoutes);

// Todas as demais rotas da API exigem JWT válido.
app.use('/api/produtos', autenticar, produtosRoutes);
app.use('/api/orcamentos', autenticar, orcamentosRoutes);
app.use('/api/pedidos', autenticar, pedidosRoutes);
app.use('/api/clientes', autenticar, clientesRoutes);
app.use('/api/profissionais', autenticar, profissionaisRoutes);
app.use('/api/logistica', autenticar, logisticaRoutes);
app.use('/api/documentos', autenticar, documentosRoutes);
app.use('/api/relatorios', autenticar, relatoriosRoutes);
app.use('/api/dashboard', autenticar, dashboardRoutes);
app.use('/api/filtros-salvos', autenticar, filtrosSalvosRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 para /api/*
app.use('/api', (req, res) => {
    res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

// Middleware global de erro — captura exceções não tratadas nos handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[erro não tratado]', err);
    const status = err.status || 500;
    res.status(status).json({
        sucesso: false,
        mensagem: isProduction ? 'Erro interno do servidor' : (err.message || 'Erro interno do servidor')
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor Ideart ERP rodando na porta ${PORT} (${process.env.NODE_ENV || 'development'})`);
    inicializarDados().catch(() => {
        console.warn('Aviso: inicialização de dados não pôde ser concluída (verifique a conexão com o MySQL).');
    });
});

// Graceful shutdown — fecha o servidor HTTP e o pool do MySQL antes de sair.
// Necessário para reinícios limpos do PM2/systemd sem conexões órfãs.
function shutdown(signal) {
    console.log(`[${signal}] Encerrando servidor...`);
    server.close((err) => {
        if (err) {
            console.error('Erro ao fechar servidor HTTP:', err);
            process.exit(1);
        }
        pool.end().then(() => {
            console.log('Pool do MySQL encerrado. Saindo.');
            process.exit(0);
        }).catch((e) => {
            console.error('Erro ao encerrar pool:', e);
            process.exit(1);
        });
    });

    // Hard exit caso algo trave — 10s é mais que suficiente.
    setTimeout(() => {
        console.error('Shutdown demorou demais, forçando exit.');
        process.exit(1);
    }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
