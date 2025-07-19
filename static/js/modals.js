
// Demo Modal Functions
function openDemoModal() {
    const modal = document.getElementById("demoModal");
    const modalContent = document.getElementById("demoModalContent");
    
    modal.classList.remove("hidden");
    setTimeout(() => {
        modalContent.classList.remove("opacity-0", "scale-90");
        modalContent.classList.add("opacity-100", "scale-100");
    }, 50);
}

function closeDemoModal() {
    const modal = document.getElementById("demoModal");
    const modalContent = document.getElementById("demoModalContent");
    
    modalContent.classList.remove("opacity-100", "scale-100");
    modalContent.classList.add("opacity-0", "scale-90");
    
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 500);
}

// Trial Modal Functions
function openTrialModal() {
    const modal = document.getElementById("trialModal");
    const modalContent = document.getElementById("trialModalContent");
    
    modal.classList.remove("hidden");
    setTimeout(() => {
        modalContent.classList.remove("opacity-0", "scale-90");
        modalContent.classList.add("opacity-100", "scale-100");
    }, 50);
}

function closeTrialModal() {
    const modal = document.getElementById("trialModal");
    const modalContent = document.getElementById("trialModalContent");
    
    modalContent.classList.remove("opacity-100", "scale-100");
    modalContent.classList.add("opacity-0", "scale-90");
    
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 500);
}
