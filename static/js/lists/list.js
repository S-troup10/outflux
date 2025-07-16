//



function openAddListModal() {
  const modal = document.getElementById("add-list-modal");
  const name = document.getElementById("new-list-name");
  const description = document.getElementById("list-description");

  // Reset inputs
  name.value = '';
  description.value = '';

  // Unhide & animate in
  modal.classList.remove("hidden");
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.95)";
  modal.style.transition = "opacity 300ms ease, transform 300ms ease";

  requestAnimationFrame(() => {
    modal.style.opacity = "1";
    modal.style.transform = "scale(1)";
  });
}

function closeAddListModal() {
  const modal = document.getElementById("add-list-modal");

  // Animate out
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.95)";

  // Wait for animation to finish, then hide
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300); // Match the 300ms transition duration
}

async function submitNewList() {
  loader.style.display = 'flex';
  const name = document.getElementById("new-list-name").value.trim();
  const description = document.getElementById("list-description").value.trim();

  if (!name) {
    alert("List name is required");
    return;
  }
  const user_id = USER_DETAILS.id;
  const list_data = { name, description, count: 0, user_id };

  const payload = {
    table: 'lists',
    data: list_data
  };

  try {
    const res = await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const response = await res.json(); // parse response JSON
    console.log(response);
    if (response.success === true || response.success === 1) {
      list_data.id = response.identification;  
      list_data.recipients = [];         // Assign returned ID
      list_headers.push(list_data);           // Add to your frontend list
      renderListsTable();  
      render_ListsTable();                 // Refresh table view
      showToast('List Created Successfully');
    } else {
      console.error(response.error || "Unknown error from server.");
    }
    loader.style.display = 'none';
  } catch (err) {
    console.error("Network or server error:", err);
    loader.style.display = 'none';
  }

  closeAddListModal();
}




const tableBody = document.getElementById('list-table');


// filtering goes here




document.getElementById('reset-filters').addEventListener('click', () => {
  document.getElementById('list-search').value = '';
  document.getElementById('sort-field').value = 'name';
  document.getElementById('sort-dir').value = 'asc';
  document.getElementById('min-count').value = '';
  renderListsTable();
});





function populate_lists() {
  //fetch from server 
  const items_to_add = MAIN_DETAILS.lists;
  items_to_add.forEach(item => {

    list_headers.push(item);
  })

  //finally render
  renderListsTable();

}



//for saving / retiving lists 
//im having an list of dictionays that include ids of lists of emails that have already been retived
//the first time get the ,listr from sever , 
//befire going to fetch from the server seach this list for its id , if the id is present just display that saved list

const list_cache = {};

//for add / edit / delete have a list of changes and lewt server resolve each list
const to_add = [];
const to_update = [];
const to_delete = [];

let current_id;



/**
 * Render the list table, applying current filter UI values.
 * If no argument is passed it defaults to the global `list_headers`.
 * @param {Array<Object>} lists – [{ id, name, count }]
 */
