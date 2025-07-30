
let changed_schedule;
let templates_opened = false;
let currentEdit = null;
let old_html;


const backButton = document.getElementById('backb');
function openCampaignDetails(campaignCard) {
  console.log(campaignCard);
  //handle template loading here
  if (templates_opened == false) {
    loadTemplates();
    templates_opened = true;
  }
  //set this to check weather schelsue was
  changed_schedule = false;
  currentEdit = campaignCard;

  const campaignList = document.getElementById("campaignList");
  const campaignDetails = document.getElementById("campaignDetails");
  const backButton = document.getElementById("backb");
  const campaignTitle = document.getElementById('detailTitle');
  const titleSection = document.getElementById('back-title-section');

  const filter = document.getElementById('filter');

  // Animate filter out (hide)
  filter.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
  filter.classList.add('opacity-0', 'scale-95', 'pointer-events-none');

  setTimeout(() => {
    filter.classList.add('hidden');
  }, 300);



  // Animate campaign list out
  campaignList.classList.remove('opacity-100', 'scale-100', 'translate-x-0');
  campaignList.classList.add('opacity-0', 'scale-95'); 

  setTimeout(() => {
  campaignList.classList.add('pointer-events-none', 'hidden');

  backButton.classList.remove('opacity-0', 'pointer-events-none');
  backButton.classList.add('opacity-100');
  titleSection.classList.remove('hidden');
  titleSection.classList.add('flex');

  campaignDetails.classList.remove('opacity-0', 'translate-x-10', 'scale-95', 'pointer-events-none');
  campaignDetails.classList.add('opacity-100', 'translate-x-0', 'scale-100');

  campaignTitle.classList.remove('hidden');
  campaignTitle.addEventListener('click', () => title_into_input(campaignTitle));
  }, 301);

  // Animate campaign details in
  

  // Animate back button in


  // Show title section after a slight deli













  // Populate data 
  const isElement = campaignCard instanceof HTMLElement;
  const name = isElement ? campaignCard.getAttribute('data-name') : campaignCard.name;
  const paused = isElement ? campaignCard.getAttribute('data-paused') === 'true' : !!campaignCard.paused;
  const schedule = isElement ? JSON.parse(campaignCard.getAttribute('data-schedule') || '[]') : campaignCard.schedule || [];
  const list_id = isElement ? JSON.parse(campaignCard.getAttribute('data-list_id') || '[]') : campaignCard.list_id || [];
  const subject = isElement ? campaignCard.getAttribute('data-subject') : campaignCard.subject || '';
  const body = isElement ? campaignCard.getAttribute('data-body') : campaignCard.body || '';
  const manual_emails = isElement ? campaignCard.getAttribute('data-manual_emails') : campaignCard.manual_emails || '';
  console.log(manual_emails);

  prefil_chips(manual_emails);

  campaignTitle.textContent = name;
  setSelectedDates(schedule);
  render_ListsTable();
  apply_selected_ids_to_list(list_id);

  document.getElementById('email-subject').value = subject;

  //test for style , if yes then it was from the pro edior

  quill.root.innerHTML = body;
  setEmailHtml(body);

if (/<body[\s\S]*?>[\s\S]*?<\/body>/.test(body)) {
  Toggle_quill(false);
  console.log('returned true, switch to grapes js');
  old_html = getEmailHtml();
}
else {
  Toggle_quill(true);
  old_html = quill.root.innerHTML;
}
  
  


  setTimeout(() => {

    showTab('emailTab');
  }, 350);
}


