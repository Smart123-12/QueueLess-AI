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
    return {
      gate: best,
      reason: `I recommend ${best.name} because it currently has the lowest crowd density, ensuring faster and smoother entry.`,
    };
  },

  /**
   * Find best food stall (shortest wait time)
   * @returns {{ stall, reason }}
   */
  bestFoodStall() {
    const sorted = [...STADIUM_DATA.foodStalls].sort((a, b) => a.waitMinutes - b.waitMinutes);
    const best = sorted[0];
    return {
      stall: best,
      reason: `For a quicker experience, ${best.name} is the best choice as it has only a ${best.waitMinutes}-minute waiting time.`,
    };
  },

  /**
   * Find best washroom (Free status, then by name)
   * @returns {{ washroom, reason }}
   */
  bestWashroom() {
    const free = STADIUM_DATA.washrooms.filter(w => w.crowdLevel === 'FREE');
    const best = free.length > 0 ? free[0] : STADIUM_DATA.washrooms.find(w => w.crowdLevel === 'BUSY');
    // Ensure "Washroom near Gate 2" renders perfectly
    let wname = best.name;
    if (wname.startsWith('Washroom')) { wname = 'washroom ' + wname.substring(9); }
    return {
      washroom: best,
      reason: `The ${wname} is currently free, making it the most convenient option.`,
    };
  },

  /**
   * Return all wait times for all facilities
   */
  allWaitTimes() {
    const gateLines = STADIUM_DATA.gates.map(g => {
      const cl = CROWD_LEVEL[g.crowdLevel];
      return `${cl.emoji} ${g.name}: ${cl.label} (${g.entranceTime} min wait)`;
    }).join('\n');

    const foodLines = STADIUM_DATA.foodStalls.map(s =>
      `🍽️ ${s.name} (${s.cuisine}): ${s.waitMinutes} min wait`
    ).join('\n');

    return `Here are all current wait times:\n\nGates:\n${gateLines}\n\nFood Stalls:\n${foodLines}`;
  },

  /**
   * Dashboard summary
   */
  dashboardSummary() {
    const { gate } = this.bestGate();
    const { stall } = this.bestFoodStall();
    const { washroom } = this.bestWashroom();
    return `📊 Current Best Options:\n\n🚪 Best Gate: ${gate.name} (${CROWD_LEVEL[gate.crowdLevel].label} crowd, ${gate.entranceTime} min entry)\n🍔 Best Food: ${stall.name} — ${stall.waitMinutes} min wait (${stall.cuisine})\n🚻 Best Washroom: ${washroom.name} — ${CROWD_LEVEL[washroom.crowdLevel].label}`;
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
    pattern: /gate|enter|entrance|crowd|crowded|less crowd|entry|fast entry|least crowd|best gate/i,
    handler: () => {
      const { reason } = DecisionEngine.bestGate();
      return `Based on current crowd data...\n\n${reason}`;
    },
  },
  {
    // Food queries
    pattern: /food|eat|hungry|snack|stall|drink|beverage|pizza|meal/i,
    handler: () => {
      const { reason } = DecisionEngine.bestFoodStall();
      return `For a smoother experience...\n\n${reason}`;
    },
  },
  {
    // Washroom queries
    pattern: /washroom|toilet|restroom|bathroom|loo|wc/i,
    handler: () => {
      const { reason } = DecisionEngine.bestWashroom();
      return `Based on current crowd data...\n\n${reason}`;
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
    handler: () => `👋 Hello! I'm QueueLess AI, your smart stadium assistant. Ask me about:\n• 🚪 Which gate to use\n• 🍔 Best food stall\n• 🚻 Nearest washroom\n• ⏱️ Current wait times`,
  },
  {
    // Help
    pattern: /help|what can you|what do you|commands|options/i,
    handler: () => `I can help you with:\n• "Which gate is least crowded?"\n• "Where should I go for food?"\n• "Nearest washroom?"\n• "What are all wait times?"\n• "Show me the crowd summary"`,
  },
];

/**
 * Process a user message and return a bot reply
 * @param {string} message
 * @returns {string} HTML response string
 */
