function add_new_campaign(data) {
    
    const campaignList = document.getElementById('campaignList');
   
    const campaignCard = document.createElement('div');
    campaignCard.className = `relative w-80 rounded-3xl overflow-hidden
         bg-gray-900 text-white p-6 shadow-2xl
         ring-1 ring-purple-800/40 hover:ring-purple-500/60
         transition-all duration-300 group space-y-5`;
  
    // Save extra data using data attributes
    campaignCard.setAttribute('data-list_id', data.list_id);
    campaignCard.setAttribute('data-name', data.name);
    campaignCard.setAttribute('data-subject', data.subject);
    campaignCard.setAttribute('data-body', data.body);
    campaignCard.setAttribute('data-email', data.email);
    campaignCard.setAttribute('data-schedule', JSON.stringify(data.schedule));
    campaignCard.setAttribute('data-paused', data.paused);
    campaignCard.setAttribute('data-id', data.id);
    campaignCard.setAttribute('data-manual_emails', data.manual_emails);
  
    campaignCard.onclick = function () {
      openCampaignDetails(campaignCard);
    };
    
    

    campaignCard.innerHTML = generateCampaignCardHTML(data); // <<== Here!
  
    const ele = campaignList.appendChild(campaignCard);
    return ele;
  }
  

//fetch data from the serever

function populate_campaigns() {

            if (Array.isArray(MAIN_DETAILS.campaigns)) {

              if (MAIN_DETAILS.campaigns.length == 0) {
                console.log(MAIN_DETAILS.campaigns);
                
                display_no_campaign_message();
                

              }
                // Proceed with adding campaigns if data is an array
                
                MAIN_DETAILS.campaigns.forEach(element => {
                   
                    add_new_campaign(element);
                });
                
            } else {
                console.error('Expected an array, but received:', MAIN_DETAILS.campaigns);
            }
}


function display_no_campaign_message() {
  const campaignList = document.getElementById('campaignList');
                campaignList.innerHTML = ''; 
                const message = document.createElement('div');
                message.id = 'msg';
                message.className = 'col-span-full w-full flex justify-center items-center py-16';
              
                message.innerHTML = `
                  <div class="text-center text-gray-400">
                    <h2 class="text-xl font-semibold mb-2">No Campaigns Found</h2>
                    <p class="text-sm">You haven’t created any campaigns yet. Click the + button to get started.</p>
                  </div>
                `;
              
                campaignList.appendChild(message);
}


function generateCampaignCardHTML(data) {
//make the cards

  const status = data.paused ? 'Paused' : 'Running';
  const colour = status === 'Paused' ? 'bg-orange-400 text-white' : 'bg-green-500 text-white';

  let dates = data.schedule;

 

  let nextDateDisplay = "No upcoming date"; // Default value
  console.log(dates)
  // Check if there are dates available
  if (dates.length > 0) {
    // Sort the dates array
    dates.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
  
    nextDate = dates[0];
    
    // Get the next date (first in the sorted list)

// Create a Date object using individual parts
    const dateObj = new Date(nextDate.scheduled_time);

    nextDateDisplay = dateObj.toLocaleString(undefined, {
      weekday: 'short', // Short weekday 
      month: 'short',   // Short month 
      day: 'numeric',   // Numeric day 
      hour: '2-digit',  // Two-digit hour
      minute: '2-digit' // Two-digit minute 
    }); // Example output  - Tue, Apr 29, 9:00 AM
  } else {
    
  }
  
  const list_ids = JSON.parse(data.list_id);

  const total_count = getRecipientCount(list_ids, data.manual_emails);


const recipientsCount = total_count; 


 


//html for the card
return `
<!-- ░░ CAMPAIGN CARD v2 ░░ -->
<!-- ░░ HYPER CAMPAIGN CARD ░░ -->


  <!-- Accent strip -->
  <div class="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600"></div>

  <!-- Card Header -->
  <div class="flex justify-between items-start">
    <!-- Name -->
    <h2 class="flex items-center gap-2 font-semibold truncate max-w-[10rem]">
      <i class="fas fa-bullhorn text-blue-400 text-lg"></i>
      <span class="truncate">${data.name}</span>
    </h2>

    <!-- Status -->
    <span
      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide
             ${status === 'Paused'
               ? 'bg-rose-800/40 text-rose-300 ring-1 ring-rose-600/40'
               : 'bg-emerald-800/40 text-emerald-300 ring-1 ring-emerald-600/40'}">
      <i class="fas ${status === 'Paused' ? 'fa-pause-circle' : 'fa-play-circle'} text-[10px]"></i>
      ${status !== 'Paused' ? 'Complete' : 'Incomplete'}
    </span>
  </div>

  <!-- Info Grid -->
  <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
    <div class="flex items-start gap-2">
      <i class="fas fa-calendar-alt text-purple-400"></i>
      <div class="leading-tight">
        <p class="uppercase tracking-wide text-[10px] text-gray-400">Next Send</p>
        <p class="text-sm font-medium text-gray-100">${nextDateDisplay || '—'}</p>
      </div>
    </div>

    <div class="flex items-start gap-2">
      <i class="fas fa-users text-blue-400"></i>
      <div class="leading-tight">
        <p class="uppercase tracking-wide text-[10px] text-gray-400">Recipients</p>
        <p class="text-sm font-medium text-gray-100">${recipientsCount.toLocaleString()}</p>
      </div>
    </div>

    <div class="col-span-2 flex items-start gap-2 pt-1 border-t border-gray-800">
      <i class="fas ${status === 'Paused' ? 'fa-history text-rose-400' : 'fa-clock text-emerald-400'}"></i>
      <p class="leading-tight">
        <span class="block uppercase tracking-wide text-[10px] text-gray-400">
          Status Detail
        </span>
        <span class="text-xs">
          ${status === 'Paused'
            ? 'Campaign is not completed; finish editing to enable sending.'
            : 'Campaign is completed and will auto‑send on schedule.'}
        </span>
      </p>
    </div>
  </div>

  <!-- Decorative Meter -->
  <div class="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
    <div
      class="h-full w-full origin-left scale-x-100 
             ${status === 'Paused' ? 'bg-rose-600/70' : 'bg-emerald-600/70'}">
    </div>
  </div>

  <!-- Action Row -->
  <div class="flex justify-end gap-4 text-xs text-blue-400">
    <button class="hover:text-blue-300 transition"
            onclick="viewCampaign('${data.id}')">
      Details <i class="fas fa-chevron-right text-[10px]"></i>
    </button>
  </div>


`;


}

// search the list ids to get total count
function getRecipientCount(list_ids, manual_emails) {
  let final_total = 0;

  if (Array.isArray(list_ids) && Array.isArray(list_headers) && list_headers.length > 0) {
    final_total = list_ids.reduce((total, rawId) => {
      const id = parseInt(rawId);
      if (isNaN(id)) return total;

      const list = list_headers.find(header => parseInt(header.id) === id);
      return total + (list?.count || 0);
    }, 0);
  }

  let manual_count = 0;
  if (typeof manual_emails === 'string') {
    const manual_email_list = manual_emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    manual_count += manual_email_list.length;
  }

  return final_total + manual_count;
}








