
let MAIN_DETAILS;

let list_headers = [

    // id name count
    ];

function set_main_details() {
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
  //so the table is actully made
  listTable.innerHTML = listLoader;

  // Fetch data
  fetch('/all_data')
    .then(res => res.json())
    .then(data => {
      MAIN_DETAILS = data;
      console.log(MAIN_DETAILS);

      // Clear loaders before inserting real content
      campaignList.innerHTML = "";
      listTable.innerHTML = "";
      render_next_send();
      populate_lists();
      populate_campaigns();
      fillStats(MAIN_DETAILS);
    });
}



set_main_details();


let USER_DETAILS;
  function FillCustomerFields() {
    fetch('/session_user')
        .then(res => res.json())
        .then(user => {
          console.log(user);
          document.getElementById("nav-name").textContent = `${user.first_name} ${user.last_name}` || '';
          
            //temporily set this for now
            document.getElementById("nav-status").textContent = 'basic';
            //document.getElementById("nav-status").value = user.last_name || '';
            USER_DETAILS = user;
            set_connection_status(user.refresh_token);
            fill_setting_fields(USER_DETAILS);
            //set the name in the dashboard
            document.getElementById('dash-name').innerText = `Welcome Back, ${user.first_name}`;
            if (user.refresh_token == true) {
              document.getElementById('connect-google').classList.add('hidden');
            }
        }).catch(
          reason => {
            console.log('failed', reason);
            window.location.replace("/");
          }
        );
}



    const loader = document.getElementById('loader');

function fill_setting_fields(user) {
  document.getElementById('settings-account-first').value = user.first_name;
  document.getElementById('settings-account-second').value = user.last_name ;
  document.getElementById('settings-account-email').value = user.email ;
  //document.getElementById('settings-account-pw').value = user. ;
  //document.getElementById('settings-account-cpw').value = user. ;


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