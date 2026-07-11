// --- VIEW SWITCHING (LOGIN <-> SIGNUP) ---
const loginView = document.getElementById('loginView');
const signupView = document.getElementById('signupView');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
});

// --- PASSWORD TOGGLE ---
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

// --- LOGIN FORM LOGIC ---
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        alert('Login successful! (Connect to Django backend here)');
    }, 1500);
});

// --- SIGNUP FORM LOGIC ---
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const pass = document.getElementById('signupPassword').value;
    const confirmPass = document.getElementById('signupConfirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    const errorText = document.getElementById('signupErrorText');

    // Simple validation
    if (pass !== confirmPass) {
        errorText.textContent = 'Passwords do not match!';
        errorDiv.classList.add('show');
        return;
    }
    if (pass.length < 8) {
        errorText.textContent = 'Password must be at least 8 characters.';
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
        alert('Account created! (Connect to Django backend here)');
        // Switch back to login view
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    }, 1500);
});

// --- FORGOT PASSWORD MODAL LOGIC ---
const modal = document.getElementById('forgotPasswordModal');
const openModalBtn = document.getElementById('openForgotModal');
const closeModalBtn = document.getElementById('modalClose');
const backToLoginBtn = document.getElementById('backToLoginFromModal');

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

openModalBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
closeModalBtn.addEventListener('click', closeModal);
backToLoginBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

// Close modal if clicking outside the box
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('modalSubmitBtn');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        alert('Reset link sent to your email!');
        closeModal();
    }, 1500);
});