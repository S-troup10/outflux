let currentScreen = 'dashboard';






window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1); // remove the '#'
  const [section, queryString] = hash.split('?');

  if (section === 'settings') {
  
    switchScreen('settings');
    setTimeout(() => {

      switchSettingsTab('subscription');
    }, 300);

    // Optionally parse query parameters
    const params = new URLSearchParams(queryString);
    if (params.has('success')) {
      // Show success message or UI feedback
      console.log('Success:', params.get('success'));
      showThankYouModal();
    } else if (params.has('error')) {
      // Show error message or UI feedback
     
      showToast('Error:', params.get('error'))
    } else if (params.has('cancelled')) {
      console.log('Cancelled:', params.get('cancelled'));
    }

    // Clean the URL
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } else if (section === 'new-user') {
    openPostGoogleModal();
    switchSettingsTab('connect');
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } else {
    switchSettingsTab('account');
  }
});






const screens = {
  dashboard: document.getElementById('dashboard'),
  campaigns: document.getElementById('campaigns'),
  analytics: document.getElementById('analytics'),
  settings: document.getElementById('settings'),
  lists: document.getElementById('lists')
};
function switchScreen(screen) {
  //fitst highlight the new icon
  document.getElementById(`${currentScreen}-button`).classList.remove('sel');

    if (!screens[screen] || screen === currentScreen) return;
  
    const current = screens[currentScreen];
    const next = screens[screen];
    document.getElementById(`${screen}-button`).classList.add('sel');
  
    // Fade out and slide left the current screen
    current.classList.remove('opacity-100', 'translate-x-0');
    current.classList.add('opacity-0', 'translate-x-full');
  
    setTimeout(() => {
      current.classList.add('hidden');
      next.classList.remove('hidden');
  
      // Fade in and slide right the next screen
      setTimeout(() => {
        next.classList.remove('opacity-0', 'translate-x-full');
        next.classList.add('opacity-100', 'translate-x-0');
      }, 50);
    }, 500);
    currentScreen = screen;
  }

  





window.onload = FillCustomerFields();

function openLogoutModal() {
  const modal = document.getElementById('logoutModal');
  const content = document.getElementById('logoutModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => content.classList.remove('opacity-0', 'scale-90'), 50);
}

function closeModal() {
  const modal = document.getElementById('logoutModal');
  const content = document.getElementById('logoutModalContent');
  content.classList.add('opacity-0', 'scale-90');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function confirmLogout() {
  // Perform logout logic here
  fetch('/logout', { method: 'POST' })
      .then(() => window.location.href = '/')
      .catch(err => console.error("Logout failed", err));
}


//highlight the scrreen that is open



