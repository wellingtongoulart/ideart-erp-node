// Corrige mojibake (cp850 lido como latin1 e re-codificado como utf8mb4) nas tabelas texto.
// Por padrão faz DRY-RUN. Passe --apply para efetivar.
// Uso:
//   node scripts/corrigir-encoding.js           (dry-run)
//   node scripts/corrigir-encoding.js --apply   (executa UPDATEs)
require('dotenv').config();
const mysql = require('mysql2/promise');

const APPLY = process.argv.includes('--apply');
const SENTINELAS = ['├', '┤', '┬', '┼', '│', '┌', '└', '┐', '┘', '┴'];

function whereMojibake(col) {
  return SENTINELAS.map(s => `\`${col}\` LIKE BINARY '%${s}%'`).join(' OR ');
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ideart_erp',
    charset: 'utf8mb4'
  });

  console.log(APPLY ? '>>> MODO: APPLY (irá atualizar o banco)' : '>>> MODO: DRY-RUN (nenhuma mudança no banco)');

  const [cols] = await conn.query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND DATA_TYPE IN ('varchar','text','char','tinytext','mediumtext','longtext')
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);

  let totalAfetado = 0;
  let totalPulado = 0;

  if (APPLY) await conn.beginTransaction();

  try {
    for (const { TABLE_NAME, COLUMN_NAME } of cols) {
      // Conta linhas candidatas e quantas têm conversão válida (não-NULL)
      const [stats] = await conn.query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN CONVERT(CAST(CONVERT(\`${COLUMN_NAME}\` USING cp850) AS BINARY) USING utf8mb4) IS NOT NULL THEN 1 ELSE 0 END) AS recuperaveis
        FROM \`${TABLE_NAME}\`
        WHERE ${whereMojibake(COLUMN_NAME)}
      `);
      const total = Number(stats[0].total);
      const recuperaveis = Number(stats[0].recuperaveis);
      if (total === 0) continue;

      console.log(`\n[${TABLE_NAME}.${COLUMN_NAME}] candidatas=${total} recuperáveis=${recuperaveis}`);
      totalAfetado += recuperaveis;
      totalPulado += (total - recuperaveis);

      if (APPLY && recuperaveis > 0) {
        // Só atualiza linhas cujo resultado é válido (não-NULL)
        const [res] = await conn.query(`
          UPDATE \`${TABLE_NAME}\`
          SET \`${COLUMN_NAME}\` = CONVERT(CAST(CONVERT(\`${COLUMN_NAME}\` USING cp850) AS BINARY) USING utf8mb4)
          WHERE (${whereMojibake(COLUMN_NAME)})
            AND CONVERT(CAST(CONVERT(\`${COLUMN_NAME}\` USING cp850) AS BINARY) USING utf8mb4) IS NOT NULL
        `);
        console.log(`  atualizadas: ${res.affectedRows}`);
      }
    }

    if (APPLY) {
      await conn.commit();
      console.log(`\n✓ Commit. Atualizações esperadas: ${totalAfetado}. Linhas não-recuperáveis: ${totalPulado}.`);
    } else {
      console.log(`\nDry-run: ${totalAfetado} linha(s) seriam atualizadas. ${totalPulado} seriam puladas (não-recuperáveis).`);
      console.log('Para aplicar de verdade, rode: node scripts/corrigir-encoding.js --apply');
    }
  } catch (e) {
    if (APPLY) await conn.rollback().catch(() => {});
    console.error('Falha — rollback aplicado:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
