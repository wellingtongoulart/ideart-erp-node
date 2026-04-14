require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ideart_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;

// Testar conexão na inicialização
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ ERRO AO CONECTAR AO MYSQL:');
        console.error('Verifique se o MySQL está rodando e se os dados no arquivo .env estão corretos.');
        console.error('Erro detalhado:', err.message);
    });
