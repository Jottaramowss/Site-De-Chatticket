// server.js - CBA ADMIN COMPLETO COM TODAS AS ABAS
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // Para chamar APIs externas

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;

// ========== BANCO DE DADOS EM MEMÓRIA ==========

// Usuários
let usuarios = [
  {
    id: 1,
    nome: "Administrador",
    email: "admin@cba.com",
    senha: "123456",
    avatar: "A",
    empresa: "Empresa 1",
    licenca: "2025-09-14",
    online: true
  }
];

// Contatos
let contatos = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "11999999999",
    email: "joao@email.com",
    status: "atendendo",
    tags: ["vip", "suporte"],
    ultimaInteracao: new Date().toISOString(),
    online: true
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "11888888888",
    email: "maria@email.com",
    status: "aguardando",
    tags: ["novo"],
    ultimaInteracao: new Date().toISOString(),
    online: false
  },
  {
    id: 3,
    nome: "Carlos Oliveira",
    telefone: "11777777777",
    email: "carlos@email.com",
    status: "finalizado",
    tags: ["tecnico"],
    ultimaInteracao: new Date().toISOString(),
    online: true
  }
];

// Mensagens
let mensagens = {
  1: [
    {
      id: 1,
      tipo: "recebida",
      texto: "Olá, preciso de ajuda com meu produto.",
      hora: "10:30",
      lida: true
    },
    {
      id: 2,
      tipo: "enviada",
      texto: "Olá João! Como posso ajudá-lo hoje?",
      hora: "10:32",
      lida: true
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
  ]
};

// Respostas Rápidas
let respostasRapidas = [
  {
    id: 1,
    titulo: "Boas-vindas",
    categoria: "boasvindas",
    conteudo: "Olá! Seja bem-vindo(a)! Como posso ajudá-lo hoje?",
    uso: 15
  },
  {
    id: 2,
    titulo: "Horário de Funcionamento",
    categoria: "suporte",
    conteudo: "Nosso horário de funcionamento é de segunda a sexta, das 9h às 18h.",
    uso: 8
  },
  {
    id: 3,
    titulo: "Preços e Orçamentos",
    categoria: "vendas",
    conteudo: "Posso enviar nossa tabela de preços. Me informe para qual produto você precisa?",
    uso: 12
  },
  {
    id: 4,
    titulo: "Problemas Técnicos",
    categoria: "tecnicas",
    conteudo: "Vou verificar isso para você. Pode me dar mais detalhes sobre o problema?",
    uso: 5
  }
];

// Kanban
let kanbanCards = [
  {
    id: 1,
    titulo: "Desenvolver novo site",
    descricao: "Criar layout e funcionalidades",
    coluna: "andamento",
    tag: "design",
    data: "15/09",
    responsavel: "João"
  },
  {
    id: 2,
    titulo: "Revisar relatório mensal",
    descricao: "Analisar métricas de atendimento",
    coluna: "aguardando",
    tag: "analise",
    data: "18/09",
    responsavel: "Maria"
  }
];

// Tarefas
let tarefas = [
  {
    id: 1,
    titulo: "Revisar relatório mensal",
    descricao: "Analisar métricas de atendimento do mês",
    data: "2024-09-15",
    responsavel: "Eu",
    prioridade: "alta",
    concluida: false
  },
  {
    id: 2,
    titulo: "Atualizar lista de contatos",
    descricao: "Verificar dados incompletos",
    data: "2024-09-16",
    responsavel: "Equipe",
    prioridade: "media",
    concluida: true
  }
];

// Agenciamentos
let agendamentos = [
  {
    id: 1,
    data: new Date().toISOString().split('T')[0],
    hora: "10:00",
    cliente: "João Silva",
    descricao: "Reunião de alinhamento",
    status: "confirmado",
    tipo: "reuniao"
  },
  {
    id: 2,
    data: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    hora: "14:30",
    cliente: "Maria Santos",
    descricao: "Demonstração do produto",
    status: "pendente",
    tipo: "vendas"
  }
];

// Tags
let tags = [
  { id: 1, nome: "novo", cor: "#ef4444", quantidade: 3 },
  { id: 2, nome: "vip", cor: "#8b5cf6", quantidade: 2 },
  { id: 3, nome: "suporte", cor: "#3b82f6", quantidade: 5 },
  { id: 4, nome: "tecnico", cor: "#10b981", quantidade: 1 }
];

// Chat Interno
let chatInternoUsuarios = [
  { id: 1, nome: "Maria", email: "maria@empresa.com", online: true, avatar: "M" },
  { id: 2, nome: "Carlos", email: "carlos@empresa.com", online: true, avatar: "C" },
  { id: 3, nome: "Ana", email: "ana@empresa.com", online: false, avatar: "A" }
];

let chatInternoMensagens = [
  { id: 1, usuarioId: 1, texto: "Bom dia equipe!", hora: "09:00", tipo: "sistema" },
  { id: 2, usuarioId: 2, texto: "Bom dia! Alguém pode revisar o relatório?", hora: "09:05", tipo: "normal" }
];

// ========== CONFIGURAÇÕES ==========
const N8N_CONFIG = {
  webhookUrl: 'http://localhost:5678/webhook/cba',
  apiKey: '',
  workflows: {
    respostaAutomatica: 'resposta-ia',
    processarMensagem: 'processar-entrada',
    criarLead: 'criar-lead'
  }
};

const IA_CONFIG = {
  enabled: true,
  provider: 'n8n',
  modelo: 'gpt-3.5-turbo',
  temperatura: 0.7,
  contextoInicial: 'Você é um assistente virtual da CBA Admin. Seja prestativo e profissional.'
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// ========== ROTAS DE AUTENTICAÇÃO ==========
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (usuario) {
    usuario.online = true;
    
    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        empresa: usuario.empresa,
        licenca: usuario.licenca
      },
      token: 'fake-jwt-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciais inválidas'
    });
  }
});

