function clearManualEmails() {
    document.getElementById('manual-email-input').value = '';
}

    function add_list_button() {
      switchScreen('lists');
      setTimeout( () => {openAddListModal();}, 1200);
      
    }

    //start of the list selcition

    function render_ListsTable(filteredLists = list_headers) {
  const tableBody = document.getElementById('lists-table-body');
  tableBody.innerHTML = '';

  if (filteredLists.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-6 text-gray-500">No lists found.</td>
      </tr>
    `;
    return;
  }

  filteredLists.forEach(list => {
    if (list.count > 0) {

      
    const row = document.createElement('tr');
    row.className = `
      list-row group cursor-pointer transition-all duration-200
      hover:bg-gray-800/60 hover:shadow-md hover:ring-1 hover:ring-purple-500/40
    `;
    row.setAttribute('data-id', list.id);
    row.onclick = () => select_list_row(row);

    row.innerHTML = `
      <td class="py-4 px-6 font-semibold text-gray-100 group-hover:text-white">
        <div class="flex items-center gap-2">
      
          <span>${list.name}</span>
        </div>
      </td>
      <td class="py-4 px-6 text-gray-400 group-hover:text-gray-200">${list.count}</td>
    `;

    tableBody.appendChild(row);



    }

  });
}

    
    // Call it once to render initially
    render_ListsTable();
    
//to enable seachring
   document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-lists');
  const tableBody = document.getElementById('lists-table-body');

  searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();

    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const listNameCell = row.querySelector('td:first-child');
      if (listNameCell) {
        const listName = listNameCell.textContent.toLowerCase();
        if (listName.includes(searchTerm)) {
          row.classList.remove('hidden');
          visibleCount++;
        } else {
          row.classList.add('hidden');
        }
      }
    });

    // Check if no rows are visible, show "No lists found"
    const noResultsRowId = 'no-results-row';
    let noResultsRow = document.getElementById(noResultsRowId);

    if (visibleCount === 0) {
      if (!noResultsRow) {
        noResultsRow = document.createElement('tr');
        noResultsRow.id = noResultsRowId;
        noResultsRow.innerHTML = `
          <td colspan="2" class="text-center py-6 text-gray-500">No lists found.</td>
        `;
        tableBody.appendChild(noResultsRow);
      }
    } else {
      if (noResultsRow) {
        noResultsRow.remove();
      }
    }
  });
});


    let selectedListId = [];

    function apply_selected_ids_to_list(selected_id_list) {
      selectedListId.length = 0;
      console.log(selected_id_list);
      selected_id_list.forEach(id => {
        const row = document.querySelector(`.list-row[data-id="${id}"]`);
        console.log(row);
        if (row) {
          select_row(row, id);
        }
      });
    }
    
    

    function select_row(row, id) {
              // Then highlight the selected row
      row.classList.add('row-selected');
      
              
        if (!selectedListId.includes(id)) {
          selectedListId.push(id);
      }
              
    }



    function select_list_row(row) {
      // First, remove highlight from all rows
      const id = parseInt(row.getAttribute('data-id'));
      if (selectedListId.includes(id)) {

        const index = selectedListId.indexOf(id);
    if (index !== -1) {
      selectedListId.splice(index, 1);
    }
        row.classList.remove('row-selected');
      }
      else {
        
        select_row(row, id);
      } 
      console.log(selectedListId);
    }



    //for manual

    let selectedSuggestionIndex = -1;
let currentSuggestions = [];

const emailInput = document.getElementById('email-chip-input');
const chipList = document.getElementById('email-chip-list');
const suggestionsBox = document.getElementById('email-suggestions');
const mirror = document.getElementById('mirror-div');
let _emails = [];

const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com', 'protonmail.com'];

emailInput.addEventListener('input', () => {
  const value = emailInput.value.trim();
  if (value.includes('@')) {
    const [prefix, partial] = value.split('@');
    const suggestions = commonDomains
      .filter(domain => domain.startsWith(partial))
      .map(domain => `${prefix}@${domain}`);
    showSuggestions(suggestions);
  } else {
    hideSuggestions();
  }
});

emailInput.addEventListener('keydown', (e) => {
  if (["Enter", ",", " "].includes(e.key)) {
    e.preventDefault();
    const value = emailInput.value.trim().replace(/[, ]+$/, '');
    if (value && validateEmail(value)) {
      addEmailChip(value);
      emailInput.value = '';
      hideSuggestions();
    }
  }

   if (suggestionsBox.classList.contains('hidden')) return;

  const items = suggestionsBox.querySelectorAll('div');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < currentSuggestions.length) {
      e.preventDefault();
      selectSuggestion(currentSuggestions[selectedSuggestionIndex]);
    }
    return;
  } else {
    return; // let normal typing go through
  }

  // Highlight the selected item
  items.forEach((item, i) => {
    item.classList.toggle('bg-blue-800/40', i === selectedSuggestionIndex);
  });
});

function showSuggestions(suggestions) {
  extractEmails();
  currentSuggestions = suggestions;
  selectedSuggestionIndex = -1;

  suggestionsBox.innerHTML = suggestions
    .map((email, idx) => `
      <div class="px-4 py-2 hover:bg-blue-700/30 cursor-pointer ${idx === 0 ? 'bg-blue-800/40' : ''}" 
           data-index="${idx}"
           onclick="selectSuggestion('${email}')">
        ${email}
      </div>
    `).join('');

  suggestionsBox.classList.remove("hidden");
  positionSuggestionBox();
}


function hideSuggestions() {
  suggestionsBox.classList.add("hidden");
  suggestionsBox.innerHTML = '';
}

function positionSuggestionBox() {
  const rect = emailInput.getBoundingClientRect();
  const containerRect = emailInput.parentElement.getBoundingClientRect();

  // Copy style
  const computed = getComputedStyle(emailInput);
  mirror.style.width = `${rect.width}px`;
  mirror.style.font = computed.font;
  mirror.style.lineHeight = computed.lineHeight;
  mirror.style.padding = computed.padding;
  mirror.style.border = computed.border;
  mirror.style.letterSpacing = computed.letterSpacing;
  mirror.style.textTransform = computed.textTransform;

  const beforeCaret = emailInput.value.substring(0, emailInput.selectionStart);
  mirror.innerHTML = beforeCaret.replace(/\n$/g, '\n\u200b').replace(/\n/g, '<br>') + '<span id="caret-marker">\u200b</span>';

  const caret = document.getElementById('caret-marker');
  const caretRect = caret.getBoundingClientRect();
  const offsetTop = caretRect.bottom - containerRect.top;

  suggestionsBox.style.left = '12px';
  suggestionsBox.style.right = '12px';
  suggestionsBox.style.top = `${offsetTop}px`;
}

function selectSuggestion(email) {
  addEmailChip(email);
  emailInput.value = '';
  hideSuggestions();
}

function addEmailChip(email) {
  if (_emails.includes(email)) return;
  _emails.push(email);

  const chip = document.createElement('div');
  chip.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-800/40 border border-blue-400/30 hover:scale-105 transition';
  chip.innerHTML = `
    <span class="truncate max-w-[210px]">${email}</span>
    <button onclick="removeEmailChip('${email}')" title="Remove" class="ml-1 hover:text-red-300">
      <i class="fas fa-times text-xs"></i>
    </button>
  `;
  chipList.appendChild(chip);
}

function removeEmailChip(email) {
  emails = emails.filter(e => e !== email);
  [...chipList.children].forEach(chip => {
    if (chip.textContent.includes(email)) chip.remove();
  });
}

function clearManualEmails() {
  emails = [];
  chipList.innerHTML = '';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function extractEmails() {
  const list = document.getElementById('email-chip-list');
  const chips = list.querySelectorAll('span');
  let emails = '';
  chips.forEach(chip => {
    emails += chip.innerText + ',';
  });
  console.log(emails);
  //reste the lenghth
 
  return emails;

}

function prefil_chips(string_of_emails) {
  _emails.length = 0;
  const str = String(string_of_emails);
  chipList.innerHTML = '';
  console.log(str);
setTimeout(() => {
 if (typeof str === "string" && str.length > 3) {
    const emailList = str
      .split(',')
      .map(email => email.trim())
      .filter(email => (
        email.length > 0 &&
        email.toLowerCase() !== 'none' &&
        email.toLowerCase() !== 'null' &&
        email.toLowerCase() !== 'undefined'
      ));

    emailList.forEach(email => {
      addEmailChip(email);
    });
  }
}, 10)
 
}


