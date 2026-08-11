// --- HELPER FUNCTIONS ---
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

const API_BASE_URL = 'https://enterprise-task-api-django-iblk.onrender.com';
function togglePassword(inputId, spanElement) {
    const input = document.getElementById(inputId);
    const icon = spanElement.querySelector('i');

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}
 

// --- 1. VIEW SWITCHING (LOGIN <-> SIGNUP) ---
const loginView = document.getElementById('loginView');
const signupView = document.getElementById('signupView');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

if (showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

// --- 2. FORGOT PASSWORD MODAL ---
const modal = document.getElementById('forgotPasswordModal');
const openModalBtn = document.getElementById('openForgotModal');
const closeModalBtn = document.getElementById('modalClose');
const backToLoginBtn = document.getElementById('backToLoginFromModal');

function openModal() {
    if (modal) modal.classList.add('active');
}

function closeModal() {
    if (modal) modal.classList.remove('active');
}

if (openModalBtn) openModalBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (backToLoginBtn) backToLoginBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

const forgotForm = document.getElementById('forgotPasswordForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const modalErrorDiv = document.getElementById('modalError');
        const modalErrorText = document.getElementById('modalErrorText');
        const btn = document.getElementById('modalSubmitBtn');

        if (!email || !validateEmail(email)) {
            modalErrorText.textContent = 'Please enter a valid email address.';
            modalErrorDiv.classList.add('show');
            return;
        }

        modalErrorDiv.classList.remove('show');
        btn.classList.add('loading');
        btn.disabled = true;

        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
            alert('Reset link sent to your email!');
            closeModal();
            forgotForm.reset();
        }, 1500);
    });
}

// --- 3. LOGIN FORM SUBMISSION (Simplified for Email Only) ---
/**
 * Authenticates the user against the Django REST API.
 * On success, intercepts the JWT access/refresh tokens and user email, 
 * stores them in LocalStorage for session persistence, and redirects to the dashboard.
 */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const errorDiv = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');
        const btn = document.getElementById('loginBtn');
        const successMsg = document.getElementById('successMessage');

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        let isValid = true;

        if (!email) {
            errorText.textContent = 'Please enter your email address.';
            isValid = false;
        } else if (!validateEmail(email)) {
            errorText.textContent = 'Please enter a valid email address.';
            isValid = false;
        }

        if (!password) {
            errorText.textContent = 'Please enter your password.';
            isValid = false;
        }

        if (!isValid) {
            errorDiv.classList.add('show');
            if (successMsg) successMsg.classList.remove('show');
            return;
        }

        errorDiv.classList.remove('show');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            btn.classList.remove('loading');
            btn.disabled = false;

            if (!response.ok) {
                errorText.textContent = data.detail || 'Invalid email or password.';
                errorDiv.classList.add('show');
            } else {
                // 1. Save tokens AND email
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('email', email);

                
                if (successMsg) {
                    successMsg.classList.add('show');
                }

                loginForm.reset();             
                setTimeout(() => {
                    window.location.href = '/dashboard/';
                }, 1000);
            }
        } catch (error) {
            btn.classList.remove('loading');
            btn.disabled = false;
            errorText.textContent = 'Network error. Please check your connection.';
            errorDiv.classList.add('show');
        }
    });
}

// --- 4. SIGNUP FORM SUBMISSION ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const pass = document.getElementById('signupPassword').value;
        const confirmPass = document.getElementById('signupConfirmPassword').value;

        const errorDiv = document.getElementById('signupError');
        const errorText = document.getElementById('signupErrorText');

        if (!name) {
            errorText.textContent = 'Please enter your full name.';
            errorDiv.classList.add('show');
            return;
        }
        if (!email || !validateEmail(email)) {
            errorText.textContent = 'Please enter a valid email address.';
            errorDiv.classList.add('show');
            return;
        }
        if (pass.length < 8) {
            errorText.textContent = 'Password must be at least 8 characters.';
            errorDiv.classList.add('show');
            return;
        }
        if (pass !== confirmPass) {
            errorText.textContent = 'Passwords do not match!';
            errorDiv.classList.add('show');
            return;
        }

        errorDiv.classList.remove('show');
        const btn = document.getElementById('signupBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: pass
                })
            });

            const data = await response.json();
            btn.classList.remove('loading');
            btn.disabled = false;

            if (!response.ok) {
                errorText.textContent = data.detail || data.email || 'Signup failed.';
                errorDiv.classList.add('show');
            } else {
                alert('Account created successfully! Please log in.');
                signupView.classList.add('hidden');
                loginView.classList.remove('hidden');
                signupForm.reset();
            }
        } catch (error) {
            btn.classList.remove('loading');
            btn.disabled = false;
            errorText.textContent = 'Network error. Please try again.';
            errorDiv.classList.add('show');
        }
    });
}

// --- 5. REAL-TIME ERROR CLEARING ---
document.querySelectorAll('#loginForm input, #signupForm input').forEach(input => {
    input.addEventListener('input', () => {
        const errorDiv = input.closest('form').querySelector('.error-message');
        if (errorDiv) errorDiv.classList.remove('show');
    });
});

// --- 6. SOCIAL BUTTON INTERACTIONS ---
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const provider = this.classList.contains('facebook') ? 'Facebook' :
            this.classList.contains('google') ? 'Google' : 'Apple';

        this.style.opacity = '0.7';
        this.style.pointerEvents = 'none';

        setTimeout(() => {
            this.style.opacity = '1';
            this.style.pointerEvents = 'auto';
            alert(`${provider} Login/Signup would be implemented here.`);
        }, 500);
    });
});

