function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const icon = document.getElementById(`toggle-icon-${sectionId}`);

  const isOpen = section.classList.contains('max-h-[9999px]');

  if (isOpen) {
    section.classList.remove('max-h-[9999px]');
    section.classList.add('max-h-0');
    icon.classList.add('rotate-180');
  } else {
    section.classList.remove('max-h-0');
    section.classList.add('max-h-[9999px]');
    icon.classList.remove('rotate-180');
  }
}






const custom_list = document.getElementById('custom_email_template_list');

const custom_templates = [];



function openSaveTemplateModal() {
  const modal = document.getElementById('save-template-modal');
  const content = document.getElementById('save-template-modal-content');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    content.classList.remove('scale-95');
    content.classList.add('scale-100');
  }, 10);
}

function closeSaveTemplateModal() {
  const modal = document.getElementById('save-template-modal');
  const content = document.getElementById('save-template-modal-content');
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  content.classList.remove('scale-100');
  content.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
    document.getElementById('template-title').value = '';
  }, 300);
}

function confirmSaveTemplate() {
  const title = document.getElementById('template-title')
  const title_value = title.value.trim();
  if (!title_value) {
    title.classList.add('glow-error');
    title.addEventListener('click', () => {
        title.classList.remove('glow-error');
    })
    return;
  }

  


  // Call your save function here
  saveTemplateToSupabase(title_value);
  closeSaveTemplateModal();
}

function saveTemplateToSupabase(title) {
  const html = getEmailHtml(); // This should return your built HTML string
  const user_id = USER_DETAILS.id;

  const payload = {
    table: 'templates', // your target Supabase table
    data: {
      title,
      html,
      user_id,
    }
  };

  fetch('/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      showToast('Template saved:');
      // Optionally show a success toast/modal or refresh list
      const id = response.identification;
      custom_templates.push({id: id, html: html, title: title});
      appendCustomCardToGrid(id, title, html, formatDate(new Date().toISOString())
);
      recalculate_template_count();
    //add card

    } else {
        showToast(response.error, false);
      // Show error message to user
    }
  })
  .catch(err => {
    showToast(err, false);
    // Handle unexpected network errors
  });
}

