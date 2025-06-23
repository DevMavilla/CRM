// === Variáveis Globais ===
let leads = JSON.parse(localStorage.getItem('leads')) || [];
let statusChart;
let xp = parseInt(localStorage.getItem('xp')) || 0;
let matriculas = leads.filter(lead => lead.matriculado).length;
const metaMatriculas = 25;
let filtroAtual = 'todos';



// Conquistas
const achievements = [
  { id: "first_lead", name: "Primeiro Lead", xp: 50, achieved: false },
  { id: "matricula_5", name: "5 Matrículas", xp: 200, achieved: false },
  { id: "conversion_10", name: "10% Conversão", xp: 300, achieved: false },
  { id: "followup_10", name: "10 Follow-ups", xp: 150, achieved: false }
];

// === Login ===
document.getElementById('btnLogin').addEventListener('click', () => {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  
  // Verificação básica (apenas para demonstração)
  if (user === 'admin' && pass === 'admin123') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('preloader').style.display = 'hidden';
    
    setTimeout(() => {
      document.getElementById('preloader').style.display = 'none';
      document.getElementById('mainApp').classList.remove('hidden');
      aplicarTemaSalvo();
      renderLeads();
      checkAchievements();
    }, 1500);
  } else {
    showNotification('🛑 Usuário ou senha incorretos!', 'danger');
  }
});

// === Tema Dark / Claro ===
const btnToggleTheme = document.getElementById('toggleTheme');
const body = document.body;

function aplicarTemaSalvo() {
  const temaSalvo = localStorage.getItem('tema') || 'claro';
  if (temaSalvo === 'dark') {
    body.classList.add('dark-theme');
    btnToggleTheme.innerHTML = '<i class="fas fa-sun"></i> Tema Claro';
  } else {
    body.classList.remove('dark-theme');
    btnToggleTheme.innerHTML = '<i class="fas fa-moon"></i> Tema Dark';
  }
}
aplicarTemaSalvo();

btnToggleTheme.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  if (body.classList.contains('dark-theme')) {
    btnToggleTheme.innerHTML = '<i class="fas fa-sun"></i> Tema Claro';
    localStorage.setItem('tema', 'dark');
  } else {
    btnToggleTheme.innerHTML = '<i class="fas fa-moon"></i> Tema Dark';
    localStorage.setItem('tema', 'claro');
  }
});

