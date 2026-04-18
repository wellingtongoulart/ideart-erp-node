/**
 * Monta um fragmento SQL seguro de ORDER BY a partir de parâmetros de query.
 *
 * O uso de whitelist é essencial: a coluna de ordenação NÃO pode ser passada
 * como parâmetro preparado (placeholders `?` cobrem valores, não identificadores),
 * então validamos contra uma lista pré-aprovada.
 *
 * @param {Object} opcoes
 * @param {string} opcoes.ordenarPor - nome da coluna enviada pelo cliente
 * @param {string} opcoes.ordem      - 'asc' ou 'desc'
 * @param {Object} opcoes.colunasPermitidas - mapa { chaveCliente: 'coluna.sql' }
 * @param {string} opcoes.padrao    - fragmento default (ex: 'criado_em DESC')
 * @returns {string} fragmento SQL (sem o prefixo 'ORDER BY ')
 */
function montarOrderBy({ ordenarPor, ordem, colunasPermitidas, padrao }) {
    const coluna = ordenarPor && colunasPermitidas[ordenarPor];
    if (!coluna) return padrao;
    const direcao = String(ordem).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    return `${coluna} ${direcao}`;
}

module.exports = { montarOrderBy };
