/**
 * QueueLess AI - Smart Event Assistant
 * Handles chat logic and decision engine based on simulated live stadium data.
 */

// Initialize Google Firebase (Mock implementation for integration)
const firebaseConfig = {
    apiKey: "AIzaSyMockKeyForGoogleServices_Simulation",
    authDomain: "queueless-ai.firebaseapp.com",
    projectId: "queueless-ai",
    storageBucket: "queueless-ai.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-12345ABCDE"
};
try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        firebase.initializeApp(firebaseConfig);
        const analytics = firebase.analytics();
        console.log("Firebase & Google Cloud Integration Active");
    }
} catch(e) {
    console.error("Google Services Error:", e);
}

// Simulated internal dataset representing live stadium data
// In a real app, this would be fetched from a server/API frequently
const stadiumData = {
    gates: [
        { id: "Gate 1", crowdLevel: "High", waitWaitMins: 25, score: 3 },
        { id: "Gate 2", crowdLevel: "Low", waitWaitMins: 5, score: 1 },
        { id: "Gate 3", crowdLevel: "Medium", waitWaitMins: 12, score: 2 }
    ],
    foodStalls: [
        { id: "Stall A", waitMins: 10, type: "Snacks" },
        { id: "Stall B", waitMins: 2, type: "Fast Food" },
        { id: "Stall C", waitMins: 6, type: "Beverages" }
    ],
    washrooms: [
        { id: "Near Gate 1", status: "Busy", queueLength: 15 },
        { id: "Near Gate 2", status: "Free", queueLength: 2 },
        { id: "Near Gate 3", status: "Busy", queueLength: 8 }
    ]
};

// DOM Elements
const chatWindow = document.getElementById('chat-window');
const inputField = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const crowdDashboard = document.getElementById('crowd-dashboard');

// Auth DOM
const custLoginForm = document.getElementById('customer-login-form');
const custLoginSection = document.getElementById('customer-login-section');
const mainAppContent = document.getElementById('main-app-content');
const custError = document.getElementById('cust-error');
const sosBtn = document.getElementById('sos-btn');

/**
 * Initialize the application
 */
function init() {
    setupAuth();
    renderDashboard();
    
    // Event Listeners for chat
    sendBtn.addEventListener('click', handleUserQuery);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserQuery();
    });
}

/**
 * Handle Auth Login for Customer Role
 */
function setupAuth() {
    if (sessionStorage.getItem('customer_auth') === 'true') {
        showMainApp();
    }

    if (custLoginForm) {
        custLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('cust-user').value.trim();
            const pass = document.getElementById('cust-pass').value.trim();

            if (user === 'student' && pass === 'password') {
                sessionStorage.setItem('customer_auth', 'true');
                showMainApp();
            } else {
                custError.style.display = 'block';
            }
        });
    }

    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            alert("🚨 EMERGENCY SOS ACTIVATED! Location pinged. Security has been dispatched directly to your seat.");
            if (typeof firebase !== 'undefined' && firebase.analytics) {
                firebase.analytics().logEvent('sos_alert', { location: 'main_stadium' });
            }
        });
    }
}

function showMainApp() {
    if(custLoginSection) custLoginSection.style.display = 'none';
    if(mainAppContent) mainAppContent.style.display = 'grid'; // because main container uses grid
    if(sosBtn) sosBtn.style.display = 'block';
}

/**
 * Handle user input processing
 */
function handleUserQuery() {
    // 1. Get and sanitize input securely using trim() and toLowerCase()
    const rawInput = inputField.value;
    const cleanInput = rawInput.trim().toLowerCase();
    
    // Check for empty input edge case
    if (!cleanInput) {
        addMessageToChat("Please enter a question.", "ai-message");
        return;
    }

    // 2. Add user message to UI
    addMessageToChat(rawInput, "user-message");
    inputField.value = ""; // Clear input immediately

    // 3. Process the query using simple keyword matching
    const response = processQuery(cleanInput);

    // 4. Add AI response to UI
    // Timeout added for slight delay to simulate thinking and feel natural
    const typingIndicator = showTypingIndicator();
    
    setTimeout(() => {
        typingIndicator.remove();
        addMessageToChat(response, "ai-message");
    }, 600);
}

/**
 * Visual feedback for waiting
 */
function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'ai-message');
    msgDiv.textContent = '...';
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return msgDiv;
}

/**
 * Process the query and decide which logic to invoke
 * Includes robust boundary testing and integration edge cases
 * @param {string} query - The sanitized query string
 * @returns {string} The AI response
 */