// === Notificações ===
function showNotification(message, type = 'info', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      ${type === 'success' ? '✅' : 
        type === 'warning' ? '⚠️' : 
        type === 'danger' ? '❌' : '💡'}
    </div>
    <div class="notification-content">${message}</div>
  `;
  
  document.getElementById('notificationsContainer').appendChild(notification);
  
  // Forçar reflow para ativar animação
  void notification.offsetWidth;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.getElementById('notificationsContainer').contains(notification)) {
        document.getElementById('notificationsContainer').removeChild(notification);
      }
    }, 300);
  }, duration);
}

// === Gamificação ===
function checkAchievements() {
  achievements.forEach(achievement => {
    if (!achievement.achieved) {
      let achieved = false;
      
      switch(achievement.id) {
        case "first_lead":
          achieved = leads.length > 0;
          break;
        case "matricula_5":
          achieved = matriculas >= 5;
          break;
        case "conversion_10":
          const conversionRate = leads.length ? ((matriculas / leads.length) * 100) : 0;
          achieved = conversionRate >= 10;
          break;
        case "followup_10":
          const totalFollowups = leads.reduce((sum, lead) => sum + (lead.followUps || 0), 0);
          achieved = totalFollowups >= 10;
          break;
      }
      
      if (achieved) {
        achievement.achieved = true;
        atualizarXP(achievement.xp);
        showNotification(`🏆 Conquista desbloqueada: ${achievement.name}! +${achievement.xp}XP`, 'success');
      }
    }
  });
}

// === Leads ===
function saveLeads() {
  try {
    localStorage.setItem('leads', JSON.stringify(leads));
    localStorage.setItem('xp', xp.toString());
  } catch (e) {
    showNotification('⚠️ Falha ao salvar dados no navegador!', 'warning');
  }
}

function renderLeads() {
  const leadsList = document.getElementById('leadsList');
  leadsList.innerHTML = '';

  const leadsFiltrados = leads.filter(lead => {
    if (filtroAtual === 'todos') return true;
    if (filtroAtual === 'matriculado') return lead.matriculado;
    if (filtroAtual === 'cancelado') return lead.status === 'cancelado';
    return lead.status === filtroAtual;
  });

  if (leadsFiltrados.length === 0) {
    leadsList.innerHTML = '<div class="empty-state"><i class="fas fa-users-slash"></i><p>Nenhum lead encontrado</p></div>';
    return;
  }

  leadsFiltrados.forEach((lead, index) => {
    const card = document.createElement('div');
    card.className = `lead-card ${lead.status} ${lead.matriculado ? 'matriculado' : ''}`;
    
    // Ícone baseado no status
    let statusIcon = '❓';
    if (lead.status === 'quente') statusIcon = '🔥';
    if (lead.status === 'morno') statusIcon = '🌤️';
    if (lead.status === 'frio') statusIcon = '❄️';
    if (lead.status === 'cancelado') statusIcon = '❌';
    
    card.innerHTML = `
      <div class="lead-card-header">
        <h3>${lead.name} ${lead.matriculado ? '🎓' : ''}</h3>
        <span class="lead-status">${statusIcon} ${lead.status.toUpperCase()}</span>
      </div>
      
      <div class="lead-card-body">
        <div class="lead-info">
          <div class="lead-info-item">
            <i class="fab fa-whatsapp"></i>
            <span>${lead.whatsapp}</span>
          </div>
          <div class="lead-info-item">
            <i class="fab fa-instagram"></i>
            <span>${lead.instagram || 'Não informado'}</span>
          </div>
          <div class="lead-info-item">
            <i class="fas fa-heart"></i>
            <span>${lead.interests || 'Não informado'}</span>
          </div>
          <div class="lead-info-item">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${lead.objections || 'Nenhuma'}</span>
          </div>
        </div>
        
        <div class="lead-meta">
          <div class="lead-meta-item">
            <i class="fas fa-sync-alt"></i>
            <span>Follow-ups: ${lead.followUps || 0}</span>
          </div>
          <div class="lead-meta-item">
            <i class="fas fa-graduation-cap"></i>
            <span>Matriculado: ${lead.matriculado ? 'Sim' : 'Não'}</span>
          </div>
        </div>
        
        <div class="lead-actions">
          <button onclick="sendWhatsApp('${lead.whatsapp}')">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </button>
          <button onclick="editLead(${index})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="deleteLead(${index})">
            <i class="fas fa-trash"></i> Excluir
          </button>
          <button onclick="toggleMatricula(${index})">
            <i class="fas fa-graduation-cap"></i> ${lead.matriculado ? 'Desmatricular' : 'Matricular'}
          </button>
        </div>
      </div>
    `;
    
    leadsList.appendChild(card);
  });

  updateDashboard();
  updateKPIs();
}

function sendWhatsApp(number) {
  const cleanedNumber = number.replace(/\D/g, '');
  if (cleanedNumber.length < 10) {
    showNotification('⚠️ Número de WhatsApp inválido!', 'warning');
    return;
  }
  
  const url = `https://wa.me/55${cleanedNumber}`;
  window.open(url, '_blank');
}

function editLead(index) {
  const lead = leads[index];
  document.getElementById('name').value = lead.name;
  document.getElementById('whatsapp').value = lead.whatsapp;
  document.getElementById('instagram').value = lead.instagram || '';
  document.getElementById('interests').value = lead.interests || '';
  document.getElementById('objections').value = lead.objections || '';
  document.getElementById('status').value = lead.status;
  
  // Remover lead para edição
  leads.splice(index, 1);
  saveLeads();
  renderLeads();
  
  showNotification('✏️ Pronto para editar o lead!', 'info');
}

function deleteLead(index) {
  if (confirm(`Deseja excluir o lead ${leads[index].name}?`)) {
    if (leads[index].matriculado) matriculas--;
    
    const deletedLead = leads.splice(index, 1)[0];
    saveLeads();
    renderLeads();
    atualizarProgresso();
    
    showNotification(`🗑️ Lead "${deletedLead.name}" excluído!`, 'warning');
  }
}

