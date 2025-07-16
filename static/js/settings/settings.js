function switchSettingsTab(tabId) {
  const tabs = document.querySelectorAll('.settings-tab');
  const newActive = document.getElementById(`tab-${tabId}`);

  // Animate tab content
  tabs.forEach(tabEl => {
    if (tabEl === newActive) {
      fadeIn(tabEl);
    } else if (!tabEl.classList.contains('hidden')) {
      fadeOut(tabEl);
    }
  });

  // Highlight the active button
  const buttons = document.querySelectorAll('aside button');
  buttons.forEach(btn => {
    btn.classList.remove(
      'bg-gradient-to-r', 'from-purple-600', 'to-blue-600',
      'shadow-lg', 'shadow-purple-500/30'
    );
  });

  const activeBtn = document.querySelector(`aside button[onclick*="${tabId}"]`);
  if (activeBtn) {
    activeBtn.classList.add(
      'bg-gradient-to-r', 'from-purple-600', 'to-blue-600',
      'shadow-lg', 'shadow-purple-500/30'
    );
  }
}

function fadeIn(element) {
  element.classList.remove('hidden');
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.pointerEvents = 'none';
  element.style.transition = 'none';

  requestAnimationFrame(() => {
    element.style.transition = 'opacity 300ms ease, transform 300ms ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    element.style.pointerEvents = '';
  }, 300);
}

function fadeOut(element) {
  element.style.transition = 'opacity 300ms ease, transform 300ms ease';
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.pointerEvents = 'none';

  const handler = (e) => {
    if (e.propertyName === 'opacity') {
      element.classList.add('hidden');
      element.removeEventListener('transitionend', handler);
      element.style.pointerEvents = '';
    }
  };

  element.addEventListener('transitionend', handler);
}


















function auth_google() {
  window.location.href = '/auth/google';
}

const pwEl   = document.getElementById('settings-account-pw');
const cpwEl  = document.getElementById('settings-account-cpw');







function save_account(buttonElement) {

  const load = document.getElementById('settings-account-loader');
  const fields_ = document.getElementById('settings-all-fields');

  const first  = document.getElementById('settings-account-first');
  const last   = document.getElementById('settings-account-second');
  const email  = document.getElementById('settings-account-email');



  buttonElement.disabled = true;
  buttonElement.classList.add('opacity-50', 'cursor-not-allowed');


  console.log("Saving account...");

  // Re-enable after 5 seconds
  setTimeout(() => {
    buttonElement.disabled = false;
    buttonElement.classList.remove('opacity-50', 'cursor-not-allowed');
  }, 5000);


  const pw     = pwEl.value;
  const cpw    = cpwEl.value;

  const old_first = USER_DETAILS.first_name;
  const old_last  = USER_DETAILS.last_name;
  const old_email = USER_DETAILS.email;

  const record = {};

  // Track if anything is changed
  let hasChanges = false;

  // Compare fields
  if (first.value !== old_first) {
    record.first_name = first.value;
    hasChanges = true;
  }

  if (last.value !== old_last) {
    record.last_name = last.value;
    hasChanges = true;
  }

  if (email.value !== old_email) {
    record.email = email.value;
    hasChanges = true;
  }

  // Password fields filled and valid
  const pwChanged = pw.length > 0 || cpw.length > 0;

  if (pwChanged) {
    // Validate password and match
    removeGlowError(pwEl);
    removeGlowError(cpwEl);

    if (!validatePassword(pw)) {
      pwEl.classList.add('glow-error');
      return;
    }

    if (pw !== cpw) {
      cpwEl.classList.add('glow-error');
      return;
    }

    record.password = pw;
    hasChanges = true;
  }

  // Stop if nothing changed
  if (!hasChanges) {
    console.log('somthing');
    showToast('Account Updated Successfully');

    return;
  }
  //show loader
    load.classList.remove('hidden');
  fields_.classList.add('hidden');
  // Send to server





  console.log("Saving changes:", record);

  //add user id to record
  record.id = USER_DETAILS.id;
  const data_to_server = {
    table: 'users', 
    data: record,
    primary_key: 'id'
  };
  fetch('/update', 
    { method: 'POST', 
      body: JSON.stringify(data_to_server), 
      headers: { 'Content-Type': 'application/json' } 
    })
     .then(res => res.json())
    .then(data => {
      if (data.success === true) {
        showToast('Account Updated Successfully');
        //clear password fields
        pwEl.value = '';
        cpwEl.value = '';
        document.getElementById('password-section')?.classList.add('hidden');
        // Update local values
        USER_DETAILS.first_name = first.value;
        USER_DETAILS.last_name = last.value;
        USER_DETAILS.email = email.value;
      } else {
        showToast(`Failed to update account.  ${data.error}`, false);
      }
            load.classList.add('hidden');
      fields_.classList.remove('hidden');


    }).catch( () => {

      load.classList.add('hidden');
fields_.classList.remove('hidden');
    }
    );


}




function validatePassword(pw) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&    // at least one uppercase
    /[a-z]/.test(pw) &&    // at least one lowercase
    /\d/.test(pw)          // at least one digit
  );
}



