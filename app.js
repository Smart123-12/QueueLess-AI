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

/**
 * Crowd levels enum for consistent comparison
 */
const CROWD_LEVEL = {
  LOW:    { label: 'Low',    score: 1, color: 'green',  emoji: '🟢' },
  MEDIUM: { label: 'Medium', score: 2, color: 'yellow', emoji: '🟡' },
  HIGH:   { label: 'High',   score: 3, color: 'red',    emoji: '🔴' },
  FREE:   { label: 'Free',   score: 1, color: 'green',  emoji: '🟢' },
  BUSY:   { label: 'Busy',   score: 3, color: 'red',    emoji: '🔴' },
};

/**
 * STADIUM_DATA — core dataset used by decision engine.
 * In a real system this would come from IoT sensors / API.
 */
let STADIUM_DATA = {
  gates: [
    { id: 'g1', name: 'Gate 1', crowdLevel: 'HIGH',   entranceTime: 12, description: 'North Entrance — Section 100–120' },
    { id: 'g2', name: 'Gate 2', crowdLevel: 'LOW',    entranceTime: 2,  description: 'East Entrance — Section 200–220' },
    { id: 'g3', name: 'Gate 3', crowdLevel: 'MEDIUM', entranceTime: 6,  description: 'West Entrance — Section 300–320' },
  ],
  foodStalls: [
    { id: 'fa', name: 'Stall A',   waitMinutes: 10, cuisine: 'Indian Snacks',  location: 'Near Gate 1' },
    { id: 'fb', name: 'Stall B',   waitMinutes: 2,  cuisine: 'Fast Food',      location: 'Near Gate 2' },
    { id: 'fc', name: 'Stall C',   waitMinutes: 6,  cuisine: 'Beverages',      location: 'Central Plaza' },
    { id: 'fd', name: 'Stall D',   waitMinutes: 8,  cuisine: 'Pizza & Wraps',  location: 'Near Gate 3' },
    { id: 'fe', name: 'Stall E',   waitMinutes: 3,  cuisine: 'South Indian',   location: 'Level 2 Food Court' },
  ],
  washrooms: [
    { id: 'wa', name: 'Washroom near Gate 1', crowdLevel: 'BUSY',   distance: '50m from Gate 1' },
    { id: 'wb', name: 'Washroom near Gate 2', crowdLevel: 'FREE',   distance: '30m from Gate 2' },
    { id: 'wc', name: 'Washroom — Level 2',   crowdLevel: 'FREE',   distance: 'Level 2, Block C' },
    { id: 'wd', name: 'Washroom near Gate 3', crowdLevel: 'BUSY',   distance: '40m from Gate 3' },
  ],
};


/* ============================================================
   2. DECISION ENGINE — Core AI logic
   ============================================================ */

const DecisionEngine = {

  /**
   * Find best gate (lowest score + least entrance time)
   * @returns {{ gate, reason }}
   */
  bestGate() {
    const sorted = [...STADIUM_DATA.gates].sort((a, b) => {
      const sa = CROWD_LEVEL[a.crowdLevel].score;
      const sb = CROWD_LEVEL[b.crowdLevel].score;
      if (sa !== sb) return sa - sb;
      return a.entranceTime - b.entranceTime;
    });
    const best = sorted[0];
    const cl = CROWD_LEVEL[best.crowdLevel];
    return {
      gate: best,
      reason: `I recommend <strong>${best.name}</strong> because it has the <span class="highlight">${cl.label} crowd level</span> with only ~${best.entranceTime} min entry time. ${best.description}.`,
    };
  },

  /**
   * Find best food stall (shortest wait time)
   * @returns {{ stall, reason }}
   */
  bestFoodStall() {
    const sorted = [...STADIUM_DATA.foodStalls].sort((a, b) => a.waitMinutes - b.waitMinutes);
    const best = sorted[0];
    const second = sorted[1];
    return {
      stall: best,
      reason: `Head to <strong>${best.name}</strong> (${best.cuisine}) — it has only a <span class="highlight">${best.waitMinutes}-minute wait</span>, located at ${best.location}. ${second.name} is the next best option at ${second.waitMinutes} min.`,
    };
  },

  /**
   * Find best washroom (Free status, then by name)
   * @returns {{ washroom, reason }}
   */
  bestWashroom() {
    const free = STADIUM_DATA.washrooms.filter(w => w.crowdLevel === 'FREE');
    const best = free.length > 0 ? free[0] : STADIUM_DATA.washrooms.find(w => w.crowdLevel === 'BUSY');
    const status = CROWD_LEVEL[best.crowdLevel];
    return {
      washroom: best,
      reason: `The nearest available washroom is <strong>${best.name}</strong> — currently <span class="${status.color === 'green' ? 'highlight-green' : 'highlight'}">${status.label}</span>. Located at ${best.distance}.`,
    };
  },

  /**
   * Return all wait times for all facilities
   */
  allWaitTimes() {
    const gateLines = STADIUM_DATA.gates.map(g => {
      const cl = CROWD_LEVEL[g.crowdLevel];
      return `${cl.emoji} <strong>${g.name}</strong>: ${cl.label} (${g.entranceTime} min wait)`;
    }).join('<br/>');

    const foodLines = STADIUM_DATA.foodStalls.map(s =>
      `🍽️ <strong>${s.name}</strong> (${s.cuisine}): ${s.waitMinutes} min wait`
    ).join('<br/>');

    return `Here are all current wait times:<br/><br/><u>Gates:</u><br/>${gateLines}<br/><br/><u>Food Stalls:</u><br/>${foodLines}`;
  },

  /**
   * Dashboard summary
   */
  dashboardSummary() {
    const { gate } = this.bestGate();
    const { stall } = this.bestFoodStall();
    const { washroom } = this.bestWashroom();
    return `📊 <strong>Current Best Options:</strong><br/><br/>
🚪 <strong>Best Gate:</strong> ${gate.name} (${CROWD_LEVEL[gate.crowdLevel].label} crowd, ${gate.entranceTime} min entry)<br/>
🍔 <strong>Best Food:</strong> ${stall.name} — ${stall.waitMinutes} min wait (${stall.cuisine})<br/>
🚻 <strong>Best Washroom:</strong> ${washroom.name} — ${CROWD_LEVEL[washroom.crowdLevel].label}`;
  },

};