function toggleMatricula(index) {
  const lead = leads[index];
  lead.matriculado = !lead.matriculado;
  
  if (lead.matriculado) {
    matriculas++;
    atualizarXP(100);
    showNotification(`🎓 ${lead.name} matriculado(a)! +100XP`, 'success');
  } else {
    if (matriculas > 0) matriculas--;
    atualizarXP(-100);
    showNotification(`📝 ${lead.name} desmatriculado(a)`, 'info');
  }
  
  saveLeads();
  renderLeads();
  atualizarProgresso();
}

function filtrar(status) {
  filtroAtual = status;
  renderLeads();
  
  // Atualizar botões ativos
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = Array.from(document.querySelectorAll('.filters button')).find(
    btn => btn.getAttribute('onclick')?.includes(`'${status}'`)
  );
  
  if (activeBtn) activeBtn.classList.add('active');
}

// === Análise de Personalidade (DISC) ===
function analyzePersonality(text) {
  if (!text) return null;
  
  const keywords = {
    dominant: ["urgente", "resultado", "controle", "desafio", "rápido", "direto"],
    influential: ["pessoas", "reconhecimento", "social", "entusiasmo", "falar", "popular"],
    steady: ["cooperação", "estabilidade", "lealdade", "paciência", "apoio", "seguro"],
    compliant: ["detalhes", "precisão", "qualidade", "análise", "dados", "exatidão"]
  };

  const scores = { D: 0, I: 0, S: 0, C: 0 };
  const textLower = text.toLowerCase();

  Object.entries(keywords).forEach(([type, words]) => {
    words.forEach(word => {
      if (textLower.includes(word)) {
        scores[type.charAt(0).toUpperCase()]++;
      }
    });
  });

  const maxScore = Math.max(...Object.values(scores));
  const profile = Object.keys(scores).find(key => scores[key] === maxScore);
  
  return {
    profile,
    scores,
    description: getProfileDescription(profile)
  };
}

function getProfileDescription(profile) {
  const descriptions = {
    D: "Dominante: Objetivo, direto e focado em resultados. Responda com objetividade e foque em resultados.",
    I: "Influente: Sociável, entusiasta e persuasivo. Seja energético e foque no relacionamento.",
    S: "Estável: Paciente, cooperativo e leal. Seja paciente e mostre segurança.",
    C: "Cauteloso: Analítico, preciso e detalhista. Seja preciso e forneça dados concretos."
  };
  
  return descriptions[profile] || "Perfil não identificado. Use uma abordagem neutra.";
}

// === Sugestões de Ação ===
function getActionSuggestions() {
  const suggestions = [];
  const now = new Date();
  const hours = now.getHours();
  
  // Sugestões baseadas em matrículas
  if (matriculas < 5) {
    suggestions.push("Foque em leads quentes para aumentar matrículas rapidamente");
  } else if (matriculas >= 5 && matriculas < 15) {
    suggestions.push("Diversifique sua abordagem entre leads mornos e quentes");
  } else {
    suggestions.push("Trabalhe leads frios para aumentar seu alcance");
  }
  
  // Sugestões baseadas em horário
  if (hours < 12) {
    suggestions.push("Período ideal para contato inicial e prospecção");
  } else if (hours >= 12 && hours < 15) {
    suggestions.push("Bom momento para follow-ups e resolver objeções");
  } else {
    suggestions.push("Ótimo horário para fechamentos e agendamentos");
  }
  
  // Sugestões baseadas em conversão
  const conversionRate = leads.length ? ((matriculas / leads.length) * 100) : 0;
  if (conversionRate < 5) {
    suggestions.push("Analise suas objeções e ajuste sua abordagem de vendas");
  } else if (conversionRate >= 5 && conversionRate < 15) {
    suggestions.push("Trabalhe na qualificação de leads para melhorar conversão");
  } else {
    suggestions.push("Parabéns! Seu processo está eficiente - mantenha o ritmo");
  }
  
  return suggestions;
}