// ========== ROTAS DE CONTATOS ==========
app.get('/api/contatos', (req, res) => {
  res.json(contatos);
});

app.get('/api/contatos/:id', (req, res) => {
  const contato = contatos.find(c => c.id === parseInt(req.params.id));
  
  if (contato) {
    res.json(contato);
  } else {
    res.status(404).json({ error: 'Contato não encontrado' });
  }
});

app.post('/api/contatos', (req, res) => {
  const novoContato = {
    id: contatos.length > 0 ? Math.max(...contatos.map(c => c.id)) + 1 : 1,
    nome: req.body.nome,
    telefone: req.body.telefone,
    email: req.body.email || '',
    status: 'aguardando',
    tags: req.body.tags || ['novo'],
    ultimaInteracao: new Date().toISOString(),
    online: false
  };
  
  contatos.push(novoContato);
  mensagens[novoContato.id] = [];
  
  // Notificar via WebSocket
  io.emit('atualizar-contatos', contatos);
  
  res.json({
    success: true,
    contato: novoContato
  });
});

// ========== ROTAS DE MENSAGENS ==========
app.get('/api/mensagens/:contatoId', (req, res) => {
  const msgs = mensagens[req.params.contatoId] || [];
  res.json(msgs);
});

app.post('/api/mensagem', (req, res) => {
  const { contatoId, texto } = req.body;
  
  if (!mensagens[contatoId]) {
    mensagens[contatoId] = [];
  }
  
  const novaMensagem = {
    id: mensagens[contatoId].length + 1,
    tipo: 'enviada',
    texto: texto,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    lida: true
  };
  
  mensagens[contatoId].push(novaMensagem);
  
  // Atualizar último contato
  const contato = contatos.find(c => c.id === parseInt(contatoId));
  if (contato) {
    contato.ultimaInteracao = new Date().toISOString();
  }
  
  // WebSocket
  io.emit('nova-mensagem', {
    contatoId: parseInt(contatoId),
    mensagem: novaMensagem
  });
  
  res.json({ success: true, mensagem: novaMensagem });
});

// ========== ROTAS RESPOSTAS RÁPIDAS ==========
app.get('/api/respostas-rapidas', (req, res) => {
  res.json(respostasRapidas);
});

app.post('/api/respostas-rapidas', (req, res) => {
  const novaResposta = {
    id: respostasRapidas.length > 0 ? Math.max(...respostasRapidas.map(r => r.id)) + 1 : 1,
    titulo: req.body.titulo,
    categoria: req.body.categoria || 'outras',
    conteudo: req.body.conteudo,
    uso: 0
  };
  
  respostasRapidas.push(novaResposta);
  res.json({ success: true, resposta: novaResposta });
});

