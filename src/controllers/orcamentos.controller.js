// Controller de Orçamentos
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { montarOrderBy } = require('../utils/ordenacao');

const CAMINHO_LOGO = path.join(__dirname, '..', '..', 'public', 'images', 'ideart-logo.png');

// pngjs é opcional: se estiver instalado, a logo é recortada removendo as
// bordas transparentes; se não, o PNG original é usado como está.
let PNG = null;
try {
    PNG = require('pngjs').PNG;
    console.log('[logo] pngjs carregado — recorte de bordas transparentes ATIVO');
} catch (_) {
    console.warn('[logo] pngjs NÃO instalado — logo será usada sem recorte. Rode: npm install');
}

// Lê largura/altura de um PNG parseando o chunk IHDR (assinatura + header).
function lerDimensoesPng(buffer) {
    if (!buffer || buffer.length < 24) return null;
    const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < sig.length; i++) {
        if (buffer[i] !== sig[i]) return null;
    }
    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
    };
}

// Dado um retângulo máximo e a proporção real da imagem, devolve o tamanho
// (em pixels de tela) que cabe dentro do retângulo sem deformar.
function encaixarProporcional(larguraMax, alturaMax, larguraReal, alturaReal) {
    if (!larguraReal || !alturaReal) return { width: larguraMax, height: alturaMax };
    const escala = Math.min(larguraMax / larguraReal, alturaMax / alturaReal);
    return {
        width: Math.round(larguraReal * escala),
        height: Math.round(alturaReal * escala)
    };
}

// Remove as bordas transparentes de um PNG, retornando um novo buffer.
// Considera "transparente" qualquer pixel com alpha <= threshold.
// Se pngjs não estiver instalado, devolve o buffer original inalterado.
function recortarTransparencia(bufferPng, alphaMin = 8) {
    if (!PNG) return bufferPng;
    try {
        const png = PNG.sync.read(bufferPng);
        const { width, height, data } = png;

        let top = height, bottom = -1, left = width, right = -1;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha > alphaMin) {
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                    if (x < left) left = x;
                    if (x > right) right = x;
                }
            }
        }

        // Sem pixels visíveis ou crop é o próprio tamanho: devolve original.
        if (bottom < top || right < left) {
            console.warn('[logo] Nenhum pixel opaco encontrado — crop ignorado');
            return bufferPng;
        }
        const novoW = right - left + 1;
        const novoH = bottom - top + 1;
        console.log(`[logo] crop: ${width}x${height} -> ${novoW}x${novoH} (removido top=${top} bottom=${height - 1 - bottom} left=${left} right=${width - 1 - right})`);
        if (novoW === width && novoH === height) return bufferPng;

        const recortado = new PNG({ width: novoW, height: novoH });
        for (let y = 0; y < novoH; y++) {
            for (let x = 0; x < novoW; x++) {
                const srcIdx = ((y + top) * width + (x + left)) * 4;
                const dstIdx = (y * novoW + x) * 4;
                recortado.data[dstIdx]     = data[srcIdx];
                recortado.data[dstIdx + 1] = data[srcIdx + 1];
                recortado.data[dstIdx + 2] = data[srcIdx + 2];
                recortado.data[dstIdx + 3] = data[srcIdx + 3];
            }
        }
        return PNG.sync.write(recortado);
    } catch (_) {
        return bufferPng;
    }
}

// Cache do PNG recortado para não reprocessar a cada export. Invalida quando
// o arquivo é alterado (mtime).
let _cacheLogo = { mtime: null, buffer: null };
function obterBufferLogo() {
    if (!fs.existsSync(CAMINHO_LOGO)) return null;
    const stat = fs.statSync(CAMINHO_LOGO);
    if (_cacheLogo.buffer && _cacheLogo.mtime === stat.mtimeMs) {
        return _cacheLogo.buffer;
    }
    const original = fs.readFileSync(CAMINHO_LOGO);
    const recortado = recortarTransparencia(original);
    _cacheLogo = { mtime: stat.mtimeMs, buffer: recortado };
    return recortado;
}
const {
    CORES,
    FONTES,
    preenchimento,
    bordaFina,
    aplicarEstiloCabecalho,
    aplicarEstiloLinha,
    aplicarTituloPrincipal,
    aplicarSubtitulo,
    ajustarLarguraColunas,
    formatarNomeArquivo,
    enviarXLSX
} = require('../utils/xlsxEstilos');