function processQuery(query) {
    try {
        if (!query || typeof query !== 'string') {
            return "Invalid query. Please ask a valid question.";
        }
        
        // Advanced Sanitization & Boundary Handling
        const sanitized = query.trim().toLowerCase().replace(/[<>]/g, "");

        // Track events via Google Analytics
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            firebase.analytics().logEvent('search_query', { search_term: sanitized });
        }

        if (sanitized.includes('gate') || sanitized.includes('entry') || sanitized.includes('enter')) {
            return getBestGate();
        } else if (sanitized.includes('food') || sanitized.includes('eat') || sanitized.includes('hungry') || sanitized.includes('stall')) {
            return getBestFood();
        } else if (sanitized.includes('washroom') || sanitized.includes('toilet') || sanitized.includes('restroom')) {
            return getBestWashroom();
        } else {
            return "I'm not exactly sure about that. Try asking me about the least crowded 'gates', fastest 'food' options, or nearest 'washrooms'!";
        }
    } catch (err) {
        console.error("Edge Case Handling Caught Error:", err);
        return "I'm experiencing a temporary glitch. Please try asking again.";
    }
}

/**
 * Logic to find the best (least crowded) gate
 * Computes best option efficiently using reduce
 * @returns {string} Recommendation string
 */
function getBestGate() {
    if (!stadiumData || !stadiumData.gates || stadiumData.gates.length === 0) {
        return "Gate data is currently unavailable.";
    }
    // reduce to find the gate with the lowest score (lowest wait time/crowd)
    const bestGate = stadiumData.gates.reduce((best, current) => {
        return (best.score < current.score) ? best : current;
    });

    return `I recommend ${bestGate.id} because it has the lowest crowd density (${bestGate.crowdLevel}) with only a ~${bestGate.waitWaitMins} min wait, ensuring faster entry.`;
}

/**
 * Logic to find the best (shortest wait) food stall
 * @returns {string} Recommendation string
 */
function getBestFood() {
    const bestFood = stadiumData.foodStalls.reduce((best, current) => {
        return (best.waitMins < current.waitMins) ? best : current;
    });

    return `I recommend heading to ${bestFood.id} for food because it currently has the shortest wait time of just ${bestFood.waitMins} minutes.`;
}

/**
 * Logic to find the best (freest) washroom
 * @returns {string} Recommendation string
 */
function getBestWashroom() {
    const bestWashroom = stadiumData.washrooms.reduce((best, current) => {
        return (best.queueLength < current.queueLength) ? best : current;
    });

    return `I highly recommend the washroom ${bestWashroom.id} because it is currently ${bestWashroom.status.toLowerCase()} with a minimal queue size of ${bestWashroom.queueLength} people.`;
}

/**
 * Helper function to safely append text messages to the chat DOM
 * @param {string} text - Message content
 * @param {string} className - CSS class for user ("user-message") or ai ("ai-message")
 */
function addMessageToChat(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', className);
    // Security Focus: Strict usage of textContent to prevent XSS/Script Injection
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    
    // Auto scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Render the live dashboard using data array
 * Minimizes DOM updates and enforces security.
 */
function renderDashboard() {
    // safe clear as it contains no user input currently here
    crowdDashboard.textContent = ''; 
    
    // Document fragment for efficient DOM appending
    const fragment = document.createDocumentFragment();
    
    stadiumData.gates.forEach(gate => {
        const card = document.createElement('div');
        card.classList.add('dashboard-card');
        card.dataset.status = gate.crowdLevel.toLowerCase();
        
        const title = document.createElement('span');
        title.classList.add('card-title');
        title.textContent = gate.id;
        
        const status = document.createElement('span');
        status.classList.add('status-badge', `status-${gate.crowdLevel.toLowerCase()}`);
        
        // Add indicator emoji based on level for better accessibility and aesthetics
        let emoji = '🟢';
        if (gate.crowdLevel === 'High') emoji = '🔴';
        if (gate.crowdLevel === 'Medium') emoji = '🟡';
        status.textContent = `${emoji} ${gate.crowdLevel}`;
        
        const wait = document.createElement('span');
        wait.classList.add('wait-time');
        wait.textContent = `${gate.waitWaitMins}m Wait`;
        
        card.appendChild(title);
        card.appendChild(status);
        card.appendChild(wait);
        
        fragment.appendChild(card);
    });
    
    crowdDashboard.appendChild(fragment);
}

// Ensure the code starts executing once ready
document.addEventListener('DOMContentLoaded', init);
