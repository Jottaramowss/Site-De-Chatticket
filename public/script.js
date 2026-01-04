// ============================================
// CBA ADMIN - SISTEMA COMPLETO COM MODAIS ELEGANTES
// ============================================

// Configurações
const API_URL = 'http://localhost:5000';
let socket = null;
let usuario = null;
let contatos = [];
let contatoSelecionado = null;
let mensagens = {};

// DADOS MOCK
let kanbanCards = [
    {
        id: '1',
        titulo: 'Desenvolver novo site',
        descricao: 'Criar layout e funcionalidades',
        coluna: 'andamento',
        tag: 'design',
        data: '15/09'
    }
];

let tarefasMock = [
    {
        id: '1',
        titulo: 'Revisar relatório mensal',
        descricao: 'Analisar métricas de atendimento',
        data: '15/09',
        responsavel: 'Eu',
        prioridade: 'alta',
        concluida: false
    }
];

let agendamentos = [
    {
        id: '1',
        data: new Date().toISOString().split('T')[0],
        hora: '10:00',
        cliente: 'João Silva',
        descricao: 'Reunião de alinhamento',
        status: 'confirmado'
    }
];

// TAGS
let tags = [
    { id: '1', nome: 'ATENDIMENTO TÉCNICO', cor: '#3b82f6', quantidade: 12 },
    { id: '2', nome: 'LIBERAÇÃO', cor: '#10b981', quantidade: 8 },
    { id: '3', nome: 'Reclamação', cor: '#ef4444', quantidade: 5 },
    { id: '4', nome: 'SUPERVISÃO', cor: '#8b5cf6', quantidade: 7 },
    { id: '5', nome: 'Registros Técnicos', cor: '#f59e0b', quantidade: 9 },
    { id: '6', nome: 'Ações', cor: '#06b6d4', quantidade: 15 }
];

// Dados do Chat Interno
let chatInternoUsuarios = [
    { id: 1, nome: 'Maria Silva', email: 'maria@empresa.com', online: true, avatar: 'M', cargo: 'Atendente' },
    { id: 2, nome: 'Carlos Santos', email: 'carlos@empresa.com', online: true, avatar: 'C', cargo: 'Suporte Técnico' },
    { id: 3, nome: 'Ana Oliveira', email: 'ana@empresa.com', online: false, avatar: 'A', cargo: 'Gerente' },
    { id: 4, nome: 'Pedro Costa', email: 'pedro@empresa.com', online: true, avatar: 'P', cargo: 'Desenvolvedor' },
    { id: 5, nome: 'Julia Mendes', email: 'julia@empresa.com', online: false, avatar: 'J', cargo: 'Marketing' }
];

let chatInternoMensagens = [
    { id: 1, usuarioId: 1, usuarioNome: 'Maria Silva', texto: 'Bom dia equipe! Alguém pode revisar o relatório?', hora: '09:00', tipo: 'recebida' },
    { id: 2, usuarioId: 2, usuarioNome: 'Carlos Santos', texto: 'Bom dia Maria! Posso revisar depois do almoço.', hora: '09:02', tipo: 'recebida' },
    { id: 3, usuarioId: 3, usuarioNome: 'Ana Oliveira', texto: 'Pessoal, reunião às 14h para alinhar metas.', hora: '09:05', tipo: 'recebida' },
    { id: 4, usuarioId: 4, usuarioNome: 'Pedro Costa', texto: 'Acabei de corrigir o bug no sistema de mensagens.', hora: '09:15', tipo: 'recebida' }
];

let chatGrupoAtual = 'geral';
let usuarioChatSelecionado = null;

// Configurações de Importação/Exportação
let tipoImportacaoAtual = null;
let dadosImportacao = null;
let formatoExportacaoAtual = 'csv';

// Configurações de Tema
let temaAtual = 'whatsapp';
const temasDisponiveis = {
    whatsapp: {
        name: 'WhatsApp',
        bgClass: 'chat-whatsapp whatsapp-bg-pattern',
        icon: 'fab fa-whatsapp'
    },
    padrao: {
        name: 'Padrão',
        bgClass: '',
        icon: 'fas fa-comment'
    }
};

// Variáveis para modais
let modalTipoAtual = null;
let dadosModalAtual = null;
let passoAtualModal = 0;

// Elementos DOM
const elementos = {
    // Login
    loginScreen: document.getElementById('login-screen'),
    app: document.getElementById('app'),
    loginEmail: document.getElementById('login-email'),
    loginSenha: document.getElementById('login-senha'),
    btnLogin: document.getElementById('btn-login'),
    
    // Usuário
    userName: document.getElementById('user-name'),
    userEmail: document.getElementById('user-email'),
    btnLogout: document.getElementById('btn-logout'),
    
    // Navegação
    menuItems: document.querySelectorAll('.menu-section li[data-section]'),
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    
    // Seções
    sections: {
        atendimento: document.getElementById('atendimento-section'),
        contatos: document.getElementById('contatos-section'),
        dashboard: document.getElementById('dashboard-section'),
        kanban: document.getElementById('kanban-section'),
        tarefas: document.getElementById('tarefas-section'),
        agenciamentos: document.getElementById('agenciamentos-section'),
        tags: document.getElementById('tags-section'),
        chatInterno: document.getElementById('chat-interno-section'),
        ajuda: document.getElementById('ajuda-section'),
        relatorios: document.getElementById('relatorios-section')
    },
    
    // Atendimento
    searchContatos: document.getElementById('search-contatos'),
    contactsList: document.getElementById('contacts-list'),
    statusTabs: document.querySelectorAll('.status-tab'),
    chatHeader: document.getElementById('chat-header'),
    chatAvatar: document.getElementById('chat-avatar'),
    chatContactName: document.getElementById('chat-contact-name'),
    chatContactStatus: document.getElementById('chat-contact-status'),
    messagesContainer: document.getElementById('messages-container'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    
    // Contatos
    btnNovoContato: document.getElementById('btn-novo-contato'),
    btnImportarContatos: document.getElementById('btn-importar-contatos'),
    btnExportarContatos: document.getElementById('btn-exportar-contatos'),
    contatoSearch: document.getElementById('contato-search'),
    filterStatus: document.getElementById('filter-status'),
    filterTags: document.getElementById('filter-tags'),
    contatosTableBody: document.getElementById('contatos-table-body'),
    
    // Dashboard
    dashboardPeriod: document.getElementById('dashboard-period'),
    statTotalContatos: document.getElementById('stat-total-contatos'),
    statContatosAtivos: document.getElementById('stat-contatos-ativos'),
    statAtendimentosHoje: document.getElementById('stat-atendimentos-hoje'),
    statTaxaResolucao: document.getElementById('stat-taxa-resolucao'),
    activityList: document.getElementById('activity-list'),
    
    // Badges
    badgeAtendimentos: document.getElementById('badge-atendimentos'),
    badgeContatos: document.getElementById('badge-contatos'),
    
    // Modais
    importModal: document.getElementById('import-modal'),
    exportModal: document.getElementById('export-modal'),
    createModal: document.getElementById('create-modal'),
    modalTitle: document.getElementById('modal-title'),
    formContainer: document.getElementById('form-container'),
    btnSaveCreate: document.getElementById('btn-save-create'),
    
    // Kanban
    btnNovoCard: document.getElementById('btn-novo-card'),
    btnNovaColuna: document.getElementById('btn-nova-coluna'),
    
    // Tarefas
    btnNovaTarefa: document.getElementById('btn-nova-tarefa'),
    filterPrioridade: document.getElementById('filter-prioridade'),
    filterResponsavel: document.getElementById('filter-responsavel'),
    filterStatusTarefa: document.getElementById('filter-status-tarefa'),
    tarefasContainer: document.getElementById('tarefas-container'),
    
    // Agenciamentos
    btnNovoAgendamento: document.getElementById('btn-novo-agendamento'),
    agendamentosHojeCount: document.getElementById('agendamentos-hoje-count'),
    agendamentosFuturosCount: document.getElementById('agendamentos-futuros-count'),
    agendamentosHojeList: document.getElementById('agendamentos-hoje-list'),
    agendamentosFuturosList: document.getElementById('agendamentos-futuros-list'),
    
    // Tags
    btnNovaTag: document.getElementById('btn-nova-tag'),
    totalTags: document.getElementById('total-tags'),
    tagMaisUsada: document.getElementById('tag-mais-usada'),
    tagsContainer: document.getElementById('tags-container'),
    
    // Chat Interno
    searchUsuarios: document.getElementById('search-usuarios'),
    usuariosList: document.getElementById('usuarios-list'),
    chatGrupoNome: document.getElementById('chat-grupo-nome'),
    chatInternoMessages: document.getElementById('chat-interno-messages'),
    chatInternoInput: document.getElementById('chat-interno-input'),
    chatInternoSend: document.getElementById('chat-interno-send'),
    
    // Relatórios
    btnGerarRelatorio: document.getElementById('btn-gerar-relatorio'),
    relatorioPeriodo: document.getElementById('relatorio-periodo'),
    relatoriosContent: document.getElementById('relatorios-content'),
    
    // Botão de Tema
    themeToggle: document.getElementById('theme-toggle'),
    
    // Importação
    fileInput: document.getElementById('file-input'),
    manualData: document.getElementById('manual-data'),
    whatsappFile: document.getElementById('whatsapp-file'),
    importProgress: document.getElementById('import-progress'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    processedCount: document.getElementById('processed-count'),
    totalCount: document.getElementById('total-count'),
    btnProcessImport: document.getElementById('btn-process-import'),
    
    // Exportação
    exportPreview: document.getElementById('preview-content')
};

// ========== FUNÇÃO DEBUG ==========
function debug(msg) {
    console.log(`🔍 ${msg}`);
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM carregado');
    inicializarApp();
    atualizarHora();
    setInterval(atualizarHora, 60000);
});

function inicializarApp() {
    debug('Inicializando app...');
    
    // Verificar se já está logado
    const token = localStorage.getItem('cba_token');
    if (token) {
        debug('Token encontrado, carregando usuário...');
        carregarUsuarioSalvo();
    }
    
    // Event Listeners BÁSICOS
    elementos.btnLogin.addEventListener('click', fazerLogin);
    elementos.loginSenha.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fazerLogin();
    });
    
    elementos.btnLogout.addEventListener('click', fazerLogout);
    
    // Navegação do menu
    elementos.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            debug(`Clicou na seção: ${section}`);
            mostrarSecao(section);
            
            // Atualizar menu ativo
            elementos.menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Event Listeners PARA NOVAS ABAS
    inicializarEventosNovasAbas();
    
    // Event Listeners de Importação/Exportação
    inicializarEventosImportExport();
    
    // Carregar configurações e tema
    carregarConfiguracoes();
    aplicarTema();
    
    // Inicializar drag and drop para importação
    inicializarDragAndDrop();
    
    debug('App inicializado com sucesso!');
}

function inicializarEventosNovasAbas() {
    // Contatos
    if (elementos.btnNovoContato) {
        elementos.btnNovoContato.addEventListener('click', () => {
            abrirModalCriacao('contato');
        });
    }
    
    // Kanban
    if (elementos.btnNovoCard) {
        elementos.btnNovoCard.addEventListener('click', () => {
            abrirModalCriacao('card');
        });
    }
    
    if (elementos.btnNovaColuna) {
        elementos.btnNovaColuna.addEventListener('click', criarNovaColunaKanban);
    }
    
    // Tarefas
    if (elementos.btnNovaTarefa) {
        elementos.btnNovaTarefa.addEventListener('click', () => {
            abrirModalCriacao('tarefa');
        });
    }
    
    if (elementos.filterPrioridade) {
        elementos.filterPrioridade.addEventListener('change', carregarTarefas);
    }
    
    // Agenciamentos
    if (elementos.btnNovoAgendamento) {
        elementos.btnNovoAgendamento.addEventListener('click', () => {
            abrirModalCriacao('agendamento');
        });
    }
    
    // Tags
    if (elementos.btnNovaTag) {
        elementos.btnNovaTag.addEventListener('click', () => {
            abrirModalCriacao('tag');
        });
    }
    
    // Chat Interno
    if (elementos.chatInternoSend) {
        elementos.chatInternoSend.addEventListener('click', enviarMensagemChatInterno);
    }
    
    if (elementos.chatInternoInput) {
        elementos.chatInternoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagemChatInterno();
            }
        });
    }
    
    // Outros eventos existentes
    if (elementos.searchContatos) {
        elementos.searchContatos.addEventListener('input', filtrarContatos);
    }
    
    if (elementos.statusTabs) {
        elementos.statusTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elementos.statusTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                filtrarContatos();
            });
        });
    }
    
    if (elementos.sendButton) {
        elementos.sendButton.addEventListener('click', enviarMensagem);
    }
    
    if (elementos.messageInput) {
        elementos.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagem();
            }
        });
        
        elementos.messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    if (elementos.contatoSearch) {
        elementos.contatoSearch.addEventListener('input', filtrarTabelaContatos);
    }
    
    if (elementos.dashboardPeriod) {
        elementos.dashboardPeriod.addEventListener('change', carregarDashboard);
    }
}

function inicializarEventosImportExport() {
    // Importação
    if (elementos.btnImportarContatos) {
        elementos.btnImportarContatos.addEventListener('click', abrirModalImportacao);
    }
    
    if (elementos.fileInput) {
        elementos.fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (elementos.whatsappFile) {
        elementos.whatsappFile.addEventListener('change', handleWhatsAppFile);
    }
    
    // Exportação
    if (elementos.btnExportarContatos) {
        elementos.btnExportarContatos.addEventListener('click', abrirModalExportacao);
    }
    
    // Tema
    if (elementos.themeToggle) {
        elementos.themeToggle.addEventListener('click', alternarTema);
    }
}

function inicializarDragAndDrop() {
    const dropArea = document.getElementById('drop-area');
    if (!dropArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }
}

function handleFile(file) {
    debug(`Arquivo recebido: ${file.name}`);
    
    if (!file.name.match(/\.(csv|xlsx|xls|txt|vcf)$/i)) {
        mostrarToast('Formato de arquivo não suportado!', 'error');
        return;
    }
    
    elementos.fileInput.files = createFileList(file);
    handleFileSelect({ target: elementos.fileInput });
}

function createFileList(files) {
    const dt = new DataTransfer();
    if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
            dt.items.add(files[i]);
        }
    } else {
        dt.items.add(files);
    }
    return dt.files;
}

