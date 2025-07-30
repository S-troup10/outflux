
let USER_DETAILS;
let MAIN_DETAILS;
let sent_count = 0;
let list_headers = [

    // id name count
    ];

async function set_main_details(retries = 3, delay = 1000) {
  const campaignList = document.getElementById("campaignList");
  const listTable = document.getElementById("list-table");

  // Loader for campaignList (valid inside a div)
  const campaignLoader = `
    <div id="campaign-loader" class="absolute inset-0 mt-24 flex justify-center items-center z-50 bg-white/80">
      <div class="flex flex-col items-center space-y-2 text-gray-500">
        <div class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm">Loading campaigns...</span>
      </div>
    </div>
  `;

  // Loader for listTable (valid inside tbody)
  const listLoader = `
    <tr id="list-loader">
      <td colspan="100%">
        <div class="w-full flex justify-center items-start py-6 animate-fade-in">
          <div class="flex flex-col items-center space-y-2 text-gray-400">
            <div class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm">Loading lists...</span>
          </div>
        </div>
      </td>
    </tr>
  `;

  // Set initial loaders
  campaignList.innerHTML = campaignLoader;
  listTable.innerHTML = listLoader;

  let attempt = 0;

  while (attempt < retries) {
    try {
      const res = await fetch('/all_data');
      const data = await res.json();

      MAIN_DETAILS = data;
      console.log(MAIN_DETAILS);

      campaignList.innerHTML = "";
      listTable.innerHTML = "";

      setTimeout(() => {
        render_next_send();
      }, 300);

      populate_lists();
      populate_campaigns();
      fillStats(MAIN_DETAILS);

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      sent_count = 0;

      MAIN_DETAILS.stats.sent.forEach(element => {
        const eventTime = new Date(element.event_time).getTime();
        if (eventTime >= oneDayAgo) {
          sent_count++;
        }
      });

      console.log('User has sent', sent_count, 'emails today');
      return; // Success – exit function

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay)); // wait before retry
      } else {
        campaignList.innerHTML = `<div class="text-center text-red-500 mt-12">Failed to load campaigns after ${retries} tries.</div>`;
        listTable.innerHTML = `<tr><td colspan="100%" class="text-center text-red-500 py-6">Failed to load lists.</td></tr>`;
      }
    }
  }
}




window.addEventListener('load', () => {
  set_main_details();
  FillCustomerFields();
});




async function FillCustomerFields(retries = 3, delay = 1000) {
  try {
    const res = await fetch('/session_user');
    if (!res.ok) throw new Error("Fetch failed");
    
    const user = await res.json();
    console.log(user);

    const capitalizedName = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
    document.getElementById("nav-name").textContent = `${capitalizedName} ${user.last_name}` || '';
    document.getElementById("nav-status").textContent = user.subscription;

    USER_DETAILS = user;

    set_connection_status(user.refresh_token);
    fill_setting_fields(USER_DETAILS);
    check_if_new_user(USER_DETAILS);

    document.getElementById('dash-name').innerText = `Welcome Back, ${capitalizedName}`;
    if (user.refresh_token === true) {
      document.getElementById('connect-google').classList.add('hidden');
    }

  } catch (err) {
    console.error("Failed to fetch user session:", err);
    
    if (retries > 0) {
      console.log(`Retrying... (${retries} left)`);
      setTimeout(() => FillCustomerFields(retries - 1, delay), delay);
    } else {
      console.error("Max retries reached. Redirecting to login.");
      window.location.replace("/");
    }
  }
}




    const loader = document.getElementById('loader');

function fill_setting_fields(user) {




  
  document.getElementById('settings-account-first').value = user.first_name;
  document.getElementById('settings-account-second').value = user.last_name ;
  document.getElementById('settings-account-email').value = user.email ;
 
  const date = new Date(user.created_at);
const formatted = date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long'
});


  document.getElementById('settings-joined').innerText = formatted;
  document.getElementById('settings-plan').innerText = user.subscription;


}

