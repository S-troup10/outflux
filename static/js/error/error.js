function ErrorModal(text) {
    let overlay = document.getElementById("error-overlay");
  
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "error-overlay";
      overlay.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center fade-in";
      overlay.innerHTML = `
        <div id="error-modal" class="bg-red-600 text-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
          <button id="close-error-btn" class="absolute top-2 right-3 text-white text-xl hover:text-gray-200">&times;</button>
          <h3 class="text-lg font-bold mb-2">Error</h3>
          <p id="error-message">${text}</p>
        </div>
      `;
      document.body.appendChild(overlay);
  
      document.getElementById("close-error-btn").onclick = () => closeErrorModal();
    } else {
      const messageEl = document.getElementById("error-message");
      messageEl.textContent = text;
      overlay.classList.remove("fade-out");
      overlay.classList.add("fade-in");
      overlay.classList.remove("hidden");
    }
  
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeErrorModal();
    }, 3000);
  }
  
  function closeErrorModal() {
    const overlay = document.getElementById("error-overlay");
    if (overlay) {
      overlay.classList.remove("fade-in");
      overlay.classList.add("fade-out");
  
      // Remove after animation
      setTimeout(() => {
        overlay.classList.add("hidden");
      }, 300); // match the animation duration
    }
  }
  


  function showConfirmation({ title = "Confirm Action", message = "Are you sure?", onConfirm }) {
    const modal = document.getElementById("confirmation-modal");
    const titleEl = document.getElementById("confirm-modal-title");
    const msgEl = document.getElementById("confirm-modal-message");
    const cancelBtn = document.getElementById("confirm-cancel");
    const okBtn = document.getElementById("confirm-ok");
    const content = document.getElementById("confirmModalContent");
  
    // Set modal content
    titleEl.textContent = title;
    msgEl.textContent = message;
  
    // Show modal with animation
    modal.classList.remove("hidden");
    setTimeout(() => content.classList.remove("opacity-0", "scale-95"), 10);
  
    function closeModal() {
      content.classList.add("opacity-0", "scale-95");
      setTimeout(() => modal.classList.add("hidden"), 300);
      cancelBtn.onclick = null;
      okBtn.onclick = null;
    }
  
    cancelBtn.onclick = closeModal;
    okBtn.onclick = () => {
      if (typeof onConfirm === "function") onConfirm();
      closeModal();
    };
  }
  
  function closeConfirmModal() {
    const content = document.getElementById("confirmModalContent");
    const modal = document.getElementById("confirmation-modal");
    content.classList.add("opacity-0", "scale-95");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }
  







/**
 * showToast(message, success = true)
 * 
 * Displays a toast notification in the top-right corner.
 * @param {string} message — the text to display
 * @param {boolean} success — whether it's a success (green) or error (red) toast
 */
function showToast(message, success = true) {
  const container = document.getElementById('toast-container');
  if (!container) return;

const toast = document.createElement('div');
toast.className = [
  'flex items-center gap-3',
  'max-w-xs w-full',
  'p-4',
  'rounded-xl',
  'shadow-lg',
  'text-white',
  'bg-gradient-to-br from-gray-900 to-gray-800', // dark purple gradient
  'backdrop-blur',
  'border border-purple-700',
  'transform transition-all duration-300',
  'opacity-0 translate-x-4'
].join(' ');

// Icon and accent color
const iconColor = success ? 'text-green-400' : 'text-red-500';
const iconClass = success ? 'fa-check-circle' : 'fa-exclamation-circle';

toast.innerHTML = `
  <i class="fas ${iconClass} ${iconColor} text-xl"></i>
  <span class="flex-1 text-sm text-purple-100">${message}</span>
`;

toast.style.boxShadow = `0 0 2px ${success ? '#a855f7' : '#f472b6'}`;



  // Append and trigger animation
  container.appendChild(toast);
  // next frame: fade in
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-x-4');
    toast.classList.add('opacity-100', 'translate-x-0');
  });

  // Auto-remove after 3s
  setTimeout(() => {
    // fade out
    toast.classList.remove('opacity-100', 'translate-x-0');
    toast.classList.add('opacity-0', 'translate-x-4');
    // remove from DOM after transition
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }, 3000);
}