function processIntent(message) {
  const userInput = message.trim().toLowerCase();
  if (!userInput) return 'Please type a question! 😊';

  for (const intent of INTENTS) {
    if (intent.pattern.test(userInput)) {
      return intent.handler();
    }
  }

  // Fallback response
  return "Sorry, I didn’t understand. Try asking about gates, food, or washrooms.";
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
      `👋 Welcome to QueueLess AI!\nI'm your smart stadium assistant.\n\nAsk me about gates, food stalls, or washrooms — I'll find you the best option using live crowd data! Try the quick-ask chips above. 🏟️`
    );
  },

  /**
   * Add a user message bubble
   * @param {string} text
   */
  addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user-row animate-in';
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar user-avatar';
    avatar.textContent = '🙋';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble user-bubble';
    bubble.textContent = text;
    
    row.appendChild(avatar);
    row.appendChild(bubble);
    
    this.window.appendChild(row);
    this.scrollToBottom();
  },

  /**
   * Add a bot message bubble with typing indicator then text
   * @param {string} textContent - plain text content
   * @param {number} delay - ms before showing (for typing effect)
   */
  addBotMessage(textContent, delay = 0) {
    if (delay > 0) {
      // Show typing indicator first
      const typingRow = this.showTyping();
      setTimeout(() => {
        typingRow.remove();
        this._insertBotBubble(textContent);
      }, delay);
    } else {
      this._insertBotBubble(textContent);
    }
  },

  /**
   * Internal: insert bot bubble element
   */
  _insertBotBubble(textContent) {
    const row = document.createElement('div');
    row.className = 'msg-row animate-in';
    
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar bot-avatar';
    avatar.textContent = '🤖';
    
    const bubbleContainer = document.createElement('div');
    bubbleContainer.style.display = 'flex';
    bubbleContainer.style.flexDirection = 'column';
    bubbleContainer.style.gap = '8px';
    bubbleContainer.style.maxWidth = '72%';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble bot-bubble';
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.style.maxWidth = '100%';
    bubble.textContent = textContent;
    
    bubbleContainer.appendChild(bubble);

    // Feedback system
    const feedback = document.createElement('div');
    feedback.className = 'msg-feedback';
    feedback.style.display = 'flex';
    feedback.style.gap = '10px';
    feedback.style.fontSize = '0.75rem';
    feedback.style.color = 'var(--text-muted)';
    
    const helpfulBtn = document.createElement('button');
    helpfulBtn.textContent = '👍 Helpful';
    helpfulBtn.style.color = 'inherit';
    helpfulBtn.style.transition = 'color 0.2s';
    helpfulBtn.onclick = () => { helpfulBtn.style.color = 'var(--accent-green)'; helpfulBtn.textContent = '✅ Thanks for feedback!'; feedback.children[1].style.display = 'none'; };

    const notHelpfulBtn = document.createElement('button');
    notHelpfulBtn.textContent = '👎 Not Helpful';
    notHelpfulBtn.style.color = 'inherit';
    notHelpfulBtn.style.transition = 'color 0.2s';
    notHelpfulBtn.onclick = () => { notHelpfulBtn.style.color = 'var(--accent-red)'; notHelpfulBtn.textContent = '❌ Thanks for feedback!'; feedback.children[0].style.display = 'none'; };

    feedback.appendChild(helpfulBtn);
    feedback.appendChild(notHelpfulBtn);
    
    // Only show feedback for meaningful AI responses, not simple greetings
    if (textContent.includes('Because') || textContent.includes('because') || textContent.includes('choice') || textContent.includes('recommend') || textContent.includes('Currently') || textContent.includes('currently')) {
      bubbleContainer.appendChild(feedback);
    }

    row.appendChild(avatar);
    row.appendChild(bubbleContainer);
    
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
      <div class="msg-bubble bot-bubble typing-indicator-container" style="display:flex; align-items:center; gap:10px; max-width:72%;">
        <span style="font-size: 0.82rem; font-weight: 500; color: var(--text-secondary);">Analyzing crowd data...</span>
        <div class="typing-indicator" style="padding:0; border:none; background:transparent;">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
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
  }
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

  // Use the safe lowercased text format locally for checking intents
  const userInput = text.trim().toLowerCase();
  
  // Process with short delay to show typing indicator
  const response = processIntent(userInput);
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