function set_connection_status(status) {
  const ele = document.getElementById('connection-space');
  if (status == true) {
    ele.innerHTML = `<div class="relative flex flex-col items-center justify-center text-center space-y-6 h-full px-6 py-12 rounded-2xl bg-gradient-to-b from-[#1a1a2e]/90 to-[#2d1b55]/90 shadow-2xl border border-purple-700 backdrop-blur-md">

  <!-- Glowing Background Halo -->
  <div class="absolute w-80 h-80 bg-purple-600/20 blur-3xl rounded-full animate-pulse -z-10"></div>

  <!-- Tick Icon Circle -->
  <div class="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] bg-[#1e1e2e]">
    <i class="fas fa-check text-green-400 text-3xl"></i>
  </div>

  <!-- Confirmation Text -->
  <div>
    <h2 class="text-3xl font-bold text-purple-100 tracking-wide">Account Connected</h2>
    <p class="text-sm text-purple-300 max-w-xs leading-relaxed mt-2">
      Your email account is successfully linked.<br />
      You're ready to send, schedule, and manage messages securely.
    </p>
  </div>

  <!-- Disconnect Button -->
  <button
    onclick="confirmDisconnect()"
    class="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 underline underline-offset-4 tracking-wide"
  >
    Disconnect
  </button>
</div>


`;
  }
  else {
    ele.innerHTML = `  <div class="flex flex-col justify-between flex-grow bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-xl border border-purple-700/20 space-y-6">  <p class="text-purple-300 max-w-2xl text-sm leading-relaxed">
      Link your account with a trusted provider to enable secure logins, calendar syncing, contact import, and deeper integrations across tools you use.
    </p>
<!-- Google Connect -->
<div class="flex items-center justify-between bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-inner hover:border-blue-500 transition duration-300">
  <div class="flex items-center gap-4">
    <!-- Google Logo -->
<div style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style="width: 20px; height: 20px;">
</div>


    <div>
      <h3 class="text-lg font-semibold text-white">Google</h3>
      <p class="text-sm text-gray-400">Log in with your Google account to access calendar, email, and cloud services.</p>
    </div>
  </div>
  <button onclick="auth_google()" class="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-all duration-300">
    Connect
  </button>
</div>





<div class="text-xs text-gray-500 pt-6 border-t border-gray-700 mt-8">
  These connections are powered by secure OAuth 2.0. You can disconnect any service at any time through your account settings.
</div></div>
`;
  }
}
//
//<!-- Microsoft Connect -->
//<div class="flex items-center justify-between bg-gray-800 border border-gray-700 p-5 rounded-xl shadow-inner hover:border-purple-500 transition duration-300">
//  <div class="flex items-center gap-4">
  //  <!-- Microsoft Logo -->
    //<div style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
 // <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" style="width: 20px; height: 20px;">
//</div>
//    <div>
//      <h3 class="text-lg font-semibold text-white">Microsoft</h3>
//      <p class="text-sm text-gray-400">Connect with your Microsoft account to access Outlook, OneDrive, and more.</p>
  //  </div>
  //</div>
  //<button onclick="auth_microsoft()" class="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-all duration-300">
  //  Connect
  //</button>
//</div>



  let valid = false;

  function check_if_new_user(user) {
    const first = user.first_name?.trim();
    const last = user.last_name?.trim();

    if (!first || !last) {
      openPostGoogleModal();
    }
  }

  function openPostGoogleModal() {
    const modal = document.getElementById('postGoogleModal');
    const content = document.getElementById('postGoogleModalContent');
    modal.classList.remove('hidden');
    setTimeout(() => content.classList.add('opacity-100', 'scale-100'), 10);
  }

  function closePostGoogleModal() {
    const modal = document.getElementById('postGoogleModal');
    const content = document.getElementById('postGoogleModalContent');
    content.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
  }

  function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

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

  function onPasswordChange() {
    const password = document.getElementById('postGooglePassword');
    const confirm = document.getElementById('confirmPassword');
    const relay = document.getElementById('relay');

    const icon = document.getElementById('postGoogleEyeIcon');

    if (password.value.length === 0) {
      icon.style.display = 'none';
      relay.style.display = 'none';
      valid = false;

      return;
    }

    icon.style.display = 'inline';

    if (password.value.length < 8) {
      relay.textContent = 'Password must be 8 characters or longer';
      relay.style.display = 'block';
      valid = false;

    } else if (!/[A-Z]/.test(password.value)) {
      relay.textContent = 'Password must include a capital letter';
      relay.style.display = 'block';
      valid = false;

    } else if (password.value !== confirm.value) {
      relay.textContent = 'Passwords do not match';
      relay.style.display = 'block';
      valid = false;

    } else {
      valid = true;
      relay.style.display = 'none';
      
    }
  }


function submitPostGoogle() {
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const password = document.getElementById('postGooglePassword');
  const failBox = document.getElementById('postGoogleFail');
  const loading = document.getElementById('loader');
  const id = USER_DETAILS.id;

  let submit = true;
  failBox.classList.add('hidden');

  // Validate first name
  if (firstName.value.trim() === '') {
    firstName.classList.add('glow-error');
    submit = false;
  } else {
    firstName.classList.remove('glow-error');
  }

  // Check global "valid" password flag
  if (typeof valid !== 'undefined' && !valid) {
    failBox.textContent = 'Fix the password issues before submitting.';
    failBox.classList.remove('hidden');
    submit = false;
  }

  if (submit) {
    const payload = {
      table: 'users',
      primary_key: 'id',
      data: {
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        password: password.value.trim(),
        id: id
      }
    };

    loading.classList.remove('hidden');

    fetch('/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
      loading.classList.add('hidden');

      if (result.success) {
        closePostGoogleModal();
        showToast('Sign Up Completed');

        // Update USER_DETAILS locally
        USER_DETAILS.first_name = payload.data.first_name;
        USER_DETAILS.last_name = payload.data.last_name;

        // Update UI
        document.getElementById('dash-name').innerText = `Welcome Back, ${payload.data.first_name}`;
        document.getElementById("nav-name").textContent = `${payload.data.first_name} ${payload.data.last_name}`;
        document.getElementById("nav-status").textContent = USER_DETAILS.subscription || '';

        fill_setting_fields(USER_DETAILS);
      } else {
        failBox.textContent = result.message || 'Save failed.';
        failBox.classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error(error);
      failBox.textContent = 'Server error. Try again later.';
      failBox.classList.remove('hidden');
      loading.classList.add('hidden');
    });
  }
}
