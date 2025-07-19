function openLogin() {
    //set the login invaid to hidden
    document.getElementById('fail').classList.remove('show');

    // Hide navigation buttons if they exist
    const topLoginButton = document.querySelector('button[onclick="openLogin()"]');
    const topSignUpButton = document.querySelector('button[onclick="openModal()"]');

    if (topLoginButton) topLoginButton.classList.add('hidden');
    if (topSignUpButton) topSignUpButton.classList.add('hidden');
    const modal = document.getElementById("loginModal");
    const modalContent = document.getElementById("loginModalContent");
    // Remove 'hidden' so the dark overlay appears instantly
    modal.classList.remove("hidden");
    // Animate modal content
    setTimeout(() => {
        modalContent.classList.remove("opacity-0", "scale-90");
        modalContent.classList.add("opacity-100", "scale-100");
    }, 50);
}
function closeLogin() {

    const modal = document.getElementById("loginModal");
    const modalContent = document.getElementById("loginModalContent");
    // Animate modal content closing
    modalContent.classList.remove("opacity-100", "scale-100");
    modalContent.classList.add("opacity-0", "scale-90");
    // After the animation, hide the overlay
    setTimeout(() => {
        modal.classList.add("hidden");

        // Show navigation buttons if they exist
        const topLoginButton = document.querySelector('button[onclick="openLogin()"]');
        const topSignUpButton = document.querySelector('button[onclick="openModal()"]');

        if (topLoginButton) topLoginButton.classList.remove('hidden');
        if (topSignUpButton) topSignUpButton.classList.remove('hidden');
    }, 500);
}

 const passwordLogin = document.getElementById('password-login');
const loginEyeIcon = document.getElementById('logineyeIcon');
loginEyeIcon.addEventListener('click', toggleloginPasswordVisibility);

function toggleloginPasswordVisibility() {
    if (passwordLogin.type === 'text') {
        passwordLogin.type = 'password';
        loginEyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        passwordLogin.type = 'text';
        loginEyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

const loginEmail = document.getElementById('email-login');

passwordLogin.addEventListener('click', () => removeGlowError(passwordLogin));
loginEmail.addEventListener('click', () => removeGlowError(loginEmail));


function removeGlowError(ele) {
    ele.classList.remove('glow-error');
}
const submitLogin = document.getElementById('loginButton');

submitLogin.addEventListener('click', AttemptLogin);

function AttemptLogin() {

    let loginAttempt = true;
    if (loginEmail.value.length == 0) {
        loginEmail.classList.add('glow-error');
        loginAttempt = false;
    }
    if (passwordLogin.value.length == 0) {
        passwordLogin.classList.add('glow-error');
        loginAttempt = false;
    }


    //after all the checks if attempt is still true login.
    if (loginAttempt == true) {
        let em = loginEmail.value;
        let pa = passwordLogin.value;
        Login(em, pa);
    }
    
}

function Login(email, password) {
    document.getElementById('loader').style.display = 'flex';
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
            
        })
        .then((data) => {
            if (data.success) {
                
                window.location.replace("/dashboard");  // or href
                // You can redirect or show a success message here
            } else {
                onFail(data.message);
                // Show an error to the user
            }
            document.getElementById('loader').style.display = 'none';
        })
        .catch((error) => {
            document.getElementById('loader').style.display = 'none';
            console.error("Error:", error);});

        
}
const fail = document.getElementById('fail');

function onFail(msg) {
    //display somthing here when user gets the credintails wrong
    //display the element 
    document.getElementById('fail').textContent = msg;
    document.getElementById('fail').classList.add('show');

}