const COLUNAS_ORDENACAO_ORCAMENTOS = {
    id: 'o.id',
    numero: 'o.numero',
    cliente_nome: 'c.nome',
    data_criacao: 'o.data_criacao',
    data_validade: 'o.data_validade',
    valor_total: 'o.valor_total',
    status: 'o.status',
    criado_em: 'o.criado_em'
};

function gerarNumeroOrcamento() {
    return `ORC${Date.now()}`;
}

function gerarNumeroPedido() {
    return `PED${Date.now()}`;
}

async function carregarItensOrcamento(connection, orcamentoId) {
    // `sku` exposto ao cliente: prioriza o código customizado (itens avulsos)
    // e cai no SKU do produto cadastrado quando o customizado não existir.
    const [itens] = await connection.execute(
        `SELECT oi.*,
                p.nome AS produto_nome,
                COALESCE(NULLIF(oi.codigo_customizado, ''), p.sku) AS sku,
                p.categoria,
                p.descricao AS produto_descricao
         FROM orcamento_itens oi
         LEFT JOIN produtos p ON oi.produto_id = p.id
         WHERE oi.orcamento_id = ?
         ORDER BY oi.ordem ASC, oi.id ASC`,
        [orcamentoId]
    );
    return itens;
}

function normalizarTextoOpcional(valor) {
    if (valor === undefined || valor === null) return null;
    const texto = String(valor).trim();
    return texto.length === 0 ? null : texto;
}

async function substituirItensOrcamento(connection, orcamentoId, itens) {
    await connection.execute('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [orcamentoId]);

    let total = 0;
    for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const quantidade = Number(item.quantidade) || 0;
        const preco = Number(item.preco_unitario) || 0;
        const subtotal = quantidade * preco;
        total += subtotal;

        await connection.execute(
            `INSERT INTO orcamento_itens
             (orcamento_id, ambiente, produto_id, nome_customizado, codigo_customizado,
              descricao_customizada, tamanho, cor, quantidade, preco_unitario, subtotal, ordem, criado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                orcamentoId,
                normalizarTextoOpcional(item.ambiente),
                item.produto_id || null,
                normalizarTextoOpcional(item.nome_customizado),
                normalizarTextoOpcional(item.codigo_customizado),
                normalizarTextoOpcional(item.descricao_customizada),
                normalizarTextoOpcional(item.tamanho),
                normalizarTextoOpcional(item.cor),
                quantidade,
                preco,
                subtotal,
                i
            ]
        );
    }
    return total;
}

// GET - Listar orçamentos com paginação e filtros
exports.listar = async (req, res) => {
    try {
        const {
            pagina = 1, limite = 10,
            status = '', cliente_id = '', busca = '',
            data_criacao_inicio = '', data_criacao_fim = '',
            data_validade_inicio = '', data_validade_fim = '',
            valor_min = '', valor_max = '',
            ordenarPor, ordem
        } = req.query;
        const offset = (pagina - 1) * limite;

        const connection = await pool.getConnection();

        let query = `
            SELECT o.*, c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone
            FROM orcamentos o
            LEFT JOIN clientes c ON o.cliente_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        if (cliente_id) {
            query += ' AND o.cliente_id = ?';
            params.push(cliente_id);
        }
        if (busca) {
            query += ' AND (o.numero LIKE ? OR c.nome LIKE ?)';
            params.push(`%${busca}%`, `%${busca}%`);
        }

        // Faixa de data de criação
        if (data_criacao_inicio) {
            query += ' AND o.data_criacao >= ?';
            params.push(data_criacao_inicio);
        }
        if (data_criacao_fim) {
            query += ' AND o.data_criacao <= ?';
            params.push(data_criacao_fim);
        }

        // Faixa de validade
        if (data_validade_inicio) {
            query += ' AND o.data_validade >= ?';
            params.push(data_validade_inicio);
        }
        if (data_validade_fim) {
            query += ' AND o.data_validade <= ?';
            params.push(data_validade_fim);
        }

        // Faixa de valor total
        if (valor_min !== '' && !isNaN(Number(valor_min))) {
            query += ' AND o.valor_total >= ?';
            params.push(Number(valor_min));
        }
        if (valor_max !== '' && !isNaN(Number(valor_max))) {
            query += ' AND o.valor_total <= ?';
            params.push(Number(valor_max));
        }

        const countQuery = query
            .replace(/SELECT o\.\*, c\.nome AS cliente_nome, c\.email AS cliente_email, c\.telefone AS cliente_telefone/, 'SELECT COUNT(*) AS total');
        const [countResult] = await connection.execute(countQuery, params);
        const totalRegistros = countResult[0].total;

        const orderBy = montarOrderBy({
            ordenarPor, ordem,
            colunasPermitidas: COLUNAS_ORDENACAO_ORCAMENTOS,
            padrao: 'o.criado_em DESC'
        });
        query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const [orcamentos] = await connection.query(query, params);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamentos listados com sucesso',
            dados: orcamentos,
            paginacao: {
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                total: totalRegistros,
                totalPaginas: Math.ceil(totalRegistros / limite)
            }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar orçamentos', erro: erro.message });
    }
};

// GET - Buscar orçamento por ID (com itens, cliente e profissional)
exports.buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            `SELECT o.*,
                    c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                    c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.estado AS cliente_estado,
                    pr.nome AS profissional_nome, pr.especialidade AS profissional_especialidade
             FROM orcamentos o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN profissionais pr ON o.profissional_id = pr.id
             WHERE o.id = ?`,
            [id]
        );

        if (orcamentos.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const itens = await carregarItensOrcamento(connection, id);
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamento encontrado',
            dados: { ...orcamentos[0], itens }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar orçamento', erro: erro.message });
    }
};

