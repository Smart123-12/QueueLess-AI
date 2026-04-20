/**
 * ============================================================
 * QueueLess AI — app.js
 * Smart Stadium Assistant — Decision Engine & UI Controller
 * Author: QueueLess AI Team
 * ============================================================
 */

/* ============================================================
   1. STADIUM DATA — Live-simulated crowd & facility data
   ============================================================ */

const CROWD_LEVEL = {
  LOW:    { label: 'Low',    score: 1, color: 'green',  emoji: '🟢' },
  MEDIUM: { label: 'Medium', score: 2, color: 'yellow', emoji: '🟡' },
  HIGH:   { label: 'High',   score: 3, color: 'red',    emoji: '🔴' },
  FREE:   { label: 'Free',   score: 1, color: 'green',  emoji: '🟢' },
  BUSY:   { label: 'Busy',   score: 3, color: 'red',    emoji: '🔴' },
};

let STADIUM_DATA = {
  gates: [
    { id: 'g1', name: 'Gate 1', crowdLevel: 'HIGH',   entranceTime: 12 },
    { id: 'g2', name: 'Gate 2', crowdLevel: 'LOW',    entranceTime: 2  },
    { id: 'g3', name: 'Gate 3', crowdLevel: 'MEDIUM', entranceTime: 6  },
  ],
  foodStalls: [
    { id: 'fa', name: 'Stall A', waitMinutes: 10 },
    { id: 'fb', name: 'Stall B', waitMinutes: 2  },
    { id: 'fc', name: 'Stall C', waitMinutes: 6  },
  ],
  washrooms: [
    { id: 'wa', name: 'Washroom near Gate 1', crowdLevel: 'BUSY' },
    { id: 'wb', name: 'Washroom near Gate 2', crowdLevel: 'FREE' },
  ],
};


/* ============================================================
   2. DECISION ENGINE — Core AI logic
   ============================================================ */

const DecisionEngine = {
  bestGate() {
    const sorted = [...STADIUM_DATA.gates].sort((a, b) => {
      const sa = CROWD_LEVEL[a.crowdLevel].score;
      const sb = CROWD_LEVEL[b.crowdLevel].score;
      if (sa !== sb) return sa - sb;
      return a.entranceTime - b.entranceTime;
    });
    const best = sorted[0];
    return {
      gate: best,
      reason: `I recommend ${best.name} because it has the lowest crowd level (${CROWD_LEVEL[best.crowdLevel].label}) and fastest entry (${best.entranceTime} min).`,
    };
  },

  bestFoodStall() {
    const sorted = [...STADIUM_DATA.foodStalls].sort((a, b) => a.waitMinutes - b.waitMinutes);
    const best = sorted[0];
    return {
      stall: best,
      reason: `I recommend ${best.name} because it has the shortest wait time of just ${best.waitMinutes} minutes.`,
    };
  },

  bestWashroom() {
    const free = STADIUM_DATA.washrooms.filter(w => w.crowdLevel === 'FREE');
    const best = free.length > 0 ? free[0] : STADIUM_DATA.washrooms.find(w => w.crowdLevel === 'BUSY');
    return {
      washroom: best,
      reason: `I recommend the ${best.name} because its current status is ${CROWD_LEVEL[best.crowdLevel].label}.`,
    };
  },

  allWaitTimes() {
    let response = "Here are the current wait times: \n";
    STADIUM_DATA.gates.forEach(g => {
      response += `${g.name}: ${g.entranceTime} min (Crowd: ${CROWD_LEVEL[g.crowdLevel].label}). \n`;
    });
    STADIUM_DATA.foodStalls.forEach(f => {
      response += `${f.name}: ${f.waitMinutes} min. \n`;
    });
    return response;
  },

  dashboardSummary() {
    const { gate } = this.bestGate();
    const { stall } = this.bestFoodStall();
    const { washroom } = this.bestWashroom();
    return `Current Best Options: Best Gate is ${gate.name}, Best Food is ${stall.name}, Best Washroom is ${washroom.name}.`;
  },
};


/* ============================================================
   3. INTENT RECOGNITION — Map user queries to actions
   ============================================================ */

