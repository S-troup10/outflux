const timeModal = document.getElementById("timeModal");
const modalDateText = document.getElementById("modal-date");
const calendarEl = document.getElementById("calendar");
const calendarTitleEl = document.getElementById("calendar-title");
const selectedDatesEl = document.getElementById("selectedDates");
const unselectButton = document.getElementById("unselect-time");

let currentDateForModal = null;

let selectedDates = new Set();
let dateTimes = {};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let isAM = true;

let originalSchedule = []; // From server

let pendingChanges = {
  inserts: [],
  updates: [],
  deletes: []
};

// --- MODAL LOGIC ---



//KEY //////// YYYY-MM-DD|HH|MM|ID


function openTimeModal(key) {

  const date = key.split('|')[0];
  let hour = parseInt(key.split('|')[1], 10);
  const minute = key.split('|')[2].padStart(2, "0");

  console.log('current key', key);
  currentDateForModal = date;
  
  modalDateText.textContent = date;


  
  isAM = hour < 12;
  hour = hour % 12 || 12;

  document.getElementById("selected-hour").textContent = hour.toString().padStart(2, "0");
  document.getElementById("selected-minute").textContent = minute;
  unselectButton.style.opacity = selectedDates.has(key) ? '1' : '0';

  updateAmPmButton();
  timeModal.classList.remove("hidden");
}

function closeTimeModal() {
  timeModal.classList.add("hidden");
  currentDateForModal = null;
}

// --- TIME FUNCTIONS ---

function saveTime() {


  const hourText = document.getElementById("selected-hour").textContent;
  const minute = document.getElementById("selected-minute").textContent;
  let hour = parseInt(hourText);
  if (!currentDateForModal) return;

  // Adjust to 24-hour format
  if (isAM && hour === 12) hour = 0;
  if (!isAM && hour !== 12) hour += 12;

  const new_key = `${currentDateForModal}|${hour}|${minute}`;

  let foundMatch = false;
  let oldValue = null;

  for (const date of selectedDates) {
    if (date.split('|')[0] == currentDateForModal) {
      foundMatch = true;
      oldValue = date;
      break;
    }
  }

  if (foundMatch) {
    selectedDates.delete(oldValue); // remove old value
    selectedDates.add(new_key);     // add new value
    console.log(`Updated entry: replaced ${oldValue} with ${new_key}`);
  } else {
    selectedDates.add(new_key); // just add if no match found
    console.log(`Added new entry: ${new_key}`);
  }

  // Check if the current date was from the original server schedule
  const originalItem = originalSchedule.find(item => {
    const parts = item.split('|');
    return parts[0] === currentDateForModal;
  });

  if (!originalItem) {
    // It's a new insert
    const index = pendingChanges.inserts.findIndex(item => item.split('|')[0] === currentDateForModal);
    const entry = new_key;
    if (index !== -1) pendingChanges.inserts[index] = entry;
    else pendingChanges.inserts.push(entry);
  } else {
    // It's an update
    const originalId = originalItem.split('|')[3];
    const index = pendingChanges.updates.findIndex(item => item.split('|')[0] === currentDateForModal);
    const entry = `${new_key}|${originalId}`;
    if (index !== -1) pendingChanges.updates[index] = entry;
    else pendingChanges.updates.push(entry);

    // Also ensure it's removed from deletes if it was previously marked for deletion
    pendingChanges.deletes = pendingChanges.deletes.filter(id => id !== originalId);
  }

  renderCalendar(currentYear, currentMonth);
  updateSelectedDatesDisplay();
  closeTimeModal();



  changed_schedule = true;
  //here the user clicks save on the time meaning they altered the schedule
}



