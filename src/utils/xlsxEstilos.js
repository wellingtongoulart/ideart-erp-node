// Estilos reutilizáveis para exportações XLSX (ExcelJS)

const CORES = {
    primaria: 'FF1F3A5F',
    primariaClara: 'FFEAF1FB',
    secundaria: 'FF3B82F6',
    cinzaClaro: 'FFF5F8FC',
    cinzaMedio: 'FFE5E7EB',
    branco: 'FFFFFFFF',
    verde: 'FF10B981',
    verdeClaro: 'FFECFDF5',
    vermelho: 'FFEF4444',
    amarelo: 'FFF59E0B',
    amareloClaro: 'FFFEF3C7',
    destaque: 'FFF9FAFB'
};

const FONTES = {
    tituloPrincipal: { name: 'Segoe UI', size: 18, bold: true, color: { argb: CORES.branco } },
    subtitulo: { name: 'Segoe UI', size: 12, bold: true, color: { argb: CORES.primaria } },
    cabecalho: { name: 'Segoe UI', size: 11, bold: true, color: { argb: CORES.branco } },
    corpo: { name: 'Segoe UI', size: 10, color: { argb: CORES.primaria } },
    rotulo: { name: 'Segoe UI', size: 10, bold: true, color: { argb: CORES.primaria } },
    total: { name: 'Segoe UI', size: 12, bold: true, color: { argb: CORES.primaria } }
};

function preenchimento(cor) {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb: cor } };
}

function bordaFina(cor = CORES.primaria) {
    const style = { style: 'thin', color: { argb: cor } };
    return { top: style, left: style, bottom: style, right: style };
}

function aplicarEstiloCabecalho(row) {
    row.eachCell((cell) => {
        cell.font = FONTES.cabecalho;
        cell.fill = preenchimento(CORES.primaria);
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = bordaFina();
    });
    row.height = 22;
}

function aplicarEstiloLinha(row, { zebrada = false, alinhamentos = {} } = {}) {
    row.eachCell((cell, colNumber) => {
        cell.font = FONTES.corpo;
        cell.border = bordaFina(CORES.cinzaMedio);
        cell.alignment = {
            vertical: 'middle',
            horizontal: alinhamentos[colNumber] || 'left',
            wrapText: true
        };
        if (zebrada) {
            cell.fill = preenchimento(CORES.destaque);
        }
    });
    row.height = 18;
}

function aplicarTituloPrincipal(ws, texto, colSpan) {
    const range = `A1:${String.fromCharCode(64 + colSpan)}1`;
    ws.mergeCells(range);
    const cel = ws.getCell('A1');
    cel.value = texto;
    cel.font = FONTES.tituloPrincipal;
    cel.fill = preenchimento(CORES.primaria);
    cel.alignment = { vertical: 'middle', horizontal: 'center' };
    ws.getRow(1).height = 34;
}

function aplicarSubtitulo(ws, linha, texto, colSpan) {
    const range = `A${linha}:${String.fromCharCode(64 + colSpan)}${linha}`;
    ws.mergeCells(range);
    const cel = ws.getCell(`A${linha}`);
    cel.value = texto;
    cel.font = { ...FONTES.subtitulo, color: { argb: CORES.primaria } };
    cel.fill = preenchimento(CORES.primariaClara);
    cel.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    ws.getRow(linha).height = 22;
}

function formatarNomeArquivo(titulo, extensao = 'xlsx') {
    const slug = (titulo || 'arquivo')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const d = new Date();
    const data = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `${slug}-${data}.${extensao}`;
}

function textoParaLargura(valor, numFmt) {
    if (valor === null || valor === undefined || valor === '') return 1;
    if (valor instanceof Date) {
        if (numFmt && numFmt.includes('hh')) return 16;
        return 10;
    }
    if (typeof valor === 'number') {
        let texto = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (numFmt && numFmt.includes('R$')) texto = 'R$ ' + texto;
        return texto.length;
    }
    const texto = String(valor);
    const linhas = texto.split(/\r?\n/);
    return linhas.reduce((max, l) => Math.max(max, l.length), 0);
}

function ajustarLarguraColunas(ws, { min = 10, max = 60, padding = 2 } = {}) {
    if (!ws.columns || ws.columns.length === 0) return;
    ws.columns.forEach((coluna, idx) => {
        if (!coluna) return;
        let larguraMax = 0;
        coluna.eachCell({ includeEmpty: false }, (cell) => {
            // Ignora células mescladas (abrangem várias colunas, não refletem largura real)
            if (cell.isMerged) return;
            const largura = textoParaLargura(cell.value, cell.numFmt);
            if (largura > larguraMax) larguraMax = largura;
        });
        const larguraFinal = Math.max(min, Math.min(max, larguraMax + padding));
        ws.getColumn(idx + 1).width = larguraFinal;
    });
}

function enviarXLSX(res, workbook, nomeArquivo) {
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(nomeArquivo)}"`
    );
    return workbook.xlsx.write(res).then(() => res.end());
}

module.exports = {
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
};
