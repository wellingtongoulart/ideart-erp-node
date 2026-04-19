const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token de autenticação ausente'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: payload.id,
            username: payload.username,
            funcao: payload.funcao
        };
        return next();
    } catch (erro) {
        const expirou = erro.name === 'TokenExpiredError';
        return res.status(401).json({
            sucesso: false,
            mensagem: expirou ? 'Sessão expirada' : 'Token inválido'
        });
    }
}

module.exports = autenticar;
