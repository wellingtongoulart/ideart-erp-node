// Script one-off: remove produtos com SKU duplicado, mantendo o mais antigo (menor id).
// Antes de deletar, reaponta referências em orcamento_itens e pedido_itens pro produto mantido.
//
// Uso:
//   node scripts/limpar-skus-duplicados.js           → dry-run (só mostra o que faria)
//   node scripts/limpar-skus-duplicados.js --apply   → executa as mudanças

const pool = require('../src/config/database');

const APLICAR = process.argv.includes('--apply');

async function main() {
    const connection = await pool.getConnection();

    try {
        const [grupos] = await connection.query(`
            SELECT sku, COUNT(*) AS total, MIN(id) AS id_manter, GROUP_CONCAT(id ORDER BY id) AS ids
            FROM produtos
            WHERE sku IS NOT NULL AND sku <> ''
            GROUP BY sku
            HAVING COUNT(*) > 1
        `);

        if (grupos.length === 0) {
            console.log('Nenhum SKU duplicado encontrado. Banco já está limpo.');
            return;
        }

        console.log(`Encontrados ${grupos.length} SKU(s) com duplicatas:\n`);

        let totalParaDeletar = 0;
        let totalReferenciasOrcamento = 0;
        let totalReferenciasPedido = 0;

        for (const g of grupos) {
            const ids = g.ids.split(',').map(Number);
            const idManter = g.id_manter;
            const idsDeletar = ids.filter(id => id !== idManter);
            totalParaDeletar += idsDeletar.length;

            const [refsOrc] = await connection.query(
                `SELECT COUNT(*) AS n FROM orcamento_itens WHERE produto_id IN (?)`,
                [idsDeletar]
            );
            const [refsPed] = await connection.query(
                `SELECT COUNT(*) AS n FROM pedido_itens WHERE produto_id IN (?)`,
                [idsDeletar]
            );
            totalReferenciasOrcamento += refsOrc[0].n;
            totalReferenciasPedido += refsPed[0].n;

            console.log(`  SKU "${g.sku}": manter id=${idManter}, deletar ids=[${idsDeletar.join(', ')}]`);
            if (refsOrc[0].n > 0) console.log(`    - ${refsOrc[0].n} item(ns) de orçamento serão reapontados`);
            if (refsPed[0].n > 0) console.log(`    - ${refsPed[0].n} item(ns) de pedido serão reapontados`);
        }

        console.log(`\nResumo:`);
        console.log(`  Produtos a deletar: ${totalParaDeletar}`);
        console.log(`  Referências em orcamento_itens a reapontar: ${totalReferenciasOrcamento}`);
        console.log(`  Referências em pedido_itens a reapontar: ${totalReferenciasPedido}`);

        if (!APLICAR) {
            console.log(`\n[DRY-RUN] Nada foi alterado. Rode com --apply para executar.`);
            return;
        }

        console.log(`\nExecutando limpeza...`);
        await connection.beginTransaction();

        try {
            for (const g of grupos) {
                const ids = g.ids.split(',').map(Number);
                const idManter = g.id_manter;
                const idsDeletar = ids.filter(id => id !== idManter);

                await connection.query(
                    `UPDATE orcamento_itens SET produto_id = ? WHERE produto_id IN (?)`,
                    [idManter, idsDeletar]
                );
                await connection.query(
                    `UPDATE pedido_itens SET produto_id = ? WHERE produto_id IN (?)`,
                    [idManter, idsDeletar]
                );
                await connection.query(
                    `DELETE FROM produtos WHERE id IN (?)`,
                    [idsDeletar]
                );
            }

            await connection.commit();
            console.log(`Limpeza concluída com sucesso.`);
        } catch (erro) {
            await connection.rollback();
            console.error(`Erro durante limpeza, transação revertida:`, erro.message);
            process.exitCode = 1;
        }
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(erro => {
    console.error('Falha:', erro.message);
    process.exitCode = 1;
});
