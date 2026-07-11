// --- HELPER FUNCTIONS ---
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

// --- 2. TAB SWITCHING (EMAIL <-> MOBILE) ---
const tabs = document.querySelectorAll('.tab');
const emailGroup = document.getElementById('emailGroup');
const mobileGroup = document.getElementById('mobileGroup');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'email') {
            emailGroup.style.display = 'block';
            mobileGroup.style.display = 'none';
        } else {
            emailGroup.style.display = 'none';
            mobileGroup.style.display = 'block';
        }
    });
});

// --- 3. PASSWORD TOGGLE (EYE ICON) ---
function togglePassword(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const icon = toggleBtn.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// --- 4. FORGOT PASSWORD MODAL ---
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

// Close modal if clicking outside the white box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Handle Forgot Password Form Submit
const forgotForm = document.getElementById('forgotPasswordForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value.trim();
        const modalErrorDiv = document.getElementById('modalError');
        const modalErrorText = document.getElementById('modalErrorText');
        const btn = document.getElementById('modalSubmitBtn');

        if (!email) {
            modalErrorText.textContent = 'Please enter your email address.';
            modalErrorDiv.classList.add('show');
            return;
        }
        if (!validateEmail(email)) {
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

// --- 5. LOGIN FORM SUBMISSION ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');
        const btn = document.getElementById('loginBtn');

        // Basic Validation
        const activeTab = document.querySelector('.tab.active').dataset.tab;
        let isValid = true;

        if (activeTab === 'email') {
            const email = document.getElementById('loginEmail').value.trim();
            if (!email) {
                errorText.textContent = 'Please enter your email address.';
                isValid = false;
            } else if (!validateEmail(email)) {
                errorText.textContent = 'Please enter a valid email address.';
                isValid = false;
            }
        } else {
            const mobile = document.getElementById('loginMobile').value.trim();
            if (!mobile) {
                errorText.textContent = 'Please enter your mobile number.';
                isValid = false;
            }
        }

        const password = document.getElementById('loginPassword').value;
        if (!password) {
            errorText.textContent = 'Please enter your password.';
            isValid = false;
        }

        if (!isValid) {
            errorDiv.classList.add('show');
            return;
        }

        errorDiv.classList.remove('show');
        btn.classList.add('loading');
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
            alert('Login successful!');
        }, 1500);
    });
}

// --- 6. SIGNUP FORM SUBMISSION ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const pass = document.getElementById('signupPassword').value;
        const confirmPass = document.getElementById('signupConfirmPassword').value;

        const errorDiv = document.getElementById('signupError');
        const errorText = document.getElementById('signupErrorText');

        // Validation
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

        // Simulate API call
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.disabled = false;
            alert('Account created successfully!');

            // Switch back to login view
            signupView.classList.add('hidden');
            loginView.classList.remove('hidden');
            signupForm.reset();
        }, 1500);
    });
}

// --- 7. REAL-TIME ERROR CLEARING ---
// Clear login errors when user starts typing
document.querySelectorAll('#loginForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('loginError').classList.remove('show');
    });
});

// Clear signup errors when user starts typing
document.querySelectorAll('#signupForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('signupError').classList.remove('show');
    });
});

// --- 8. SOCIAL BUTTON INTERACTIONS ---
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const provider = this.classList.contains('facebook') ? 'Facebook' :
            this.classList.contains('google') ? 'Google' : 'Apple';

        // Add loading state
        this.style.opacity = '0.7';
        this.style.pointerEvents = 'none';

        setTimeout(() => {
            this.style.opacity = '1';
            this.style.pointerEvents = 'auto';
            alert(`${provider} login/signup would be implemented here.`);
        }, 500);
    });
});