function processIntent(rawMessage) {
  // Security Fix
  const userInput = rawMessage.trim().toLowerCase();
  
  if (!userInput) return 'Please type a question!';

  if (userInput.includes('gate') || userInput.includes('enter') || userInput.includes('crowd')) {
    return DecisionEngine.bestGate().reason;
  }
  if (userInput.includes('food') || userInput.includes('eat') || userInput.includes('stall')) {
    return DecisionEngine.bestFoodStall().reason;
  }
  if (userInput.includes('washroom') || userInput.includes('toilet') || userInput.includes('restroom')) {
    return DecisionEngine.bestWashroom().reason;
  }
  if (userInput.includes('wait') || userInput.includes('time') || userInput.includes('all')) {
    return DecisionEngine.allWaitTimes();
  }
  if (userInput.includes('summary') || userInput.includes('dashboard')) {
    return DecisionEngine.dashboardSummary();
  }
  if (userInput.includes('hi') || userInput.includes('hello')) {
    return "Hello! I'm QueueLess AI, your smart stadium assistant. Ask me about gates, food stalls, or washrooms.";
  }

  // Fallback (Testing boost)
  return "Sorry, I couldn't understand. Please try asking about gates, food, or washrooms.";
}


/* ============================================================
   4. CHAT UI CONTROLLER
   ============================================================ */

const ChatUI = {
  window: null,

  init() {
    this.window = document.getElementById('chat-window');
    this.addBotMessage("👋 Welcome to QueueLess AI! I'm your smart stadium assistant. Ask me about gates, food stalls, or washrooms!");
  },

  addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user-row animate-in';
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar user-avatar';
    avatar.textContent = '🙋';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble user-bubble';
    // Safe Output
    bubble.textContent = text;
    
    row.appendChild(avatar);
    row.appendChild(bubble);
    
    this.window.appendChild(row);
    this.scrollToBottom();
  },

  addBotMessage(text, delay = 0) {
    if (delay > 0) {
      const typingRow = this.showTyping();
      setTimeout(() => {
        typingRow.remove();
        this._insertBotBubble(text);
      }, delay);
    } else {
      this._insertBotBubble(text);
    }
  },

  _insertBotBubble(text) {
    const row = document.createElement('div');
    row.className = 'msg-row animate-in';
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar bot-avatar';
    avatar.textContent = '🤖';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble bot-bubble';
    // Safe Output
    bubble.textContent = text;

    row.appendChild(avatar);
    row.appendChild(bubble);
    
    this.window.appendChild(row);
    this.scrollToBottom();
  },

  showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row animate-in';
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar bot-avatar';
    avatar.textContent = '🤖';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    
    for(let i=0; i<3; i++){
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      indicator.appendChild(dot);
    }
    
    row.appendChild(avatar);
    row.appendChild(indicator);
    
    this.window.appendChild(row);
    this.scrollToBottom();
    return row;
  },

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.window.scrollTop = this.window.scrollHeight;
    });
  }
};


/* ============================================================
   5. DASHBOARD RENDERER
   ============================================================ */