app.put('/api/respostas-rapidas/:id/usar', (req, res) => {
  const resposta = respostasRapidas.find(r => r.id === parseInt(req.params.id));
  
  if (resposta) {
    resposta.uso++;
    res.json({ success: true, uso: resposta.uso });
  } else {
    res.status(404).json({ error: 'Resposta não encontrada' });
  }
});

// ========== ROTAS KANBAN ==========
app.get('/api/kanban', (req, res) => {
  res.json(kanbanCards);
});

app.post('/api/kanban', (req, res) => {
  const novoCard = {
    id: kanbanCards.length > 0 ? Math.max(...kanbanCards.map(c => c.id)) + 1 : 1,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    coluna: req.body.coluna || 'aguardando',
    tag: req.body.tag || 'geral',
    data: new Date().toLocaleDateString('pt-BR'),
    responsavel: req.body.responsavel || 'Não atribuído'
  };
  
  kanbanCards.push(novoCard);
  res.json({ success: true, card: novoCard });
});

app.put('/api/kanban/:id/mover', (req, res) => {
  const { coluna } = req.body;
  const card = kanbanCards.find(c => c.id === parseInt(req.params.id));
  
  if (card) {
    card.coluna = coluna;
    res.json({ success: true, card });
  } else {
    res.status(404).json({ error: 'Card não encontrado' });
  }
});

// ========== ROTAS TAREFAS ==========
app.get('/api/tarefas', (req, res) => {
  const { status, prioridade, responsavel } = req.query;
  
  let tarefasFiltradas = tarefas;
  
  if (status && status !== 'todas') {
    tarefasFiltradas = tarefasFiltradas.filter(t => 
      status === 'concluida' ? t.concluida : !t.concluida
    );
  }
  
  if (prioridade && prioridade !== 'todas') {
    tarefasFiltradas = tarefasFiltradas.filter(t => t.prioridade === prioridade);
  }
  
  if (responsavel && responsavel !== 'todos') {
    if (responsavel === 'eu') {
      tarefasFiltradas = tarefasFiltradas.filter(t => t.responsavel === 'Eu');
    } else if (responsavel === 'equipe') {
      tarefasFiltradas = tarefasFiltradas.filter(t => t.responsavel === 'Equipe');
    }
  }
  
  res.json(tarefasFiltradas);
});

app.post('/api/tarefas', (req, res) => {
  const novaTarefa = {
    id: tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 1,
    titulo: req.body.titulo,
    descricao: req.body.descricao || '',
    data: req.body.data || new Date().toISOString().split('T')[0],
    responsavel: req.body.responsavel || 'Eu',
    prioridade: req.body.prioridade || 'media',
    concluida: false
  };
  
  tarefas.push(novaTarefa);
  res.json({ success: true, tarefa: novaTarefa });
});

app.put('/api/tarefas/:id/concluir', (req, res) => {
  const tarefa = tarefas.find(t => t.id === parseInt(req.params.id));
  
  if (tarefa) {
    tarefa.concluida = !tarefa.concluida;
    res.json({ success: true, concluida: tarefa.concluida });
  } else {
    res.status(404).json({ error: 'Tarefa não encontrada' });
  }
});

// ========== ROTAS AGENCIAMENTOS ==========
app.get('/api/agenciamentos', (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  
  const agendamentosHoje = agendamentos.filter(a => a.data === hoje);
  const agendamentosFuturos = agendamentos.filter(a => a.data > hoje);
  
  res.json({
    hoje: agendamentosHoje,
    futuros: agendamentosFuturos
  });
});

app.post('/api/agenciamentos', (req, res) => {
  const novoAgendamento = {
    id: agendamentos.length > 0 ? Math.max(...agendamentos.map(a => a.id)) + 1 : 1,
    data: req.body.data,
    hora: req.body.hora,
    cliente: req.body.cliente,
    descricao: req.body.descricao,
    status: 'pendente',
    tipo: req.body.tipo || 'outro'
  };
  
  agendamentos.push(novoAgendamento);
  res.json({ success: true, agendamento: novoAgendamento });
});

// ========== ROTAS TAGS ==========
app.get('/api/tags', (req, res) => {
  const total = tags.reduce((sum, tag) => sum + tag.quantidade, 0);
  const maisUsada = tags.length > 0 ? 
    tags.reduce((prev, current) => (prev.quantidade > current.quantidade) ? prev : current).nome : 
    '-';
  
  res.json({
    tags: tags,
    estatisticas: {
      total: total,
      maisUsada: maisUsada,
      totalTags: tags.length
    }
  });
});