/* ============================================================
   3. INTENT RECOGNITION — Map user queries to actions
   ============================================================ */

/**
 * Patterns for intent detection
 * Each entry: { pattern (regex), handler }
 */
const INTENTS = [
  {
    // Gate & entrance queries
    pattern: /gate|enter|entrance|crowd|crowded|less crowd|entry/i,
    handler: () => {
      const { reason } = DecisionEngine.bestGate();
      return reason;
    },
  },
  {
    // Food queries
    pattern: /food|eat|hungry|snack|stall|drink|beverage|pizza|meal/i,
    handler: () => {
      const { reason } = DecisionEngine.bestFoodStall();
      return reason;
    },
  },
  {
    // Washroom queries
    pattern: /washroom|toilet|restroom|bathroom|loo|wc/i,
    handler: () => {
      const { reason } = DecisionEngine.bestWashroom();
      return reason;
    },
  },
  {
    // All wait times
    pattern: /wait time|all|how long|queue|time/i,
    handler: () => DecisionEngine.allWaitTimes(),
  },
  {
    // Dashboard / summary
    pattern: /dashboard|summary|overview|status|best option/i,
    handler: () => DecisionEngine.dashboardSummary(),
  },
  {
    // Greetings
    pattern: /^(hi|hello|hey|hola|yo|sup|good morning|good evening|greetings)/i,
    handler: () => `👋 Hello! I'm <strong>QueueLess AI</strong>, your smart stadium assistant. Ask me about:<br/>• 🚪 Which gate to use<br/>• 🍔 Best food stall<br/>• 🚻 Nearest washroom<br/>• ⏱️ Current wait times`,
  },
  {
    // Help
    pattern: /help|what can you|what do you|commands|options/i,
    handler: () => `I can help you with:<br/>• <em>"Which gate is least crowded?"</em><br/>• <em>"Where should I go for food?"</em><br/>• <em>"Nearest washroom?"</em><br/>• <em>"What are all wait times?"</em><br/>• <em>"Show me the crowd summary"</em>`,
  },
];

/**
 * Process a user message and return a bot reply
 * @param {string} message
 * @returns {string} HTML response string
 */
function processIntent(message) {
  const trimmed = message.trim();
  if (!trimmed) return 'Please type a question! 😊';

  for (const intent of INTENTS) {
    if (intent.pattern.test(trimmed)) {
      return intent.handler();
    }
  }

  // Fallback response
  return `I'm not sure about that, but I can help with: <br/>🚪 Gate status · 🍔 Food stalls · 🚻 Washrooms · ⏱️ Wait times.<br/>Try asking: <em>"Which gate is least crowded?"</em>`;
}


/* ============================================================
   4. CHAT UI CONTROLLER
   ============================================================ */