// POST - Criar orçamento com itens
exports.criar = async (req, res) => {
    const {
        cliente_id,
        profissional_id = null,
        data_criacao,
        data_validade,
        desconto = 0,
        status = 'pendente',
        observacoes = '',
        forma_pagamento = '',
        assinatura = '',
        itens = []
    } = req.body;

    if (!cliente_id) {
        return res.status(400).json({ sucesso: false, mensagem: 'Cliente é obrigatório' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const numero = gerarNumeroOrcamento();

        const [result] = await connection.execute(
            `INSERT INTO orcamentos
             (numero, cliente_id, profissional_id, data_criacao, data_validade, valor_total, desconto,
              status, observacoes, forma_pagamento, assinatura, criado_em, atualizado_em)
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                numero, cliente_id, profissional_id,
                data_criacao || new Date().toISOString().split('T')[0],
                data_validade || null,
                desconto, status, observacoes, forma_pagamento, assinatura
            ]
        );

        const orcamentoId = result.insertId;
        const total = await substituirItensOrcamento(connection, orcamentoId, Array.isArray(itens) ? itens : []);

        await connection.execute('UPDATE orcamentos SET valor_total = ? WHERE id = ?', [total, orcamentoId]);

        await connection.commit();
        connection.release();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Orçamento criado com sucesso',
            dados: { id: orcamentoId, numero, valor_total: total }
        });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar orçamento', erro: erro.message });
    }
};

// PUT - Atualizar orçamento completo (incluindo itens)
exports.atualizar = async (req, res) => {
    const { id } = req.params;
    const {
        cliente_id,
        profissional_id,
        data_criacao,
        data_validade,
        desconto,
        status,
        observacoes,
        forma_pagamento,
        assinatura,
        itens
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existe] = await connection.execute('SELECT id FROM orcamentos WHERE id = ?', [id]);
        if (existe.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const campos = [];
        const params = [];
        const add = (col, val) => { if (val !== undefined) { campos.push(`${col} = ?`); params.push(val); } };

        add('cliente_id', cliente_id);
        add('profissional_id', profissional_id);
        add('data_criacao', data_criacao);
        add('data_validade', data_validade);
        add('desconto', desconto);
        add('status', status);
        add('observacoes', observacoes);
        add('forma_pagamento', forma_pagamento);
        add('assinatura', assinatura);

        if (campos.length > 0) {
            campos.push('atualizado_em = NOW()');
            await connection.execute(
                `UPDATE orcamentos SET ${campos.join(', ')} WHERE id = ?`,
                [...params, id]
            );
        }

        if (Array.isArray(itens)) {
            const total = await substituirItensOrcamento(connection, id, itens);
            await connection.execute('UPDATE orcamentos SET valor_total = ? WHERE id = ?', [total, id]);
        }

        await connection.commit();
        connection.release();

        res.json({ sucesso: true, mensagem: 'Orçamento atualizado com sucesso' });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar orçamento', erro: erro.message });
    }
};

// POST - Aprovar orçamento (cria pedido vinculado)
exports.aprovar = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orcamentos] = await connection.execute('SELECT * FROM orcamentos WHERE id = ?', [id]);
        if (orcamentos.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const orcamento = orcamentos[0];

        if (orcamento.status === 'aprovado' || orcamento.status === 'convertido') {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ sucesso: false, mensagem: 'Este orçamento já foi aprovado' });
        }

        const [itens] = await connection.execute(
            'SELECT * FROM orcamento_itens WHERE orcamento_id = ? ORDER BY ordem ASC, id ASC',
            [id]
        );

        const numeroPedido = gerarNumeroPedido();
        const [resPedido] = await connection.execute(
            `INSERT INTO pedidos
             (numero, cliente_id, orcamento_id, data_pedido, valor_total, desconto, status, observacoes, forma_pagamento, criado_em, atualizado_em)
             VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?, NOW(), NOW())`,
            [
                numeroPedido,
                orcamento.cliente_id,
                orcamento.id,
                new Date().toISOString().split('T')[0],
                orcamento.valor_total,
                orcamento.desconto,
                orcamento.observacoes || '',
                orcamento.forma_pagamento || ''
            ]
        );
        const pedidoId = resPedido.insertId;

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            await connection.execute(
                `INSERT INTO pedido_itens
                 (pedido_id, ambiente, produto_id, nome_customizado, codigo_customizado,
                  descricao_customizada, tamanho, cor, quantidade, preco_unitario, subtotal, ordem, criado_em)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    pedidoId,
                    item.ambiente || null,
                    item.produto_id || null,
                    item.nome_customizado || null,
                    item.codigo_customizado || null,
                    item.descricao_customizada || null,
                    item.tamanho || null,
                    item.cor || null,
                    item.quantidade,
                    item.preco_unitario,
                    item.subtotal,
                    i
                ]
            );

            if (item.produto_id) {
                await connection.execute(
                    'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }
        }

        await connection.execute(
            `UPDATE orcamentos SET status = 'aprovado', pedido_id = ?, atualizado_em = NOW() WHERE id = ?`,
            [pedidoId, id]
        );

        await connection.commit();
        connection.release();

        res.json({
            sucesso: true,
            mensagem: 'Orçamento aprovado e pedido criado',
            dados: { orcamento_id: id, pedido_id: pedidoId, pedido_numero: numeroPedido }
        });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao aprovar orçamento', erro: erro.message });
    }
};

// POST - Recusar orçamento
exports.recusar = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo = '' } = req.body;
        const connection = await pool.getConnection();

        const [existe] = await connection.execute('SELECT status, observacoes FROM orcamentos WHERE id = ?', [id]);
        if (existe.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const novaObs = (existe[0].observacoes || '') + (motivo ? `\n[Recusado: ${motivo}]` : '');
        await connection.execute(
            `UPDATE orcamentos SET status = 'recusado', observacoes = ?, atualizado_em = NOW() WHERE id = ?`,
            [novaObs, id]
        );
        connection.release();

        res.json({ sucesso: true, mensagem: 'Orçamento recusado' });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao recusar orçamento', erro: erro.message });
    }
};