app.post('/api/tags', (req, res) => {
  const novaTag = {
    id: tags.length > 0 ? Math.max(...tags.map(t => t.id)) + 1 : 1,
    nome: req.body.nome,
    cor: req.body.cor || '#6b7280',
    quantidade: 0
  };
  
  tags.push(novaTag);
  res.json({ success: true, tag: novaTag });
});

// ========== ROTAS CHAT INTERNO ==========
app.get('/api/chat-interno/usuarios', (req, res) => {
  res.json(chatInternoUsuarios);
});

app.get('/api/chat-interno/mensagens', (req, res) => {
  res.json(chatInternoMensagens);
});

app.post('/api/chat-interno/mensagens', (req, res) => {
  const novaMensagem = {
    id: chatInternoMensagens.length + 1,
    usuarioId: 1, // Usuário atual (admin)
    texto: req.body.texto,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tipo: 'normal'
  };
  
  chatInternoMensagens.push(novaMensagem);
  
  // WebSocket para chat interno
  io.emit('chat-interno-nova-mensagem', novaMensagem);
  
  res.json({ success: true, mensagem: novaMensagem });
});

// ========== ROTAS DASHBOARD ==========
app.get('/api/dashboard', (req, res) => {
  const totalContatos = contatos.length;
  const contatosAtivos = contatos.filter(c => c.status === 'atendendo').length;
  const hoje = new Date().toISOString().split('T')[0];
  
  // Simular atendimentos hoje (na realidade seria por data)
  const atendimentosHoje = Math.floor(Math.random() * 10) + 5;
  
  // Calcular taxa de resolução (mensagens respondidas / total)
  let totalMensagens = 0;
  let mensagensRespondidas = 0;
  
  Object.values(mensagens).forEach(msgs => {
    totalMensagens += msgs.length;
    mensagensRespondidas += msgs.filter(m => m.tipo === 'enviada').length;
  });
  
  const taxaResolucao = totalMensagens > 0 ? 
    Math.round((mensagensRespondidas / totalMensagens) * 100) + '%' : 
    '0%';
  
  res.json({
    totalContatos: totalContatos,
    contatosAtivos: contatosAtivos,
    atendimentosHoje: atendimentosHoje,
    taxaResolucao: taxaResolucao,
    atividadeRecente: Object.values(mensagens)
      .flat()
      .sort((a, b) => new Date(b.hora) - new Date(a.hora))
      .slice(0, 5)
  });
});

// ========== ROTAS RELATÓRIOS ==========
app.get('/api/relatorios', (req, res) => {
  const periodo = req.query.periodo || 'mes';
  const tipo = req.query.tipo || 'atendimento';
  
  // Gerar dados simulados baseados no período
  let dados;
  
  switch(tipo) {
    case 'atendimento':
      dados = {
        titulo: 'Relatório de Atendimento',
        periodo: periodo,
        totalAtendimentos: 150,
        atendimentosConcluidos: 120,
        taxaResolucao: '80%',
        tempoMedioResposta: '2m 30s',
        satisfacao: '4.5/5'
      };
      break;
      
    case 'desempenho':
      dados = {
        titulo: 'Relatório de Desempenho',
        periodo: periodo,
        equipe: [
          { nome: 'João', atendimentos: 45, resolvidos: 38 },
          { nome: 'Maria', atendimentos: 52, resolvidos: 45 },
          { nome: 'Carlos', atendimentos: 38, resolvidos: 32 }
        ]
      };
      break;
      
    default:
      dados = {
        titulo: 'Relatório ' + tipo,
        periodo: periodo,
        dados: []
      };
  }
  
  res.json(dados);
});

// ========== ROTAS N8N ==========
app.post('/api/n8n/webhook', (req, res) => {
  const { evento, data } = req.body;
  
  console.log(`📥 Webhook N8N recebido: ${evento}`);
  
  switch (evento) {
    case 'nova_mensagem':
      processarMensagemRecebida(data);
      break;
      
    case 'resposta_ia':
      enviarRespostaIA(data);
      break;
      
    default:
      console.log(`Evento não reconhecido: ${evento}`);
  }
  
  res.json({ success: true, message: 'Webhook processado' });
});