// === Dashboard ===
function updateDashboard() {
  const statusCounts = { quente: 0, morno: 0, frio: 0, cancelado: 0 };
  const matriculadosCounts = { quente: 0, morno: 0, frio: 0, cancelado: 0 };

  leads.forEach(lead => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    if (lead.matriculado) {
      matriculadosCounts[lead.status] = (matriculadosCounts[lead.status] || 0) + 1;
    }
  });

  const totalLeads = leads.length;
  const totalMatriculados = leads.filter(l => l.matriculado).length;
  const conversionRate = totalLeads ? ((totalMatriculados / totalLeads) * 100).toFixed(2) : 0;

  document.getElementById('conversionRate').innerHTML = `
    <strong>Taxa de conversão:</strong> ${conversionRate}% <br>
    <strong>Matrículas:</strong> ${totalMatriculados}/${metaMatriculas}
  `;

  const data = [
    matriculadosCounts.quente,
    matriculadosCounts.morno,
    matriculadosCounts.frio,
    matriculadosCounts.cancelado
  ];

  const ctx = document.getElementById('statusChart')?.getContext('2d');
  if (!ctx) {
    console.warn('Canvas #statusChart não encontrado!');
    return;
  }

  // 🔥 Destroi o gráfico antigo, se existir
  if (statusChart) {
    statusChart.destroy();
  }

  // 🔥 Cria um novo gráfico atualizado
  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Quente 🔥', 'Morno 🌤️', 'Frio ❄️', 'Cancelado ❌'],
      datasets: [{
        data,
        backgroundColor: ['#e63946', '#f4a261', '#457b9d', '#6c757d'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} matrícula(s)`;
            }
          }
        }
      },
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
}


function updateKPIs() {
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === 'quente').length;
  const conversionRate = totalLeads ? ((matriculas / totalLeads) * 100).toFixed(1) : 0;
  const totalFollowups = leads.reduce((sum, lead) => sum + (lead.followUps || 0), 0);
  
  document.getElementById('kpiLeads').textContent = totalLeads;
  document.getElementById('kpiQuentes').textContent = hotLeads;
  document.getElementById('kpiConversao').textContent = `${conversionRate}%`;
  document.getElementById('kpiFollowups').textContent = totalFollowups;
  
  // Atualizar sugestões de ação
  const suggestions = getActionSuggestions();
  const suggestionsHTML = suggestions.map(s => 
    `<div class="suggestion-item"><i class="fas fa-bullseye"></i> ${s}</div>`
  ).join('');
  
  document.getElementById('actionSuggestions').innerHTML = suggestionsHTML;
}

// === Matrículas ===
function zerarMatriculas() {
  if (!confirm('Deseja zerar TODAS as matrículas?')) return;
  
  leads.forEach(lead => lead.matriculado = false);
  matriculas = 0;
  atualizarXP(-xp);
  saveLeads();
  renderLeads();
  atualizarProgresso();
  
  showNotification('🔄 Todas as matrículas foram zeradas!', 'warning');
}

function atualizarMatricula() {
  const valor = matriculas;
  const maximo = metaMatriculas;
  const barra = document.getElementById('matriculaProgress');
  const texto = document.getElementById('matriculaProgressText');

  if (barra && texto) {
    barra.value = valor;
    texto.textContent = `${valor}/${maximo} Matrículas`;
  } else {
    console.warn('Elemento de progresso não encontrado no DOM');
  }
}

function adicionarMatricula() {
  if (matriculas < metaMatriculas) {
    matriculas++;
    atualizarXP(100);
    saveLeads();
    renderLeads();
    atualizarProgresso();
    showNotification('✅ Matrícula adicionada! +100XP', 'success');
  } else {
    showNotification('🎉 Meta de matrículas atingida! Parabéns!', 'success');
  }
}

function excluirMatricula() {
  if (matriculas > 0) {
    matriculas--;
    atualizarXP(-100);
    saveLeads();
    renderLeads();
    atualizarProgresso();
    showNotification('📝 Matrícula removida', 'info');
  } else {
    showNotification('⚠️ Não há matrículas para remover', 'warning');
  }
}

// === XP e Progresso ===
function atualizarXP(valor) {
  xp = Math.max(0, xp + valor);
  document.getElementById('xpCount').textContent = xp;
  localStorage.setItem('xp', xp.toString());
  
  // Efeito visual ao ganhar XP
  if (valor > 0) {
    const xpElement = document.getElementById('xpCount');
    xpElement.classList.add('xp-pulse');
    setTimeout(() => xpElement.classList.remove('xp-pulse'), 1000);
  }
}

function atualizarProgresso() {
  const progresso = matriculas / metaMatriculas * 100;
  const barra = document.querySelector('.progress-bar');
  const texto = document.getElementById('progressText');

  if (barra) {
    barra.style.width = `${progresso}%`;
  } else {
    console.warn('progress-bar não encontrada');
  }

  if (texto) {
    texto.textContent = `${matriculas}/${metaMatriculas}`;
  } else {
    console.warn('progressText não encontrada');
  }
}


// === Export CSV ===
document.getElementById('exportCsv').addEventListener('click', e => {
  e.preventDefault();
  
  if (leads.length === 0) {
    showNotification('⚠️ Nenhum lead para exportar!', 'warning');
    return;
  }

  const headers = ['Nome', 'WhatsApp', 'Instagram', 'Interesses', 'Objeções', 'Status', 'Matriculado'];
  const rows = leads.map(lead => [
    lead.name, 
    lead.whatsapp, 
    lead.instagram || '', 
    lead.interests || '', 
    lead.objections || '', 
    lead.status, 
    lead.matriculado ? 'Sim' : 'Não'
  ]);

  let csv = 'data:text/csv;charset=utf-8;';
  csv += headers.join(';') + '\n';
  rows.forEach(row => {
    csv += row.map(v => `"${v.toString().replace(/"/g, '""')}"`).join(';') + '\n';
  });

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `leads_nexus_${new Date().toLocaleDateString('pt-BR')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('📤 Exportação CSV concluída!', 'success');
});

// === Formulário ===
document.getElementById('leadForm').addEventListener('submit', e => {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  
  if (!name || !whatsapp) {
    showNotification('⚠️ Nome e WhatsApp são obrigatórios!', 'danger');
    return;
  }
  
  const newLead = {
    name,
    whatsapp,
    instagram: document.getElementById('instagram').value.trim() || '',
    interests: document.getElementById('interests').value.trim() || '',
    objections: document.getElementById('objections').value.trim() || '',
    status: document.getElementById('status').value,
    matriculado: false,
    followUps: 0,
    createdAt: new Date().toISOString()
  };
  
  leads.push(newLead);
  saveLeads();
  renderLeads();
  document.getElementById('leadForm').reset();
  
  showNotification(`👤 Lead "${name}" adicionado!`, 'success');
  atualizarXP(50);
});

// === Análise de Personalidade ===
document.getElementById('analyzeBtn').addEventListener('click', () => {
  const interests = document.getElementById('interests').value.trim();
  
  if (!interests) {
    showNotification('⚠️ Preencha os interesses para análise', 'warning');
    return;
  }
  
  const analysis = analyzePersonality(interests);
  showNotification(`🧠 Perfil detectado: ${analysis.description}`, 'info');
});

// === Lembretes Inteligentes ===
function addReminders(lead) {
  const now = new Date();
  
  switch(lead.status) {
    case 'quente':
      lead.reminder = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
      break;
    case 'morno':
      lead.reminder = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dias
      break;
    case 'frio':
      lead.reminder = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
      break;
  }
}

function checkReminders() {
  const now = new Date();
  
  leads.forEach(lead => {
    if (lead.reminder && !lead.matriculado && lead.status !== 'cancelado') {
      const reminderDate = new Date(lead.reminder);
      
      if (reminderDate <= now) {
        showNotification(`⏰ Hora de contatar ${lead.name} (${lead.status})`, 'info');
        
        // Incrementar follow-up
        lead.followUps = (lead.followUps || 0) + 1;
        
        // Reprogramar próximo lembrete
        addReminders(lead);
        saveLeads();
        renderLeads();
      }
    }
  });
}

// Executar a cada hora
setInterval(checkReminders, 60 * 60 * 1000);

// === Inicialização ===
document.addEventListener('DOMContentLoaded', () => {
  aplicarTemaSalvo();
  renderLeads();
  atualizarXP(0);
  atualizarProgresso();
  
  // Adicionar lembretes para leads existentes
  leads.forEach(lead => {
    if (!lead.reminder) {
      addReminders(lead);
    }
  });
  
  // Ativar filtro "todos" inicialmente
  filtrar('todos');
  
  // Configurar pesquisa
  document.getElementById('searchLeads').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(term) || 
      lead.whatsapp.includes(term) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(term))
    );
    
    leadsList.innerHTML = '';
    
    if (filtered.length === 0) {
      leadsList.innerHTML = '<div class="empty-state"><i class="fas fa-users-slash"></i><p>Nenhum lead encontrado</p></div>';
      return;
    }
    
    // Renderizar apenas os leads filtrados
    filtered.forEach((lead, index) => {
      // Mesmo código de renderização de lead...
    });
  });
});


 
 