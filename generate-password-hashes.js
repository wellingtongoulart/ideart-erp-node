#!/usr/bin/env node

/**
 * Script para gerar hashes bcrypt das senhas
 * Execute: node generate-password-hashes.js
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Senhas padrão do sistema
const defaultPasswords = {
    'admin': 'admin@123',
    'vendedor': 'vendedor@123',
    'gerente': 'gerente@123'
};

async function generateHash(password) {
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        console.error('Erro ao gerar hash:', error.message);
        return null;
    }
}

async function generateAllHashes() {
    console.log('\n=== GERADOR DE HASHES BCRYPT ===\n');
    console.log('Gerando hashes para as senhas padrão...\n');

    const hashes = {};
    
    for (const [username, password] of Object.entries(defaultPasswords)) {
        console.log(`⏳ Gerando hash para ${username}...`);
        const hash = await generateHash(password);
        
        if (hash) {
            hashes[username] = hash;
            console.log(`✅ ${username}:`);
            console.log(`   Senha: ${password}`);
            console.log(`   Hash: ${hash}\n`);
        } else {
            console.log(`❌ Erro ao gerar hash para ${username}\n`);
        }
    }

    // Gerar SQL update
    console.log('\n=== SQL UPDATES ===\n');
    console.log('Execute as queries abaixo no MySQL:\n');
    
    for (const [username, hash] of Object.entries(hashes)) {
        console.log(`UPDATE usuarios SET senha = '${hash}' WHERE username = '${username}';`);
    }

    // Salvar em arquivo
    const fs = require('fs');
    const sqlContent = Object.entries(hashes)
        .map(([username, hash]) => `UPDATE usuarios SET senha = '${hash}' WHERE username = '${username}';`)
        .join('\n');
    
    fs.writeFileSync('update-passwords.sql', sqlContent);
    console.log('\n✅ Arquivo "update-passwords.sql" gerado com sucesso!\n');

    rl.close();
}

// Verificar se bcrypt está instalado
try {
    require.resolve('bcrypt');
    generateAllHashes();
} catch (e) {
    console.error('❌ Erro: bcrypt não está instalado!');
    console.error('Execute: npm install bcrypt\n');
    process.exit(1);
}
