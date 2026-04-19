// Interceptador de fetch: anexa o JWT em todas as chamadas para /api/* (exceto
// endpoints públicos de login/recuperação de senha) e redireciona para o login
// quando o backend responde 401. Carregado como script regular em index.html
// ANTES dos módulos ES, para garantir que esteja ativo desde o primeiro fetch.
(function () {
    const TOKEN_KEY = 'user_token';
    const PUBLIC_API_ROUTES = [
        '/api/autenticacao/login',
        '/api/autenticacao/forgot-password',
        '/api/autenticacao/validate-reset-token',
        '/api/autenticacao/reset-password'
    ];

    const nativeFetch = window.fetch.bind(window);

    function ehRotaDaAPI(url) {
        if (!url) return false;
        try {
            const u = new URL(url, window.location.origin);
            return u.pathname.startsWith('/api/');
        } catch {
            return typeof url === 'string' && url.startsWith('/api/');
        }
    }

    function ehRotaPublica(url) {
        try {
            const u = new URL(url, window.location.origin);
            return PUBLIC_API_ROUTES.some((p) => u.pathname.startsWith(p));
        } catch {
            return PUBLIC_API_ROUTES.some((p) => typeof url === 'string' && url.startsWith(p));
        }
    }

    function limparSessaoERedirecionar() {
        try {
            sessionStorage.removeItem('user_token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('ideart_session');
            localStorage.removeItem('ideart_user');
        } catch { /* ignore */ }
        if (!window.location.pathname.endsWith('/login.html')) {
            window.location.href = '/login.html';
        }
    }

    window.fetch = async function (input, init = {}) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';

        if (ehRotaDaAPI(url) && !ehRotaPublica(url)) {
            const token = sessionStorage.getItem(TOKEN_KEY);
            const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
            if (token && !headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            init = { ...init, headers };
        }

        const response = await nativeFetch(input, init);

        if (response.status === 401 && ehRotaDaAPI(url) && !ehRotaPublica(url)) {
            limparSessaoERedirecionar();
        }

        return response;
    };
})();
