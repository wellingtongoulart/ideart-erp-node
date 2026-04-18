// Dry-run: detecta colunas texto com mojibake (cp850 lido como latin1 e gravado como utf8mb4).
// Usa LIKE com operador BINARY para evitar falsos positivos de collations accent-insensitive.
// Uso: node scripts/diagnosticar-encoding.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Sentinelas: caracteres que só aparecem em strings de mojibake cp850->utf8mb4.
// (box-drawing chars e outros símbolos resultantes da dupla-codificação)
const SENTINELAS = ['├', '┤', '┬', '┼', '│', '┌', '└', '┐', '┘', '┴', '┤'];

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

  const [cols] = await conn.query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND DATA_TYPE IN ('varchar','text','char','tinytext','mediumtext','longtext')
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);

  console.log('\n=== Amostra de correção proposta (até 20 por coluna) ===');
  let totalLinhas = 0;
  for (const { TABLE_NAME, COLUMN_NAME } of cols) {
    const [rows] = await conn.query(
      `SELECT id, \`${COLUMN_NAME}\` AS atual,
              CONVERT(CAST(CONVERT(\`${COLUMN_NAME}\` USING cp850) AS BINARY) USING utf8mb4) AS corrigido
       FROM \`${TABLE_NAME}\`
       WHERE ${whereMojibake(COLUMN_NAME)}
       LIMIT 20`
    ).catch(() => [[]]);
    if (rows.length) {
      totalLinhas += rows.length;
      console.log(`\n  [${TABLE_NAME}.${COLUMN_NAME}] ${rows.length} linha(s):`);
      rows.forEach(r => {
        const ok = r.corrigido != null && r.atual !== r.corrigido;
        console.log(`    ${ok ? '✓' : '!'} id=${r.id} "${r.atual}" -> ${r.corrigido === null ? '(NULL: não recuperável)' : `"${r.corrigido}"`}`);
      });
    }
  }
  console.log(`\nTotal de linhas com mojibake: ${totalLinhas}`);

  console.log('\n=== Dados com U+FFFD (PERDIDOS, correção impossível) ===');
  let totalPerdidos = 0;
  for (const { TABLE_NAME, COLUMN_NAME } of cols) {
    const [rows] = await conn.query(
      `SELECT id, \`${COLUMN_NAME}\` AS valor FROM \`${TABLE_NAME}\` WHERE HEX(\`${COLUMN_NAME}\`) LIKE '%EFBFBD%'`
    );
    if (rows.length) {
      totalPerdidos += rows.length;
      console.log(`\n  [${TABLE_NAME}.${COLUMN_NAME}]`);
      rows.forEach(r => console.log(`    id=${r.id} "${r.valor}"`));
    }
  }
  if (totalPerdidos === 0) console.log('  (nenhum)');

  await conn.end();
})().catch(e => { console.error(e); process.exit(1); });
