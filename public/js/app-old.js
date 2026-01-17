// Configurações
const APP_CONFIG = {
    sessionKey: 'ideart_session',
    userKey: 'ideart_user',
    sidebarMinimized: 'ideart_sidebar_minimized'
};

// Função para obter dados do usuário
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem(APP_CONFIG.userKey);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}
const pages = {
    dashboard: {
        title: 'Dashboard',
        content: `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total de Produtos</h3>
                    <div class="stat-value">1.234</div>
                    <div class="stat-change">↑ 12% em relação ao mês anterior</div>
                </div>
                <div class="stat-card">
                    <h3>Orçamentos Pendentes</h3>
                    <div class="stat-value">45</div>
                    <div class="stat-change">Aguardando aprovação</div>
                </div>
                <div class="stat-card">
                    <h3>Pedidos em Andamento</h3>
                    <div class="stat-value">28</div>
                    <div class="stat-change">Em processamento</div>
                </div>
                <div class="stat-card">
                    <h3>Total de Clientes</h3>
                    <div class="stat-value">567</div>
                    <div class="stat-change">↑ 5% novo este mês</div>
                </div>
            </div>
            <div class="card">
                <h2 class="card-title">Últimas Atividades</h2>
                <div class="card-content">
                    <p>Bem-vindo ao Ideart ERP! Comece navegando pelos menus para acessar as diferentes funcionalidades do sistema.</p>
                </div>
            </div>
        `
    },
    produtos: {
        title: 'Produtos',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Produtos</h2>
                <div class="btn-group">
                    <button class="btn btn-primary" id="novoProdutoBtn">
                        <i class="fas fa-plus"></i> Novo Produto
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table id="produtosTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Estoque</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="produtosTbody">
                            <!-- Carregado dinamicamente -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal de Novo Produto -->
            <div class="modal" id="modalNovoProduto">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Novo Produto</h3>
                        <button class="modal-close" id="fecharModalBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formNovoProduto">
                            <div class="form-group">
                                <label for="produtoNome">Nome do Produto *</label>
                                <input type="text" id="produtoNome" name="nome" required placeholder="Digite o nome do produto">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="produtoCategoria">Categoria</label>
                                    <input type="text" id="produtoCategoria" name="categoria" placeholder="Ex: Eletrônicos">
                                </div>
                                <div class="form-group">
                                    <label for="produtoSku">SKU</label>
                                    <input type="text" id="produtoSku" name="sku" placeholder="Ex: PROD001">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="produtoDescricao">Descrição</label>
                                <textarea id="produtoDescricao" name="descricao" rows="3" placeholder="Digite a descrição do produto"></textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="produtoPrecoCusto">Preço de Custo (R$)</label>
                                    <input type="number" id="produtoPrecoCusto" name="preco_custo" step="0.01" placeholder="0.00">
                                </div>
                                <div class="form-group">
                                    <label for="produtoPrecoVenda">Preço de Venda (R$) *</label>
                                    <input type="number" id="produtoPrecoVenda" name="preco_venda" step="0.01" required placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="produtoEstoque">Estoque</label>
                                <input type="number" id="produtoEstoque" name="estoque" min="0" value="0" placeholder="0">
                            </div>

                            <div class="form-group checkbox">
                                <input type="checkbox" id="produtoAtivo" name="ativo" checked>
                                <label for="produtoAtivo">Produto Ativo</label>
                            </div>

                            <div class="alert alert-info" id="mensagemProduto" style="display: none;"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelarProdutoBtn">Cancelar</button>
                        <button class="btn btn-primary" id="salvarProdutoBtn">
                            <i class="fas fa-save"></i> Salvar Produto
                        </button>
                    </div>
                </div>
            </div>
        `
    },
    orcamentos: {
        title: 'Orçamentos',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Orçamentos</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Orçamento
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ORC001</td>
                                <td>Cliente A</td>
                                <td>15/01/2026</td>
                                <td>R$ 5.000,00</td>
                                <td><span style="background-color: #fff3cd; color: #856404; padding: 0.3rem 0.6rem; border-radius: 4px;">Pendente</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                            <tr>
                                <td>ORC002</td>
                                <td>Cliente B</td>
                                <td>14/01/2026</td>
                                <td>R$ 3.200,00</td>
                                <td><span style="background-color: #d4edda; color: #155724; padding: 0.3rem 0.6rem; border-radius: 4px;">Aprovado</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                            <tr>
                                <td>ORC003</td>
                                <td>Cliente C</td>
                                <td>13/01/2026</td>
                                <td>R$ 7.500,00</td>
                                <td><span style="background-color: #f8d7da; color: #721c24; padding: 0.3rem 0.6rem; border-radius: 4px;">Recusado</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    pedidos: {
        title: 'Pedidos',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Pedidos</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Pedido
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>PED001</td>
                                <td>João Silva</td>
                                <td>17/01/2026</td>
                                <td>R$ 4.500,00</td>
                                <td><span style="background-color: #d1ecf1; color: #0c5460; padding: 0.3rem 0.6rem; border-radius: 4px;">Em processamento</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                            <tr>
                                <td>PED002</td>
                                <td>Maria Santos</td>
                                <td>16/01/2026</td>
                                <td>R$ 2.300,00</td>
                                <td><span style="background-color: #d4edda; color: #155724; padding: 0.3rem 0.6rem; border-radius: 4px;">Entregue</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                            <tr>
                                <td>PED003</td>
                                <td>Pedro Oliveira</td>
                                <td>15/01/2026</td>
                                <td>R$ 6.800,00</td>
                                <td><span style="background-color: #cfe2ff; color: #084298; padding: 0.3rem 0.6rem; border-radius: 4px;">Enviado</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-eye"></i> Ver</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    clientes: {
        title: 'Clientes',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Clientes</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Cidade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>CLI001</td>
                                <td>João Silva</td>
                                <td>joao@email.com</td>
                                <td>(11) 98765-4321</td>
                                <td>São Paulo</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>CLI002</td>
                                <td>Maria Santos</td>
                                <td>maria@email.com</td>
                                <td>(11) 99876-5432</td>
                                <td>Rio de Janeiro</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>CLI003</td>
                                <td>Pedro Oliveira</td>
                                <td>pedro@email.com</td>
                                <td>(21) 98765-1234</td>
                                <td>Belo Horizonte</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    profissionais: {
        title: 'Profissionais',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Profissionais</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Profissional
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Especialidade</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>PROF001</td>
                                <td>Carlos Developer</td>
                                <td>Desenvolvimento</td>
                                <td>carlos@email.com</td>
                                <td>(11) 98765-4321</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>PROF002</td>
                                <td>Ana Designer</td>
                                <td>Design</td>
                                <td>ana@email.com</td>
                                <td>(11) 99876-5432</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>PROF003</td>
                                <td>Roberto Gerente</td>
                                <td>Gestão</td>
                                <td>roberto@email.com</td>
                                <td>(21) 98765-1234</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    logistica: {
        title: 'Logística',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Logística</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Envio
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Rastrear
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID Envio</th>
                                <th>Pedido</th>
                                <th>Transportadora</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ENV001</td>
                                <td>PED001</td>
                                <td>Sedex</td>
                                <td>São Paulo</td>
                                <td>Rio de Janeiro</td>
                                <td><span style="background-color: #cfe2ff; color: #084298; padding: 0.3rem 0.6rem; border-radius: 4px;">Em trânsito</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-map"></i> Rastrear</button>
                                </td>
                            </tr>
                            <tr>
                                <td>ENV002</td>
                                <td>PED002</td>
                                <td>Pac</td>
                                <td>São Paulo</td>
                                <td>Belo Horizonte</td>
                                <td><span style="background-color: #d4edda; color: #155724; padding: 0.3rem 0.6rem; border-radius: 4px;">Entregue</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-map"></i> Rastrear</button>
                                </td>
                            </tr>
                            <tr>
                                <td>ENV003</td>
                                <td>PED003</td>
                                <td>Loggi</td>
                                <td>São Paulo</td>
                                <td>Brasília</td>
                                <td><span style="background-color: #fff3cd; color: #856404; padding: 0.3rem 0.6rem; border-radius: 4px;">Saiu para entrega</span></td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-map"></i> Rastrear</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    documentos: {
        title: 'Documentos',
        content: `
            <div class="card">
                <h2 class="card-title">Gerenciamento de Documentos</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Documento
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Referência</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>DOC001</td>
                                <td>NF-e 12345</td>
                                <td>Nota Fiscal</td>
                                <td>PED001</td>
                                <td>17/01/2026</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-download"></i> Download</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>DOC002</td>
                                <td>Contrato CLi001</td>
                                <td>Contrato</td>
                                <td>CLI001</td>
                                <td>10/01/2026</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-download"></i> Download</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                            <tr>
                                <td>DOC003</td>
                                <td>Recibo de Pagamento</td>
                                <td>Recibo</td>
                                <td>PED002</td>
                                <td>16/01/2026</td>
                                <td>
                                    <button class="btn btn-primary btn-small"><i class="fas fa-download"></i> Download</button>
                                    <button class="btn btn-secondary btn-small"><i class="fas fa-trash"></i> Deletar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `
    },
    relatorios: {
        title: 'Relatórios',
        content: `
            <div class="card">
                <h2 class="card-title">Relatórios do Sistema</h2>
                <div class="btn-group">
                    <button class="btn btn-primary">
                        <i class="fas fa-file-pdf"></i> Gerar Relatório
                    </button>
                    <button class="btn btn-secondary">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            <div class="grid">
                <div class="grid-item">
                    <i class="fas fa-chart-line"></i>
                    <h3>Relatório de Vendas</h3>
                    <p>Análise detalhada de vendas por período</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
                <div class="grid-item">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Relatório de Estoque</h3>
                    <p>Situação atual do inventário</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
                <div class="grid-item">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Relatório Financeiro</h3>
                    <p>Análise financeira e receitas</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
                <div class="grid-item">
                    <i class="fas fa-users"></i>
                    <h3>Relatório de Clientes</h3>
                    <p>Base de clientes e análises</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
                <div class="grid-item">
                    <i class="fas fa-tasks"></i>
                    <h3>Relatório de Pedidos</h3>
                    <p>Histórico e performance de pedidos</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
                <div class="grid-item">
                    <i class="fas fa-truck"></i>
                    <h3>Relatório de Logística</h3>
                    <p>Desempenho das entregas</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;">Ver Relatório</button>
                </div>
            </div>
        `
    }
};

// Função para inicializar perfil do usuário
function initializeUserProfile() {
    try {
        const userStr = localStorage.getItem('ideart_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            
            // Atualizar avatar
            const userAvatarEl = document.getElementById('userAvatar');
            if (userAvatarEl) {
                userAvatarEl.src = user.avatar || 'https://via.placeholder.com/40';
            }
            
            // Atualizar nome
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.name || 'Usuário';
            }
            
            // Atualizar papel/role
            const userRoleEl = document.getElementById('userRole');
            if (userRoleEl) {
                userRoleEl.textContent = user.role || 'Usuário';
            }
            
            // Atualizar data de última acesso
            const lastAccessEl = document.getElementById('lastAccess');
            if (lastAccessEl && user.lastAccess) {
                lastAccessEl.textContent = new Date(user.lastAccess).toLocaleString('pt-BR');
            }
            
            // Atualizar nome no dropdown
            const dropdownUserName = document.getElementById('dropdownUserName');
            if (dropdownUserName) {
                dropdownUserName.textContent = user.name || 'Usuário';
            }
            
            // Atualizar email no dropdown
            const dropdownUserEmail = document.getElementById('dropdownUserEmail');
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = user.email || 'usuario@email.com';
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar perfil:', error);
    }
}

// Função para alternar dropdown do usuário
function toggleUserDropdown(e) {
    e.preventDefault();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Função para fechar dropdown ao clicar fora
function closeUserDropdown(e) {
    const dropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.querySelector('[onclick*="toggleUserDropdown"]');
    
    if (dropdown && userMenuBtn) {
        if (!dropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
}

// Função para fazer logout
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Tem certeza que deseja sair?')) {
        // Limpar dados do usuário
        localStorage.removeItem('ideart_user');
        localStorage.removeItem('ideart_remembered_username');
        sessionStorage.removeItem('ideart_session');
        
        // Redirecionar para login
        window.location.href = 'login.html';
    }
}

// Função para toggle sidebar
function toggleSidebarSize() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('minimized');
    
    // Salvar preferência
    const isMinimized = sidebar.classList.contains('minimized');
    localStorage.setItem(APP_CONFIG.sidebarMinimized, isMinimized);
}

// Função para restaurar estado do sidebar
function restoreSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isMinimized = localStorage.getItem(APP_CONFIG.sidebarMinimized) === 'true';
    
    if (isMinimized) {
        sidebar.classList.add('minimized');
    }
}

// Função para carregar página
function loadPage(pageName) {
    const page = pages[pageName] || pages.dashboard;
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');

    pageTitle.textContent = page.title;
    contentArea.innerHTML = page.content;

    // Atualizar menu ativo
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // Fechar sidebar em mobile após clicar
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }

    // Inicializar eventos da página específica
    if (pageName === 'produtos') {
        inicializarProdutos();
    }
}

// ============================================
// FUNÇÕES DE PRODUTOS
// ============================================

function inicializarProdutos() {
    const novoProdutoBtn = document.getElementById('novoProdutoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const cancelarProdutoBtn = document.getElementById('cancelarProdutoBtn');
    const salvarProdutoBtn = document.getElementById('salvarProdutoBtn');
    const modalNovoProduto = document.getElementById('modalNovoProduto');

    // Carregar lista de produtos
    carregarProdutos();

    // Abrir modal
    if (novoProdutoBtn) {
        novoProdutoBtn.addEventListener('click', abrirModalNovoProduto);
    }

    // Fechar modal
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalProduto);
    }

    if (cancelarProdutoBtn) {
        cancelarProdutoBtn.addEventListener('click', fecharModalProduto);
    }

    // Salvar produto
    if (salvarProdutoBtn) {
        salvarProdutoBtn.addEventListener('click', salvarNovoProduto);
    }

    // Fechar modal ao clicar fora
    if (modalNovoProduto) {
        window.addEventListener('click', (event) => {
            if (event.target === modalNovoProduto) {
                fecharModalProduto();
            }
        });
    }
}

function carregarProdutos() {
    fetch('/api/produtos')
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.dados) {
                const tbody = document.getElementById('produtosTbody');
                if (!tbody) return;

                tbody.innerHTML = '';

                data.dados.forEach(produto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${produto.id}</td>
                        <td>${produto.nome}</td>
                        <td>${produto.categoria || '-'}</td>
                        <td>R$ ${parseFloat(produto.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>${produto.estoque}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="editarProduto(${produto.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="deletarProduto(${produto.id})">
                                <i class="fas fa-trash"></i> Deletar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(erro => {
            console.error('Erro ao carregar produtos:', erro);
            alert('Erro ao carregar produtos');
        });
}

function abrirModalNovoProduto() {
    const modal = document.getElementById('modalNovoProduto');
    const form = document.getElementById('formNovoProduto');
    
    if (form) {
        form.reset();
    }

    limparMensagemProduto();

    if (modal) {
        modal.classList.add('show');
    }
}

function fecharModalProduto() {
    const modal = document.getElementById('modalNovoProduto');
    if (modal) {
        modal.classList.remove('show');
    }
}

function salvarNovoProduto(e) {
    e.preventDefault();

    const form = document.getElementById('formNovoProduto');
    if (!form) return;

    const nome = document.getElementById('produtoNome').value.trim();
    const categoria = document.getElementById('produtoCategoria').value.trim();
    const sku = document.getElementById('produtoSku').value.trim();
    const descricao = document.getElementById('produtoDescricao').value.trim();
    const preco_custo = parseFloat(document.getElementById('produtoPrecoCusto').value) || 0;
    const preco_venda = parseFloat(document.getElementById('produtoPrecoVenda').value);
    const estoque = parseInt(document.getElementById('produtoEstoque').value) || 0;

    // Validação
    if (!nome) {
        mostrarMensagemProduto('Nome do produto é obrigatório', 'erro');
        return;
    }

    if (!preco_venda || preco_venda <= 0) {
        mostrarMensagemProduto('Preço de venda é obrigatório e deve ser maior que zero', 'erro');
        return;
    }

    // Desabilitar botão durante envio
    const salvarBtn = document.getElementById('salvarProdutoBtn');
    salvarBtn.disabled = true;
    salvarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

    const dados = {
        nome,
        categoria,
        sku,
        descricao,
        preco_custo,
        preco_venda,
        estoque,
        ativo: document.getElementById('produtoAtivo').checked
    };

    fetch('/api/produtos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                mostrarMensagemProduto('Produto criado com sucesso!', 'sucesso');
                
                setTimeout(() => {
                    fecharModalProduto();
                    carregarProdutos();
                }, 1500);
            } else {
                mostrarMensagemProduto(data.mensagem || 'Erro ao salvar produto', 'erro');
            }
        })
        .catch(erro => {
            console.error('Erro:', erro);
            mostrarMensagemProduto('Erro ao comunicar com o servidor', 'erro');
        })
        .finally(() => {
            salvarBtn.disabled = false;
            salvarBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Produto';
        });
}

function editarProduto(id) {
    alert('Funcionalidade de editar em desenvolvimento! Produto ID: ' + id);
}

function deletarProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Produto deletado com sucesso!');
                    carregarProdutos();
                } else {
                    alert(data.mensagem || 'Erro ao deletar produto');
                }
            })
            .catch(erro => {
                console.error('Erro:', erro);
                alert('Erro ao deletar produto');
            });
    }
}

function mostrarMensagemProduto(mensagem, tipo) {
    const messageEl = document.getElementById('mensagemProduto');
    if (!messageEl) return;

    messageEl.textContent = mensagem;
    messageEl.className = `alert alert-${tipo}`;
    messageEl.style.display = 'block';
}

function limparMensagemProduto() {
    const messageEl = document.getElementById('mensagemProduto');
    if (messageEl) {
        messageEl.style.display = 'none';
        messageEl.textContent = '';
    }
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Restaurar estado do sidebar
    restoreSidebarState();
    
    // Inicializar perfil do usuário
    initializeUserProfile();
    
    // Carregar página inicial
    loadPage('dashboard');

    // Menu items
    document.querySelectorAll('.menu-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.getAttribute('data-page');
            loadPage(pageName);
        });
    });

    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.toggle-sidebar')) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Event listeners para dropdown de usuário
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (userDropdown && userMenuBtn) {
            if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        }
    });
    
    // Event listener para botão "Sair" do dropdown
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Event listener para botão "Alterar Senha"
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.remove('show');
            alert('Funcionalidade de alterar senha em desenvolvimento!');
            // Aqui iremos adicionar modal de alterar senha no futuro
        });
    }
    
    // Event listener para botão de toggle sidebar
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebarSize();
        });
    }
});