// ========== FUNÇÕES DE TEMA ==========
function alternarTema() {
    temaAtual = temaAtual === 'whatsapp' ? 'padrao' : 'whatsapp';
    aplicarTema();
    salvarConfiguracoes();
}

function aplicarTema() {
    const chatContainer = document.querySelector('.chat-container');
    const atendimentoSection = elementos.sections.atendimento;
    
    if (chatContainer && atendimentoSection) {
        // Remover todas as classes de tema
        chatContainer.classList.remove('chat-whatsapp', 'whatsapp-bg-pattern');
        atendimentoSection.classList.remove('chat-whatsapp', 'whatsapp-bg-pattern');
        
        // Aplicar tema atual
        if (temaAtual === 'whatsapp') {
            chatContainer.classList.add('chat-whatsapp', 'whatsapp-bg-pattern');
            atendimentoSection.classList.add('chat-whatsapp', 'whatsapp-bg-pattern');
        }
    }
    
    // Atualizar botão de alternar tema
    if (elementos.themeToggle) {
        const tema = temasDisponiveis[temaAtual];
        elementos.themeToggle.innerHTML = `<i class="${tema.icon}"></i> ${tema.name}`;
        elementos.themeToggle.title = `Alternar para tema ${temaAtual === 'whatsapp' ? 'Padrão' : 'WhatsApp'}`;
    }
    
    // Recarregar mensagens para aplicar novo estilo
    if (contatoSelecionado) {
        renderizarMensagens(contatoSelecionado.id);
    }
}

function salvarConfiguracoes() {
    const config = {
        tema: temaAtual,
        usuario: usuario ? usuario.id : null
    };
    localStorage.setItem('cba_config', JSON.stringify(config));
}

function carregarConfiguracoes() {
    const configSalva = localStorage.getItem('cba_config');
    if (configSalva) {
        try {
            const config = JSON.parse(configSalva);
            temaAtual = config.tema || 'whatsapp';
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
    }
}

// ========== AUTENTICAÇÃO ==========
async function fazerLogin() {
    debug('Tentando login...');
    
    const email = elementos.loginEmail.value.trim();
    const senha = elementos.loginSenha.value.trim();
    
    if (!email) {
        mostrarToast('Por favor, digite seu e-mail', 'warning');
        return;
    }
    
    // Mostrar loading
    elementos.btnLogin.disabled = true;
    elementos.btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        if (response.ok) {
            const data = await response.json();
            debug('Login bem sucedido!');
            
            usuario = data.usuario;
            localStorage.setItem('cba_token', data.token);
            localStorage.setItem('cba_usuario', JSON.stringify(data.usuario));
            
            // Mostrar app
            elementos.loginScreen.classList.add('hidden');
            elementos.app.classList.remove('hidden');
            
            // Atualizar informações do usuário
            elementos.userName.textContent = usuario.nome;
            elementos.userEmail.textContent = usuario.email;
            
            // Carregar dados iniciais
            await carregarDadosIniciais();
            
            // Mostrar atendimento por padrão
            mostrarSecao('atendimento');
            
            mostrarToast('Login realizado com sucesso!', 'success');
            
        } else {
            // Se a API falhar, usar modo offline
            debug('API falhou, usando modo offline...');
            loginOffline(email, senha);
        }
    } catch (error) {
        debug(`Erro na conexão: ${error.message}`);
        // Modo offline
        loginOffline(email, senha);
    } finally {
        elementos.btnLogin.disabled = false;
        elementos.btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Sistema';
    }
}

function loginOffline(email, senha) {
    // Modo offline - login fixo
    if (email === 'admin@cba.com' && senha === '123456') {
        usuario = {
            id: 1,
            nome: "Administrador",
            email: "admin@cba.com",
            avatar: "A",
            empresa: "Empresa 1",
            licenca: "2025-09-14",
            online: true
        };
        
        localStorage.setItem('cba_token', 'fake-token-offline');
        localStorage.setItem('cba_usuario', JSON.stringify(usuario));
        
        elementos.loginScreen.classList.add('hidden');
        elementos.app.classList.remove('hidden');
        
        elementos.userName.textContent = usuario.nome;
        elementos.userEmail.textContent = usuario.email;
        
        // Carregar dados mock
        carregarDadosMock();
        
        // Mostrar atendimento
        mostrarSecao('atendimento');
        
        mostrarToast('Login bem-sucedido (modo offline)', 'success');
    } else {
        mostrarToast('Credenciais inválidas. Use admin@cba.com / 123456', 'error');
    }
}

function carregarUsuarioSalvo() {
    const usuarioSalvo = localStorage.getItem('cba_usuario');
    if (usuarioSalvo) {
        usuario = JSON.parse(usuarioSalvo);
        elementos.loginScreen.classList.add('hidden');
        elementos.app.classList.remove('hidden');
        elementos.userName.textContent = usuario.nome;
        elementos.userEmail.textContent = usuario.email;
        
        carregarDadosMock();
        mostrarSecao('atendimento');
        mostrarToast('Sessão recuperada com sucesso!', 'success');
    }
}

function fazerLogout() {
    mostrarConfirmacao(
        'Tem certeza que deseja sair?',
        'Você será desconectado do sistema.',
        'Sair',
        'Cancelar',
        () => {
            localStorage.clear();
            usuario = null;
            contatos = [];
            contatoSelecionado = null;
            
            if (socket) {
                socket.disconnect();
                socket = null;
            }
            
            elementos.app.classList.add('hidden');
            elementos.loginScreen.classList.remove('hidden');
            
            // Limpar campos
            elementos.loginEmail.value = 'admin@cba.com';
            elementos.loginSenha.value = '123456';
            
            mostrarToast('Logout realizado com sucesso!', 'success');
        }
    );
}

// ========== DADOS MOCK ==========
function carregarDadosMock() {
    debug('Carregando dados mock...');
    
    // Dados mock para contatos
    contatos = [
        {
            id: 1,
            nome: "João Silva",
            telefone: "11999999999",
            email: "joao@email.com",
            status: "atendendo",
            tags: ["ATENDIMENTO TÉCNICO", "vip"],
            ultimaInteracao: new Date().toISOString(),
            online: true,
            dataCriacao: "2025-09-01"
        },
        {
            id: 2,
            nome: "Maria Santos",
            telefone: "11888888888",
            email: "maria@email.com",
            status: "aguardando",
            tags: ["Reclamação"],
            ultimaInteracao: new Date().toISOString(),
            online: false,
            dataCriacao: "2025-09-05"
        },
        {
            id: 3,
            nome: "Portaria Virtual",
            telefone: "1133333333",
            email: "portaria@empresa.com",
            status: "atendendo",
            tags: ["LIBERAÇÃO", "SUPERVISÃO"],
            ultimaInteracao: new Date().toISOString(),
            online: true,
            dataCriacao: "2025-09-10"
        },
        {
            id: 4,
            nome: "Carlos Oliveira",
            telefone: "11777777777",
            email: "carlos@empresa.com",
            status: "finalizado",
            tags: ["VIP", "Ações"],
            ultimaInteracao: "2025-09-12T10:30:00",
            online: false,
            dataCriacao: "2025-08-15"
        },
        {
            id: 5,
            nome: "Ana Paula",
            telefone: "11666666666",
            email: "ana@email.com",
            status: "aguardando",
            tags: ["Novo"],
            ultimaInteracao: "2025-09-14T14:20:00",
            online: true,
            dataCriacao: "2025-09-13"
        }
    ];
    
    // Dados mock para mensagens
    mensagens = {
        1: [
            {
                id: 1,
                tipo: "recebida",
                texto: "A TENDIMENTO TÉCNICO  \nTags  \n  \n08/12/2025  \n  \nLiberação  \n17:23 ✔",
                hora: "17:23",
                lida: true
            },
            {
                id: 2,
                tipo: "recebida",
                texto: "[1] - LIBERAÇÃO  \n[2] - SUPORTE TÉCNICO  \n[3] - SUPERVISÃO",
                hora: "17:25",
                lida: true
            },
            {
                id: 3,
                tipo: "recebida",
                texto: "Olá! Aqui é a Portaria Virtual. Como posso ajudar?  \n  \nSe desejar, basta informar o número da opção desejada ou descrever sua solicitação:  \n  \n[1] Liberação  \n[2] Suporte técnico  \n[3] Supervisão",
                hora: "17:25",
                lida: true
            },
            {
                id: 4,
                tipo: "enviada",
                texto: "1",
                hora: "17:25",
                lida: true
            },
            {
                id: 5,
                tipo: "recebida",
                texto: "Opção inválida, por favor, escolha uma opção válida.",
                hora: "17:25",
                lida: false
            },
            {
                id: 6,
                tipo: "recebida",
                texto: "[1] - LIBERAÇÃO  \n[2] - SUPORTE TÉCNICO  \n[3] - SUPERVISÃO",
                hora: "17:25",
                lida: false
            }
        ],
        2: [
            {
                id: 1,
                tipo: "recebida",
                texto: "Quando chega meu pedido?",
                hora: "09:15",
                lida: false
            }
        ],
        3: [
            {
                id: 1,
                tipo: "recebida",
                texto: "Sistema de portaria automatizada  \nStatus: Online  \n  \nDigite [1] para liberação  \n[2] para suporte  \n[3] para supervisão",
                hora: "10:00",
                lida: true
            }
        ]
    };
    
    // Atualizar dados do Kanban
    kanbanCards = [
        {
            id: '1',
            titulo: 'Revisar novos contatos',
            descricao: 'Verificar novos clientes cadastrados',
            coluna: 'aguardando',
            tag: 'ATENDIMENTO TÉCNICO',
            data: '18/09',
            responsavel: 'João',
            cor: '#3b82f6'
        },
        {
            id: '2',
            titulo: 'Atendimento cliente VIP',
            descricao: 'Suporte especializado',
            coluna: 'andamento',
            tag: 'ATENDIMENTO TÉCNICO',
            data: '15/09',
            responsavel: 'Maria',
            cor: '#10b981'
        },
        {
            id: '3',
            titulo: 'Corrigir bug crítico',
            descricao: 'Problema no sistema de mensagens',
            coluna: 'revisao',
            tag: 'Reclamação',
            data: '20/09',
            responsavel: 'Carlos',
            cor: '#ef4444'
        },
        {
            id: '4',
            titulo: 'Desenvolver nova funcionalidade',
            descricao: 'Criar integração com WhatsApp',
            coluna: 'concluido',
            tag: 'Ações',
            data: '10/09',
            responsavel: 'Ana',
            cor: '#06b6d4'
        }
    ];
    
    // Renderizar dados
    renderizarListaContatos();
    atualizarBadges();
    carregarDashboard();
    
    // Mostrar primeiro contato
    if (contatos.length > 0) {
        setTimeout(() => selecionarContato(1), 500);
    }
}

// ========== FORMATAÇÃO DE TEXTO ==========
function formatarTextoMensagem(texto) {
    if (!texto) return '';
    
    // Substituir quebras de linha
    texto = texto.replace(/\n/g, '<br>');
    
    // Destacar opções numéricas [1], [2], etc.
    texto = texto.replace(/\[(\d+)\]/g, '<strong class="option-number">[$1]</strong>');
    
    // Destacar checkmarks
    texto = texto.replace(/✔/g, '<span class="checkmark">✔</span>');
    
    return texto;
}

// ========== SEÇÕES ==========
function mostrarSecao(section) {
    debug(`Mostrando seção: ${section}`);
    
    // Esconder todas as seções
    Object.values(elementos.sections).forEach(sec => {
        if (sec) sec.classList.add('hidden');
    });
    
    // Mostrar seção selecionada
    if (elementos.sections[section]) {
        elementos.sections[section].classList.remove('hidden');
    } else {
        debug(`ERRO: Seção ${section} não encontrada!`);
    }
    
    // Atualizar título
    const titulos = {
        atendimento: 'Atendimentos',
        contatos: 'Contatos',
        dashboard: 'Dashboard',
        kanban: 'Kanban',
        tarefas: 'Tarefas',
        agenciamentos: 'Agenciamentos',
        tags: 'Tags',
        chatInterno: 'Chat Interno',
        ajuda: 'Ajuda',
        relatorios: 'Relatórios'
    };
    
    const subtitulos = {
        atendimento: 'Gerencie conversas com clientes',
        contatos: 'Gerencie sua lista de contatos',
        dashboard: 'Visão geral do sistema',
        kanban: 'Organize tarefas e projetos',
        tarefas: 'Gerencie suas atividades',
        agenciamentos: 'Agendamentos e compromissos',
        tags: 'Categorize e organize contatos',
        chatInterno: 'Comunicação interna da equipe',
        ajuda: 'Central de suporte e ajuda',
        relatorios: 'Relatórios e análises'
    };
    
    if (elementos.pageTitle) {
        elementos.pageTitle.textContent = titulos[section] || section;
    }
    
    if (elementos.pageSubtitle) {
        elementos.pageSubtitle.textContent = subtitulos[section] || '';
    }
    
    // Ações específicas por seção
    switch(section) {
        case 'contatos':
            renderizarTabelaContatos();
            break;
        case 'dashboard':
            carregarDashboard();
            break;
        case 'kanban':
            carregarKanban();
            break;
        case 'tarefas':
            carregarTarefas();
            break;
        case 'agenciamentos':
            carregarAgenciamentos();
            break;
        case 'tags':
            carregarTags();
            break;
        case 'chatInterno':
            carregarChatInterno();
            break;
        case 'relatorios':
            carregarRelatorios();
            break;
        case 'ajuda':
            carregarAjuda();
            break;
    }
}

