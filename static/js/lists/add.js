//tabs 

window.onload = showListTab('manual')
function showListTab(tab) {
    // Hide all tab content
    document.querySelectorAll('.list-tab-content').forEach(tabDiv => tabDiv.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
  
    // Reset all tab buttons
    document.querySelectorAll('.list-tab-button').forEach(btn => {
      btn.classList.remove('border-b-2', 'border-blue-500', 'text-white');
      btn.classList.add('text-gray-400');
    });
  
    // Highlight the active tab button
    const activeBtn = document.getElementById(`tab-button-${tab}`);
    activeBtn.classList.add('border-b-2', 'border-blue-500', 'text-white');
    activeBtn.classList.remove('text-gray-400');
  }
  

  // Detect likely column indexes from headers
function detectColumns(headers) {
    const map = { email: null, name: null, company: null };
    headers.forEach((h, i) => {
      const key = h.trim().toLowerCase();
      if (key.includes('email'))       map.email   = i;
      else if (key.includes('name') && !key.includes('company')) map.name    = i;
      else if (key.includes('company') || key.includes('org'))   map.company = i;
    });
    return map;
  }
  
  // Once user clicks "Upload & Import CSV"
  document.getElementById('csv-upload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result.trim();
      const rows = text.split('\n').map(r =>
        r.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
      );
  
      const headers = rows.shift();
      const detection = detectColumns(headers);
      renderCSVMappingUI(headers, detection, rows);

      document.getElementById('csv-upload').value = '';

    };
    reader.readAsText(file);
  });
  
  
  // Render the mapping UI
  function renderCSVMappingUI(headers, detection, dataRows) {
    const container = document.getElementById('csv-mapping');
    container.innerHTML = '';
  
    // Build a select for each field
    ['email', 'name', 'company'].forEach(field => {
      const div = document.createElement('div');
      div.className = 'flex items-center gap-3';
  
      const label = document.createElement('label');
      label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ':';
      label.className = 'w-24 text-gray-300';
      div.appendChild(label);
  
      const select = document.createElement('select');
      select.id = `csv-${field}-col`;
      select.className = 'flex-1 bg-gray-800 text-white px-3 py-2 rounded';
      headers.forEach((h, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = h || `(Column ${idx+1})`;
        if (detection[field] === idx) opt.selected = true;
        select.appendChild(opt);
      });
      div.appendChild(select);
  
      container.appendChild(div);
    });
  
    // Add a confirm button
    const btn = document.createElement('button');
    btn.textContent = 'Confirm & Import';
    btn.className = 'mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded';
    btn.onclick = () => finalizeCSVImport(dataRows);
    container.appendChild(btn);
  }
  
  // After user confirms mapping, read rows into your list
  function finalizeCSVImport(rows) {
    // read mapping
    const eIdx = +document.getElementById('csv-email-col').value;
    const nIdx = +document.getElementById('csv-name-col').value;
    const cIdx = +document.getElementById('csv-company-col').value;
  
    // convert each row into your entry format and add it
    let num = 0;
    rows.forEach(cells => {
      const email   = cells[eIdx] || '';
      const name    = cells[nIdx] || '';
      const company = cells[cIdx] || '';
      num = num + 1;
      if (validateEmail(email)) {
        add_data(email, name, company); // reuse your addEntry logic
      }
      else {
        console.warn('email was not valid: ', num);
      }
    });
    updateCount();
    // clear mapping UI
    document.getElementById('csv-mapping').innerHTML = '';
  }
  
  
  function confirmDeleteList() {
    const id = selectedList.id
    showConfirmation({
      title: "Delete List",
      message: "This will permanently delete the list and all associated emails. Are you sure you want to proceed?",
      onConfirm: () => {
        deleteList(id);
      }
    });
  }
  
  function deleteList(id) {
    //delete from server
    //then if sucessfull delte from the frontend
    fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ table: 'lists', id: id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {

        //HERE delte from header , list cashe
        list_headers = list_headers.filter(item => item.id !== id);
        closeEditPanel(true);
        //render both tables
        renderListsTable();
        render_ListsTable();
        

        showToast('Deleted Successfully');
      } else {
        ErrorModal("Error: " + data.error);
      }
    });
    
  }

  function filterEmails(query) {
  const q = query.trim().toLowerCase();
  const list = document.getElementById('edit-list-emails');
  const rows = list.querySelectorAll('li');

  let visibleCount = 0;

  rows.forEach(li => {
    const email = (li.getAttribute('data-email') || '').toLowerCase();
    const show  = !q || email.includes(q);
    li.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  /* ── handle the "no-results" placeholder ── */
  let placeholder = document.getElementById('email-no-results');

  if (visibleCount === 0) {
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = 'email-no-results';
      placeholder.className =
        'text-center text-gray-400 text-sm py-6 italic';
      list.appendChild(placeholder);
    }
    placeholder.textContent = `No results for “${query.trim()}”`;
  } else if (placeholder) {
    placeholder.remove();
  }
}


  