function backToCampaignList() {
  const details = document.getElementById('campaignDetails');
  const list = document.getElementById('campaignList');
  const backButton = document.getElementById('backb');
  const title = document.getElementById('detailTitle');
  const tabContents = document.querySelectorAll('.tab-content');
  const filter = document.getElementById('filter');
  const titleSection = document.getElementById('back-title-section');

  // Animate campaignDetails out
  details.classList.remove('opacity-100', 'translate-x-0', 'scale-100');
  details.classList.add('opacity-0', 'translate-x-10', 'scale-95');

  // After animation finishes, hide and disable interaction
  setTimeout(() => {
    details.classList.add('pointer-events-none');
  }, 300);



  // Show filter before animation
  filter.classList.remove('hidden', 'pointer-events-none', 'opacity-0', 'scale-95');

  // Force reflow
  void filter.offsetWidth;

  // Animate filter in
  filter.classList.add('opacity-100');


  // Reveal campaignList smoothly
  list.classList.remove('hidden', 'pointer-events-none');
  void list.offsetWidth; // trigger reflow

  list.classList.remove('opacity-0', 'scale-95', 'translate-x-[-10px]');
  list.classList.add('opacity-100', 'scale-100', 'translate-x-0', 'pointer-events-auto');

  // Hide title section
  titleSection.classList.remove('flex');
 
  titleSection.classList.add('opacity-0');
  
    titleSection.classList.add('hidden');
    titleSection.classList.remove('opacity-0');
  

  // Hide back button
  backButton.classList.add('opacity-0', 'pointer-events-none');
  backButton.classList.remove('opacity-100');

  // Hide title
  title.classList.add('hidden');

  // Hide all tab content
  tabContents.forEach(tab => {
    tab.classList.add('hidden', 'opacity-0');
    tab.classList.remove('opacity-100');
  });
}


//function to chnage the title
function title_into_input(ele) {
  const currentText = ele.textContent.trim();

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;


  input.className = ele.className;
  input.classList.remove(
    'bg-gradient-to-r',
    'from-blue-400',
    'to-purple-500',
    'text-transparent',
    'bg-clip-text'
  );


  input.style.background = 'transparent';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.fontSize = '1.5rem'; // roughly text-2xl
  input.style.fontWeight = 'bold';
  input.style.marginLeft = '1rem';
  input.style.color = '#FAF9F6';

  input.addEventListener('blur', () => {
    const newText = input.value.trim() || 'Untitled';
    ele.textContent = newText;

    // Reapply gradient classes
    ele.classList.add(
      'bg-gradient-to-r',
      'from-blue-400',
      'to-purple-500',
      'text-transparent',
      'bg-clip-text'
    );

    input.replaceWith(ele);
  });
 
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
  });

  ele.replaceWith(input);
  input.focus();
}


//code to managhe the editing of campigns including setting an email and determining the list of people to send it to 
function showTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden', 'opacity-0');
    tab.classList.remove('opacity-100');
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.classList.remove('hidden');
    setTimeout(() => {
      selectedTab.classList.add('opacity-100');
    }, 10);
  }

  // Set active tab button style
  document.querySelectorAll('.tab--button').forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(tabId)) {
      btn.classList.add('active-tab');
    } else {
      btn.classList.remove('active-tab');
      btn.classList.add('text-gray-400');
    }
  });

  if (tabId == 'settingsTab') {
    update_summary();
  }
}










//basic edior init


    const quill = new Quill('#email-content-editor', {
      theme: 'snow',
      placeholder: 'Type your email content here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],

          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],

          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],

          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    });
  















