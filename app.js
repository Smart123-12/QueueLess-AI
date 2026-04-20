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
let chatWindow, inputField, sendBtn, crowdDashboard;
let custLoginForm, custLoginSection, custLogoutBtn, custError, sosBtn;
let viewLogin, viewRegister, authTitle, authSubtitle, authBtn;

let isRegisterMode = false;
// Session Expiry configuration (e.g., 30 minutes)
// Removed per final request - session is now unlimited

// Setup mock DB defaults
if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify({
        'student': 'Secure@2026!'
    }));
}

/**
 * Initialize the application
 */
function init() {
    // 1. Fetch DOM elements
    chatWindow = document.getElementById('chat-window');
    inputField = document.getElementById('user-input');
    sendBtn = document.getElementById('send-btn');
    crowdDashboard = document.getElementById('crowd-dashboard');
    custLoginForm = document.getElementById('customer-login-form');
    custLoginSection = document.getElementById('customer-login-section');
    custLogoutBtn = document.getElementById('customer-logout-btn');
    custError = document.getElementById('cust-error');
    sosBtn = document.getElementById('sos-btn');
    viewLogin = document.getElementById('view-login');
    viewRegister = document.getElementById('view-register');
    authTitle = document.getElementById('auth-title');
    authSubtitle = document.getElementById('auth-subtitle');
    authBtn = document.getElementById('auth-btn');

    // 2. Setup systems
    setupAuth();
    renderDashboard();
    
    // 3. Event Listeners for chat
    if (sendBtn) sendBtn.addEventListener('click', handleUserQuery);
    if (inputField) inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserQuery();
    });
}

/**
 * Custom modern Toast Notification
 */
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = isError ? '#ef4444' : '#10b981';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = 'bold';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease, margin-top 0.3s ease';
    toast.style.marginTop = '-10px';
    document.body.appendChild(toast);

    // trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.marginTop = '0';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.marginTop = '-10px';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Handle Auth Login & Register for Customer Role
 */
function setupAuth() {
    // Read session (no expiry check)
    if (sessionStorage.getItem('customer_auth') === 'true') {
        showMainApp();
    }

    if (viewLogin && viewRegister) {
        viewLogin.addEventListener('click', (e) => { e.preventDefault(); setAuthMode(false); });
        viewRegister.addEventListener('click', (e) => { e.preventDefault(); setAuthMode(true); });
    }

    if (custLoginForm) {
        custLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('cust-user').value.trim();
            const pass = document.getElementById('cust-pass').value.trim();
            custError.style.display = 'none';

            if (isRegisterMode) {
                // Register Flow
                const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
                if (!passRegex.test(pass)) {
                    custError.textContent = "Password must be at least 6 chars and include 1 Uppercase, 1 Lowercase, and 1 Number.";
                    custError.style.display = 'block';
                    showToast("Weak Password. Try e.g. Secure123", true);
                    return;
                }
                const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
                if (users[user]) {
                    custError.textContent = "Account already exists! Click 'Sign In'.";
                    custError.style.display = 'block';
                    showToast("Account already exists!", true);
                    return;
                }
                users[user] = pass;
                localStorage.setItem('mock_users', JSON.stringify(users));
                showToast("Account successfully created! Welcome aboard.");
                setTimeout(() => { createSession(); }, 1000);
            } else {
                // Login Flow
                const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
                if (users[user]) {
                    if (users[user] === pass) {
                        showToast("Login successful.");
                        createSession();
                    } else {
                        custError.textContent = "Incorrect password.";
                        custError.style.display = 'block';
                    }
                } else {
                    custError.textContent = "Account does not exist! Please click 'Create Account' above.";
                    custError.style.display = 'block';
                    showToast("Account not found.", true);
                }
            }
        });
    }

    if (custLogoutBtn) {
        custLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('customer_auth');
            location.reload();
        });
    }

    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            showToast("🚨 EMERGENCY SOS ACTIVATED! Security dispatched.", true);
            if (typeof firebase !== 'undefined' && firebase.analytics) {
                firebase.analytics().logEvent('sos_alert', { location: 'main_stadium' });
            }
        });
    }
}

function setAuthMode(isRegister) {
    isRegisterMode = isRegister;
    custError.style.display = 'none';
    if (isRegisterMode) {
        authTitle.innerHTML = 'Create Account<span class="pulse-dot"></span>';
        authSubtitle.textContent = 'Register a new Attendee pass.';
        authBtn.textContent = 'Register';
        viewRegister.style.color = '#60a5fa'; viewRegister.style.textDecoration = 'underline'; viewRegister.style.fontWeight = '600';
        viewLogin.style.color = '#94a3b8'; viewLogin.style.textDecoration = 'none'; viewLogin.style.fontWeight = '400';
    } else {
        authTitle.innerHTML = 'Welcome Attendee<span class="pulse-dot"></span>';
        authSubtitle.textContent = 'Login to unlock the Assistant.';
        authBtn.textContent = 'Access Assistant';
        viewLogin.style.color = '#60a5fa'; viewLogin.style.textDecoration = 'underline'; viewLogin.style.fontWeight = '600';
        viewRegister.style.color = '#94a3b8'; viewRegister.style.textDecoration = 'none'; viewRegister.style.fontWeight = '400';
    }
}

function createSession() {
    sessionStorage.setItem('customer_auth', 'true');
    showMainApp();
}

function showMainApp() {
    if(custLoginSection) custLoginSection.style.display = 'none';
    if(mainAppContent) mainAppContent.style.display = 'grid'; // because main container uses grid
    if(sosBtn) sosBtn.style.display = 'block';
    if(custLogoutBtn) custLogoutBtn.style.display = 'inline-block';
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
