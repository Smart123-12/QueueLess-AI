/**
 * admin.js
 * Handles authentication and authorization for the Admin Portal.
 * Interacts with Firebase Auth (Simulated for this implementation).
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const dashboardPanel = document.getElementById('dashboard-panel');
    const errorMsg = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Expected Secure Credentials (In production, never store passwords in frontend)
    const REQUIRED_USER = "admin";
    const REQUIRED_PASS = "password123";

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';

            // Sanitize inputs
            const userVal = document.getElementById('admin-user').value.trim();
            const passVal = document.getElementById('admin-pass').value.trim();

            if (userVal === REQUIRED_USER && passVal === REQUIRED_PASS) {
                // Successful Auth Simulation
                sessionStorage.setItem("admin_auth", "true");
                showDashboard();
            } else {
                // Failed Auth
                errorMsg.style.display = 'block';
                // Security Log (mocked integration flow)
                console.warn("Security Alert: Failed login attempt for user:", userVal);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem("admin_auth");
            hideDashboard();
        });
    }

    // Checking existing session
    function checkAuthSession() {
        if (sessionStorage.getItem("admin_auth") === "true") {
            showDashboard();
        }
    }

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardPanel.style.display = 'block';
        // Mock Firebase usage event log
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            firebase.analytics().logEvent('admin_login', { method: 'password' });
        }
    }

    function hideDashboard() {
        dashboardPanel.style.display = 'none';
        loginSection.style.display = 'block';
        if (loginForm) loginForm.reset();
        errorMsg.style.display = 'none';
    }

    // Run auth check on load
    checkAuthSession();
});