function saveEditedCampaign(send_now = false) {
  loader.style.display = 'flex';

  const subject = document.getElementById('email-subject').value;

let body = null;
// if quill 
  if (is_quill == true) {
    body = quill.root.innerHTML;
  }
  else {
    body = getEmailHtml();
  }
  console.log('body : ', body, '|  status :', is_quill);

  //retunms a string of emails else will return a empty string
  const manual_emails = extractEmails();

  const list = selectedListId ? JSON.stringify(selectedListId) : JSON.stringify([]);
  // here check if everything is filled out
  const paused = !(subject.length > 0 && (list.length > 0 || manual_emails.length > 0));


  const id = currentEdit instanceof HTMLElement ? currentEdit.getAttribute('data-id') : currentEdit.id;
  const name = document.getElementById('detailTitle').innerText;
  const user_id = USER_DETAILS.id;

  // Use confirmDates to process the schedule changes
  const schedule = confirmDates(id);

  const campaignData = {
    id,
    name,
    subject,
    body,
    list_id: list,
    manual_emails,
    paused,
    user_id
  };

  //IIIIIIIIIIIIIIIIIIIIIIIIIIIII
  //IMPORATNT I AM TRYING TO CHECK OLD VS NEW DATA TO SEE IF I NEED TO SAVE ANYTHING
  const isElement = currentEdit instanceof HTMLElement;
  const old_name = isElement ? currentEdit.getAttribute('data-name') : currentEdit.name;
  const old_paused = isElement ? currentEdit.getAttribute('data-paused') === 'true' : !!currentEdit.paused;

  const old_list_id = isElement ? currentEdit.getAttribute('data-list_id') || '[]' : currentEdit.list_id || [];
  const old_subject = isElement ? currentEdit.getAttribute('data-subject') : currentEdit.subject || '';
  const old_manual_emails = isElement ? currentEdit.getAttribute('data-manual_emails') : currentEdit.manual_emails || '';





function isChanged(keys, newObj, oldObj) {
  return keys.some(key => {
    const a = newObj[key];
    const b = oldObj[key];
    const changed = Array.isArray(a) && Array.isArray(b)
      ? a.toString() !== b.toString()
      : a !== b;

    if (changed) {
      console.log(`[CHANGED DETECTED] Key: "${key}"`);
      console.log(`→ New:`, a);
      console.log(`→ Old:`, b);
    }

    return changed;
  });
}



const keysToCheck = ['name', 'subject', 'body', 'paused', 'list_id', 'manual_emails'];

const changed = isChanged(keysToCheck, campaignData, {
  name: old_name,
  subject: old_subject,
  body: old_html,
  paused: old_paused,
  list_id: old_list_id,
  manual_emails: old_manual_emails,
  
});


//if data matches old data and schedule remains unchanged then exit without saving
if (changed == false && changed_schedule == false && !send_now) {
  backToCampaignList();
  console.log('leaving without saving');
  loader.style.display = 'none';
  return;
}


  const data_to_server = {
    campaign: campaignData,
    schedule: schedule
  };

  console.log('Sending schedule:', schedule);

  fetch('/api/save_campaign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data_to_server)
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(responseData => {
    if (responseData.success === true) {
      if (currentEdit) {
        currentEdit.setAttribute('data-name', campaignData.name);
        currentEdit.setAttribute('data-subject', campaignData.subject);
        currentEdit.setAttribute('data-body', campaignData.body);
        currentEdit.setAttribute('data-list_id', campaignData.list_id);
        currentEdit.setAttribute('data-paused', campaignData.paused);
        currentEdit.setAttribute('data-manual_emails', campaignData.manual_emails);
        //campaignData.schedule = return_server_like_schedule(id); //here pass in the data in the same vaaion as the servrer
        console.log('sever returniong ', responseData.data);
        campaignData.schedule = responseData.data;
        currentEdit.setAttribute('data-schedule', JSON.stringify(campaignData.schedule));
        resetScheduleTracking();

        currentEdit.innerHTML = generateCampaignCardHTML(campaignData);
        backToCampaignList();
        showToast('Campaign Saved Successfully');
        render_next_send();


        if (send_now === true) {

          showToast('Email Sent Successfully');
        }
        
      }
    } else {
      console.log('Server responded with error:', responseData.error);
    }
    loader.style.display = 'none';
  })
  .catch(error => {
    console.error('Error updating campaign:', error);
    loader.style.display = 'none';
  });
}

// code to instead of having a se3ttings tab when the user fills out all fields in list and email a send button will show up 
//first a function to fill out campain summary

function update_summary() {
  const subject = document.getElementById('email-subject').value;
  const recipients = getRecipientCount(selectedListId, extractEmails());
  document.getElementById('campaign-subject-preview').innerText = subject;

  if (subject.length == 0 || recipients == 0) {
    toggleSectionLock(true, !subject.length == 0, !recipients == 0);

  } else {
    toggleSectionLock(false);
  }


  

  let htmlContent;

  // PREVIEW
  if (!grapesjsEditor.classList.contains('hidden')) {
    htmlContent = getEmailHtml();
  } else {
    htmlContent = quill.root.innerHTML;
  }

  document.getElementById('campaign-recipients-preview').innerText = recipients + ' selected';

  // Wrap content in full HTML doc + scrollbar styles
  const fullHtml = `
    <html>
      <head>
        <style>
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-thumb {
        background-color: #2b7fff;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-track {
        background-color: #1f2937;
      }
      html {
        scrollbar-width: thin;
        scrollbar-color: #2b7fff #1f2937;
      }
      body { margin: 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  document.getElementById('html-preview').src = url;
}

function toggleSectionLock(
  locked,
  subjectFilled = true,
  recipientsFilled = true,
) {
  const googleConnected = USER_DETAILS.refresh_token;
  const withinUsageLimit = isWithinUsageLimit();
  const container = document.getElementById('lock_section');
  if (!container) return;

  let overlay = container.querySelector('.lock-overlay');

  if (locked) {
    let missingItems = [];
    if (!subjectFilled) missingItems.push("Subject");
    if (!recipientsFilled) missingItems.push("Recipient List");

    let issues = '';

    if (missingItems.length) {
      issues += `
        <div class="bg-red-500/10 border border-red-400 text-red-300 px-4 py-2 rounded-lg text-sm w-full">
          Missing: ${missingItems.join(', ')}
        </div>
      `;
    }

    if (!googleConnected) {
      issues += `
        <div class="bg-yellow-500/10 border border-yellow-400 text-yellow-300 px-4 py-2 rounded-lg text-sm w-full space-y-2">
          <p>Google account not connected.</p>
          <button onclick="connectGoogleAccount()" class="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition">
            Connect Account
          </button>
        </div>
      `;
    }

    if (!withinUsageLimit) {
      issues += `
        <div class="bg-blue-500/10 border border-blue-400 text-blue-300 px-4 py-2 rounded-lg text-sm w-full space-y-2">
          <p>Usage limit reached.</p>
          <button onclick="switchScreen('settings'); " class="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
            Upgrade Plan
          </button>
        </div>
      `;
    }

    const lockContent = `
      <div class="bg-slate-800/90 border border-purple-700 rounded-2xl p-6 shadow-2xl max-w-md w-full flex flex-col items-center space-y-6 text-white text-center">
        <div class="bg-purple-700/20 p-6 rounded-full border-4 border-purple-600 shadow-inner">
          <i class="fa-solid fa-lock text-4xl text-purple-400 animate-pulse"></i>
        </div>
        <h2 class="text-xl font-semibold">Section Locked</h2>
        <p class="text-sm text-gray-300">Complete the required steps to continue.</p>
        <div class="w-full space-y-3 text-left">${issues}</div>
        <button onclick="showTab('emailTab')" class="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition">
          Go Back
        </button>
      </div>
    `;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = `
        lock-overlay absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 rounded-2xl pointer-events-auto p-4
      `;
      overlay.innerHTML = lockContent;
      container.appendChild(overlay);
    } else {
      overlay.innerHTML = lockContent;
    }
  } else {
    if (overlay) {
      overlay.remove();
    }
  }
}





function sendCampaignNow() {
  sent_count++;
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  const date = `${year}-${month}-${day}`;
  const new_key = `${date}|${hour}|${minute}`;

  pendingChanges.inserts.push(new_key);
  saveEditedCampaign(true);
  setTimeout(() => {

    showSendingModal();
  }, 300);


}

 function showSendingModal() {
    const modal = document.getElementById("sending-modal");
    const content = document.getElementById("sendingModalContent");
    modal.classList.remove("hidden");
    setTimeout(() => {
      content.classList.remove("opacity-0", "scale-95");
    }, 10);
  }

  function closeSendingModal() {
    const modal = document.getElementById("sending-modal");
    const content = document.getElementById("sendingModalContent");
    content.classList.add("opacity-0", "scale-95");
    setTimeout(() => modal.classList.add("hidden"), 300);
  }