function unselect_time() {
  if (!currentDateForModal) return;
//check if date align with orignial
  const original = originalSchedule.find(d => d.split('|')[0] === currentDateForModal);

  //delete from seleced dates
  for (const key of Array.from(selectedDates)) {
  if (key.split('|')[0] === currentDateForModal) {
    selectedDates.delete(key);
  }
}

  
if (original) {
  const id = original.split('|')[3];


  //if its not alreay in the to delete  append it 
  if (!pendingChanges.deletes.includes(id)) {
    pendingChanges.deletes.push(id);
  }
}

  pendingChanges.inserts = pendingChanges.inserts.filter(d => d.split('|')[0] !== currentDateForModal);
  pendingChanges.updates = pendingChanges.updates.filter(d => d.split('|')[0] !== currentDateForModal);

  renderCalendar(currentYear, currentMonth);
  updateSelectedDatesDisplay();
  closeTimeModal();
}

function changeHour(amount) {
  const el = document.getElementById("selected-hour");
  let h = parseInt(el.textContent);
  h = (h + amount + 12) % 12 || 12;
  el.textContent = h.toString().padStart(2, "0");
}

function changeMinute(amount) {
  const el = document.getElementById("selected-minute");
  let m = parseInt(el.textContent);
  m = (m + amount + 60) % 60;
  el.textContent = m.toString().padStart(2, "0");
}

function toggleAmPm() {
  isAM = !isAM;
  updateAmPmButton();
}

function updateAmPmButton() {
  document.getElementById("am-pm-button").textContent = isAM ? "AM" : "PM";
}

// --- CALENDAR RENDERING ---
function renderCalendar(year, month) {
  calendarTitleEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  calendarEl.innerHTML = `
    ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => `<div class="font-semibold text-gray-400 text-sm">${day}</div>`).join("")}
  `;

  for (let i = 0; i < firstDay; i++) {
    const spacer = document.createElement("div");
    calendarEl.appendChild(spacer);
  }

  for (let date = 1; date <= lastDate; date++) {
    const d = new Date(year, month, date);
    d.setHours(0, 0, 0, 0);
    const iso = toLocalIsoDate(d);

    const cell = document.createElement("div");
    cell.className = "p-3 rounded-lg text-sm text-center transition";

    if (d < today) {
      cell.classList.add("bg-gray-700", "opacity-30", "cursor-not-allowed", "text-gray-500");
      cell.textContent = date;
    } else {
      const fullKey = Array.from(selectedDates).find(key => key.startsWith(`${iso}|`));

      if (fullKey) {
        const [_, h, m] = fullKey.split('|');
        const time = new Date();
        time.setHours(parseInt(h));
        time.setMinutes(parseInt(m));

        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        cell.classList.add("bg-purple-600", "text-white", "cursor-pointer", "hover:bg-purple-500");
        cell.innerHTML = `<div class="font-bold">${date}</div><div class="text-xs text-gray-200">${timeStr}</div>`;
        cell.onclick = () => openTimeModal(fullKey);
      } else {
        cell.classList.add("bg-gray-700", "hover:bg-gray-600", "text-white", "cursor-pointer");
        cell.textContent = date;
        cell.onclick = () => openTimeModal(`${iso}|00|00`);
      }
    }

    calendarEl.appendChild(cell);
  }
}



function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar(currentYear, currentMonth);
}

// --- DISPLAY / SYNC ---

function updateSelectedDatesDisplay() {
  const dates = Array.from(selectedDates).sort();
  selectedDatesEl.innerHTML = "";

  if (!dates.length) {
    selectedDatesEl.innerHTML = `<div class="text-sm text-gray-500 italic">No dates selected</div>`;
    return;
  }

  selectedDatesEl.className = "mt-6 text-sm text-gray-300 grid grid-cols-4 sm:grid-cols-3 gap-x-6 gap-y-3";

  dates.forEach(key => {
    const [date, hour, minute] = key.split('|');
    const time = `${hour}:${minute}`;
    const div = document.createElement("div");

    div.className = "px-3 py-1 rounded-md bg-gray-700 text-white flex justify-between items-center shadow-sm";
    div.innerHTML = `
      <span>${date} @ ${time}</span>
      <button onclick="openTimeModal('${key}')" class="text-xs text-purple-400 hover:underline">Edit</button>
    `;

    selectedDatesEl.appendChild(div);
  });
}


