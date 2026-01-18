const pool = require('./src/config/database');

async function resetSenhas() {
  try {
    const conn = await pool.getConnection();
    
    const queries = [
      { username: 'admin', senha: 'admin@123' },
      { username: 'vendedor', senha: 'vendedor@123' },
      { username: 'gerente', senha: 'gerente@123' }
    ];
    
    for (const q of queries) {
      await conn.query('UPDATE usuarios SET senha = ? WHERE username = ?', [q.senha, q.username]);
    }
    
    const [users] = await conn.query('SELECT id, username, senha FROM usuarios');
    console.log('✓ Senhas atualizadas:');
    users.forEach(u => {
      console.log('  ', u.username, '→', u.senha);
    });
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('✗ Erro:', err.message);
    process.exit(1);
  }
}

resetSenhas();
