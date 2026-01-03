// Script pour la page de connexion (login.html)
// Ce script ne s'exécute que si les éléments du formulaire existent

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('auth-form');
  
  // Vérifier si on est sur la page de connexion
  if (!form) {
    console.log('Page principale détectée - script de connexion ignoré');
    return;
  }
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberInput = document.getElementById('remember');
  const feedback = document.getElementById('feedback');
  const submitBtn = document.getElementById('submit-btn');
  const togglePassword = document.querySelector('.toggle-password');

  const rememberKey = 'aina-remembered-email';

  function setLoading(isLoading) {
    if (submitBtn) {
      submitBtn.classList.toggle('loading', isLoading);
      submitBtn.disabled = isLoading;
    }
  }

  function showFeedback(message, isError = true) {
    if (feedback) {
      feedback.textContent = message;
      feedback.style.color = isError ? '#d21b46' : '#0f7b0f';
    }
  }

  function restoreRememberedEmail() {
    const savedEmail = localStorage.getItem(rememberKey);
    if (savedEmail && emailInput) {
      emailInput.value = savedEmail;
      if (rememberInput) rememberInput.checked = true;
    }
  }

  function saveRememberPreference() {
    if (rememberInput && rememberInput.checked && emailInput && emailInput.value) {
      localStorage.setItem(rememberKey, emailInput.value);
    } else {
      localStorage.removeItem(rememberKey);
    }
  }

  function validateInputs() {
    if (!emailInput || !emailInput.value || !emailInput.checkValidity()) {
      return 'Identifiants invalides. Vérifiez votre adresse e-mail.';
    }

    if (!passwordInput || !passwordInput.value || passwordInput.value.length < 6) {
      return 'Identifiants invalides. Vérifiez vos informations.';
    }

    return '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = validateInputs();
    if (error) {
      showFeedback(error, true);
      return;
    }

    saveRememberPreference();
    setLoading(true);
    showFeedback('Connexion en cours...', false);

    // Simulation d'appel réseau
    setTimeout(() => {
      setLoading(false);
      showFeedback('Identifiants invalides. Vérifiez vos informations.', true);
    }, 1200);
  });

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    });
  }

  // Boutons SSO (simulation)
  document.querySelectorAll('.sso-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const provider = event.currentTarget.dataset.provider;
      showFeedback(`Redirection vers ${provider}...`, false);
    });
  });

  restoreRememberedEmail();
});