// GET - Retornar dados consolidados para exportação (PDF/Excel)
exports.dadosExportacao = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            `SELECT o.*,
                    c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                    c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.estado AS cliente_estado,
                    pr.nome AS profissional_nome, pr.especialidade AS profissional_especialidade
             FROM orcamentos o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN profissionais pr ON o.profissional_id = pr.id
             WHERE o.id = ?`,
            [id]
        );

        if (orcamentos.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const itens = await carregarItensOrcamento(connection, id);

        let empresa = {
            nome_fantasia: 'Ideart',
            email: 'contato@ideart.com.br',
            telefone: '(11) 0000-0000',
            endereco: '',
            cidade: '',
            estado: ''
        };
        try {
            const [empresas] = await connection.execute('SELECT * FROM empresa_config LIMIT 1');
            if (empresas.length > 0) empresa = empresas[0];
        } catch (_) { /* tabela pode não existir ainda */ }

        connection.release();

        res.json({
            sucesso: true,
            dados: { orcamento: orcamentos[0], itens, empresa }
        });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao carregar dados de exportação', erro: erro.message });
    }
};

function formatarDataBR(data) {
    if (!data) return '-';
    const d = new Date(data);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
}

function agruparItensPorAmbiente(itens) {
    const grupos = new Map();
    (itens || []).forEach((item) => {
        const chave = (item.ambiente && String(item.ambiente).trim()) || 'SEM AMBIENTE';
        if (!grupos.has(chave)) grupos.set(chave, []);
        grupos.get(chave).push(item);
    });
    return Array.from(grupos.entries()).map(([nome, lista]) => ({ nome, itens: lista }));
}