function toLocalIsoDate(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().split("T")[0];
}




function confirmDates(campaignId) {
  const formatRecord = (entry) => {
    if (typeof entry !== 'string') return null;

    const parts = entry.split('|');
    const [dateStr, hourStr, minuteStr, id] = parts;

    if (!dateStr || !hourStr || !minuteStr) return null;

    const [year, month, day] = dateStr.split('-').map(Number);
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if ([year, month, day, hour, minute].some(isNaN)) return null;

    const dt = new Date(year, month - 1, day, hour, minute);
    if (isNaN(dt.getTime())) return null;

    const formatted = {
      campaign_id: campaignId,
      scheduled_time: `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}:00`,
      status: false
    };

    if (id) {
      formatted.id = id;
    }

    return formatted;
  };

  const inserts = (pendingChanges.inserts || []).map(formatRecord).filter(Boolean);
  const updates = (pendingChanges.updates || []).map(formatRecord).filter(Boolean);
  const deletes = pendingChanges.deletes || [];

  return { inserts, updates, deletes };
}




// baSICALLY how this works is theress a key which is year month day minute second id seperatde by | 
//this can then extracted by .split to get what the fuction needs
function convertKey(key, id) {
  const parts = key.split('|');
  const [year, month, day] = parts[0].split('-');
  const hourStr = parts[1];
  const minuteStr = parts[2];

  return {
    campaign_id: id,
    scheduled_time: `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}:00`,
    status: false
  };
}

function return_server_like_schedule(campaign_id) {
  const list = [];

  for (const key of selectedDates) {
    const record = convertKey(key, campaign_id);
    list.push(record);
  }

  console.log('simon', list);
  return list;
}

//this function the data is gotten in the form from the server , convert to the string , 
function setSelectedDates(schedule) {
  console.log('data into set se;lected', schedule)
  if (typeof schedule === "string") {
    try {
      schedule = schedule;
    } catch (e) {
      console.error("Invalid schedule format:", schedule);
      return;
    }
  }

  if (!Array.isArray(schedule)) return;

  selectedDates.clear();
  originalSchedule = [];

  schedule.forEach(item => {
    const dt = new Date(item.scheduled_time);
    if (isNaN(dt)) return;

    const date =  toLocalIsoDate(dt);

    const hour = dt.getHours().toString().padStart(2, '0');
    const minute = dt.getMinutes().toString().padStart(2, '0');
    const id = item.id;

    const key = `${date}|${hour}|${minute}|${id}`;
    selectedDates.add(key);
    originalSchedule.push(key);
  });

  renderCalendar(currentYear, currentMonth);
  updateSelectedDatesDisplay();
}


function resetScheduleTracking() {
  originalSchedule = Array.from(selectedDates); 
  pendingChanges = { inserts: [], updates: [], deletes: [] };
}


// --- INIT ---

renderCalendar(currentYear, currentMonth);
document.getElementById("hour-increase").addEventListener("click", () => changeHour(1));
document.getElementById("hour-decrease").addEventListener("click", () => changeHour(-1));
document.getElementById("minute-increase").addEventListener("click", () => changeMinute(5));
document.getElementById("minute-decrease").addEventListener("click", () => changeMinute(-5));
document.getElementById("save-time").addEventListener("click", saveTime);
document.getElementById("am-pm-button").addEventListener("click", toggleAmPm);
document.getElementById("unselect-time").addEventListener("click", unselect_time);

// Expose globally
window.setSelectedDates = setSelectedDates;
window.confirmDates = confirmDates;
window.resetScheduleTracking = resetScheduleTracking;