// ========== ATENDIMENTO ==========
function renderizarListaContatos() {
    if (!elementos.contactsList) return;
    
    const container = elementos.contactsList;
    const statusAtivo = document.querySelector('.status-tab.active') ? document.querySelector('.status-tab.active').dataset.status : 'todos';
    const busca = elementos.searchContatos ? elementos.searchContatos.value.toLowerCase() : '';
    
    let contatosFiltrados = contatos;
    
    // Filtrar por status
    if (statusAtivo !== 'todos') {
        contatosFiltrados = contatosFiltrados.filter(c => c.status === statusAtivo);
    }
    
    // Filtrar por busca
    if (busca) {
        contatosFiltrados = contatosFiltrados.filter(c => 
            c.nome.toLowerCase().includes(busca) ||
            c.telefone.includes(busca) ||
            (c.email && c.email.toLowerCase().includes(busca)) ||
            c.tags.some(tag => tag.toLowerCase().includes(busca))
        );
    }
    
    if (contatosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>Nenhum contato encontrado</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = contatosFiltrados.map(contato => {
        const ultimaMensagem = mensagens[contato.id]?.[mensagens[contato.id].length - 1];
        const mensagemPreview = ultimaMensagem ? 
            (ultimaMensagem.texto.length > 30 ? ultimaMensagem.texto.substring(0, 30) + '...' : ultimaMensagem.texto) : 
            'Nenhuma mensagem';
        
        const hora = new Date(contato.ultimaInteracao).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="contact-item ${contatoSelecionado?.id === contato.id ? 'active' : ''}" 
                 onclick="selecionarContato(${contato.id})">
                <div class="contact-header">
                    <div class="contact-name">
                        ${contato.online ? '<span class="online-indicator"></span>' : ''}
                        ${contato.nome}
                    </div>
                    <div class="contact-time">${hora}</div>
                </div>
                <div class="contact-message">${mensagemPreview}</div>
                <div class="contact-footer">
                    <div class="contact-status status-${contato.status}">
                        ${contato.status === 'atendendo' ? 'Atendendo' : 
                          contato.status === 'aguardando' ? 'Aguardando' : 'Finalizado'}
                    </div>
                    <div class="contact-tags">
                        ${contato.tags.slice(0, 2).map(tag => `
                            <span class="contact-tag" style="background: ${getTagColor(tag)}">${tag}</span>
                        `).join('')}
                        ${contato.tags.length > 2 ? `<span class="contact-tag">+${contato.tags.length - 2}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filtrarContatos() {
    renderizarListaContatos();
}

function selecionarContato(contatoId) {
    const contato = contatos.find(c => c.id === contatoId);
    if (!contato) return;
    
    contatoSelecionado = contato;
    renderizarListaContatos();
    
    // Atualizar header do chat
    if (elementos.chatAvatar) {
        elementos.chatAvatar.innerHTML = `<i class="fas fa-user"></i>`;
    }
    
    if (elementos.chatContactName) {
        elementos.chatContactName.textContent = contato.nome;
    }
    
    if (elementos.chatContactStatus) {
        elementos.chatContactStatus.textContent = contato.online ? '● Online' : '○ Offline';
        elementos.chatContactStatus.style.color = contato.online ? '#10b981' : '#6b7280';
    }
    
    // Habilitar input
    if (elementos.messageInput) {
        elementos.messageInput.disabled = false;
        elementos.messageInput.placeholder = 'Digite sua mensagem...';
    }
    
    if (elementos.sendButton) {
        elementos.sendButton.disabled = false;
    }
    
    // Carregar mensagens
    renderizarMensagens(contatoId);
}

function renderizarMensagens(contatoId) {
    if (!elementos.messagesContainer) return;
    
    const container = elementos.messagesContainer;
    const msgs = mensagens[contatoId] || [];
    
    if (msgs.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-comment-slash"></i>
                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = msgs.map(msg => {
        const isWhatsApp = temaAtual === 'whatsapp';
        const messageClass = msg.tipo === 'enviada' ? 'sent' : 'received';
        const textoFormatado = formatarTextoMensagem(msg.texto);
        
        if (isWhatsApp && msg.tipo === 'enviada') {
            return `
                <div class="message ${messageClass}">
                    <div class="message-text">${textoFormatado}</div>
                    <div class="message-time">
                        ${msg.hora}
                        ${msg.lida ? 
                            '<i class="fas fa-check-double read"></i>' : 
                            '<i class="fas fa-check sent"></i>'
                        }
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="message ${messageClass}">
                <div class="message-text">${textoFormatado}</div>
                <div class="message-time">${msg.hora}</div>
            </div>
        `;
    }).join('');
    
    // Scroll para baixo
    container.scrollTop = container.scrollHeight;
}

async function enviarMensagem() {
    const texto = elementos.messageInput ? elementos.messageInput.value.trim() : '';
    if (!texto || !contatoSelecionado) {
        mostrarToast('Digite uma mensagem primeiro!', 'warning');
        return;
    }
    
    try {
        // Simular envio
        if (!mensagens[contatoSelecionado.id]) {
            mensagens[contatoSelecionado.id] = [];
        }
        
        const novaMensagem = {
            id: mensagens[contatoSelecionado.id].length + 1,
            tipo: 'enviada',
            texto: texto,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            lida: true
        };
        
        mensagens[contatoSelecionado.id].push(novaMensagem);
        
        // Limpar input
        if (elementos.messageInput) {
            elementos.messageInput.value = '';
            elementos.messageInput.style.height = 'auto';
        }
        
        // Atualizar chat
        renderizarMensagens(contatoSelecionado.id);
        
        // Simular resposta automática
        setTimeout(() => {
            if (!mensagens[contatoSelecionado.id]) {
                mensagens[contatoSelecionado.id] = [];
            }
            
            const resposta = {
                id: mensagens[contatoSelecionado.id].length + 1,
                tipo: 'recebida',
                texto: 'Obrigado pela sua mensagem! Em breve retornarei.',
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                lida: false
            };
            
            mensagens[contatoSelecionado.id].push(resposta);
            renderizarMensagens(contatoSelecionado.id);
            mostrarToast('Mensagem recebida!', 'info');
        }, 1000);
        
        mostrarToast('Mensagem enviada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        mostrarToast('Erro ao enviar mensagem', 'error');
    }
}

// ========== CONTATOS ==========
function renderizarTabelaContatos() {
    if (!elementos.contatosTableBody) return;
    
    const tbody = elementos.contatosTableBody;
    const busca = elementos.contatoSearch ? elementos.contatoSearch.value.toLowerCase() : '';
    
    let contatosFiltrados = contatos;
    
    // Filtrar por busca
    if (busca) {
        contatosFiltrados = contatosFiltrados.filter(c => 
            c.nome.toLowerCase().includes(busca) ||
            c.telefone.includes(busca) ||
            (c.email && c.email.toLowerCase().includes(busca))
        );
    }
    
    if (contatosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <i class="fas fa-users"></i>
                    <p>Nenhum contato encontrado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = contatosFiltrados.map(contato => {
        const data = new Date(contato.ultimaInteracao);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <tr>
                <td>
                    <div class="contato-info">
                        <div class="contato-avatar">
                            ${contato.nome.charAt(0)}
                            ${contato.online ? '<span class="online-dot"></span>' : ''}
                        </div>
                        <div>
                            <strong>${contato.nome}</strong>
                            <div class="contato-email">${contato.email || 'Não informado'}</div>
                        </div>
                    </div>
                </td>
                <td>${formatarTelefone(contato.telefone)}</td>
                <td>${contato.email || '-'}</td>
                <td>
                    <span class="status-badge status-${contato.status}">
                        ${contato.status === 'atendendo' ? 'Atendendo' : 
                          contato.status === 'aguardando' ? 'Aguardando' : 'Finalizado'}
                    </span>
                </td>
                <td>
                    ${dataFormatada}<br>
                    <small>${horaFormatada}</small>
                </td>
                <td>
                    <div class="tags-container">
                        ${contato.tags.map(tag => `
                            <span class="tag" style="background: ${getTagColor(tag)}">${tag}</span>
                        `).join('')}
                    </div>
                </td>
                <td>
                    <button class="btn-action" onclick="selecionarContato(${contato.id})" title="Chat">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="btn-action" onclick="editarContato(${contato.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="excluirContato(${contato.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarTabelaContatos() {
    renderizarTabelaContatos();
}

function editarContato(contatoId) {
    const contato = contatos.find(c => c.id === contatoId);
    if (!contato) return;
    
    abrirModalCriacao('contato', contato);
}

function excluirContato(contatoId) {
    mostrarConfirmacao(
        'Excluir Contato',
        'Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita.',
        'Excluir',
        'Cancelar',
        () => {
            // Remover localmente
            contatos = contatos.filter(c => c.id !== contatoId);
            delete mensagens[contatoId];
            
            // Se for o contato selecionado, limpar chat
            if (contatoSelecionado?.id === contatoId) {
                contatoSelecionado = null;
                if (elementos.chatContactName) {
                    elementos.chatContactName.textContent = 'Selecione um contato';
                }
                if (elementos.chatContactStatus) {
                    elementos.chatContactStatus.textContent = 'Clique em um contato para conversar';
                }
                if (elementos.messageInput) {
                    elementos.messageInput.disabled = true;
                    elementos.messageInput.placeholder = 'Selecione um contato para enviar mensagem';
                }
                if (elementos.sendButton) {
                    elementos.sendButton.disabled = true;
                }
                if (elementos.messagesContainer) {
                    elementos.messagesContainer.innerHTML = `
                        <div class="empty-chat">
                            <i class="fas fa-comment-slash"></i>
                            <p>Selecione um contato para ver as mensagens</p>
                        </div>
                    `;
                }
            }
            
            // Atualizar interfaces
            renderizarListaContatos();
            renderizarTabelaContatos();
            atualizarBadges();
            
            mostrarToast('Contato excluído com sucesso!', 'success');
        }
    );
}

// ========== FUNÇÕES AUXILIARES PARA MODAIS ==========
function criarHeaderModal(titulo, icone = 'fas fa-plus') {
    return `
        <div class="modal-header stylish">
            <div class="modal-title-section">
                <div class="modal-icon">
                    <i class="${icone}"></i>
                </div>
                <div>
                    <h3>${titulo}</h3>
                    <p class="modal-subtitle">Preencha os dados abaixo</p>
                </div>
            </div>
            <button class="modal-close" onclick="fecharModalCriacao()">&times;</button>
        </div>
    `;
}

function criarCampoFormulario(tipo, id, label, valor = '', placeholder = '', opcoes = [], required = false) {
    let campo = '';
    
    switch(tipo) {
        case 'text':
        case 'email':
        case 'tel':
        case 'date':
        case 'time':
            campo = `
                <div class="form-group animated">
                    <label for="${id}">
                        ${label} ${required ? '<span class="required">*</span>' : ''}
                    </label>
                    <input type="${tipo}" 
                           id="${id}" 
                           value="${valor}" 
                           placeholder="${placeholder}"
                           ${required ? 'required' : ''}>
                </div>
            `;
            break;
            
        case 'textarea':
            campo = `
                <div class="form-group animated">
                    <label for="${id}">
                        ${label} ${required ? '<span class="required">*</span>' : ''}
                    </label>
                    <textarea id="${id}" 
                              placeholder="${placeholder}"
                              rows="4"
                              ${required ? 'required' : ''}>${valor}</textarea>
                </div>
            `;
            break;
            
        case 'select':
            const opcoesHtml = opcoes.map(opcao => {
                const selected = opcao.value === valor ? 'selected' : '';
                return `<option value="${opcao.value}" ${selected}>${opcao.label}</option>`;
            }).join('');
            
            campo = `
                <div class="form-group animated">
                    <label for="${id}">${label}</label>
                    <select id="${id}">
                        ${opcoesHtml}
                    </select>
                </div>
            `;
            break;
            
        case 'color':
            const coresHtml = opcoes.map((cor, index) => {
                const selected = cor === valor ? 'selected' : '';
                return `
                    <div class="color-preset ${selected}" 
                         style="background: ${cor}"
                         data-color="${cor}"
                         onclick="selecionarCorPreset(this, '${id}')">
                        <i class="fas fa-check"></i>
                    </div>
                `;
            }).join('');
            
            campo = `
                <div class="form-group animated">
                    <label for="${id}">${label}</label>
                    <div class="color-picker-premium">
                        <div class="color-presets">
                            ${coresHtml}
                        </div>
                        <div class="color-custom">
                            <label>Personalizar:</label>
                            <input type="color" id="${id}" value="${valor || '#3b82f6'}">
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'checkbox':
            campo = `
                <div class="form-group animated">
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="${id}" ${valor ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            ${label}
                        </label>
                    </div>
                </div>
            `;
            break;
            
        case 'multiselect':
            const tagsHtml = opcoes.map(opcao => {
                const selected = valor && valor.includes(opcao.value) ? 'selected' : '';
                return `<option value="${opcao.value}" ${selected}>${opcao.label}</option>`;
            }).join('');
            
            campo = `
                <div class="form-group animated">
                    <label for="${id}">${label}</label>
                    <div class="multiselect-container">
                        <div class="multiselect-tags" id="${id}-tags"></div>
                        <select id="${id}" multiple>
                            ${tagsHtml}
                        </select>
                    </div>
                </div>
            `;
            break;
    }
    
    return campo;
}

function selecionarCorPreset(elemento, inputId) {
    // Remover seleção anterior
    elemento.parentElement.querySelectorAll('.color-preset').forEach(preset => {
        preset.classList.remove('selected');
    });
    
    // Adicionar seleção atual
    elemento.classList.add('selected');
    
    // Atualizar input color
    const colorInput = document.getElementById(inputId);
    if (colorInput) {
        colorInput.value = elemento.dataset.color;
    }
}

function inicializarMultiSelect(selectId) {
    const select = document.getElementById(selectId);
    const tagsContainer = document.getElementById(`${selectId}-tags`);
    
    if (!select || !tagsContainer) return;
    
    function atualizarTags() {
        tagsContainer.innerHTML = '';
        const opcoesSelecionadas = Array.from(select.selectedOptions);
        
        opcoesSelecionadas.forEach(opcao => {
            const tag = document.createElement('span');
            tag.className = 'multiselect-tag';
            tag.innerHTML = `
                ${opcao.text}
                <button type="button" onclick="removerTagMultiSelect('${selectId}', '${opcao.value}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            tagsContainer.appendChild(tag);
        });
    }
    
    select.addEventListener('change', atualizarTags);
    atualizarTags();
}

function removerTagMultiSelect(selectId, valor) {
    const select = document.getElementById(selectId);
    const opcao = select.querySelector(`option[value="${valor}"]`);
    
    if (opcao) {
        opcao.selected = false;
        select.dispatchEvent(new Event('change'));
    }
}

function criarNavegacaoFormulario(totalPassos) {
    const stepsHtml = Array.from({ length: totalPassos }, (_, i) => {
        const active = i === 0 ? 'active' : '';
        return `<span class="step ${active}"></span>`;
    }).join('');
    
    return `
        <div class="form-navigation">
            <button type="button" class="btn-navigation btn-prev" onclick="navegarFormulario(-1)" style="display: none;">
                <i class="fas fa-arrow-left"></i> Anterior
            </button>
            <div class="form-steps">
                ${stepsHtml}
            </div>
            <button type="button" class="btn-navigation btn-next" onclick="navegarFormulario(1)">
                Próximo <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function navegarFormulario(direcao) {
    const steps = document.querySelectorAll('.form-step');
    const currentStep = document.querySelector('.form-step.active');
    const currentIndex = Array.from(steps).indexOf(currentStep);
    const newIndex = currentIndex + direcao;
    
    if (newIndex >= 0 && newIndex < steps.length) {
        currentStep.classList.remove('active');
        steps[newIndex].classList.add('active');
        
        // Atualizar indicadores de passo
        const stepIndicators = document.querySelectorAll('.form-steps .step');
        stepIndicators.forEach((step, index) => {
            if (index === newIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Atualizar botões de navegação
        const btnPrev = document.querySelector('.btn-prev');
        const btnNext = document.querySelector('.btn-next');
        
        if (btnPrev) {
            btnPrev.style.display = newIndex === 0 ? 'none' : 'flex';
        }
        
        if (btnNext) {
            btnNext.innerHTML = newIndex === steps.length - 1 ? 
                '<i class="fas fa-save"></i> Salvar' : 
                'Próximo <i class="fas fa-arrow-right"></i>';
            if (newIndex === steps.length - 1) {
                btnNext.onclick = salvarCriacao;
            } else {
                btnNext.onclick = () => navegarFormulario(1);
            }
        }
    }
}

// ========== MODAL DE CRIAÇÃO ==========
function abrirModalCriacao(tipo, dados = null) {
    modalTipoAtual = tipo;
    dadosModalAtual = dados;
    passoAtualModal = 0;
    
    // Configurar título e ícone
    const configs = {
        contato: {
            titulo: dados ? 'Editar Contato' : 'Novo Contato',
            icone: 'fas fa-user-plus',
            passos: 2
        },
        card: {
            titulo: 'Novo Card Kanban',
            icone: 'fas fa-sticky-note',
            passos: 2
        },
        tag: {
            titulo: 'Nova Tag',
            icone: 'fas fa-tag',
            passos: 2
        },
        tarefa: {
            titulo: 'Nova Tarefa',
            icone: 'fas fa-tasks',
            passos: 2
        },
        agendamento: {
            titulo: 'Novo Agendamento',
            icone: 'fas fa-calendar-plus',
            passos: 2
        }
    };
    
    const config = configs[tipo] || { titulo: 'Novo Item', icone: 'fas fa-plus', passos: 1 };
    
    // Criar estrutura do modal
    let formHTML = criarHeaderModal(config.titulo, config.icone);
    formHTML += `<div class="form-body">`;
    
    // Adicionar formulário específico
    switch(tipo) {
        case 'contato':
            formHTML += criarFormContato(dados);
            break;
        case 'card':
            formHTML += criarFormCard(dados);
            break;
        case 'tag':
            formHTML += criarFormTag(dados);
            break;
        case 'tarefa':
            formHTML += criarFormTarefa(dados);
            break;
        case 'agendamento':
            formHTML += criarFormAgendamento(dados);
            break;
    }
    
    formHTML += `</div>`;
    
    // Adicionar navegação se tiver mais de 1 passo
    if (config.passos > 1) {
        formHTML += criarNavegacaoFormulario(config.passos);
    } else {
        // Para formulário de 1 passo, adicionar botão salvar
        formHTML += `
            <div class="form-footer">
                <button class="btn-primary" onclick="salvarCriacao()" style="width: 100%; padding: 15px;">
                    <i class="fas fa-save"></i> Salvar
                </button>
            </div>
        `;
    }
    
    elementos.formContainer.innerHTML = formHTML;
    
    // Inicializar componentes
    setTimeout(() => {
        if (tipo === 'contato') {
            inicializarMultiSelect('contato-tags');
        } else if (tipo === 'tag' || tipo === 'card') {
            // Selecionar primeira cor por padrão
            const firstColorPreset = document.querySelector('.color-preset');
            if (firstColorPreset && !dados) {
                selecionarCorPreset(firstColorPreset, `${tipo}-cor`);
            }
        }
    }, 100);
    
    // Abrir modal com animação
    elementos.createModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Animação de entrada
    setTimeout(() => {
        elementos.createModal.querySelector('.modal-content').classList.add('show');
    }, 10);
}

function fecharModalCriacao() {
    const modalContent = elementos.createModal.querySelector('.modal-content');
    modalContent.classList.remove('show');
    
    setTimeout(() => {
        elementos.createModal.classList.add('hidden');
        document.body.style.overflow = '';
        modalTipoAtual = null;
        dadosModalAtual = null;
        passoAtualModal = 0;
    }, 300);
}

function criarFormContato(dados = null) {
    const coresPresets = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    
    const opcoesStatus = [
        { value: 'aguardando', label: 'Aguardando' },
        { value: 'atendendo', label: 'Atendendo' },
        { value: 'finalizado', label: 'Finalizado' }
    ];
    
    const opcoesTags = tags.map(tag => ({
        value: tag.nome,
        label: tag.nome
    }));
    
    return `
        <div class="form-step active">
            ${criarCampoFormulario('text', 'contato-nome', 'Nome completo', dados?.nome || '', 'Ex: João Silva', [], true)}
            ${criarCampoFormulario('tel', 'contato-telefone', 'WhatsApp', dados?.telefone || '', '(11) 99999-9999', [], true)}
            ${criarCampoFormulario('email', 'contato-email', 'E-mail', dados?.email || '', 'exemplo@email.com')}
        </div>
        
        <div class="form-step">
            ${criarCampoFormulario('select', 'contato-status', 'Status', dados?.status || 'aguardando', '', opcoesStatus)}
            ${criarCampoFormulario('multiselect', 'contato-tags', 'Tags', dados?.tags || [], '', opcoesTags)}
            ${criarCampoFormulario('checkbox', 'contato-online', 'Contato online', dados?.online || false)}
        </div>
    `;
}

function criarFormTag(dados = null) {
    const coresPresets = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    
    const opcoesCategoria = [
        { value: '', label: 'Sem categoria' },
        { value: 'status', label: 'Status' },
        { value: 'prioridade', label: 'Prioridade' },
        { value: 'tipo', label: 'Tipo' },
        { value: 'departamento', label: 'Departamento' }
    ];
    
    const opcoesIcone = [
        { value: '', label: 'Nenhum ícone' },
        { value: 'fa-tag', label: '🏷️ Tag' },
        { value: 'fa-wrench', label: '🔧 Técnico' },
        { value: 'fa-star', label: '⭐ VIP' },
        { value: 'fa-exclamation', label: '⚠️ Reclamação' },
        { value: 'fa-check', label: '✅ Concluído' },
        { value: 'fa-clock', label: '⏰ Aguardando' }
    ];
    
    return `
        <div class="form-step active">
            ${criarCampoFormulario('text', 'tag-nome', 'Nome da tag', dados?.nome || '', 'ATENDIMENTO TÉCNICO', [], true)}
            ${criarCampoFormulario('color', 'tag-cor', 'Cor da tag', dados?.cor || '#3b82f6', '', coresPresets)}
        </div>
        
        <div class="form-step">
            ${criarCampoFormulario('textarea', 'tag-descricao', 'Descrição', dados?.descricao || '', 'Descreva para que serve esta tag...')}
            ${criarCampoFormulario('select', 'tag-icone', 'Ícone', dados?.icone || '', '', opcoesIcone)}
            ${criarCampoFormulario('select', 'tag-categoria', 'Categoria', dados?.categoria || '', '', opcoesCategoria)}
        </div>
    `;
}

function criarFormCard(dados = null) {
    const coresPresets = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    
    const opcoesColuna = [
        { value: 'aguardando', label: 'Aguardando' },
        { value: 'andamento', label: 'Em Andamento' },
        { value: 'revisao', label: 'Revisão' },
        { value: 'concluido', label: 'Concluído' }
    ];
    
    const opcoesTag = [{ value: '', label: 'Nenhuma' }, ...tags.map(tag => ({
        value: tag.nome,
        label: tag.nome
    }))];
    
    return `
        <div class="form-step active">
            ${criarCampoFormulario('text', 'card-titulo', 'Título do card', dados?.titulo || '', 'Revisar relatório mensal', [], true)}
            ${criarCampoFormulario('textarea', 'card-descricao', 'Descrição', dados?.descricao || '', 'Descreva a tarefa...')}
        </div>
        
        <div class="form-step">
            ${criarCampoFormulario('select', 'card-coluna', 'Coluna', dados?.coluna || 'aguardando', '', opcoesColuna)}
            ${criarCampoFormulario('select', 'card-tag', 'Tag', dados?.tag || '', '', opcoesTag)}
            ${criarCampoFormulario('date', 'card-data', 'Data', dados?.data || new Date().toISOString().split('T')[0])}
            ${criarCampoFormulario('text', 'card-responsavel', 'Responsável', dados?.responsavel || (usuario?.nome || 'Eu'), 'Nome do responsável')}
            ${criarCampoFormulario('color', 'card-cor', 'Cor do card', dados?.cor || '#3b82f6', '', coresPresets)}
        </div>
    `;
}

function criarFormTarefa(dados = null) {
    const opcoesPrioridade = [
        { value: 'baixa', label: 'Baixa' },
        { value: 'media', label: 'Média' },
        { value: 'alta', label: 'Alta' }
    ];
    
    const opcoesTags = tags.map(tag => ({
        value: tag.nome,
        label: tag.nome
    }));
    
    return `
        <div class="form-step active">
            ${criarCampoFormulario('text', 'tarefa-titulo', 'Título', dados?.titulo || '', 'Revisar relatório mensal', [], true)}
            ${criarCampoFormulario('textarea', 'tarefa-descricao', 'Descrição', dados?.descricao || '', 'Descreva a tarefa...')}
        </div>
        
        <div class="form-step">
            ${criarCampoFormulario('date', 'tarefa-data', 'Data de vencimento', dados?.data || '')}
            ${criarCampoFormulario('select', 'tarefa-prioridade', 'Prioridade', dados?.prioridade || 'media', '', opcoesPrioridade)}
            ${criarCampoFormulario('text', 'tarefa-responsavel', 'Responsável', dados?.responsavel || (usuario?.nome || 'Eu'), 'Nome do responsável')}
            ${criarCampoFormulario('multiselect', 'tarefa-tags', 'Tags', dados?.tags || [], '', opcoesTags)}
            ${dados?.concluida ? criarCampoFormulario('checkbox', 'tarefa-concluida', 'Tarefa concluída', true) : ''}
        </div>
    `;
}

function criarFormAgendamento(dados = null) {
    const opcoesStatus = [
        { value: 'agendado', label: 'Agendado' },
        { value: 'confirmado', label: 'Confirmado' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'realizado', label: 'Realizado' }
    ];
    
    const opcoesTags = tags.map(tag => ({
        value: tag.nome,
        label: tag.nome
    }));
    
    return `
        <div class="form-step active">
            ${criarCampoFormulario('text', 'agendamento-cliente', 'Cliente', dados?.cliente || '', 'Nome do cliente', [], true)}
            ${criarCampoFormulario('date', 'agendamento-data', 'Data', dados?.data || new Date().toISOString().split('T')[0], '', [], true)}
            ${criarCampoFormulario('time', 'agendamento-hora', 'Hora', dados?.hora || '09:00', '', [], true)}
        </div>
        
        <div class="form-step">
            ${criarCampoFormulario('textarea', 'agendamento-descricao', 'Descrição', dados?.descricao || '', 'Descrição do agendamento...')}
            ${criarCampoFormulario('select', 'agendamento-status', 'Status', dados?.status || 'agendado', '', opcoesStatus)}
            ${criarCampoFormulario('multiselect', 'agendamento-tags', 'Tags', dados?.tags || [], '', opcoesTags)}
        </div>
    `;
}

function salvarCriacao() {
    if (!modalTipoAtual) return;
    
    try {
        let sucesso = false;
        let mensagem = '';
        
        switch(modalTipoAtual) {
            case 'contato':
                sucesso = salvarContato();
                mensagem = dadosModalAtual ? 'Contato atualizado com sucesso!' : 'Contato criado com sucesso!';
                break;
            case 'card':
                sucesso = salvarCard();
                mensagem = dadosModalAtual ? 'Card atualizado com sucesso!' : 'Card criado com sucesso!';
                break;
            case 'tag':
                sucesso = salvarTag();
                mensagem = dadosModalAtual ? 'Tag atualizada com sucesso!' : 'Tag criada com sucesso!';
                break;
            case 'tarefa':
                sucesso = salvarTarefa();
                mensagem = dadosModalAtual ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!';
                break;
            case 'agendamento':
                sucesso = salvarAgendamento();
                mensagem = dadosModalAtual ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!';
                break;
        }
        
        if (sucesso) {
            fecharModalCriacao();
            mostrarToast(mensagem, 'success');
            
            // Recarregar seção apropriada
            switch(modalTipoAtual) {
                case 'contato':
                    renderizarTabelaContatos();
                    renderizarListaContatos();
                    atualizarBadges();
                    break;
                case 'card':
                    carregarKanban();
                    break;
                case 'tag':
                    carregarTags();
                    break;
                case 'tarefa':
                    carregarTarefas();
                    break;
                case 'agendamento':
                    carregarAgenciamentos();
                    break;
            }
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarToast('Erro ao salvar. Verifique os dados.', 'error');
    }
}

function salvarContato() {
    const nome = document.getElementById('contato-nome').value.trim();
    const telefone = document.getElementById('contato-telefone').value.trim();
    const email = document.getElementById('contato-email').value.trim();
    const status = document.getElementById('contato-status').value;
    const tagsSelect = document.getElementById('contato-tags');
    const online = document.getElementById('contato-online').checked;
    
    if (!nome || !telefone) {
        mostrarToast('Nome e WhatsApp são obrigatórios!', 'warning');
        return false;
    }
    
    // Obter tags selecionadas
    const tagsSelecionadas = Array.from(tagsSelect.selectedOptions).map(option => option.value);
    
    if (dadosModalAtual) {
        // Atualizar contato existente
        Object.assign(dadosModalAtual, {
            nome,
            telefone,
            email,
            status,
            tags: tagsSelecionadas,
            online,
            ultimaInteracao: new Date().toISOString()
        });
    } else {
        // Criar novo contato
        const novoContato = {
            id: contatos.length > 0 ? Math.max(...contatos.map(c => c.id)) + 1 : 1,
            nome,
            telefone,
            email,
            status,
            tags: tagsSelecionadas,
            ultimaInteracao: new Date().toISOString(),
            online,
            dataCriacao: new Date().toISOString().split('T')[0]
        };
        
        contatos.push(novoContato);
        mensagens[novoContato.id] = [];
    }
    
    return true;
}

function salvarTag() {
    const nome = document.getElementById('tag-nome').value.trim().toUpperCase();
    const cor = document.getElementById('tag-cor').value;
    const descricao = document.getElementById('tag-descricao').value.trim();
    const icone = document.getElementById('tag-icone').value;
    const categoria = document.getElementById('tag-categoria').value;
    
    if (!nome) {
        mostrarToast('Nome da tag é obrigatório!', 'warning');
        return false;
    }
    
    // Verificar se tag já existe (exceto se estiver editando)
    const tagExistente = tags.find(t => t.nome === nome);
    if (tagExistente && (!dadosModalAtual || dadosModalAtual.id !== tagExistente.id)) {
        mostrarToast('Já existe uma tag com este nome!', 'warning');
        return false;
    }
    
    if (dadosModalAtual) {
        // Atualizar tag existente
        Object.assign(dadosModalAtual, {
            nome,
            cor,
            descricao,
            icone,
            categoria
        });
    } else {
        // Criar nova tag
        const novaTag = {
            id: (tags.length + 1).toString(),
            nome,
            cor,
            descricao,
            icone,
            categoria,
            quantidade: 0,
            dataCriacao: new Date().toISOString()
        };
        
        tags.push(novaTag);
    }
    
    return true;
}

function salvarCard() {
    const titulo = document.getElementById('card-titulo').value.trim();
    const descricao = document.getElementById('card-descricao').value.trim();
    const coluna = document.getElementById('card-coluna').value;
    const tag = document.getElementById('card-tag').value;
    const data = document.getElementById('card-data').value;
    const responsavel = document.getElementById('card-responsavel').value.trim() || 'Eu';
    const cor = document.getElementById('card-cor').value;
    
    if (!titulo) {
        mostrarToast('Título é obrigatório!', 'warning');
        return false;
    }
    
    if (dadosModalAtual) {
        // Atualizar card existente
        Object.assign(dadosModalAtual, {
            titulo,
            descricao,
            coluna,
            tag,
            data: data ? formatarData(data) : new Date().toLocaleDateString('pt-BR'),
            responsavel,
            cor
        });
    } else {
        // Criar novo card
        const novoCard = {
            id: (kanbanCards.length + 1).toString(),
            titulo,
            descricao,
            coluna,
            tag,
            data: data ? formatarData(data) : new Date().toLocaleDateString('pt-BR'),
            responsavel,
            cor,
            dataCriacao: new Date().toISOString()
        };
        
        kanbanCards.push(novoCard);
    }
    
    return true;
}

function salvarTarefa() {
    const titulo = document.getElementById('tarefa-titulo').value.trim();
    const descricao = document.getElementById('tarefa-descricao').value.trim();
    const data = document.getElementById('tarefa-data').value;
    const prioridade = document.getElementById('tarefa-prioridade').value;
    const responsavel = document.getElementById('tarefa-responsavel').value.trim() || 'Eu';
    const tagsSelect = document.getElementById('tarefa-tags');
    const concluida = document.getElementById('tarefa-concluida')?.checked || false;
    
    if (!titulo) {
        mostrarToast('Título é obrigatório!', 'warning');
        return false;
    }
    
    // Obter tags selecionadas
    const tagsSelecionadas = Array.from(tagsSelect?.selectedOptions || []).map(option => option.value);
    
    if (dadosModalAtual) {
        // Atualizar tarefa existente
        Object.assign(dadosModalAtual, {
            titulo,
            descricao,
            data: data || '',
            prioridade,
            responsavel,
            tags: tagsSelecionadas,
            concluida
        });
    } else {
        // Criar nova tarefa
        const novaTarefa = {
            id: (tarefasMock.length + 1).toString(),
            titulo,
            descricao,
            data: data || '',
            prioridade,
            responsavel,
            tags: tagsSelecionadas,
            concluida: false,
            dataCriacao: new Date().toISOString()
        };
        
        tarefasMock.push(novaTarefa);
    }
    
    return true;
}

function salvarAgendamento() {
    const cliente = document.getElementById('agendamento-cliente').value.trim();
    const data = document.getElementById('agendamento-data').value;
    const hora = document.getElementById('agendamento-hora').value;
    const descricao = document.getElementById('agendamento-descricao').value.trim();
    const status = document.getElementById('agendamento-status').value;
    const tagsSelect = document.getElementById('agendamento-tags');
    
    if (!cliente || !data || !hora) {
        mostrarToast('Cliente, data e hora são obrigatórios!', 'warning');
        return false;
    }
    
    // Obter tags selecionadas
    const tagsSelecionadas = Array.from(tagsSelect?.selectedOptions || []).map(option => option.value);
    
    if (dadosModalAtual) {
        // Atualizar agendamento existente
        Object.assign(dadosModalAtual, {
            cliente,
            data,
            hora,
            descricao,
            status,
            tags: tagsSelecionadas
        });
    } else {
        // Criar novo agendamento
        const novoAgendamento = {
            id: (agendamentos.length + 1).toString(),
            cliente,
            data,
            hora,
            descricao,
            status,
            tags: tagsSelecionadas,
            dataCriacao: new Date().toISOString()
        };
        
        agendamentos.push(novoAgendamento);
    }
    
    return true;
}

// ========== IMPORTAR CONTATOS ==========
function abrirModalImportacao() {
    elementos.importModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Resetar formulário
    elementos.importProgress.classList.add('hidden');
    elementos.btnProcessImport.disabled = true;
    dadosImportacao = null;
    tipoImportacaoAtual = null;
    
    // Mostrar opções iniciais
    document.querySelector('.import-options').style.display = 'grid';
    document.querySelectorAll('.import-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remover seleções anteriores
    document.querySelectorAll('.import-option').forEach(option => {
        option.classList.remove('selected');
    });
}

function fecharModalImportacao() {
    const modalContent = elementos.importModal.querySelector('.modal-content');
    modalContent.classList.remove('show');
    
    setTimeout(() => {
        elementos.importModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

function selecionarTipoImportacao(tipo) {
    tipoImportacaoAtual = tipo;
    
    // Atualizar seleção visual
    document.querySelectorAll('.import-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.import-option[onclick*="${tipo}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Esconder todas as seções
    document.querySelectorAll('.import-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Esconder opções iniciais
    document.querySelector('.import-options').style.display = 'none';
    
    // Mostrar seção selecionada
    const sectionId = `${tipo}-import`;
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
    
    // Habilitar botão de processamento para manual
    if (tipo === 'manual' && elementos.manualData.value.trim()) {
        elementos.btnProcessImport.disabled = false;
    } else {
        elementos.btnProcessImport.disabled = true;
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    debug(`Processando arquivo: ${file.name}`);
    
    // Mostrar seção CSV
    if (!tipoImportacaoAtual) {
        selecionarTipoImportacao('csv');
    }
    
    // Processar arquivo
    processarArquivoImportacao(file);
}

function handleWhatsAppFile(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    debug(`Processando ${files.length} arquivo(s) do WhatsApp`);
    mostrarToast('Processando arquivos do WhatsApp...', 'info');
    
    // Simular processamento
    setTimeout(() => {
        const dadosSimulados = [
            ['Nome', 'WhatsApp', 'Email'],
            ['Contato WhatsApp 1', '11999999999', 'whatsapp1@email.com'],
            ['Contato WhatsApp 2', '11888888888', 'whatsapp2@email.com']
        ];
        
        exibirPreviewImportacao(dadosSimulados);
        dadosImportacao = dadosSimulados;
        elementos.btnProcessImport.disabled = false;
        mostrarToast('Arquivos do WhatsApp processados!', 'success');
    }, 2000);
}

function processarArquivoImportacao(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let dados;
            
            if (file.name.match(/\.xlsx?$/i)) {
                // Processar Excel
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                dados = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            } else {
                // Processar CSV
                const text = e.target.result;
                const separator = document.getElementById('csv-separator')?.value || ',';
                dados = text.split('\n').map(line => line.split(separator));
            }
            
            // Exibir preview
            exibirPreviewImportacao(dados);
            
            // Armazenar dados
            dadosImportacao = dados;
            
            // Habilitar botão de processamento
            elementos.btnProcessImport.disabled = false;
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            mostrarToast('Erro ao processar arquivo. Verifique o formato.', 'error');
        }
    };
    
    if (file.name.match(/\.xlsx?$/i)) {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsText(file);
    }
}

function exibirPreviewImportacao(dados) {
    const previewContainer = document.getElementById('import-preview');
    if (!previewContainer) return;
    
    // Limitar a 10 linhas para preview
    const previewData = dados.slice(0, Math.min(10, dados.length));
    
    let html = '<h4>Pré-visualização dos Dados</h4>';
    html += '<div class="preview-table-container"><table class="preview-table">';
    
    previewData.forEach((row, index) => {
        html += '<tr>';
        (Array.isArray(row) ? row : [row]).forEach(cell => {
            const cellContent = cell || '';
            html += `<td title="${cellContent}">${cellContent}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table></div>';
    html += `<p class="preview-info">Mostrando ${previewData.length} de ${dados.length} linhas</p>`;
    
    previewContainer.innerHTML = html;
    previewContainer.style.display = 'block';
}

function processarImportacao() {
    if (!dadosImportacao && tipoImportacaoAtual !== 'manual') {
        mostrarToast('Nenhum dado para importar!', 'warning');
        return;
    }
    
    // Mostrar progresso
    elementos.importProgress.classList.remove('hidden');
    elementos.btnProcessImport.disabled = true;
    
    let contatosImportados = [];
    
    if (tipoImportacaoAtual === 'manual') {
        const texto = elementos.manualData.value.trim();
        if (!texto) {
            mostrarToast('Digite ou cole os dados para importar!', 'warning');
            return;
        }
        
        // Processar dados manuais
        const lines = texto.split('\n').filter(line => line.trim());
        const separator = texto.includes(';') ? ';' : (texto.includes('\t') ? '\t' : ',');
        
        contatosImportados = processarLinhasImportacao(lines, separator);
    } else {
        // Processar dados do arquivo
        contatosImportados = processarLinhasImportacao(dadosImportacao);
    }
    
    // Simular processamento com progresso
    simularProgressoImportacao(contatosImportados);
}

function processarLinhasImportacao(lines, separator = ',') {
    const contatos = [];
    let headers = null;
    
    lines.forEach((line, index) => {
        // Pular linhas vazias
        if (!line || (Array.isArray(line) && line.every(cell => !cell))) return;
        
        // Primeira linha pode ser cabeçalho
        if (index === 0) {
            const firstCell = Array.isArray(line) ? line[0]?.toString().toLowerCase() : line.toString().toLowerCase();
            if (firstCell && firstCell.includes('nome')) {
                headers = Array.isArray(line) ? line.map(h => h.toString().toLowerCase().trim()) : line.split(separator).map(h => h.toLowerCase().trim());
                return;
            }
        }
        
        // Converter linha para array se for string
        let rowData = line;
        if (typeof line === 'string') {
            rowData = line.split(separator).map(cell => cell.trim());
        }
        
        // Extrair dados baseado nas posições
        const nome = rowData[0] || '';
        const telefone = rowData[1] || '';
        const email = rowData[2] || '';
        const tags = rowData[3] ? rowData[3].split(/[,;]/).map(tag => tag.trim()).filter(tag => tag) : [];
        
        if (nome && telefone) {
            contatos.push({
                id: contatos.length + 1,
                nome: nome.toString(),
                telefone: telefone.toString(),
                email: email.toString(),
                status: 'aguardando',
                tags: tags,
                ultimaInteracao: new Date().toISOString(),
                online: false,
                dataCriacao: new Date().toISOString().split('T')[0]
            });
        }
    });
    
    return contatos;
}

function simularProgressoImportacao(contatosImportados) {
    const total = contatosImportados.length;
    let processados = 0;
    
    if (total === 0) {
        elementos.progressFill.style.width = '100%';
        elementos.progressText.textContent = 'Nenhum contato válido encontrado';
        setTimeout(() => {
            elementos.importProgress.classList.add('hidden');
            mostrarToast('Nenhum contato válido para importar!', 'warning');
        }, 1000);
        return;
    }
    
    elementos.totalCount.textContent = total;
    
    const interval = setInterval(() => {
        processados++;
        elementos.processedCount.textContent = processados;
        
        const progresso = (processados / total) * 100;
        elementos.progressFill.style.width = `${progresso}%`;
        elementos.progressText.textContent = `Importando contato ${processados} de ${total}...`;
        
        if (processados >= total) {
            clearInterval(interval);
            
            // Adicionar contatos à lista
            const novosIds = [];
            contatosImportados.forEach(contato => {
                // Verificar se contato já existe
                const existe = contatos.some(c => c.telefone === contato.telefone);
                if (!existe) {
                    contatos.push(contato);
                    novosIds.push(contato.id);
                }
            });
            
            // Atualizar interface
            setTimeout(() => {
                elementos.progressText.textContent = 'Importação concluída!';
                
                setTimeout(() => {
                    // Fechar modal
                    fecharModalImportacao();
                    
                    // Atualizar interface
                    renderizarListaContatos();
                    renderizarTabelaContatos();
                    atualizarBadges();
                    
                    // Mostrar resultado
                    const importados = novosIds.length;
                    if (importados > 0) {
                        mostrarToast(`${importados} contatos importados com sucesso!`, 'success');
                    } else {
                        mostrarToast('Nenhum novo contato importado (todos já existiam)', 'info');
                    }
                }, 1000);
            }, 500);
        }
    }, 100);
}

// ========== EXPORTAR CONTATOS ==========
function abrirModalExportacao() {
    elementos.exportModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Selecionar primeira opção por padrão
    selecionarFormatoExportacao('csv');
    
    // Atualizar preview
    atualizarPreviewExportacao();
}

function fecharModalExportacao() {
    const modalContent = elementos.exportModal.querySelector('.modal-content');
    modalContent.classList.remove('show');
    
    setTimeout(() => {
        elementos.exportModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

function selecionarFormatoExportacao(formato) {
    formatoExportacaoAtual = formato;
    
    // Atualizar seleção visual
    document.querySelectorAll('.export-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.export-option[onclick*="${formato}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Atualizar preview
    atualizarPreviewExportacao();
}

function atualizarPreviewExportacao() {
    if (!elementos.exportPreview) return;
    
    // Preparar dados de exemplo
    let previewContent = '';
    
    switch(formatoExportacaoAtual) {
        case 'csv':
            previewContent = `Nome,WhatsApp,Email,Status,Tags,Data Criação
"João Silva","11999999999","joao@email.com","Atendendo","VIP;Cliente","2025-09-01"
"Maria Santos","11888888888","maria@email.com","Aguardando","Novo","2025-09-05"
"Portaria Virtual","1133333333","portaria@empresa.com","Atendendo","LIBERAÇÃO;SUPERVISÃO","2025-09-10"`;
            break;
            
        case 'json':
            previewContent = `[
  {
    "id": 1,
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@email.com",
    "status": "Atendendo",
    "tags": ["VIP", "Cliente"],
    "dataCriacao": "2025-09-01"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "telefone": "11888888888",
    "email": "maria@email.com",
    "status": "Aguardando",
    "tags": ["Novo"],
    "dataCriacao": "2025-09-05"
  }
]`;
            break;
            
        case 'vcf':
            previewContent = `BEGIN:VCARD
VERSION:3.0
FN:João Silva
TEL;TYPE=CELL,VOICE:11999999999
EMAIL:joao@email.com
CATEGORIES:VIP,Cliente
END:VCARD

BEGIN:VCARD
VERSION:3.0
FN:Maria Santos
TEL;TYPE=CELL,VOICE:11888888888
EMAIL:maria@email.com
CATEGORIES:Novo
END:VCARD`;
            break;
            
        default:
            previewContent = 'Pré-visualização do formato selecionado';
    }
    
    elementos.exportPreview.textContent = previewContent;
}

function executarExportacao() {
    // Preparar dados para exportação
    const exportarFiltrados = document.getElementById('export-filtered')?.checked || false;
    const incluirHistorico = document.getElementById('export-history')?.checked || false;
    const incluirTags = document.getElementById('export-tags')?.checked || true;
    const incluirMetadata = document.getElementById('export-metadata')?.checked || true;
    const formatoData = document.getElementById('export-date-format')?.value || 'dd/mm/yyyy';
    const encoding = document.getElementById('export-encoding')?.value || 'utf-8';
    
    // Obter contatos para exportar
    let contatosExportar = contatos;
    if (exportarFiltrados) {
        // Aqui você aplicaria os filtros atuais da tabela
        // Por simplicidade, exportamos todos
    }
    
    // Gerar arquivo
    let blob;
    let filename;
    
    switch(formatoExportacaoAtual) {
        case 'csv':
            const csvData = gerarCSV(contatosExportar, incluirTags, incluirMetadata, formatoData);
            blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
            filename = `contatos_cba_${new Date().toISOString().split('T')[0]}.csv`;
            break;
            
        case 'excel':
            const excelData = gerarCSV(contatosExportar, incluirTags, incluirMetadata, formatoData);
            blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            filename = `contatos_cba_${new Date().toISOString().split('T')[0]}.xlsx`;
            break;
            
        case 'json':
            const jsonData = gerarJSON(contatosExportar, incluirHistorico);
            blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
            filename = `contatos_cba_${new Date().toISOString().split('T')[0]}.json`;
            break;
            
        case 'vcf':
            const vcfData = gerarVCF(contatosExportar);
            blob = new Blob([vcfData], { type: 'text/vcard;charset=utf-8' });
            filename = `contatos_cba_${new Date().toISOString().split('T')[0]}.vcf`;
            break;
    }
    
    // Criar link de download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Fechar modal e mostrar mensagem
    fecharModalExportacao();
    mostrarToast(`Arquivo "${filename}" baixado com sucesso!`, 'success');
}

function gerarCSV(contatos, incluirTags = true, incluirMetadata = true, formatoData = 'dd/mm/yyyy') {
    // Cabeçalhos
    let headers = ['Nome', 'WhatsApp', 'Email', 'Status'];
    if (incluirTags) headers.push('Tags');
    if (incluirMetadata) headers.push('Última Interação', 'Data Criação');
    
    let csv = headers.join(',') + '\n';
    
    // Dados
    contatos.forEach(contato => {
        let row = [
            `"${contato.nome}"`,
            `"${contato.telefone}"`,
            `"${contato.email || ''}"`,
            `"${contato.status}"`
        ];
        
        if (incluirTags) {
            row.push(`"${contato.tags.join(';')}"`);
        }
        
        if (incluirMetadata) {
            const ultimaInteracao = formatarDataParaExportacao(contato.ultimaInteracao, formatoData);
            const dataCriacao = formatarDataParaExportacao(contato.dataCriacao, formatoData);
            row.push(`"${ultimaInteracao}"`, `"${dataCriacao}"`);
        }
        
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

function gerarJSON(contatos, incluirHistorico = false) {
    const dadosExportacao = {
        exportadoEm: new Date().toISOString(),
        totalContatos: contatos.length,
        contatos: contatos.map(contato => {
            const dados = {
                id: contato.id,
                nome: contato.nome,
                telefone: contato.telefone,
                email: contato.email,
                status: contato.status,
                tags: contato.tags,
                ultimaInteracao: contato.ultimaInteracao,
                dataCriacao: contato.dataCriacao,
                online: contato.online
            };
            
            if (incluirHistorico && mensagens[contato.id]) {
                dados.historicoMensagens = mensagens[contato.id];
            }
            
            return dados;
        })
    };
    
    return JSON.stringify(dadosExportacao, null, 2);
}

function gerarVCF(contatos) {
    let vcf = '';
    
    contatos.forEach(contato => {
        vcf += `BEGIN:VCARD
VERSION:3.0
FN:${contato.nome}
TEL;TYPE=CELL,VOICE:${contato.telefone}
EMAIL:${contato.email || ''}
CATEGORIES:${contato.tags.join(',')}
NOTE:Status: ${contato.status}
END:VCARD

`;
    });
    
    return vcf;
}

// ========== KANBAN ==========
function carregarKanban() {
    const container = document.getElementById('kanban-board');
    if (!container) return;
    
    // Colunas do Kanban
    const columns = [
        { id: 'aguardando', nome: 'Aguardando' },
        { id: 'andamento', nome: 'Em Andamento' },
        { id: 'revisao', nome: 'Revisão' },
        { id: 'concluido', nome: 'Concluído' }
    ];
    
    container.innerHTML = columns.map(coluna => {
        const cardsColuna = kanbanCards.filter(card => card.coluna === coluna.id);
        
        return `
            <div class="kanban-column">
                <div class="column-header">
                    <h3>${coluna.nome}</h3>
                    <span class="column-count">${cardsColuna.length}</span>
                </div>
                <div class="cards-list" data-column="${coluna.id}">
                    ${cardsColuna.map(card => {
                        const tagInfo = tags.find(t => t.nome === card.tag);
                        const tagCor = tagInfo ? tagInfo.cor : card.cor || '#6b7280';
                        
                        return `
                            <div class="kanban-card" draggable="true" data-id="${card.id}">
                                <div class="card-header">
                                    <h4>${card.titulo}</h4>
                                    <div class="card-actions">
                                        <button class="card-action-btn" onclick="editarCard('${card.id}')" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="card-action-btn" onclick="excluirCard('${card.id}')" title="Excluir">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <p class="card-desc">${card.descricao}</p>
                                <div class="card-footer">
                                    <div class="card-tag" style="background: ${tagCor}20; color: ${tagCor}; border: 1px solid ${tagCor}40;">
                                        ${card.tag || 'Sem tag'}
                                    </div>
                                    <div class="card-date">${card.data}</div>
                                </div>
                                <div class="card-responsavel">
                                    <small><i class="fas fa-user"></i> ${card.responsavel}</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${cardsColuna.length === 0 ? `
                        <div class="empty-column">
                            <i class="fas fa-columns"></i>
                            <p>Nenhum card</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Ativar drag and drop
    ativarDragAndDrop();
}

function ativarDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.cards-list');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.dataset.id);
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard) {
                column.appendChild(draggingCard);
            }
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const cardId = e.dataTransfer.getData('text/plain');
            const card = document.querySelector(`[data-id="${cardId}"]`);
            if (card) {
                const newColumn = column.dataset.column;
                
                // Atualizar coluna do card no array
                const cardIndex = kanbanCards.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                    kanbanCards[cardIndex].coluna = newColumn;
                }
                
                column.appendChild(card);
                atualizarContadoresKanban();
                
                mostrarToast(`Card movido para: ${column.closest('.kanban-column').querySelector('h3').textContent}`, 'success');
            }
        });
    });
}

function atualizarContadoresKanban() {
    document.querySelectorAll('.kanban-column').forEach(column => {
        const columnId = column.querySelector('.cards-list')?.dataset.column;
        if (columnId) {
            const count = kanbanCards.filter(card => card.coluna === columnId).length;
            const countElement = column.querySelector('.column-count');
            if (countElement) {
                countElement.textContent = count;
            }
        }
    });
}

function criarNovaColunaKanban() {
    const nome = prompt('Nome da nova coluna:');
    if (!nome) return;
    
    mostrarToast(`Coluna "${nome}" criada!`, 'success');
    // Em implementação real, você adicionaria ao array de colunas
}

function editarCard(cardId) {
    const card = kanbanCards.find(c => c.id === cardId);
    if (!card) return;
    
    abrirModalCriacao('card', card);
}

function excluirCard(cardId) {
    mostrarConfirmacao(
        'Excluir Card',
        'Tem certeza que deseja excluir este card?',
        'Excluir',
        'Cancelar',
        () => {
            const index = kanbanCards.findIndex(c => c.id === cardId);
            if (index !== -1) {
                kanbanCards.splice(index, 1);
                carregarKanban();
                mostrarToast('Card excluído com sucesso!', 'success');
            }
        }
    );
}

// ========== TAREFAS ==========
function carregarTarefas() {
    const container = elementos.tarefasContainer;
    if (!container) return;
    
    // Dados mock
    const tarefas = tarefasMock;
    
    if (tarefas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>Nenhuma tarefa encontrada</p>
                <button class="btn-primary" onclick="abrirModalCriacao('tarefa')">
                    <i class="fas fa-plus"></i> Criar primeira tarefa
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tarefas.map(tarefa => `
        <div class="tarefa-item ${tarefa.concluida ? 'concluida' : ''}">
            <div class="tarefa-checkbox ${tarefa.concluida ? 'checked' : ''}" 
                 onclick="alternarTarefa('${tarefa.id}')">
                ${tarefa.concluida ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="tarefa-content">
                <div class="tarefa-header">
                    <div class="tarefa-title">${tarefa.titulo}</div>
                    <div class="tarefa-actions">
                        <button class="tarefa-action-btn" onclick="editarTarefa('${tarefa.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="tarefa-action-btn" onclick="excluirTarefa('${tarefa.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="tarefa-desc">${tarefa.descricao}</div>
                <div class="tarefa-meta">
                    <span><i class="far fa-calendar"></i> ${tarefa.data}</span>
                    <span><i class="fas fa-user"></i> ${tarefa.responsavel}</span>
                    <span class="tarefa-prioridade prioridade-${tarefa.prioridade}">
                        ${tarefa.prioridade}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function editarTarefa(tarefaId) {
    const tarefa = tarefasMock.find(t => t.id === tarefaId);
    if (!tarefa) return;
    
    abrirModalCriacao('tarefa', tarefa);
}

function excluirTarefa(tarefaId) {
    mostrarConfirmacao(
        'Excluir Tarefa',
        'Tem certeza que deseja excluir esta tarefa?',
        'Excluir',
        'Cancelar',
        () => {
            const index = tarefasMock.findIndex(t => t.id === tarefaId);
            if (index !== -1) {
                tarefasMock.splice(index, 1);
                carregarTarefas();
                mostrarToast('Tarefa excluída com sucesso!', 'success');
            }
        }
    );
}

// ========== TAGS ==========
function carregarTags() {
    const container = elementos.tagsContainer;
    if (!container) return;
    
    // Atualizar estatísticas
    if (elementos.totalTags) {
        elementos.totalTags.textContent = tags.length;
    }
    
    if (elementos.tagMaisUsada) {
        const maisUsada = tags.reduce((prev, current) => 
            (prev.quantidade > current.quantidade) ? prev : current
        );
        elementos.tagMaisUsada.textContent = maisUsada.nome;
    }
    
    if (tags.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <p>Nenhuma tag encontrada</p>
                <button class="btn-primary" onclick="abrirModalCriacao('tag')">
                    <i class="fas fa-plus"></i> Criar primeira tag
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tags.map(tag => `
        <div class="tag-card">
            <div class="tag-icon" style="background: ${tag.cor}">
                ${getTagIcon(tag.nome)}
            </div>
            <div class="tag-content">
                <h3 class="tag-title">${tag.nome}</h3>
                <p class="tag-count">${tag.quantidade} registros</p>
                <div class="tag-progress">
                    <div class="progress-bar" style="width: ${Math.min((tag.quantidade / 20) * 100, 100)}%; background: ${tag.cor}"></div>
                </div>
            </div>
            <div class="tag-actions">
                <button class="tag-btn" onclick="usarTag('${tag.id}')" title="Usar tag">
                    <i class="fas fa-tag"></i>
                </button>
                <button class="tag-btn" onclick="editarTag('${tag.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="tag-btn" onclick="excluirTag('${tag.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getTagIcon(tagNome) {
    const icons = {
        'ATENDIMENTO TÉCNICO': '🔧',
        'LIBERAÇÃO': '🔓',
        'Reclamação': '⚠️',
        'SUPERVISÃO': '👁️',
        'Registros Técnicos': '📋',
        'Ações': '🎯'
    };
    
    return icons[tagNome] || '🏷️';
}

function editarTag(tagId) {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;
    
    abrirModalCriacao('tag', tag);
}

function excluirTag(tagId) {
    mostrarConfirmacao(
        'Excluir Tag',
        'Tem certeza que deseja excluir esta tag? Isso não afetará os contatos que a utilizam.',
        'Excluir',
        'Cancelar',
        () => {
            const index = tags.findIndex(t => t.id === tagId);
            if (index !== -1) {
                tags.splice(index, 1);
                carregarTags();
                mostrarToast('Tag excluída com sucesso!', 'success');
            }
        }
    );
}

function usarTag(tagId) {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;
    
    mostrarToast(`Tag "${tag.nome}" selecionada para uso!`, 'info');
    // Aqui você implementaria a lógica para usar a tag em um contato
}

// ========== FUNÇÕES PARA CHAT INTERNO ==========
function carregarUsuariosChatInterno() {
    const container = elementos.usuariosList;
    if (!container) return;
    
    const busca = elementos.searchUsuarios ? elementos.searchUsuarios.value.toLowerCase() : '';
    
    let usuariosFiltrados = chatInternoUsuarios;
    
    if (busca) {
        usuariosFiltrados = usuariosFiltrados.filter(u => 
            u.nome.toLowerCase().includes(busca) ||
            u.email.toLowerCase().includes(busca) ||
            u.cargo.toLowerCase().includes(busca)
        );
    }
    
    if (usuariosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>Nenhum usuário encontrado</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = usuariosFiltrados.map(usuario => `
        <div class="usuario-item ${usuarioChatSelecionado?.id === usuario.id ? 'selected' : ''}" 
             onclick="selecionarUsuarioChat(${usuario.id})">
            <div class="usuario-avatar ${usuario.online ? 'online' : 'offline'}">
                ${usuario.avatar}
            </div>
            <div class="usuario-info">
                <div class="usuario-nome">${usuario.nome}</div>
                <div class="usuario-cargo">${usuario.cargo}</div>
            </div>
            ${usuario.online ? '<div class="usuario-status online"></div>' : ''}
        </div>
    `).join('');
}

function selecionarUsuarioChat(usuarioId) {
    usuarioChatSelecionado = chatInternoUsuarios.find(u => u.id === usuarioId);
    chatGrupoAtual = 'privado';
    
    if (elementos.chatGrupoNome) {
        elementos.chatGrupoNome.textContent = usuarioChatSelecionado.nome;
        elementos.chatGrupoNome.innerHTML = `
            <i class="fas fa-user-circle"></i>
            ${usuarioChatSelecionado.nome}
            ${usuarioChatSelecionado.online ? 
                '<span style="color: #10b981; font-size: 12px;"> ● Online</span>' : 
                '<span style="color: #6b7280; font-size: 12px;"> ○ Offline</span>'
            }
        `;
    }
    
    // Adicionar mensagens do sistema para o chat privado
    const mensagensPrivadas = [
        {
            id: 1,
            usuarioId: usuarioChatSelecionado.id,
            usuarioNome: usuarioChatSelecionado.nome,
            texto: `Olá! Este é o início da conversa privada com ${usuarioChatSelecionado.nome}.`,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo: "recebida"
        },
        {
            id: 2,
            usuarioId: 0,
            usuarioNome: "Sistema",
            texto: "Você está em uma conversa privada. As mensagens são visíveis apenas para você e este usuário.",
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo: "system"
        }
    ];
    
    // Carregar chat
    carregarMensagensChatInterno(mensagensPrivadas);
    
    // Focar no input
    if (elementos.chatInternoInput) {
        elementos.chatInternoInput.focus();
    }
    
    // Atualizar lista de usuários
    carregarUsuariosChatInterno();
}

function carregarMensagensChatInterno(mensagensPersonalizadas = null) {
    const container = elementos.chatInternoMessages;
    if (!container) return;
    
    let mensagensParaExibir = mensagensPersonalizadas || chatInternoMensagens;
    
    if (chatGrupoAtual === 'privado' && usuarioChatSelecionado) {
        // Filtrar mensagens do chat privado
        mensagensParaExibir = mensagensPersonalizadas || 
            chatInternoMensagens.filter(m => 
                (m.usuarioId === usuarioChatSelecionado.id && m.tipo === 'recebida') ||
                (m.usuarioId === 0 && m.tipo === 'system') ||
                m.tipo === 'enviada'
            );
    }
    
    if (mensagensParaExibir.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-comments"></i>
                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
                <p class="text-gray-500" style="margin-top: 10px; font-size: 14px;">
                    ${chatGrupoAtual === 'geral' ? 
                        'Este é o chat geral da equipe. Todas as mensagens são visíveis para todos.' : 
                        'Esta é uma conversa privada. Apenas você e este usuário podem ver as mensagens.'
                    }
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = mensagensParaExibir.map(msg => {
        if (msg.tipo === 'system') {
            return `
                <div class="system-message">
                    <i class="fas fa-info-circle"></i> ${msg.texto}
                </div>
            `;
        }
        
        const isEnviada = msg.tipo === 'enviada';
        const messageClass = isEnviada ? 'sent' : 'received';
        const usuario = chatInternoUsuarios.find(u => u.id === msg.usuarioId);
        const nomeUsuario = usuario ? usuario.nome : msg.usuarioNome;
        
        return `
            <div class="chat-interno-message ${messageClass}">
                ${!isEnviada ? `
                    <div class="message-sender">
                        <strong>${nomeUsuario}</strong>
                        <span class="message-time">${msg.hora}</span>
                    </div>
                ` : ''}
                <div class="message-text">${msg.texto}</div>
                ${isEnviada ? `
                    <div class="message-time">${msg.hora}</div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Scroll para baixo
    container.scrollTop = container.scrollHeight;
}

function enviarMensagemChatInterno() {
    const input = elementos.chatInternoInput;
    const texto = input ? input.value.trim() : '';
    
    if (!texto) {
        mostrarToast('Digite uma mensagem primeiro!', 'warning');
        return;
    }
    
    if (chatGrupoAtual === 'geral' || !usuarioChatSelecionado) {
        // Enviar para chat geral
        const novaMensagem = {
            id: chatInternoMensagens.length + 1,
            usuarioId: usuario ? usuario.id : 0,
            usuarioNome: usuario ? usuario.nome : 'Você',
            texto: texto,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo: 'enviada'
        };
        
        chatInternoMensagens.push(novaMensagem);
    } else {
        // Enviar para chat privado
        const novaMensagem = {
            id: chatInternoMensagens.length + 1,
            usuarioId: usuario ? usuario.id : 0,
            usuarioNome: usuario ? usuario.nome : 'Você',
            texto: texto,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            tipo: 'enviada'
        };
        
        // Adicionar mensagem ao histórico
        chatInternoMensagens.push(novaMensagem);
        
        // Simular resposta automática (apenas para demonstração)
        setTimeout(() => {
            const resposta = {
                id: chatInternoMensagens.length + 1,
                usuarioId: usuarioChatSelecionado.id,
                usuarioNome: usuarioChatSelecionado.nome,
                texto: `Obrigado pela sua mensagem! Estarei disponível para conversar em breve.`,
                hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                tipo: 'recebida'
            };
            
            chatInternoMensagens.push(resposta);
            carregarMensagensChatInterno();
            mostrarToast(`${usuarioChatSelecionado.nome} enviou uma mensagem!`, 'info');
        }, 1000);
    }
    
    // Limpar input
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
    
    // Atualizar chat
    carregarMensagensChatInterno();
    mostrarToast('Mensagem enviada!', 'success');
}

function carregarChatInterno() {
    if (!elementos.usuariosList) return;
    
    // Carregar usuários
    carregarUsuariosChatInterno();
    
    // Configurar busca de usuários
    if (elementos.searchUsuarios) {
        elementos.searchUsuarios.addEventListener('input', carregarUsuariosChatInterno);
    }
    
    // Carregar mensagens
    if (chatGrupoAtual === 'geral') {
        elementos.chatGrupoNome.innerHTML = `<i class="fas fa-users"></i> Chat Geral`;
        carregarMensagensChatInterno();
    } else if (usuarioChatSelecionado) {
        elementos.chatGrupoNome.innerHTML = `
            <i class="fas fa-user-circle"></i>
            ${usuarioChatSelecionado.nome}
            ${usuarioChatSelecionado.online ? 
                '<span style="color: #10b981; font-size: 12px;"> ● Online</span>' : 
                '<span style="color: #6b7280; font-size: 12px;"> ○ Offline</span>'
            }
        `;
        carregarMensagensChatInterno();
    }
    
    // Configurar eventos do input
    if (elementos.chatInternoInput) {
        elementos.chatInternoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensagemChatInterno();
            }
        });
        
        elementos.chatInternoInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    if (elementos.chatInternoSend) {
        elementos.chatInternoSend.addEventListener('click', enviarMensagemChatInterno);
    }
}

function alternarParaChatGeral() {
    chatGrupoAtual = 'geral';
    usuarioChatSelecionado = null;
    
    if (elementos.chatGrupoNome) {
        elementos.chatGrupoNome.innerHTML = `<i class="fas fa-users"></i> Chat Geral`;
    }
    
    // Adicionar mensagem de sistema
    const mensagemSistema = {
        id: chatInternoMensagens.length + 1,
        usuarioId: 0,
        usuarioNome: "Sistema",
        texto: "Você entrou no chat geral da equipe. Todas as mensagens são visíveis para todos os membros online.",
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        tipo: "system"
    };
    
    chatInternoMensagens.push(mensagemSistema);
    
    carregarChatInterno();
}

// Adicionar ao escopo global
window.selecionarUsuarioChat = selecionarUsuarioChat;
window.enviarMensagemChatInterno = enviarMensagemChatInterno;
window.alternarParaChatGeral = alternarParaChatGeral;

// Adicionar evento de clique no título para alternar para chat geral
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const chatGrupoNome = document.getElementById('chat-grupo-nome');
        if (chatGrupoNome) {
            chatGrupoNome.style.cursor = 'pointer';
            chatGrupoNome.title = 'Clique para voltar ao chat geral';
            chatGrupoNome.addEventListener('click', () => {
                if (chatGrupoAtual !== 'geral') {
                    alternarParaChatGeral();
                }
            });
        }
    }, 1000);
});
    
    // Scroll para baixo
    container.scrollTop = container.scrollHeight;

function enviarMensagemChatInterno() {
    const texto = elementos.chatInternoInput ? elementos.chatInternoInput.value.trim() : '';
    if (!texto) {
        mostrarToast('Digite uma mensagem primeiro!', 'warning');
        return;
    }
    
    const novaMensagem = {
        id: chatInternoMensagens.length + 1,
        usuarioId: usuario ? usuario.id : 0,
        usuarioNome: usuario ? usuario.nome : 'Você',
        texto: texto,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        tipo: 'enviada'
    };
    
    chatInternoMensagens.push(novaMensagem);
    
    // Limpar input
    if (elementos.chatInternoInput) {
        elementos.chatInternoInput.value = '';
    }
    
    // Atualizar chat
    carregarMensagensChatInterno();
    mostrarToast('Mensagem enviada!', 'success');
}

// ========== DASHBOARD ==========
function carregarDashboard() {
    // Atualizar estatísticas
    if (elementos.statTotalContatos) {
        elementos.statTotalContatos.textContent = contatos.length;
    }
    
    if (elementos.statContatosAtivos) {
        const ativos = contatos.filter(c => c.status === 'atendendo' || c.status === 'aguardando').length;
        elementos.statContatosAtivos.textContent = ativos;
    }
    
    if (elementos.statAtendimentosHoje) {
        const hoje = new Date().toISOString().split('T')[0];
        const atendimentosHoje = contatos.filter(c => 
            c.ultimaInteracao && c.ultimaInteracao.split('T')[0] === hoje
        ).length;
        elementos.statAtendimentosHoje.textContent = atendimentosHoje;
    }
    
    if (elementos.statTaxaResolucao) {
        const finalizados = contatos.filter(c => c.status === 'finalizado').length;
        const taxa = contatos.length > 0 ? Math.round((finalizados / contatos.length) * 100) : 0;
        elementos.statTaxaResolucao.textContent = `${taxa}%`;
    }
    
    // Carregar atividades recentes
    carregarAtividades();
}

function carregarAtividades() {
    if (!elementos.activityList) return;
    
    const atividades = [
        { tipo: 'chat', descricao: 'João Silva enviou uma mensagem', tempo: '2 min atrás' },
        { tipo: 'contato', descricao: 'Novo contato adicionado: Ana Paula', tempo: '15 min atrás' },
        { tipo: 'tag', descricao: 'Tag ATENDIMENTO TÉCNICO aplicada em 3 contatos', tempo: '1 hora atrás' },
        { tipo: 'agendamento', descricao: 'Reunião agendada para amanhã às 14h', tempo: '3 horas atrás' }
    ];
    
    elementos.activityList.innerHTML = atividades.map(atividade => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getAtividadeIcon(atividade.tipo)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-desc">${atividade.descricao}</div>
                <div class="activity-time">${atividade.tempo}</div>
            </div>
        </div>
    `).join('');
}

function getAtividadeIcon(tipo) {
    const icons = {
        'chat': 'comment',
        'contato': 'user-plus',
        'tag': 'tag',
        'agendamento': 'calendar-alt'
    };
    
    return icons[tipo] || 'bell';
}

// ========== AGENCIAMENTOS ==========
function carregarAgenciamentos() {
    const hoje = new Date().toISOString().split('T')[0];
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);
    const agendamentosFuturos = agendamentos.filter(a => a.data > hoje);
    
    // Atualizar contadores
    if (elementos.agendamentosHojeCount) {
        elementos.agendamentosHojeCount.textContent = agendamentosHoje.length;
    }
    
    if (elementos.agendamentosFuturosCount) {
        elementos.agendamentosFuturosCount.textContent = agendamentosFuturos.length;
    }
    
    // Carregar agendamentos de hoje
    if (elementos.agendamentosHojeList) {
        if (agendamentosHoje.length === 0) {
            elementos.agendamentosHojeList.innerHTML = `
                <div class="empty-agendamento">
                    <i class="fas fa-calendar-check"></i>
                    <p>Nenhum agendamento para hoje</p>
                </div>
            `;
        } else {
            elementos.agendamentosHojeList.innerHTML = agendamentosHoje.map(agendamento => `
                <div class="agendamento-item">
                    <div class="agendamento-hora">${agendamento.hora}</div>
                    <div class="agendamento-info">
                        <div class="agendamento-cliente">${agendamento.cliente}</div>
                        <div class="agendamento-desc">${agendamento.descricao}</div>
                    </div>
                    <span class="agendamento-status status-${agendamento.status}">
                        ${agendamento.status}
                    </span>
                </div>
            `).join('');
        }
    }
    
    // Carregar agendamentos futuros
    if (elementos.agendamentosFuturosList) {
        if (agendamentosFuturos.length === 0) {
            elementos.agendamentosFuturosList.innerHTML = `
                <div class="empty-agendamento">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Nenhum agendamento futuro</p>
                </div>
            `;
        } else {
            elementos.agendamentosFuturosList.innerHTML = agendamentosFuturos.map(agendamento => `
                <div class="agendamento-item">
                    <div class="agendamento-data">
                        ${formatarData(agendamento.data)}<br>
                        <small>${agendamento.hora}</small>
                    </div>
                    <div class="agendamento-info">
                        <div class="agendamento-cliente">${agendamento.cliente}</div>
                        <div class="agendamento-desc">${agendamento.descricao}</div>
                    </div>
                    <span class="agendamento-status status-${agendamento.status}">
                        ${agendamento.status}
                    </span>
                </div>
            `).join('');
        }
    }
}

// ========== RELATÓRIOS ==========
function carregarRelatorios() {
    if (!elementos.relatoriosContent) return;
    
    const periodo = elementos.relatorioPeriodo ? elementos.relatorioPeriodo.value : '7dias';
    
    // Dados simulados para relatórios
    const dadosRelatorio = {
        totalAtendimentos: contatos.length,
        atendimentosPorStatus: {
            atendendo: contatos.filter(c => c.status === 'atendendo').length,
            aguardando: contatos.filter(c => c.status === 'aguardando').length,
            finalizado: contatos.filter(c => c.status === 'finalizado').length
        },
        tagsMaisUsadas: tags.slice(0, 5).map(t => ({
            nome: t.nome,
            quantidade: t.quantidade
        })),
        atendimentosPorDia: [
            { dia: 'Seg', quantidade: 12 },
            { dia: 'Ter', quantidade: 8 },
            { dia: 'Qua', quantidade: 15 },
            { dia: 'Qui', quantidade: 10 },
            { dia: 'Sex', quantidade: 18 },
            { dia: 'Sáb', quantidade: 5 },
            { dia: 'Dom', quantidade: 2 }
        ]
    };
    
    elementos.relatoriosContent.innerHTML = `
        <div class="relatorios-grid">
            <div class="relatorio-card">
                <h3>Atendimentos por Status</h3>
                <div class="status-chart">
                    <div class="status-bar" style="width: ${dadosRelatorio.atendimentosPorStatus.atendendo / contatos.length * 100}%; background: #10b981;">
                        Atendendo: ${dadosRelatorio.atendimentosPorStatus.atendendo}
                    </div>
                    <div class="status-bar" style="width: ${dadosRelatorio.atendimentosPorStatus.aguardando / contatos.length * 100}%; background: #f59e0b;">
                        Aguardando: ${dadosRelatorio.atendimentosPorStatus.aguardando}
                    </div>
                    <div class="status-bar" style="width: ${dadosRelatorio.atendimentosPorStatus.finalizado / contatos.length * 100}%; background: #3b82f6;">
                        Finalizado: ${dadosRelatorio.atendimentosPorStatus.finalizado}
                    </div>
                </div>
            </div>
            
            <div class="relatorio-card">
                <h3>Tags Mais Usadas</h3>
                <div class="tags-chart">
                    ${dadosRelatorio.tagsMaisUsadas.map(tag => `
                        <div class="tag-item">
                            <span class="tag-nome">${tag.nome}</span>
                            <div class="tag-bar">
                                <div class="tag-fill" style="width: ${(tag.quantidade / 20) * 100}%"></div>
                            </div>
                            <span class="tag-count">${tag.quantidade}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="relatorio-card">
                <h3>Atendimentos por Dia</h3>
                <div class="daily-chart">
                    ${dadosRelatorio.atendimentosPorDia.map(dia => `
                        <div class="daily-bar">
                            <div class="bar-fill" style="height: ${(dia.quantidade / 20) * 100}%"></div>
                            <div class="bar-label">${dia.dia}</div>
                            <div class="bar-value">${dia.quantidade}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="relatorio-card">
                <h3>Estatísticas Gerais</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${dadosRelatorio.totalAtendimentos}</div>
                        <div class="stat-label">Total de Atendimentos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(dadosRelatorio.atendimentosPorStatus.finalizado / contatos.length * 100)}%</div>
                        <div class="stat-label">Taxa de Resolução</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${tags.length}</div>
                        <div class="stat-label">Tags Criadas</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${0}</div>
                        <div class="stat-label">Respostas Rápidas</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== AJUDA ==========
function carregarAjuda() {
    const ajudaSection = elementos.sections.ajuda;
    if (!ajudaSection) return;
    
    ajudaSection.innerHTML = `
        <div class="ajuda-container">
            <h2>Central de Ajuda</h2>
            
            <div class="ajuda-search">
                <input type="text" placeholder="Pesquise por tópicos de ajuda..." class="search-input">
                <button class="btn-primary"><i class="fas fa-search"></i> Buscar</button>
            </div>
            
            <div class="ajuda-categorias">
                <div class="categoria-card" onclick="mostrarTopicoAjuda('atendimento')">
                    <div class="categoria-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <h3>Atendimento</h3>
                    <p>Como gerenciar conversas e contatos</p>
                </div>
                
                <div class="categoria-card" onclick="mostrarTopicoAjuda('contatos')">
                    <div class="categoria-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Contatos</h3>
                    <p>Importar, exportar e gerenciar contatos</p>
                </div>
                
                <div class="categoria-card" onclick="mostrarTopicoAjuda('tags')">
                    <div class="categoria-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3>Tags</h3>
                    <p>Categorizar e organizar seus contatos</p>
                </div>
                
                <div class="categoria-card" onclick="mostrarTopicoAjuda('relatorios')">
                    <div class="categoria-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3>Relatórios</h3>
                    <p>Análises e métricas do sistema</p>
                </div>
            </div>
            
            <div class="ajuda-faq">
                <h3>Perguntas Frequentes</h3>
                <div class="faq-list">
                    <div class="faq-item">
                        <div class="faq-pergunta">
                            Como importar contatos?
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-resposta">
                            Vá para a seção Contatos → Clique em "Importar Contatos" → 
                            Selecione o formato (CSV, Excel) → Siga as instruções na tela.
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-pergunta">
                            Como criar uma tarefa?
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-resposta">
                            Vá para Tarefas → Clique em "Nova Tarefa" → 
                            Preencha os dados necessários → Salve.
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-pergunta">
                            Como mudar o tema do chat?
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-resposta">
                            Clique no botão "Tema" no menu superior → 
                            Escolha entre WhatsApp ou Padrão.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar eventos para FAQ
    document.querySelectorAll('.faq-pergunta').forEach(pergunta => {
        pergunta.addEventListener('click', () => {
            const resposta = pergunta.nextElementSibling;
            resposta.classList.toggle('show');
            const icon = pergunta.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });
}

function mostrarTopicoAjuda(topoico) {
    const topicos = {
        atendimento: {
            titulo: 'Guia de Atendimento',
            conteudo: `
                <h3>Como usar o sistema de atendimento</h3>
                <p>1. Na barra lateral esquerda, selecione um contato da lista</p>
                <p>2. Use a caixa de mensagem para digitar sua resposta</p>
                <p>3. Clique em enviar ou pressione Enter</p>
                <p>4. Mude o status do contato conforme a necessidade</p>
            `
        },
        contatos: {
            titulo: 'Gerenciamento de Contatos',
            conteudo: `
                <h3>Como gerenciar seus contatos</h3>
                <p><strong>Importar:</strong> Suporta CSV, Excel e WhatsApp</p>
                <p><strong>Exportar:</strong> Vários formatos disponíveis</p>
                <p><strong>Editar:</strong> Clique no ícone de edição na tabela</p>
                <p><strong>Filtrar:</strong> Use a barra de busca e filtros</p>
            `
        }
    };
    
    const topico = topicos[topoico];
    if (topico) {
        alert(`${topico.titulo}\n\n${topico.conteudo}`);
    }
}

// ========== FUNÇÕES AUXILIARES ==========
function carregarDadosIniciais() {
    return new Promise((resolve) => {
        setTimeout(() => {
            carregarDadosMock();
            resolve();
        }, 500);
    });
}

function atualizarBadges() {
    if (elementos.badgeAtendimentos) {
        const atendimentosAtivos = contatos.filter(c => 
            c.status === 'atendendo' || c.status === 'aguardando'
        ).length;
        elementos.badgeAtendimentos.textContent = atendimentosAtivos;
        elementos.badgeAtendimentos.style.display = atendimentosAtivos > 0 ? 'flex' : 'none';
    }
    
    if (elementos.badgeContatos) {
        const novosContatos = contatos.filter(c => {
            const dataCriacao = new Date(c.dataCriacao);
            const hoje = new Date();
            const diffTime = Math.abs(hoje - dataCriacao);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).length;
        
        elementos.badgeContatos.textContent = novosContatos;
        elementos.badgeContatos.style.display = novosContatos > 0 ? 'flex' : 'none';
    }
}

function formatarTelefone(telefone) {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return telefone;
}

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

function formatarDataParaExportacao(dataString, formato) {
    if (!dataString) return '';
    const data = new Date(dataString);
    
    switch(formato) {
        case 'dd/mm/yyyy':
            return data.toLocaleDateString('pt-BR');
        case 'mm/dd/yyyy':
            return (data.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                   data.getDate().toString().padStart(2, '0') + '/' + 
                   data.getFullYear();
        case 'yyyy-mm-dd':
            return data.getFullYear() + '-' + 
                   (data.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                   data.getDate().toString().padStart(2, '0');
        default:
            return data.toISOString().split('T')[0];
    }
}

function getTagColor(tagNome) {
    const tag = tags.find(t => t.nome === tagNome);
    return tag ? tag.cor : '#6b7280';
}

function getTagIcon(tagNome) {
    const tag = tags.find(t => t.nome === tagNome);
    return tag && tag.icone ? `<i class="fas ${tag.icone}"></i>` : '🏷️';
}

function atualizarHora() {
    const horaElement = document.getElementById('current-time');
    if (horaElement) {
        const agora = new Date();
        horaElement.textContent = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ========== NOTIFICAÇÕES ==========
function mostrarToast(mensagem, tipo = 'info') {
    // Remover toast anterior se existir
    const toastAnterior = document.querySelector('.toast');
    if (toastAnterior) {
        toastAnterior.remove();
    }
    
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icons[tipo] || 'fa-info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

function mostrarConfirmacao(titulo, mensagem, textoConfirmar, textoCancelar, onConfirmar) {
    // Remover confirmação anterior se existir
    const confirmacaoAnterior = document.querySelector('.confirmation-modal');
    if (confirmacaoAnterior) {
        confirmacaoAnterior.remove();
    }
    
    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
        <div class="confirmation-content">
            <h3>${titulo}</h3>
            <p>${mensagem}</p>
            <div class="confirmation-buttons">
                <button class="btn-secondary" id="btn-cancelar">${textoCancelar}</button>
                <button class="btn-primary" id="btn-confirmar">${textoConfirmar}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Adicionar eventos
    document.getElementById('btn-confirmar').addEventListener('click', () => {
        modal.remove();
        if (onConfirmar) onConfirmar();
    });
    
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ========== FUNÇÕES ADICIONAIS ==========
function alternarTarefa(tarefaId) {
    const tarefa = tarefasMock.find(t => t.id === tarefaId);
    if (!tarefa) return;
    
    tarefa.concluida = !tarefa.concluida;
    carregarTarefas();
    
    const status = tarefa.concluida ? 'concluída' : 'pendente';
    mostrarToast(`Tarefa "${tarefa.titulo}" marcada como ${status}!`, 'success');
}

function carregarAgenciamentos() {
    // Implementação já está no código acima
}

function carregarRelatorios() {
    // Implementação já está no código acima
}

// ========== EXPORTAR FUNÇÕES PARA O ESCOPO GLOBAL ==========
// Todas as funções já estão no escopo global, mas vamos garantir
// que as principais estejam disponíveis para eventos HTML
window.selecionarContato = selecionarContato;
window.enviarMensagem = enviarMensagem;
window.enviarMensagemChatInterno = enviarMensagemChatInterno;
window.selecionarUsuarioChat = selecionarUsuarioChat;
window.fecharModalCriacao = fecharModalCriacao;
window.navegarFormulario = navegarFormulario;
window.salvarCriacao = salvarCriacao;
window.selecionarCorPreset = selecionarCorPreset;
window.removerTagMultiSelect = removerTagMultiSelect;
window.selecionarTipoImportacao = selecionarTipoImportacao;
window.fecharModalImportacao = fecharModalImportacao;
window.processarImportacao = processarImportacao;
window.selecionarFormatoExportacao = selecionarFormatoExportacao;
window.fecharModalExportacao = fecharModalExportacao;
window.executarExportacao = executarExportacao;
window.criarNovaColunaKanban = criarNovaColunaKanban;
window.editarCard = editarCard;
window.excluirCard = excluirCard;
window.editarTarefa = editarTarefa;
window.excluirTarefa = excluirTarefa;
window.alternarTarefa = alternarTarefa;
window.editarTag = editarTag;
window.excluirTag = excluirTag;
window.usarTag = usarTag;
window.editarContato = editarContato;
window.excluirContato = excluirContato;
window.mostrarTopicoAjuda = mostrarTopicoAjuda;

debug('Aplicação CBA Admin carregada com sucesso!');