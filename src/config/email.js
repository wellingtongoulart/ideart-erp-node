const nodemailer = require('nodemailer');

// Configuração do SMTP via .env. Se SMTP_HOST não estiver definido, o envio fica
// desabilitado e o link de recuperação continua sendo impresso apenas no log.
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;
// "secure" true => porta 465 (SSL). Para 587/25 use STARTTLS (secure=false).
const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

let transporter = null;
if (host && user && pass) {
    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
}

function emailAtivo() {
    return transporter !== null;
}

async function enviarEmailRecuperacaoSenha({ para, nomeUsuario, resetUrl, validadeMinutos }) {
    if (!transporter) {
        // Modo "sem SMTP": loga e devolve sem falhar para que o fluxo continue.
        console.warn('[email] SMTP não configurado — link apenas nos logs. Defina SMTP_HOST/USER/PASS no .env para habilitar o envio.');
        return { enviado: false };
    }

    const saudacao = nomeUsuario ? `Olá, ${nomeUsuario}` : 'Olá';
    const texto = [
        `${saudacao}!`,
        '',
        'Recebemos um pedido para redefinir sua senha no Ideart ERP.',
        `Acesse o link abaixo para cadastrar uma nova senha (válido por ${validadeMinutos} minutos):`,
        '',
        resetUrl,
        '',
        'Se você não solicitou esta redefinição, ignore este email — sua senha atual continua válida.',
        '',
        '— Equipe Ideart ERP'
    ].join('\n');

    const html = `
<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6fa;padding:24px;color:#1a1a1a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e3e6ef">
    <tr>
      <td style="background:#0066cc;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold">Ideart ERP</td>
    </tr>
    <tr>
      <td style="padding:24px">
        <p style="margin:0 0 12px">${saudacao}!</p>
        <p style="margin:0 0 12px">Recebemos um pedido para redefinir sua senha no Ideart ERP.</p>
        <p style="margin:0 0 20px">Clique no botão abaixo para cadastrar uma nova senha. O link é válido por <strong>${validadeMinutos} minutos</strong>.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#0066cc;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Redefinir minha senha</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#555">Ou copie e cole este endereço no seu navegador:</p>
        <p style="word-break:break-all;font-size:13px;color:#0066cc;margin:0 0 20px">${resetUrl}</p>
        <hr style="border:none;border-top:1px solid #e3e6ef;margin:20px 0">
        <p style="margin:0;font-size:12px;color:#777">Se você não solicitou esta redefinição, ignore este email — sua senha atual continua válida.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from,
        to: para,
        subject: 'Redefinição de senha — Ideart ERP',
        text: texto,
        html
    });

    return { enviado: true };
}

module.exports = {
    emailAtivo,
    enviarEmailRecuperacaoSenha
};