function renderListsTable(lists = list_headers) {
  /* ── 1. Read filter UI values ─────────────────────────── */
  const q          = document.getElementById('list-search').value.trim().toLowerCase();
  const sortField  = document.getElementById('sort-field')?.value || 'name';
  const sortDir    = document.getElementById('sort-dir')?.value   || 'asc';
  const minCount   = parseInt(document.getElementById('min-count')?.value || '0', 10);

  /* ── 2. Apply filters ─────────────────────────────────── */
  let filtered = lists.filter(l =>
       l.name.toLowerCase().includes(q) &&
       l.count >= minCount
  );

  /* ── 3. Sort result ───────────────────────────────────── */
  filtered.sort((a, b) => {
    const valA = sortField === 'name'  ? a.name.toLowerCase() : a.count;
    const valB = sortField === 'name'  ? b.name.toLowerCase() : b.count;
    return (valA > valB ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
  });

  /* ── 4. Render table body ─────────────────────────────── */
  tableBody.innerHTML = '';

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" class="py-6 text-center italic text-gray-500">
          No lists match your filter.
        </td>
      </tr>`;
    return;
  }



  filtered.forEach(list => {
    const row = document.createElement('tr');
    row.className = "hover:bg-gray-700 cursor-pointer list-row group transition-all duration-200 ease-in-out";

    row.onclick = () => list_select_list_row(row, list.id);
    const count = list.count;
row.innerHTML = `
  <td class="py-4 px-6 font-semibold text-gray-100 group-hover:text-white transition-colors duration-200">
    ${list.name}
  </td>
  <td class="py-4 px-6 text-gray-300 group-hover:text-white transition-colors duration-200">
    ${count}
  </td>
`;


    tableBody.appendChild(row);

  });

}

/* Optional: re‑render on any filter change */
['list-search', 'sort-field', 'sort-dir', 'min-count'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => renderListsTable());
});


// Call it once to render initially



let selectedList = null;


function list_select_list_row(row, id) {
  // Highlight selected row
  document.querySelectorAll('.list-row-selected').forEach(r => r.classList.remove('list-row-selected'));
  row.classList.add('list-row-selected');

  const listDetails = list_headers.find(l => l.id === id);
  if (!listDetails) return;


  //set the current id to that 

  //open the side bar
  openEditPanel(id, listDetails);
}

async function fetchEmailsForList(listId) {
  try {
    const res = await fetch('/getEmails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ list_id: listId })
    });

    const data = await res.json();

    if (data.success) {
      list_cache[listId] = data.emails;
      console.log(list_cache);

      return data.emails || [];
    } else {
      console.error("Server error:", data.error || "Unknown error");
      return [];
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}



async function openEditPanel(listId, listDetails) {
  selectedList = listDetails;

  
  // Update static info
  document.getElementById("edit-list-title").textContent = listDetails.name || "Unnamed List";
  document.getElementById("edit-list-description").textContent = listDetails.description || "No description";
  document.getElementById("edit-list-count").textContent = "...";

  // Show panel right away
  document.getElementById("edit-list-overlay").classList.remove("hidden");
  document.getElementById("edit-list-panel").classList.remove("translate-x-full");

  const emailsContainer = document.getElementById("edit-list-emails");

  // Show Tailwind loading spinner
  emailsContainer.innerHTML = `
    <div class="flex justify-center items-center py-8 animate-fade-in">
      <div class="flex flex-col items-center space-y-2 text-gray-400">
        <div class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm">Loading emails...</span>
      </div>
    </div>
  `;

  // Load emails
  let emails;
  if (list_cache[listId]) {
    emails = list_cache[listId];
  } else {
    try {
      emails = await fetchEmailsForList(listId);
      list_cache[listId] = emails; // Cache it
    } catch (err) {
      emailsContainer.innerHTML = `
        <div class="text-red-500 text-center py-4">Failed to load emails.</div>
      `;
      document.getElementById("edit-list-count").textContent = "0";
      return;
    }
  }

  listDetails.emails = emails;
  document.getElementById("edit-list-count").textContent = emails.length;

  // Populate email list
  if (emails.length > 0) {
    emailsContainer.innerHTML = "";
    emails.forEach(email => {
      const flagged = email.flagged || false
      const uniqueId = email.temp || email.id;
      const li = document.createElement("li");
      append_email_element(li, email.name, email.email, email.company, uniqueId, flagged);
    });
  } else {
    emailsContainer.innerHTML = `
      <div class="text-gray-400 text-center py-4">No emails in this list.</div>
    `;
  }
}


function closeEditPanel(dontsave = false) {


  document.querySelectorAll('.list-row-selected').forEach(r => r.classList.remove('list-row-selected'));
  document.getElementById("edit-list-overlay").classList.add("hidden");
  document.getElementById("edit-list-panel").classList.add("translate-x-full");

if (dontsave == false) {

  saveEditedList();
}
  //get the list selected
  //get the list of emails
  //2 lists , update , delete
}





function saveEditedList() {
  // Gather data from dictionaries
  const list_id = selectedList.id;
  const count = updateCount();
  const data = {
    to_add,
    to_update,
    to_delete,
    list_id,
    count
  };
  
  to_add.forEach(item => {
    delete item.id;
  });


  //needd to remove temp in each record
  


  



  if (to_add.length == 0 && to_update.length == 0 && to_delete.length == 0)
  {
    console.log('no data to send to server');
  }
  else {
    console.log(loader);
    
    
    fetch('/save-lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save list changes');
      
      return res.json();
    })
    .then(response => {
      const newIdMap = response.new_id_map;

  for (const [tempId, newId] of Object.entries(newIdMap)) {
    const list = list_cache[data.list_id];
    const entryIndex = list.findIndex(e => e.temp == tempId);

    if (entryIndex !== -1) {
      list[entryIndex].id = newId;
      delete list[entryIndex].temp;
    } else {
      console.warn("Temp ID not found in list_cache:", tempId);
    }
  }

      
      
      
      
    showToast('List Saved Successfully');
  
      to_add.length = 0;
      to_update.length = 0;
      to_delete.length = 0;
      
    })
    .catch(err => {
      ErrorModal(err);
      
    });
  }


  }
  


function add_data(email, name, company) {
  const list_id = selectedList.id;

  //Normalise the email
  const normalisedEmail = email.trim().toLowerCase();

  //Check if that email is already on this list
  const exists = list_cache[list_id]?.some(
    (entry) => entry.email.toLowerCase() === normalisedEmail
  );

  if (exists) {
   
    showToast(`"${email}" is already on this list.`, false);
    return;               //do not add a duplicate
  }

  
  const temp = generateTempId();
  const record = { temp, email: normalisedEmail, name, company, list_id };

  to_add.push(record);
  list_cache[list_id].push(record);

  const li = document.createElement("li");
  append_email_element(li, name, email, company, temp);
}






const email_ele = document.getElementById("new-email");


  function addEntry() {
    //make sure the no emails is hidden
    document.querySelector('.no-email-tag')?.remove();

    const email = email_ele.value.trim();
    const name = document.getElementById("new-name").value.trim();
    const company = document.getElementById("new-company").value.trim();

    if (email.length == 0) {
      email_ele.classList.add('glow-error');
      email_ele.addEventListener('click' , () => {
        email_ele.classList.remove('glow-error');
      })
      return;
    }

    if (!validateEmail(email)) {
      ErrorModal('enter a valid email');
      return;
    }
    //get id
    add_data(email, name, company);
    //upates the 'count field'
    updateCount();
    clearInputs();
  }

  
/**
 * Add / update a row in #edit-list-emails
 * @param {HTMLLIElement} li
 * @param {string}        name
 * @param {string}        email
 * @param {string}        company
 * @param {string}        id
 * @param {boolean}       isFlagged  – true: invalid, false: valid
 * @param {string}        reason     – tooltip if invalid
 */
function append_email_element(
  li,
  name,
  email,
  company,
  id,
  isFlagged = false,
  reason = ''
) {
  const list = document.getElementById('edit-list-emails');

  /* Store the email on the <li> itself so scrollToEmail can query it */
  li.setAttribute('data-email', email);

  li.className = `
    bg-gray-800/90 border border-gray-700 hover:border-purple-600/70
    rounded-md px-3 py-1.5 flex justify-between items-center text-sm group
    transition-all
  `;

  /* Status icon */
  const statusIcon = isFlagged
    ? `<i class="fas fa-exclamation-circle text-rose-400 text-xs" title="${reason || 'Invalid email'}"></i>`
    : `<i class="fas fa-check-circle text-emerald-400 text-xs" title="Valid email"></i>`;

  /* Inline name/company */
  const metaInline = [name, company].filter(Boolean).join(' • ');

  li.innerHTML = `
    <!-- Left: status + email + meta -->
    <div class="flex items-center gap-2 truncate text-xs">
      ${statusIcon}
      <span class="truncate text-white font-medium">
        ${email}
        ${metaInline ? `<span class="text-gray-400 font-normal"> • ${metaInline}</span>` : ''}
      </span>
    </div>

    <!-- Right: action icons -->
    <div class="flex gap-2 items-center opacity-60 group-hover:opacity-100 transition">
      <button onclick="editEntry('${id}', this)" class="text-blue-400 hover:text-yellow-300" title="Edit">
        <i class="fas fa-edit text-xs"></i>
      </button>
      <button onclick="deleteEntry('${id}', this)" class="text-red-400 hover:text-red-300" title="Delete">
        <i class="fas fa-trash-alt text-xs"></i>
      </button>
    </div>
  `;

  list.appendChild(li);
}


  
  function editEntry(id, btnEl) {


    const list_id = selectedList.id;
    
    
    const list = list_cache[list_id];
    if (!list) return console.error("List not found");
    
    const isTempId = typeof id === "string" && id.startsWith("temp-");
    console.log(`is temp ${isTempId}, id : ${id}`);
    console.log(list_cache);
    const record = list.find(item => isTempId ? item.temp == id : item.id == id);
    if (!record) return console.error("Record not found");
  
    const { name, email, company } = record;
  
    const listItem = btnEl.closest("li");
    if (!listItem) return console.error("List item not found");
  
    // Store original HTML safely
    listItem.dataset.original = listItem.innerHTML;
  
    listItem.innerHTML = `
      <div class="w-full space-y-2 text-sm text-gray-300">
        <input type="email" 
               class=" edit-entry-field-email w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
               value="${email}" 
               placeholder="Email" />
  
        <div class="flex gap-2">
          <input type="text" 
                 class=" edit-entry-field-name flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-500"
                 value="${name || ''}" 
                 placeholder="Name (optional)" />
                 
          <input type="text" 
                 class="edit-entry-field-company flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-500"
                 value="${company || ''}" 
                 placeholder="Company (optional)" />
        </div>
  
        <div class="flex justify-end gap-3 pt-2">
          <button onclick="saveEditedEntry('${id}', this)" 
                  class="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded">
            Save
          </button>
          <button onclick="cancelEntryEdit(this)" 
                  class="text-sm px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded">
            Cancel
          </button>
        </div>
      </div>
    `;
  }
  
  function cancelEntryEdit(btnEl) {
    const listItem = btnEl.closest("li");
    const originalHTML = listItem?.dataset.original;
    if (originalHTML) {
      listItem.innerHTML = originalHTML;
    }
  }
  
  function saveEditedEntry(id , element) {


    const list_id = selectedList.id;


    //get field elements
    const listItem = element.closest("li");
    const email = listItem.querySelector(".edit-entry-field-email").value.trim();
    const name = listItem.querySelector(".edit-entry-field-name").value.trim();
    const company = listItem.querySelector(".edit-entry-field-company").value.trim();
    


    if (!validateEmail(email)) {
      ErrorModal('enter a valid email');
      return;
    }
    
    const updated_record = { list_id, email, name, company, id };

    // Dtermine if it's a temp iD or a permanent one
    const isTempId = typeof id === "string" && id.startsWith("temp-");

    // Get the list
    const list = list_cache[list_id];
    if (!list) return console.error("List not found in cache");

    // Find index of the existing record
    const index = list.findIndex(item => isTempId ? item.temp == id : item.id == id);
    if (index === -1) return console.error("Record not found in cache");

    // Update the record
    list[index] = { ...list[index], ...updated_record };


    //check if it is in to add if so just change it in there, if temp then check add 
    // is a [{}, {}, {}]
    
    if (isTempId) {
      //then change it in the to add ELSe add it to the update one
      const index_of_toAdd = to_add.findIndex(item => item.temp === id);
      if (index_of_toAdd === -1) return console.error("Record not found in to add");

      to_add[index_of_toAdd] = { ...list[index_of_toAdd], ...updated_record };
      
    }
    else {
      to_update.push(updated_record);
    }
    

    
    //render the proper one
    //add some confiumation animation here #################################
    append_email_element(listItem, name, email, company, id);

  }

  

  function deleteEntry(id, ele) {
    const list_id = selectedList.id;

    const isTempId = typeof id === "string" && id.startsWith("temp-");
  
    const list = list_cache[list_id];
    if (!list) return console.error("List not found in cache");
  
    // Remove from list_cache
    const indexInCache = list.findIndex(item => isTempId ? item.temp == id : item.id == id);
    if (indexInCache === -1) return console.error("Record not found in list_cache");
    list.splice(indexInCache, 1);
  
    if (isTempId) {
      // Remove from to_add
      const indexInToAdd = to_add.findIndex(item => item.temp == id);
      if (indexInToAdd === -1) return console.error("Record not found in to_add");
      to_add.splice(indexInToAdd, 1);
    } else {
      // Add to to_delete
      if (!to_delete.includes(id)) {
        to_delete.push(id);
      }
    }
  
    // Remove DOM element if provided
    ele.closest('li').remove();
  
    updateCount();
  }
  

  function generateTempId() {
    return 'temp-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  function updateCount() {
    // Count how many <li> elements are inside #edit-list-emails
    const count = document.querySelectorAll("#edit-list-emails > li").length;
  
    // Get the selected list ID
    const list_id = selectedList.id;
  
    // Update the count in the list_headers object
    const header = list_headers.find(l => l.id === list_id);
    if (header) {
     header.count = count;
    } else {
      console.warn(`List header not found for ID ${list_id}`);
    }
    render_ListsTable();
    renderListsTable();
    // Update the UI element showing the count
    document.getElementById("edit-list-count").textContent = count;

    return count;
  }
  

  function clearInputs() {
    document.getElementById("new-email").value = "";
    document.getElementById("new-name").value = "";
    document.getElementById("new-company").value = "";
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  //function to test if an email is valiud


function fill_failed_table(data) {
  const tbody = document.getElementById('fail-table');
  const empty = document.getElementById('fail-empty'); // “No failures” placeholder

  // ── 1. Combine this week + last week into a single array ──
  const failed = [
    ...(data.stats.this_week.failed_events ?? []),
    ...(data.stats.last_week.failed_events ?? [])
  ];

  // ── 2. Early‑out if nothing ──
  if (failed.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  // ── 3. Sort newest first ──
  failed.sort((a, b) => new Date(b.event_time) - new Date(a.event_time));

  // ── 4. Render rows without duplicates ──
  const frag = document.createDocumentFragment();
  const seenEmails = new Set();

  failed.forEach(f => {
    if (!f.failed_email) return; // skip if no email

    const email = f.failed_email;
    if (seenEmails.has(email)) return; // skip duplicates
    seenEmails.add(email);

    const reason = summarizeReason(f.reason) || 'N/A';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/60 transition-colors text-sm text-gray-200';
    tr.addEventListener('click', () => {

      go_to_email(f.list_id, email );
    });
    tr.innerHTML = `
      <td class="px-4 py-2 truncate">${email}</td>
      <td class="px-4 py-2 text-rose-300">${reason}</td>
    `;
    frag.appendChild(tr);
  });

  tbody.innerHTML = ''; // clear previous
  tbody.appendChild(frag); // inject rows
}



function summarizeReason(reason) {
  const reasonsMap = [
    { keywords: ['user', 'unavailable', 'not found', 'no such user'], summary: 'User Not Found' },
    { keywords: ['spam', 'rejected', 'blocked'], summary: 'Rejected as Spam' },
    { keywords: ['mailbox', 'full', 'quota'], summary: 'Mailbox Full' },
    { keywords: ['temporary', 'greylisted', 'try later'], summary: 'Temporary Failure' },
    { keywords: ['invalid', 'address', 'syntax', 'domain'], summary: 'Invalid Address' },
    { keywords: ['policy', 'blocked', 'denied'], summary: 'Blocked by Policy' },
    { keywords: ['connection', 'timeout', 'failed'], summary: 'Connection Failed' },
    { keywords: ['relay', 'denied', 'unauthorized'], summary: 'Relay Denied' },
    { keywords: ['spam detected'], summary: 'Spam Detected' },
  ];

  const reasonLower = reason.toLowerCase();
  for (const entry of reasonsMap) {
    if (entry.keywords.some(keyword => reasonLower.includes(keyword))) {
      return entry.summary;
    }
  }
  // fallback: just shorten the original reason (max 4 words)
  return reason.split(' ').slice(0, 4).join(' ');
}


//take in list id then email : STR to open and go to the email
function go_to_email(list_id, email) {
  const listDetails = list_headers.find(l => l.id === list_id);
  openEditPanel(list_id, listDetails);
  setTimeout(() => {
    scrollToEmail(email);

  }, 300) 
}

function scrollToEmail(email) {
  const list = document.getElementById("edit-list-emails");
  const target = list.querySelector(`[data-email='${email}']`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    target.closest('li').classList.add('subtle-red-indicator');
    target.closest('li').classList.remove('bg-gray-800/90');

  
  }
}