app.post('/api/ia/processar', async (req, res) => {
  const { contatoId, mensagem } = req.body;
  
  // Simular resposta da IA
  setTimeout(() => {
    const respostas = [
      "Entendi sua dúvida. Vou ajudar você com isso.",
      "Claro! Posso te dar mais informações sobre isso.",
      "Obrigado pela mensagem. Em que mais posso ajudar?",
      "Vou verificar isso para você e retorno em breve."
    ];
    
    const resposta = respostas[Math.floor(Math.random() * respostas.length)];
    
    res.json({
      success: true,
      resposta: resposta,
      processadoPor: 'ia-simulada'
    });
  }, 1000);
});

// ========== WEBHOOK FUNCTIONS ==========
function processarMensagemRecebida(data) {
  const { contato, mensagem } = data;
  
  if (!mensagens[contato.id]) {
    mensagens[contato.id] = [];
  }
  
  mensagens[contato.id].push({
    id: mensagens[contato.id].length + 1,
    tipo: 'recebida',
    texto: mensagem,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    lida: false,
    origem: 'n8n'
  });
  
  io.emit('nova-mensagem', {
    contatoId: contato.id,
    mensagem: mensagens[contato.id][mensagens[contato.id].length - 1]
  });
  
  io.emit('atualizar-contatos', contatos);
}

function enviarRespostaIA(data) {
  const { contatoId, resposta } = data;
  
  if (!mensagens[contatoId]) {
    mensagens[contatoId] = [];
  }
  
  mensagens[contatoId].push({
    id: mensagens[contatoId].length + 1,
    tipo: 'enviada',
    texto: resposta,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    lida: true,
    origem: 'ia'
  });
  
  io.emit('nova-mensagem', {
    contatoId: contatoId,
    mensagem: mensagens[contatoId][mensagens[contatoId].length - 1]
  });
}

// ========== WEBSOCKET ==========
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);
  
  // Join em sala de chat
  socket.on('join-chat', (contatoId) => {
    socket.join(`chat-${contatoId}`);
    console.log(`Usuário entrou no chat ${contatoId}`);
  });
  
  // Enviar mensagem
  socket.on('enviar-mensagem', (data) => {
    const { contatoId, texto, tipo } = data;
    
    if (!mensagens[contatoId]) {
      mensagens[contatoId] = [];
    }
    
    const novaMensagem = {
      id: mensagens[contatoId].length + 1,
      tipo: tipo || 'enviada',
      texto: texto,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lida: true
    };
    
    mensagens[contatoId].push(novaMensagem);
    
    // Atualizar contato
    const contato = contatos.find(c => c.id === contatoId);
    if (contato) {
      contato.ultimaInteracao = new Date().toISOString();
    }
    
    // Broadcast para todos
    io.emit('nova-mensagem', {
      contatoId: contatoId,
      mensagem: novaMensagem
    });
    
    io.emit('atualizar-contatos', contatos);
  });
  
  // Atualizar status do contato
  socket.on('atualizar-status', (data) => {
    const { contatoId, status } = data;
    const contato = contatos.find(c => c.id === contatoId);
    
    if (contato) {
      contato.status = status;
      io.emit('atualizar-contatos', contatos);
    }
  });
  
  // Chat interno
  socket.on('chat-interno-mensagem', (mensagem) => {
    const novaMensagem = {
      id: chatInternoMensagens.length + 1,
      usuarioId: mensagem.usuarioId,
      texto: mensagem.texto,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tipo: 'normal'
    };
    
    chatInternoMensagens.push(novaMensagem);
    io.emit('chat-interno-nova-mensagem', novaMensagem);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// ========== INICIAR SERVIDOR ==========
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 CBA ADMIN - SISTEMA COMPLETO');
  console.log('='.repeat(60));
  console.log(`📡 Servidor rodando: http://localhost:${PORT}`);
  console.log(`🔗 API disponível: http://localhost:${PORT}/api`);
  console.log(`💬 WebSocket: ws://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('📊 Seções disponíveis:');
  console.log('   • Atendimento');
  console.log('   • Contatos');
  console.log('   • Respostas Rápidas');
  console.log('   • Kanban');
  console.log('   • Tarefas');
  console.log('   • Agenciamentos');
  console.log('   • Tags');
  console.log('   • Chat Interno');
  console.log('   • Dashboard');
  console.log('   • Relatórios');
  console.log('   • Ajuda');
  console.log('='.repeat(60));
  console.log('👤 Login: admin@cba.com / 123456');
  console.log('='.repeat(60));
});