document.addEventListener('DOMContentLoaded', () => {
  const password = pwEl
  const confirm =  cpwEl

  const eyeIcon = document.getElementById('eyeIcon');
  const passwordEye = document.getElementById('passwordEye');

  const passwordTick = document.getElementById('passwordTick');
  const passwordX = document.getElementById('passwordX');

  const confirmTick = document.getElementById('confirmTick');
  const confirmX = document.getElementById('confirmX');

  // State for password visibility
  let passwordVisible = false;

  // Toggle password visibility
  passwordEye.addEventListener('click', () => {
    passwordVisible = !passwordVisible;
    password.type = passwordVisible ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
  });

  // Validate password rules










  // Update password icons based on validation
  function updatePasswordIcons() {
    if (password.value.length === 0) {
      passwordEye.style.display = 'none';
      passwordTick.classList.add('hidden');
      passwordX.classList.add('hidden');
    } else {
      passwordEye.style.display = 'flex';

      if (validatePassword(password.value)) {
        passwordTick.classList.remove('hidden');
        passwordX.classList.add('hidden');
      } else {
        passwordTick.classList.add('hidden');
        passwordX.classList.remove('hidden');
      }
    }
  }

  // Update confirm password icons based on match
  function updateConfirmIcons() {
    if (confirm.value.length === 0) {
      confirmTick.classList.add('hidden');
      confirmX.classList.add('hidden');
      return;
    }

    if (confirm.value === password.value && validatePassword(password.value)) {
      confirmTick.classList.remove('hidden');
      confirmX.classList.add('hidden');
    } else {
      confirmTick.classList.add('hidden');
      confirmX.classList.remove('hidden');
    }
  }

  // Event listeners
  password.addEventListener('input', () => {
    updatePasswordIcons();
    updateConfirmIcons();
    updateRelay(password.value);
  });



  confirm.addEventListener('input', updateConfirmIcons);

  // Initialize icons on page load
  updatePasswordIcons();
  updateConfirmIcons();


    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordSection = document.getElementById('settings-password-fields');

  togglePasswordBtn.addEventListener('click', () => {
  passwordSection.classList.toggle('hidden');
  pwEl.value =  '';
  cpwEl.value = '';
    updatePasswordIcons();
    updateConfirmIcons();
    updateRelay('');
  
  togglePasswordBtn.textContent = passwordSection.classList.contains('hidden') ? 'Change Password' : 'Cancel';
});
});


function updateRelay(pw) {
  const relay = document.getElementById('settings-relay');

    //    pw.length >= 8 &&
   //   /[A-Z]/.test(pw) &&    // at least one uppercase
   //   /[a-z]/.test(pw) &&    // at least one lowercase
  //    /\d/.test(pw)   
  //check for length 
  //check for capital
  //check for lower
  //check for number
  if (pw.length == 0 ) {
    relay.style.display = 'none';
  }
  else {
     relay.style.display = 'block';
  }

  if (pw.length <= 8) {
    relay.innerText = 'Must be 8 characters or longer';
  }
  else if (!/[A-Z]/.test(pw)) {
    relay.innerText = 'Must include at least one capital';
  }
  else if (!/[a-z]/.test(pw)) {
    relay.innerHTML = 'Must include at least one lower case'
  }
  else if (!/\d/.test(pw)) {
    relay.innerHTML = 'Must include at least one number';
  }
  else {
    relay.innerHTML = '';
  }
}



function removeGlowError(ele) {
  ele.classList.remove('glow-error');
}








function auth_microsoft() {
  
}

function confirmDisconnect() {
    
    showConfirmation({
      title: "Disconnect",
      message: "This will mean you will not be able to send emails, all scheduled emails will not send unless you connect another account",
      onConfirm: () => {
        disconnect_account()
      }
    });
  }


function disconnect_account() {
  // Confirm disconnect action 
  loader.style.display = 'flex';
  fetch('/disconnect_account', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('Disconnected successfully');
        set_connection_status(false); // update UI to show disconnected
      } else {
        console.error('Failed to disconnect:', data.error || 'Unknown error');
        alert('Failed to disconnect account. Please try again.');
      }
      loader.style.display = 'none';
    })
    .catch(err => {
      console.error('Disconnect failed', err);
      ErrorModal('An error occurred while disconnecting.');
      loader.style.display = 'none';
    });
}





function showAboutContent(type) {
  const about = document.getElementById('aboutContent');
  const terms = document.getElementById('termsContent');
  const aboutBtn = document.getElementById('aboutTabBtn');
  const termsBtn = document.getElementById('termsTabBtn');

  if (type === 'about') {
    about.classList.remove('hidden');
    terms.classList.add('hidden');
    aboutBtn.classList.add('border-purple-500', 'text-purple-400');
    termsBtn.classList.remove('border-purple-500', 'text-purple-400');
  } else {
    about.classList.add('hidden');
    terms.classList.remove('hidden');
    termsBtn.classList.add('border-purple-500', 'text-purple-400');
    aboutBtn.classList.remove('border-purple-500', 'text-purple-400');
  }
}