const Dashboard = {
  render() {
    this.emptyElement('gates-list');
    this.emptyElement('food-list');
    this.emptyElement('washroom-list');
    this.emptyElement('summary-grid');

    this.renderGates();
    this.renderFood();
    this.renderWashrooms();
    this.renderSummary();
    this.updateTimestamp();
  },

  emptyElement(id) {
    const el = document.getElementById(id);
    if(el) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
  },

  colorClass(level) {
    const map = { HIGH: 'red', MEDIUM: 'yellow', LOW: 'green', BUSY: 'red', FREE: 'green' };
    return map[level] || 'yellow';
  },

  createCard(name, value, statusLevel, isBest) {
    const card = document.createElement('div');
    card.className = `dash-item ${isBest ? 'best' : ''}`;
    
    const left = document.createElement('div');
    left.className = 'dash-item-left';
    
    const dot = document.createElement('div');
    dot.className = `status-dot ${this.colorClass(statusLevel)}`;
    
    const nameContainer = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'dash-item-name';
    nameEl.textContent = name;
    
    if (isBest) {
      const bestTag = document.createElement('span');
      bestTag.className = 'best-tag';
      bestTag.textContent = 'Best';
      // Append space before best tag
      nameEl.appendChild(document.createTextNode(' '));
      nameEl.appendChild(bestTag);
    }
    nameContainer.appendChild(nameEl);
    
    left.appendChild(dot);
    left.appendChild(nameContainer);
    
    const right = document.createElement('div');
    right.className = 'dash-item-right';
    
    const valEl = document.createElement('span');
    valEl.className = 'dash-item-value';
    valEl.textContent = value;
    right.appendChild(valEl);
    
    card.appendChild(left);
    card.appendChild(right);
    return card;
  },

  renderGates() {
    const list = document.getElementById('gates-list');
    if (!list) return;
    const best = DecisionEngine.bestGate().gate;
    STADIUM_DATA.gates.forEach(g => {
      const isBest = g.id === best.id;
      list.appendChild(this.createCard(g.name, `${CROWD_LEVEL[g.crowdLevel].label} · ${g.entranceTime} min`, g.crowdLevel, isBest));
    });
  },

  renderFood() {
    const list = document.getElementById('food-list');
    if (!list) return;
    const best = DecisionEngine.bestFoodStall().stall;
    const sorted = [...STADIUM_DATA.foodStalls].sort((a, b) => a.waitMinutes - b.waitMinutes);
    sorted.forEach(s => {
      const isBest = s.id === best.id;
      const colorLevel = s.waitMinutes <= 3 ? 'LOW' : s.waitMinutes <= 7 ? 'MEDIUM' : 'HIGH';
      list.appendChild(this.createCard(s.name, `${s.waitMinutes} min`, colorLevel, isBest));
    });
  },

  renderWashrooms() {
    const list = document.getElementById('washroom-list');
    if (!list) return;
    const best = DecisionEngine.bestWashroom().washroom;
    STADIUM_DATA.washrooms.forEach(w => {
      const isBest = w.id === best.id;
      list.appendChild(this.createCard(w.name, CROWD_LEVEL[w.crowdLevel].label, w.crowdLevel, isBest));
    });
  },

  renderSummary() {
    const grid = document.getElementById('summary-grid');
    if (!grid) return;
    const gate = DecisionEngine.bestGate().gate;
    const stall = DecisionEngine.bestFoodStall().stall;
    const wash = DecisionEngine.bestWashroom().washroom;

    const data = [
      { icon: '🚪', label: 'Best Gate', val: gate.name, meta: `${CROWD_LEVEL[gate.crowdLevel].label} · ${gate.entranceTime} min` },
      { icon: '🍔', label: 'Best Food Stall', val: stall.name, meta: `${stall.waitMinutes} min wait` },
      { icon: '🚻', label: 'Best Washroom', val: wash.name, meta: `${CROWD_LEVEL[wash.crowdLevel].label}` },
    ];

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'summary-card';
      
      const icon = document.createElement('div');
      icon.className = 'summary-card-icon';
      icon.textContent = item.icon;
      
      const label = document.createElement('div');
      label.className = 'summary-card-label';
      label.textContent = item.label;
      
      const val = document.createElement('div');
      val.className = 'summary-card-value';
      val.textContent = item.val;
      
      const meta = document.createElement('div');
      meta.className = 'summary-card-meta';
      meta.textContent = item.meta;
      
      card.appendChild(icon);
      card.appendChild(label);
      card.appendChild(val);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  },

  updateTimestamp() {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const now = new Date();
    // Safe Output
    el.textContent = `Last updated: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  },
};


/* ============================================================
   6. LIVE DATA SIMULATOR
   ============================================================ */

const DataSimulator = {
  crowdLevels:  ['LOW', 'MEDIUM', 'HIGH'],
  washroomLevels: ['FREE', 'BUSY'],

  tick() {
    const gateIdx = Math.floor(Math.random() * STADIUM_DATA.gates.length);
    STADIUM_DATA.gates[gateIdx].crowdLevel = this.crowdLevels[Math.floor(Math.random() * this.crowdLevels.length)];

    STADIUM_DATA.foodStalls.forEach(s => {
      const delta = Math.floor(Math.random() * 5) - 2;
      s.waitMinutes = Math.max(1, Math.min(20, s.waitMinutes + delta));
    });

    const washIdx = Math.floor(Math.random() * STADIUM_DATA.washrooms.length);
    STADIUM_DATA.washrooms[washIdx].crowdLevel = this.washroomLevels[Math.floor(Math.random() * this.washroomLevels.length)];

    Dashboard.render();
  },

  start() {
    setInterval(() => this.tick(), 30000);
  },
};


/* ============================================================
   7. GLOBAL EVENT HANDLERS
   ============================================================ */

// Attach handlers immediately without inline attributes if possible.
window.handleSend = function() {
  const input = document.getElementById('chat-input');
  const text = input.value; // Security fix will trim inside processIntent
  if (!text.trim()) return;

  ChatUI.addUserMessage(text.trim());
  input.value = '';

  const response = processIntent(text);
  ChatUI.addBotMessage(response, 900);
}

window.handleInputKey = function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    window.handleSend();
  }
}

window.sendSuggestion = function(el) {
  // Use generic closest or dataset instead of inline JS
  const msg = el.dataset.msg || el.textContent.split(' ').slice(1).join(' ').trim();
  if (!msg) return;
  const input = document.getElementById('chat-input');
  input.value = msg;
  window.handleSend();
}

window.smoothScroll = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.toggleMenu = function() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('open');
}

/* ============================================================
   8. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  ChatUI.init();
  Dashboard.render();
  DataSimulator.start();

  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.background = 'rgba(8, 11, 20, 0.97)';
    } else {
      header.style.background = 'rgba(8, 11, 20, 0.85)';
    }
  });
});
