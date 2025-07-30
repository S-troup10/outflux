
//functions from the buttons on the dashboard
function update_settings(tab) {
    switchScreen('settings');
    switchSettingsTab(tab);
}

function create_new_list() {
    switchScreen('lists');
    openAddListModal();

}

function create_new_campagin() {
    switchScreen('campaigns');
    openCampaignModal();
}



function find_next_send() {
  
  const campaigns = MAIN_DETAILS.campaigns;
  let nextSend = null;

  

  for (const campaign of campaigns) {
    if (!Array.isArray(campaign.schedule)) continue;

    for (const item of campaign.schedule) {
      const scheduledTime = new Date(item.scheduled_time);
      const now = new Date();

      if (isNaN(scheduledTime.getTime())) continue; // skip invalid dates
      if (scheduledTime < now) continue; // skip past events

      
      const manual_emails = campaign.manual_emails;

      // Update if it's the first valid one, or earlier than current
      if (!nextSend || scheduledTime < new Date(nextSend.scheduled_time)) {
        nextSend = {
          ...item,
          campaign_name: campaign.name,
          campaign_id: campaign.id || '–',
          status: 'Scheduled',
          list_id: campaign.list_id,
          scheduled_time: item.scheduled_time, // make sure this exists
          manual_emails,

        };
      }
    }
  }

  return nextSend;
}

let current_rendered_date;
// d is the new date that was just saved in campaigns 
// if it is sooner than the rendered next send replace it
function render_next_send(d = null) {

    if (d != null) {

    }
  const data = find_next_send();
  console.log('data: ', data);
  if (!data) return;

  // Convert list_id string to array of IDs
  let list_ids = [];
  try {
    list_ids = JSON.parse(data.list_id);
  } catch (e) {
    console.warn("Could not parse list_id:", data.list_id);
  }

  // Calculate total recipients
  let total_count = 0;
  for (const id of list_ids) {
    const list = MAIN_DETAILS.lists.find(l => l.id === id);
    if (list) total_count += list.count;      
  }
  
  const manual = data.manual_emails;
    const man_count = manual
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
      .length;
  total_count += man_count;

  document.getElementById('ns-campaign').textContent = data.campaign_name;
  document.getElementById('ns-scheduled').textContent = new Date(data.scheduled_time).toLocaleString('en-AU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  document.getElementById('ns-recipients').textContent = total_count || '-';
  document.getElementById('ns-status').textContent = data.status;

  document.getElementById('ns-button').onclick = () => {
    openCampaignByID(data.campaign_id);
  };
}


function openCampaignByID(id) {
    switchScreen('campaigns');
    //wait for the screen to swsitch
    setTimeout(() => {
        //to open the details query the campagin list for the data-id == id

        const card = document.getElementById('campaignList').querySelector(`[data-id="${id}"]`);
        openCampaignDetails(card);
    }, 300);
}