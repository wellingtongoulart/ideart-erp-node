// Aplica a troca de índice único em produtos: dropa índices antigos (sku, uk_produtos_sku_fornecedor)
// e cria uk_produtos_sku (sku). Seguro para rodar múltiplas vezes.

const pool = require('../src/config/database');

async function indiceExiste(connection, nome) {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS n FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produtos' AND INDEX_NAME = ?`,
        [nome]
    );
    return rows[0].n > 0;
}

async function main() {
    const connection = await pool.getConnection();

    try {
        if (await indiceExiste(connection, 'sku')) {
            await connection.query('ALTER TABLE produtos DROP INDEX sku');
            console.log('Removido índice legado: sku');
        }

        if (await indiceExiste(connection, 'uk_produtos_sku_fornecedor')) {
            await connection.query('ALTER TABLE produtos DROP INDEX uk_produtos_sku_fornecedor');
            console.log('Removido índice composto: uk_produtos_sku_fornecedor');
        }

        if (!(await indiceExiste(connection, 'uk_produtos_sku'))) {
            await connection.query('ALTER TABLE produtos ADD UNIQUE KEY uk_produtos_sku (sku)');
            console.log('Criado índice único: uk_produtos_sku (sku)');
        } else {
            console.log('Índice uk_produtos_sku já existe, nada a fazer.');
        }

        console.log('Migração concluída.');
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(erro => {
    console.error('Falha:', erro.message);
    process.exitCode = 1;
});
