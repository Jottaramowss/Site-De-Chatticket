// n8n-config.js
const API_URL = 'http://localhost:5000';

async function carregarConfiguracoes() {
    try {
        const response = await fetch(`${API_URL}/api/n8n/config`);
        const config = await response.json();
        
        // Preencher campos
        document.getElementById('n8n-webhook-url').value = config.webhookUrl;
        document.getElementById('webhook-url').textContent = config.apiUrl;
        
        // Atualizar status
        atualizarStatusConexao();
        
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

async function testarConexao() {
    try {
        const response = await fetch(`${API_URL}/api/n8n/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Conexão com N8N estabelecida com sucesso!');
            atualizarStatusConexao(true);
        } else {
            alert('❌ Falha na conexão: ' + result.message);
            atualizarStatusConexao(false);
        }
        
    } catch (error) {
        alert('❌ Erro ao testar conexão: ' + error.message);
    }
}

async function salvarConfigN8N() {
    const webhookUrl = document.getElementById('n8n-webhook-url').value;
    const apiKey = document.getElementById('n8n-api-key').value;
    
    try {
        const response = await fetch(`${API_URL}/api/n8n/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ webhookUrl, apiKey })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Configurações do N8N salvas com sucesso!');
            await testarConexao();
        } else {
            alert('❌ Erro ao salvar configurações');
        }
        
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

function atualizarStatusConexao(conectado = false) {
    const statusElement = document.getElementById('connection-status');
    const indicator = conectado ? 
        '<span class="status-indicator status-connected"></span>' :
        '<span class="status-indicator status-disconnected"></span>';
    
    statusElement.innerHTML = `
        <p>${indicator} N8N: ${conectado ? 'Conectado' : 'Não conectado'}</p>
        <p><span class="status-indicator status-disconnected"></span> IA: Configurar</p>
    `;
}

function copiarWebhook() {
    const webhookUrl = document.getElementById('webhook-url').textContent;
    navigator.clipboard.writeText(webhookUrl)
        .then(() => alert('Webhook copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar:', err));
}

function voltarParaDashboard() {
    window.location.href = '/';
}

function iniciarTudo() {
    alert('🚀 Iniciando todas as automações...');
    // Implementar lógica para iniciar fluxos
}

// Carregar configurações ao iniciar
document.addEventListener('DOMContentLoaded', carregarConfiguracoes);