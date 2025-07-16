const button = document.getElementById('signUp');
function openModal() {
    button.classList.add('hidden');
    topLoginButton.classList.add('hidden');
    const modal = document.getElementById("signupModal");
    const modalContent = document.getElementById("modalContent");
    // Remove 'hidden' so the dark overlay appears instantly
    modal.classList.remove("hidden");
    // Animate modal content
    setTimeout(() => {
        modalContent.classList.remove("opacity-0", "scale-90");
        modalContent.classList.add("opacity-100", "scale-100");
    }, 50);
}
function closeModal() {
    
    const modal = document.getElementById("signupModal");
    const modalContent = document.getElementById("modalContent");
    // Animate modal content closing
    modalContent.classList.remove("opacity-100", "scale-100");
    modalContent.classList.add("opacity-0", "scale-90");
    // After the animation, hide the overlay
    setTimeout(() => {
        modal.classList.add("hidden");
        topLoginButton.classList.remove('hidden');
        button.classList.remove('hidden');
    }, 500);
}

const password = document.getElementById('password');
const confirm_password = document.getElementById('confirm');
const relay = document.getElementById('relay');
const ct = document.getElementById('confirmTick');
const pt = document.getElementById('passwordTick');
const cx = document.getElementById('confirmX');
const px = document.getElementById('passwordX');

password.addEventListener('input', OnPasswordChange);
confirm_password.addEventListener('input', ConfirmPassword);


const eyeIcon = document.getElementById('eyeIcon');

let valid = false;

//password requirements
function OnPasswordChange() {
    if (password.value.length == 0) {
        eyeIcon.style.display = 'none';
        relay.style.display = 'none';
        valid = false;
        pt.classList.add('hidden');
        px.classList.add('hidden');
    } else {
        eyeIcon.style.display = 'block';
        relay.style.display = 'block';

        if (password.value.length < 8) {
            relay.textContent = 'Password must be 8 characters or longer';
            valid = false;
            pt.classList.add('hidden');
            px.classList.remove('hidden');
        } else if (!/[A-Z]/.test(password.value)) {
            relay.textContent = 'Password must include a capital letter';
            valid = false;
            pt.classList.add('hidden');
            px.classList.remove('hidden');
        } else {
            valid = true;
            relay.style.display = 'none';
            pt.classList.remove('hidden');
            px.classList.add('hidden');
        }


    }
}

//check or x marks
function ConfirmPassword() {
    if (confirm_password.value.length == 0) {
      
        cx.classList.add('hidden');
        ct.classList.add('hidden');
    } else {
       

        if (password.value === confirm_password.value && valid) {
            ct.classList.remove('hidden');
            cx.classList.add('hidden');
        } else {
            cx.classList.remove('hidden');
            ct.classList.add('hidden');
        }

    }
}

//eye button
eyeIcon.addEventListener('click', togglePasswordVisibility);

function togglePasswordVisibility() {
    if (password.type === 'text') {
        password.type = 'password';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        password.type = 'text';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

//when sign up button clicked

const submit = document.getElementById('signup');

submit.addEventListener('click', Submit);

const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');

const _confirm = document.getElementById('confirm');


function Submit() {
    //check each element to see if they have answered , 
    // if not illimuniate the fields required
    
    let submit = true;

    if (firstName.value.length == 0) {
        firstName.classList.add('glow-error');
        submit = false;
    }
    if (lastName.value.length == 0) {
        lastName.classList.add('glow-error');
        submit = false;
    }
    if (email.value.length == 0) {
        email.classList.add('glow-error');
        submit = false;
    }
    if (password.value.length == 0) {
        password.classList.add('glow-error');
        submit = false;
    }
    if (_confirm.value.length == 0) {
        _confirm.classList.add('glow-error');
        submit = false;
    }
    if (!valid) {
        password.classList.add('glow-error');
        submit = false;
    }
    if (password.value !== _confirm.value) {
        _confirm.classList.add('glow-error');
        submit = false;
    }   

    const user = {
        first_name: firstName.value,
        last_name: lastName.value,
        email: email.value,
        password: password.value
    }

    if (submit) {
        const ele = document.getElementById('signupError');
        document.getElementById('loader').style.display = 'flex';
        
        // Function to handle sign-up submission
        fetch('/sign_up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)  // USER must be a properly defined JS object
        })
        .then(response => {
            if (!response.ok) {
                console.log('error in !ok');
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);  
            if (data.success) {  // 
                console.log('redirectging to ');
                window.location.replace("/dashboard");
            } else {
                console.log(data)
                ele.textContent = 'Email already exists';
                ele.classList.remove('hidden');
                document.getElementById('loader').style.display = 'none';
            }
        })
        .catch(error => {
            console.error("Error:", error);
            ele.textContent = "Something went wrong: " + error.message;
            ele.classList.remove('hidden');
            document.getElementById('loader').style.display = 'none';
        });
    }
        
}
//make sure do not glow
const inputs = [firstName, lastName, email, password, _confirm];

inputs.forEach(input => {
    input.addEventListener("click", function () {
        input.classList.remove("glow-error");
    });
});


function AfterSubmit() {
    window.location.href = data.redirect;
}