// GET - Gera e envia arquivo XLSX estilizado do orçamento
exports.exportarXLSX = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [orcamentos] = await connection.execute(
            `SELECT o.*,
                    c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_telefone,
                    c.endereco AS cliente_endereco, c.cidade AS cliente_cidade, c.estado AS cliente_estado,
                    pr.nome AS profissional_nome, pr.especialidade AS profissional_especialidade
             FROM orcamentos o
             LEFT JOIN clientes c ON o.cliente_id = c.id
             LEFT JOIN profissionais pr ON o.profissional_id = pr.id
             WHERE o.id = ?`,
            [id]
        );

        if (orcamentos.length === 0) {
            connection.release();
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }

        const orcamento = orcamentos[0];
        const itens = await carregarItensOrcamento(connection, id);

        let empresa = {
            nome_fantasia: 'Ideart',
            email: 'contato@ideart.com.br',
            telefone: '(11) 0000-0000',
            endereco: '', cidade: '', estado: ''
        };
        try {
            const [empresas] = await connection.execute('SELECT * FROM empresa_config LIMIT 1');
            if (empresas.length > 0) empresa = empresas[0];
        } catch (_) { /* tabela pode não existir ainda */ }

        connection.release();

        const subtotal = (itens || []).reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
        let descPerc = Number(orcamento.desconto) || 0;
        if (descPerc < 0) descPerc = 0;
        if (descPerc > 100) descPerc = 100;
        const descValor = subtotal * (descPerc / 100);
        const total = subtotal - descValor;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = empresa.nome_fantasia || 'Ideart';
        workbook.created = new Date();

        const ws = workbook.addWorksheet('Orçamento', {
            pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
            views: [{ showGridLines: false }]
        });

        // Colunas: Item | Código | Descrição | Cor | Tamanho | Qtd | Vl. Unit | Vl. Total
        ws.columns = [
            { key: 'item', width: 8 },
            { key: 'codigo', width: 22 },
            { key: 'descricao', width: 42 },
            { key: 'cor', width: 12 },
            { key: 'tamanho', width: 14 },
            { key: 'qtd', width: 8 },
            { key: 'unitario', width: 14 },
            { key: 'total', width: 16 }
        ];

        const totalColunas = 8;
        // Bloco topo (linhas 1-4): logo à esquerda (A:C), título ORÇAMENTO centralizado (D:F),
        // caixa do número à direita (G:H) — todos na mesma altura, batendo com o layout do PDF.
        ws.mergeCells('A1:C4');

        ws.mergeCells('D1:F4');
        ws.getCell('D1').value = 'ORÇAMENTO';
        ws.getCell('D1').font = { name: 'Segoe UI', size: 26, bold: true, color: { argb: CORES.primaria } };
        ws.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' };

        // Altura uniforme nas 4 linhas do topo
        for (let r = 1; r <= 4; r++) ws.getRow(r).height = 22;

        // Insere logo se o arquivo existir; silenciosamente pula caso contrário
        try {
            const bufferLogo = obterBufferLogo();
            if (bufferLogo) {
                const logoId = workbook.addImage({ buffer: bufferLogo, extension: 'png' });

                // Limites da caixa onde a logo pode aparecer (em px de tela).
                // A escala é proporcional para evitar deformação.
                const LOGO_MAX_WIDTH = 260;
                const LOGO_MAX_HEIGHT = 110;

                const dims = lerDimensoesPng(bufferLogo);
                const ext = encaixarProporcional(
                    LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT,
                    dims ? dims.width : LOGO_MAX_WIDTH,
                    dims ? dims.height : LOGO_MAX_HEIGHT
                );

                ws.addImage(logoId, {
                    tl: { col: 0.1, row: 0.1 },
                    ext
                });
            } else {
                ws.getCell('A1').value = (empresa.nome_fantasia || 'IDEART').toUpperCase();
                ws.getCell('A1').font = { name: 'Segoe UI', size: 20, bold: true, color: { argb: CORES.primaria } };
                ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            }
        } catch (_) { /* continua sem logo */ }

        // Caixa "ORÇAMENTO Nº" alinhada com a logo (linhas 1-2 label, 3-4 número)
        ws.mergeCells('G1:H2');
        ws.getCell('G1').value = 'ORÇAMENTO Nº';
        ws.getCell('G1').font = { ...FONTES.rotulo, color: { argb: CORES.branco } };
        ws.getCell('G1').fill = preenchimento(CORES.primaria);
        ws.getCell('G1').alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getCell('G1').border = bordaFina();

        ws.mergeCells('G3:H4');
        ws.getCell('G3').value = orcamento.numero || `#${orcamento.id}`;
        ws.getCell('G3').font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: CORES.primaria } };
        ws.getCell('G3').alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getCell('G3').border = bordaFina();

        // Linhas 5-6: dados da empresa em faixa compacta abaixo do topo
        ws.getCell('A5').value = 'CNPJ:';
        ws.getCell('A5').font = FONTES.rotulo;
        ws.getCell('B5').value = empresa.cnpj || '-';
        ws.getCell('B5').font = FONTES.corpo;

        ws.getCell('A6').value = 'TELEFONE:';
        ws.getCell('A6').font = FONTES.rotulo;
        ws.getCell('B6').value = empresa.telefone || '-';
        ws.getCell('B6').font = FONTES.corpo;

        ws.getCell('D5').value = 'E-MAIL:';
        ws.getCell('D5').font = FONTES.rotulo;
        ws.mergeCells('E5:H5');
        ws.getCell('E5').value = empresa.email || '-';
        ws.getCell('E5').font = FONTES.corpo;

        ws.getCell('D6').value = 'DATA:';
        ws.getCell('D6').font = FONTES.rotulo;
        ws.mergeCells('E6:H6');
        ws.getCell('E6').value = formatarDataBR(orcamento.data_criacao);
        ws.getCell('E6').font = FONTES.corpo;

        // Bloco dados do cliente
        aplicarSubtitulo(ws, 8, 'DADOS DO CLIENTE', totalColunas);
        const infoCliente = [
            ['CLIENTE:', orcamento.cliente_nome || '-'],
            ['ENDEREÇO:', [orcamento.cliente_endereco, orcamento.cliente_cidade, orcamento.cliente_estado].filter(Boolean).join(', ') || '-'],
            ['TELEFONE:', orcamento.cliente_telefone || '-'],
            ['E-MAIL:', orcamento.cliente_email || '-']
        ];
        infoCliente.forEach((linha, idx) => {
            const linhaNum = 9 + idx;
            ws.getCell(`A${linhaNum}`).value = linha[0];
            ws.getCell(`A${linhaNum}`).font = FONTES.rotulo;
            ws.getCell(`A${linhaNum}`).fill = preenchimento(CORES.cinzaClaro);
            ws.getCell(`A${linhaNum}`).alignment = { vertical: 'middle', horizontal: 'right' };
            ws.getCell(`A${linhaNum}`).border = bordaFina(CORES.cinzaMedio);
            ws.mergeCells(`B${linhaNum}:H${linhaNum}`);
            ws.getCell(`B${linhaNum}`).value = linha[1];
            ws.getCell(`B${linhaNum}`).font = FONTES.corpo;
            ws.getCell(`B${linhaNum}`).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            ws.getCell(`B${linhaNum}`).border = bordaFina(CORES.cinzaMedio);
            ws.getRow(linhaNum).height = 20;
        });

        // Cabeçalho da tabela de itens
        const linhaCabecalho = 14;
        const cabecalho = ws.getRow(linhaCabecalho);
        cabecalho.values = ['ITEM', 'CÓDIGO', 'DESCRIÇÃO DO PRODUTO', 'COR', 'TAMANHO', 'QTD.', 'VL. UNIT.', 'VL. TOTAL'];
        aplicarEstiloCabecalho(cabecalho);

        let linhaAtual = linhaCabecalho + 1;
        let numeroItem = 1;
        const grupos = agruparItensPorAmbiente(itens);

        if (grupos.length === 0) {
            ws.mergeCells(`A${linhaAtual}:H${linhaAtual}`);
            const cel = ws.getCell(`A${linhaAtual}`);
            cel.value = 'Nenhum item cadastrado.';
            cel.font = { ...FONTES.corpo, italic: true };
            cel.alignment = { vertical: 'middle', horizontal: 'center' };
            cel.border = bordaFina(CORES.cinzaMedio);
            linhaAtual += 1;
        }

        grupos.forEach((grupo) => {
            // Linha de seção do ambiente (fundo escuro, banner em toda a largura)
            ws.mergeCells(`A${linhaAtual}:H${linhaAtual}`);
            const celAmbiente = ws.getCell(`A${linhaAtual}`);
            celAmbiente.value = (grupo.nome || '').toString().toUpperCase();
            celAmbiente.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: CORES.branco } };
            celAmbiente.fill = preenchimento(CORES.primaria);
            celAmbiente.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            celAmbiente.border = bordaFina();
            ws.getRow(linhaAtual).height = 20;
            linhaAtual += 1;

            grupo.itens.forEach((item, idx) => {
                const row = ws.getRow(linhaAtual);
                row.values = [
                    numeroItem++,
                    item.sku || '-',
                    item.produto_nome || item.nome_customizado || '-',
                    item.cor || '',
                    item.tamanho || '',
                    Number(item.quantidade) || 0,
                    Number(item.preco_unitario) || 0,
                    Number(item.subtotal) || 0
                ];
                aplicarEstiloLinha(row, {
                    zebrada: idx % 2 === 1,
                    alinhamentos: { 1: 'center', 2: 'center', 4: 'center', 5: 'center', 6: 'center', 7: 'right', 8: 'right' }
                });
                row.getCell(7).numFmt = '"R$" #,##0.00';
                row.getCell(8).numFmt = '"R$" #,##0.00';
                linhaAtual += 1;
            });
        });

        // Totais
        linhaAtual += 1;
        const linhasTotais = [
            ['TOTAL DOS AMBIENTES:', subtotal, false],
            [`DESCONTO (${descPerc}%):`, -descValor, false],
            ['ORÇAMENTO FINAL:', total, true]
        ];

        linhasTotais.forEach(([rotulo, valor, destaque]) => {
            ws.mergeCells(`A${linhaAtual}:G${linhaAtual}`);
            const celRotulo = ws.getCell(`A${linhaAtual}`);
            celRotulo.value = rotulo;
            celRotulo.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
            celRotulo.border = bordaFina(CORES.cinzaMedio);

            const celValor = ws.getCell(`H${linhaAtual}`);
            celValor.value = valor;
            celValor.numFmt = '"R$" #,##0.00';
            celValor.alignment = { vertical: 'middle', horizontal: 'right' };
            celValor.border = bordaFina(CORES.cinzaMedio);

            if (destaque) {
                celRotulo.font = { ...FONTES.total, color: { argb: CORES.branco } };
                celValor.font = { ...FONTES.total, color: { argb: CORES.branco } };
                celRotulo.fill = preenchimento(CORES.primaria);
                celValor.fill = preenchimento(CORES.primaria);
                ws.getRow(linhaAtual).height = 26;
            } else {
                celRotulo.font = FONTES.rotulo;
                celValor.font = FONTES.corpo;
                celRotulo.fill = preenchimento(CORES.cinzaClaro);
                ws.getRow(linhaAtual).height = 20;
            }
            linhaAtual += 1;
        });

        // Informações adicionais
        linhaAtual += 1;
        aplicarSubtitulo(ws, linhaAtual, 'INFORMAÇÕES ADICIONAIS', totalColunas);
        linhaAtual += 1;

        const infoExtra = [
            ['Forma de Pagamento', orcamento.forma_pagamento || '-'],
            ['Validade', formatarDataBR(orcamento.data_validade)],
            ['Observações', (orcamento.observacoes || '-').toString()],
            ['Status', (orcamento.status || '-').toUpperCase()]
        ];

        infoExtra.forEach(([rotulo, valor]) => {
            ws.getCell(`A${linhaAtual}`).value = rotulo;
            ws.getCell(`A${linhaAtual}`).font = FONTES.rotulo;
            ws.getCell(`A${linhaAtual}`).fill = preenchimento(CORES.cinzaClaro);
            ws.getCell(`A${linhaAtual}`).alignment = { vertical: 'middle', horizontal: 'right' };
            ws.getCell(`A${linhaAtual}`).border = bordaFina(CORES.cinzaMedio);
            ws.mergeCells(`B${linhaAtual}:H${linhaAtual}`);
            ws.getCell(`B${linhaAtual}`).value = valor;
            ws.getCell(`B${linhaAtual}`).font = FONTES.corpo;
            ws.getCell(`B${linhaAtual}`).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
            ws.getCell(`B${linhaAtual}`).border = bordaFina(CORES.cinzaMedio);
            ws.getRow(linhaAtual).height = rotulo === 'Observações' ? 40 : 20;
            linhaAtual += 1;
        });

        // Rodapé
        linhaAtual += 1;
        ws.mergeCells(`A${linhaAtual}:H${linhaAtual}`);
        const rodape = ws.getCell(`A${linhaAtual}`);
        rodape.value = `Documento gerado em ${new Date().toLocaleString('pt-BR')}`;
        rodape.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF6B7280' } };
        rodape.alignment = { vertical: 'middle', horizontal: 'center' };

        const nomeArquivo = formatarNomeArquivo(`orcamento-${orcamento.numero || orcamento.id}`, 'xlsx');
        await enviarXLSX(res, workbook, nomeArquivo);
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao gerar XLSX do orçamento', erro: erro.message });
    }
};

// DELETE - Deletar orçamento
exports.deletar = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id]);
        const [result] = await connection.execute('DELETE FROM orcamentos WHERE id = ?', [id]);
        await connection.commit();
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Orçamento não encontrado' });
        }
        res.json({ sucesso: true, mensagem: 'Orçamento deletado com sucesso' });
    } catch (erro) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar orçamento', erro: erro.message });
    }
};