function check_for_no_templates() {
  const grid = document.getElementById('custom_email_template_list');
        if (custom_templates.length == 0) {
        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center text-center py-10 text-gray-400">
  <i class="fas fa-envelope-open-text text-4xl mb-4 text-purple-500"></i>
  <p class="text-lg font-semibold">No templates found</p>
  <p class="text-sm mt-1">You haven’t created any templates yet.</p>
</div>
`
      }
}

function filterCustomTemplates(searchValue) {
  const query = searchValue.trim().toLowerCase();
  const grid = document.getElementById('custom_email_template_list');
  const cards = grid.querySelectorAll('.custom_template');
  let visibleCount = 0;

  cards.forEach(card => {
    const title = card.querySelector('h4')?.textContent?.toLowerCase() || '';
    const matches = title.includes(query);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  // Remove existing no-results message if present
  const existingMsg = document.getElementById('custom_template_empty');
  if (existingMsg) existingMsg.remove();

  // Inject message if no visible cards
  if (visibleCount === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.id = 'custom_template_empty';
    emptyMsg.className = 'col-span-full text-center text-gray-400 py-10';
    emptyMsg.innerHTML = `
      <i class="fas fa-folder-open text-3xl mb-2"></i>
      <p class="text-sm">No matching templates found.</p>
    `;
    grid.appendChild(emptyMsg);
  }
}




function loadTemplates() {
  const payload = {
    table: 'templates',
    args : {user_id : USER_DETAILS.id}
  }


   fetch('/api/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      
    //populate the 
      const data = response.data;
      custom_templates.push(...data);
      const grid = document.getElementById('custom_email_template_list');
      grid.innerHTML = '';
      custom_templates.forEach(ele => {
        appendCustomCardToGrid(ele.id, ele.title, ele.html, formatDate(ele.updated_at));
      })
      recalculate_template_count();
      check_for_no_templates();
    //add card

    } else {
        showToast('templates failed to load', false);
        console.log(response.error);
      // Show error message to user
    }
  })
  .catch(err => {
    showToast('templates failed to load', false);
    console.log(err);
    // Handle unexpected network errors
  });
}

function recalculate_template_count() {
  const count = templates.length + custom_templates.length;
  document.getElementById('template-count').innerText = count;
}



function deleteTemplate(template_id) {
    const data = {
      table: 'templates',
      id : template_id
    }

    fetch('/api/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      
     
      //delete from custom _templates
      const index = custom_templates.findIndex(t => t.id === template_id);
    if (index !== -1) custom_templates.splice(index, 1);


      //remove from dom
    const ele = document.getElementById('custom_email_template_list').querySelector(`[cust-id="${template_id}"]`);
    if (ele) ele.remove();

     check_for_no_templates();
     recalculate_template_count();
      showToast('Template Deleted');

    //add card

    } else {
        showToast(response.error, false);
        console.log(response.error);
      // Show error message to user
    }
  })
  .catch(err => {
    showToast(err, false);
    console.log(err);
    // Handle unexpected network errors
  });
    
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function appendCustomCardToGrid(template_id, title, htmlContent, updated_at) {
  const grid = document.getElementById('custom_email_template_list');
  if (!grid) return;

  const scrollbarStyles = `
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
  `;

  const safeHTML = (scrollbarStyles + htmlContent)
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ');

  const card = document.createElement('div');
  card.className = `custom_template group bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-blue-500/30 
    hover:ring-1 hover:ring-blue-600 transition-all duration-300 overflow-hidden flex flex-col`.trim();
  card.setAttribute('cust-id', template_id);

  card.innerHTML = `
    <!-- Preview Area -->
    <div class="relative w-full h-56 bg-white overflow-hidden border-b border-gray-700 nice-scrollbar">

      <!-- Loader overlay -->
      <div class="loader-overlay absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-white/70 z-10 text-gray-500">
        <div class="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm">Loading...</span>
      </div>

      <iframe 
        srcdoc="${safeHTML}" 
        class="absolute inset-0 w-full h-full"
        sandbox=""
        frameborder="0">
      </iframe>
    </div>

    <!-- Info & Actions -->
    <div class="p-4 bg-gray-950 flex flex-col gap-3 flex-grow">
      <!-- Title & Tools -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <h4 class="text-white font-bold text-base truncate">${title || 'Untitled Template'}</h4>
          <span class="text-xs text-gray-500">updated: ${updated_at || 'Unknown'}</span>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
          <button class="text-gray-500 hover:text-blue-400" title="Delete" onclick="event.stopPropagation(); showConfirmation({
              title: 'Delete This Template?',
              message: 'This action cannot be undone.',
              onConfirm: () => { deleteTemplate(${template_id}) }
            });">
            <i class="fas fa-trash text-sm"></i>
          </button>
          <button class="text-gray-500 hover:text-blue-400" title="Preview" onclick="event.stopPropagation(); display_template_display_modal(${template_id}, true)">
            <i class="fas fa-eye text-sm"></i>
          </button>
        </div>
      </div>

      <!-- CTA -->
      <div class="pt-2 mt-auto">
        <button class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition" onclick="event.stopPropagation(); showConfirmation({
            title: 'Apply This Template',
            message: 'This action will override all content currently in the builder.',
            onConfirm: () => { apply_template('${template_id}', true) }
          });">
          Use Template
        </button>
      </div>
    </div>
  `;

  grid.appendChild(card);

  // Hide loader when iframe finishes loading
  const iframe = card.querySelector('iframe');
  const loader = card.querySelector('.loader-overlay');
  if (iframe && loader) {
    iframe.addEventListener('load', () => {
      loader.style.display = 'none';
    });
  }
}