const ChatUI = {

  /** Reference to chat window element */
  window: null,

  /**
   * Initialize chat with a welcome message
   */
  init() {
    this.window = document.getElementById('chat-window');
    this.addBotMessage(
      `👋 Welcome to <strong>QueueLess AI</strong>!<br/>I'm your smart stadium assistant.<br/><br/>Ask me about gates, food stalls, or washrooms — I'll find you the best option using live crowd data! Try the quick-ask chips above. 🏟️`
    );
  },

  /**
   * Add a user message bubble
   * @param {string} text
   */
  addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user-row animate-in';
    row.innerHTML = `
      <div class="msg-avatar user-avatar">🙋</div>
      <div class="msg-bubble user-bubble">${this.escapeHtml(text)}</div>
    `;
    this.window.appendChild(row);
    this.scrollToBottom();
  },

  /**
   * Add a bot message bubble with typing indicator then text
   * @param {string} htmlContent - can include HTML tags
   * @param {number} delay - ms before showing (for typing effect)
   */
  addBotMessage(htmlContent, delay = 0) {
    if (delay > 0) {
      // Show typing indicator first
      const typingRow = this.showTyping();
      setTimeout(() => {
        typingRow.remove();
        this._insertBotBubble(htmlContent);
      }, delay);
    } else {
      this._insertBotBubble(htmlContent);
    }
  },

  /**
   * Internal: insert bot bubble element
   */
  _insertBotBubble(htmlContent) {
    const row = document.createElement('div');
    row.className = 'msg-row animate-in';
    row.innerHTML = `
      <div class="msg-avatar bot-avatar">🤖</div>
      <div class="msg-bubble bot-bubble">${htmlContent}</div>
    `;
    this.window.appendChild(row);
    this.scrollToBottom();
  },

  /**
   * Show a typing indicator bubble
   * @returns {HTMLElement} the typing row element (for removal)
   */
  showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row animate-in';
    row.innerHTML = `
      <div class="msg-avatar bot-avatar">🤖</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    this.window.appendChild(row);
    this.scrollToBottom();
    return row;
  },

  /**
   * Scroll chat window to the bottom
   */
  scrollToBottom() {
    requestAnimationFrame(() => {
      this.window.scrollTop = this.window.scrollHeight;
    });
  },

  /**
   * Escape HTML special characters in user inputs
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  },
};


/* ============================================================
   5. DASHBOARD RENDERER
   ============================================================ */

const Dashboard = {

  /**
   * Render all dashboard cards from STADIUM_DATA
   */
  render() {
    this.renderGates();
    this.renderFood();
    this.renderWashrooms();
    this.renderSummary();
    this.updateTimestamp();
  },

  /**
   * Convert a crowd level key to a color class
   */
  colorClass(level) {
    const map = { HIGH: 'red', MEDIUM: 'yellow', LOW: 'green', BUSY: 'red', FREE: 'green' };
    return map[level] || 'yellow';
  },

  /**
   * Render gates list
   */
  renderGates() {
    const list = document.getElementById('gates-list');
    if (!list) return;
    const best = DecisionEngine.bestGate().gate;
    list.innerHTML = STADIUM_DATA.gates.map(g => {
      const cl = CROWD_LEVEL[g.crowdLevel];
      const isBest = g.id === best.id;
      return `
        <div class="dash-item ${isBest ? 'best' : ''}">
          <div class="dash-item-left">
            <div class="status-dot ${this.colorClass(g.crowdLevel)}"></div>
            <div>
              <div class="dash-item-name">${g.name} ${isBest ? '<span class="best-tag">Best</span>' : ''}</div>
            </div>
          </div>
          <div class="dash-item-right">
            <span class="dash-item-value">${cl.label} · ${g.entranceTime} min</span>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render food stall list
   */
  renderFood() {
    const list = document.getElementById('food-list');
    if (!list) return;
    const best = DecisionEngine.bestFoodStall().stall;
    const sorted = [...STADIUM_DATA.foodStalls].sort((a, b) => a.waitMinutes - b.waitMinutes);
    list.innerHTML = sorted.map(s => {
      const isBest = s.id === best.id;
      const color = s.waitMinutes <= 3 ? 'green' : s.waitMinutes <= 7 ? 'yellow' : 'red';
      return `
        <div class="dash-item ${isBest ? 'best' : ''}">
          <div class="dash-item-left">
            <div class="status-dot ${color}"></div>
            <div>
              <div class="dash-item-name">${s.name} ${isBest ? '<span class="best-tag">Best</span>' : ''}</div>
            </div>
          </div>
          <div class="dash-item-right">
            <span class="dash-item-value">${s.waitMinutes} min · ${s.cuisine}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render washrooms list
   */
  renderWashrooms() {
    const list = document.getElementById('washroom-list');
    if (!list) return;
    const best = DecisionEngine.bestWashroom().washroom;
    list.innerHTML = STADIUM_DATA.washrooms.map(w => {
      const cl = CROWD_LEVEL[w.crowdLevel];
      const isBest = w.id === best.id;
      return `
        <div class="dash-item ${isBest ? 'best' : ''}">
          <div class="dash-item-left">
            <div class="status-dot ${this.colorClass(w.crowdLevel)}"></div>
            <div>
              <div class="dash-item-name">${w.name} ${isBest ? '<span class="best-tag">Best</span>' : ''}</div>
            </div>
          </div>
          <div class="dash-item-right">
            <span class="dash-item-value">${cl.label}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Render summary card (best picks at a glance)
   */
  renderSummary() {
    const grid = document.getElementById('summary-grid');
    if (!grid) return;
    const gate = DecisionEngine.bestGate().gate;
    const stall = DecisionEngine.bestFoodStall().stall;
    const wash = DecisionEngine.bestWashroom().washroom;

    grid.innerHTML = `
      <div class="summary-card">
        <div class="summary-card-icon">🚪</div>
        <div class="summary-card-label">Best Gate</div>
        <div class="summary-card-value">${gate.name}</div>
        <div class="summary-card-meta">${CROWD_LEVEL[gate.crowdLevel].label} · ${gate.entranceTime} min</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-icon">🍔</div>
        <div class="summary-card-label">Best Food Stall</div>
        <div class="summary-card-value">${stall.name}</div>
        <div class="summary-card-meta">${stall.waitMinutes} min wait · ${stall.cuisine}</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-icon">🚻</div>
        <div class="summary-card-label">Best Washroom</div>
        <div class="summary-card-value">${wash.name.replace('Washroom near ', '').replace('Washroom — ', '')}</div>
        <div class="summary-card-meta">${CROWD_LEVEL[wash.crowdLevel].label} · ${wash.distance}</div>
      </div>
    `;
  },

  /**
   * Update the last-updated timestamp display
   */
  updateTimestamp() {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const now = new Date();
    el.textContent = `Last updated: ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  },
};


/* ============================================================
   6. LIVE DATA SIMULATOR
   Randomly mutates crowd levels / wait times every 30 seconds
   ============================================================ */

const DataSimulator = {

  crowdLevels:  ['LOW', 'MEDIUM', 'HIGH'],
  washroomLevels: ['FREE', 'BUSY'],

  /**
   * Randomly shift some data points to simulate live updates
   */
  tick() {
    // Randomly update one gate crowd level
    const gateIdx = Math.floor(Math.random() * STADIUM_DATA.gates.length);
    STADIUM_DATA.gates[gateIdx].crowdLevel =
      this.crowdLevels[Math.floor(Math.random() * this.crowdLevels.length)];

    // Randomly shift food stall wait times by ± 1-3 min
    STADIUM_DATA.foodStalls.forEach(s => {
      const delta = Math.floor(Math.random() * 5) - 2;
      s.waitMinutes = Math.max(1, Math.min(20, s.waitMinutes + delta));
    });

    // Randomly toggle one washroom
    const washIdx = Math.floor(Math.random() * STADIUM_DATA.washrooms.length);
    STADIUM_DATA.washrooms[washIdx].crowdLevel =
      this.washroomLevels[Math.floor(Math.random() * this.washroomLevels.length)];

    // Re-render dashboard
    Dashboard.render();
  },

  start() {
    setInterval(() => this.tick(), 30000); // every 30 seconds
  },
};


/* ============================================================
   7. GLOBAL EVENT HANDLERS (called from HTML)
   ============================================================ */

/**
 * Handle send button click
 */
function handleSend() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  ChatUI.addUserMessage(text);
  input.value = '';

  // Process with short delay to show typing indicator
  const response = processIntent(text);
  ChatUI.addBotMessage(response, 900);
}

/**
 * Handle Enter key in chat input
 * @param {KeyboardEvent} event
 */
function handleInputKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}

/**
 * Handle quick-suggest chip click
 * @param {HTMLElement} el — chip element with data-msg attribute
 */
function sendSuggestion(el) {
  const msg = el.dataset.msg;
  if (!msg) return;
  const input = document.getElementById('chat-input');
  input.value = msg;
  handleSend();
}

/**
 * Smooth scroll to section by ID
 * @param {string} id
 */
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Toggle mobile nav menu
 */
function toggleMenu() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('open');
}


/* ============================================================
   8. SCROLL ANIMATION — Reveal elements on scroll
   ============================================================ */

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.dash-card, .map-info-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}


/* ============================================================
   9. APP INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize chat
  ChatUI.init();

  // Render dashboard
  Dashboard.render();

  // Start live data simulation
  DataSimulator.start();

  // Scroll animations
  initScrollAnimations();

  // Sticky header shadow on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.style.background = 'rgba(8, 11, 20, 0.97)';
    } else {
      header.style.background = 'rgba(8, 11, 20, 0.85)';
    }
  });
});
