function fillStats(data) {
  fill_failed_table(data);
  //set the current time 
  const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');  // months are zero-based
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');

const formatted = `${year}-${month}-${day} ${hours}:${minutes}`;

document.getElementById('an-lastSync').innerText = formatted;

renderCampaignStats(data.campaigns, data.stats.campaigns );

  const stats = data.stats;

  /* ───── Current‑week raw counts ───── */
  const sent               = stats.this_week.total_emails_sent      || 0;
  const total_failed       = stats.this_week.total_failed           || 0;
  const recipients         = stats.this_week.total_recipients       || 0;
  const individuals_failed = stats.this_week.failed_events?.length  || 0;
  const failed             = total_failed - individuals_failed;

  /* Deliverability rate (%) */
  const deliveredRate =
        recipients ? ((recipients - individuals_failed) / recipients) * 100 : 0;
  



  /* ───── Previous‑week raw counts ───── */
  const prev_sent               = stats.last_week.total_emails_sent     || 0;
  const prev_total_failed       = stats.last_week.total_failed          || 0;
  const prev_recipients         = stats.last_week.total_recipients      || 0;
  const prev_individuals_failed = stats.last_week.failed_events?.length || 0;
  const prev_failed             = prev_total_failed - prev_individuals_failed;

  /* Previous deliverability rate (%) */
  const prev_deliveredRate =
        prev_recipients ? ((prev_recipients - prev_individuals_failed) /
                           prev_recipients) * 100 : 0;

  /* ───── Helpers ───── */
  const atLeastOne = n => n || 1;
  const pct        = (curr, prev) =>
      Math.round(((curr - prev) / atLeastOne(prev)) * 1000) / 10;  // 1 decimal
  const cap        = v => Math.min(100, v);

  //cap each percentage to 500%
  const perc_cap        = v => Math.max(-500, Math.min(500, v));

  /* ───── Percentage deltas ───── */
  const sentPct        = perc_cap(pct(sent,               prev_sent));
  const deliveredPct   = perc_cap(Math.round((deliveredRate - prev_deliveredRate) * 10) / 10);
  const failedPct      = perc_cap(pct(failed,             prev_failed));
  const recipientsPct  = perc_cap(pct(recipients,         prev_recipients));
  const indivFailPct   = perc_cap(pct(individuals_failed, prev_individuals_failed));

  /* ───── Fill numbers & delta badges ───── */
  const num   = (id, val)  => (document.getElementById(id).textContent = val);
  const delta = (id, pct)  =>
      (document.getElementById(id).textContent =
        (pct >= 0 ? '+' : '‑') + Math.abs(pct) + '%');

  num('an_sent',        sent);
  num('an-delivered',   deliveredRate.toFixed(1) + '%');        // ← now a %
  num('an-failed',      failed);
  num('an-recipients',  recipients);
  num('an-bounces',     individuals_failed);

  delta('an-sent_percent',       sentPct);
  delta('an-delivered_percent',  deliveredPct);
  delta('an-failed-percent',     failedPct);
  delta('an-recipients_percent', recipientsPct);
  delta('an-bounces_percent',    indivFailPct);

  /* ───── Progress bars (all capped ≤ 100 %) ───── */
  const totalAttempts = sent + failed;
  const barWidths = {
    sent:       cap(totalAttempts ? (sent        / totalAttempts) * 100 : 0),
    delivered:  cap(deliveredRate),                     // ← use the rate itself
    failed:     cap(totalAttempts ? (failed      / totalAttempts) * 100 : 0),
    recipients: cap(sent          ? (recipients  / sent)          * 100 : 0),
    bounces:    cap(recipients    ? (individuals_failed / recipients) * 100 : 0)
  };

  const setBar = (numId, pct) =>
    document
      .getElementById(numId)          // <p id="…">
      .parentElement                  // card body
      .querySelector('.mt-4 > div') 
      .style.width = pct + '%';

  setBar('an_sent',       barWidths.sent);
  setBar('an-delivered',  barWidths.delivered);
  setBar('an-failed',     barWidths.failed);
  setBar('an-recipients', barWidths.recipients);
  setBar('an-bounces',    barWidths.bounces);

  //parse and sort sent data
  const sent_data = stats.sent;
  renderSentOverTime(sent_data);
  



  renderDeliverPie((recipients - individuals_failed), individuals_failed)
  renderScheduleTable(stats.schedule, data.campaigns);
}






//the table will be the last sends?
//or could be the last email events

let fullScheduleData = [];

function renderScheduleTable(records = [], campaigns = {}) {
  const tbody = document.getElementById('schedule-body');
  const empty = document.getElementById('schedule-empty');
  const searchInput = document.getElementById('search-schedule');
  const statusSelect = document.getElementById('status-filter');


  const campaignLookup = Object.fromEntries(campaigns.map(c => [c.id, c]));

// inside render loop

  // Store for filters

  console.log('camp', campaigns);
  fullScheduleData = records.map(r => ({
    ...r,
    campaign_name: campaignLookup[r.campaign_id]
    ? campaignLookup[r.campaign_id].name
    : `#${r.campaign_id}`

  }));

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusSelect.value;

    let filtered = fullScheduleData.filter(r => {
      const matchesName = r.campaign_name.toLowerCase().includes(query);
      const matchesStatus = status === "" || String(r.status) === status;
      return matchesName && matchesStatus;
    });

    tbody.innerHTML = '';
    if (filtered.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    filtered
      .sort((a, b) => {
        if (a.status !== b.status) return a.status ? 1 : -1;
        return new Date(a.scheduled_time) - new Date(b.scheduled_time);
      })
      .forEach(r => {
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-800/60 transition-colors text-gray-200";

        const badge = r.status
          ? `<span class="inline-flex items-center gap-1 bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded text-xs font-semibold"><i class="fas fa-paper-plane"></i> Sent</span>`
          : `<span class="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs font-semibold"><i class="fas fa-hourglass-half"></i> Upcoming</span>`;

        row.innerHTML = `
          <td class="px-6 py-3 whitespace-nowrap">${r.campaign_name}</td>
          <td class="px-6 py-3 font-mono">${dayjs(r.scheduled_time).format("YYYY-MM-DD HH:mm")}</td>
          <td class="px-6 py-3">${badge}</td>
        `;
        tbody.appendChild(row);
      });
  }

  // Attach listeners only once
  if (!searchInput.dataset.bound) {
    searchInput.dataset.bound = true;
    searchInput.addEventListener("input", applyFilters);
    statusSelect.addEventListener("change", applyFilters);
  }

  applyFilters(); // Initial render
}

// EXAMPLE USAGE
// const campaigns = { 59: { id: 59, name: "Promo A" }, 60: { id: 60, name: "Event X" } };
// const records = [
//   { campaign_id: 59, scheduled_time: "2025-07-04T10:00", status: true },
//   { campaign_id: 60, scheduled_time: "2025-07-05T12:30", status: false }
// ];
// renderScheduleTable(records, campaigns);

function fill_table() {

}





//stats for each camogin
function renderCampaignStats(campaigns, campaignStats) {
  const container = document.getElementById('campaignStatsContainer');
  container.innerHTML = ''; // Clear container

  Object.values(campaigns).forEach(campaign => {
    const id = campaign.id;
    const stats = campaignStats[id];
    if (!stats) return;

    const thisW = stats.this_week;
    const lastW = stats.last_week;

    // Delivered rates (percent strings)
    const deliveredRateThis = thisW.total_recipients
      ? (((thisW.total_recipients - thisW.total_failed) / thisW.total_recipients) * 100).toFixed(1)
      : '0.0';
    const deliveredRateLast = lastW.total_recipients
      ? (((lastW.total_recipients - lastW.total_failed) / lastW.total_recipients) * 100).toFixed(1)
      : '0.0';

    // Status and schedule info
    const name = campaign.name || 'no name';
    const subject = campaign.subject || 'No subject';
    const paused = campaign.paused ? true : false;
    const scheduleCount = campaign.schedule?.length || 0;
    const bodyHTML = campaign.body || 'no preview';

    // Progress bar values for "This Week"
    const totalEvents = thisW.total_emails_sent + thisW.total_failed;
    const sentPercent = totalEvents > 0 ? Math.round((thisW.total_emails_sent / totalEvents) * 100) : 0;
    const failPercent = totalEvents > 0 ? Math.round((thisW.total_failed / totalEvents) * 100) : 0;
    const deliveredPercent = parseFloat(deliveredRateThis);

    const html = `
    <article
      id="card-${id}"
      class="bg-gray-900 border border-blue-500 rounded-xl shadow-lg mb-8 select-none transition-shadow hover:shadow-blue-600"
      aria-expanded="false"
    >
     <!-- ────── COLLAPSIBLE CAMPAIGN HEADER ────── -->
<!-- ────── COLLAPSIBLE CAMPAIGN HEADER (variables: id, subject, paused, scheduleCount, deliveredPercent, thisW, lastW) ────── -->









<header
  id="btn-${id}"
  role="button"
  aria-controls="stats-${id}"
  aria-expanded="false"
  tabindex="0"
  class="flex justify-between items-center px-6 py-6 bg-gradient-to-r from-blue-900/60 via-blue-800/40 to-blue-900/60
         cursor-pointer rounded-t-xl transition-all duration-300
         hover:bg-blue-900/50 "
  onclick="toggleStats('${id}')"
  onkeydown="if(event.key==='Enter'||event.key===' ') toggleStats('${id}')"
>
  <!-- LEFT SIDE -->
  <div class="flex items-start gap-4">
    <!-- Icon -->
    <div class="flex items-center justify-center w-10 h-10 bg-blue-800 rounded-full shadow-inner">
      <i class="fas fa-envelope text-blue-300 text-lg"></i>
    </div>

    <!-- Text content -->
    <div>
      <h2 class="text-xl font-extrabold text-white tracking-wide mb-0.5">
        ${name}
      </h2>

      <!-- Stats preview -->
      <div class="flex flex-wrap gap-4 text-xs text-blue-200 mt-1 font-mono">
        <div class="flex items-center gap-1">
          <i class="fas fa-users text-blue-400"></i>
          Recipients: <span class="font-semibold">${thisW.total_recipients}</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="fas fa-paper-plane text-blue-400"></i>
          Sent: <span class="font-semibold">${thisW.total_emails_sent}</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="fas fa-check-circle text-blue-400"></i>
          Delivered: <span class="font-semibold">${deliveredPercent}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT SIDE: Chevron -->
  <i
    id="icon-${id}"
    class="fas fa-chevron-down text-blue-400 text-xl transition-transform duration-300"
  ></i>
</header>






<section
  id="stats-${id}"
  class="hidden bg-gray-900 px-6 py-8 rounded-b-xl border-t border-blue-700/70"
>
  <div class="grid gap-6 sm:grid-cols-3 text-gray-300 font-mono">

    <!-- ────── THIS WEEK ────── -->
    <div class="space-y-4 p-5 rounded-xl bg-blue-950/60 shadow-lg ring-1 ring-blue-800/50">

      <h3 class="flex items-center gap-2 text-blue-400 uppercase text-[11px] font-semibold tracking-widest">
        <i class="fas fa-calendar-week text-blue-300"></i> This Week
      </h3>

      <p class="text-4xl font-extrabold text-white">${thisW.total_emails_sent}</p>
      <p class="text-xs text-blue-200">Emails Sent</p>

      <div class="grid grid-cols-2 gap-y-2 text-xs mt-2">
        <div class="flex items-center gap-1 text-blue-300">
          <i class="fas fa-users"></i> Recipients
        </div>
        <div class="text-right font-semibold text-white">${thisW.total_recipients}</div>

        <div class="flex items-center gap-1 text-green-400">
          <i class="fas fa-check-circle"></i> Delivered
        </div>
        <div class="text-right font-semibold text-white">${deliveredRateThis}%</div>

        <div class="flex items-center gap-1 text-red-400">
          <i class="fas fa-times-circle"></i> Failed
        </div>
        <div class="text-right font-semibold text-white">${thisW.total_failed}</div>
      </div>

      <!-- Sent vs Failed bar -->
      <div class="mt-4">
        <p class="text-[10px] uppercase tracking-widest text-blue-200 mb-1">Sent vs Failed</p>
        <div class="relative w-full h-2.5 bg-blue-800 rounded-full overflow-hidden">
          <div style="width:${sentPercent}%"
               class="absolute inset-y-0 left-0 bg-blue-500 rounded-l-full shadow-md"></div>
          <div style="width:${failPercent}%"
               class="absolute inset-y-0 right-0 bg-red-500 rounded-r-full shadow-md"></div>
        </div>
      </div>

      <!-- Deliverability bar -->
      <div>
        <p class="text-[10px] uppercase tracking-widest text-blue-200 mb-1">Deliverability</p>
        <div class="w-full h-2.5 bg-blue-800 rounded-full overflow-hidden shadow-inner">
          <div style="width:${deliveredPercent}%" 
               class="h-2.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm"></div>
        </div>
        <p class="text-[11px] text-blue-300 mt-1 font-semibold">${deliveredPercent}% Delivered</p>
      </div>
    </div>

    <!-- ────── LAST WEEK ────── -->
    <div class="space-y-4 p-5 rounded-xl bg-indigo-950/60 shadow-lg ring-1 ring-indigo-800/50">

      <h3 class="flex items-center gap-2 text-indigo-300 uppercase text-[11px] font-semibold tracking-widest">
        <i class="fas fa-history text-indigo-200"></i> Last Week
      </h3>

      <p class="text-4xl font-extrabold text-white">${lastW.total_emails_sent}</p>
      <p class="text-xs text-indigo-200">Emails Sent</p>

      <div class="grid grid-cols-2 gap-y-2 text-xs mt-2">
        <div class="flex items-center gap-1 text-indigo-300">
          <i class="fas fa-users"></i> Recipients
        </div>
        <div class="text-right font-semibold text-white">${lastW.total_recipients}</div>

        <div class="flex items-center gap-1 text-green-400">
          <i class="fas fa-check-circle"></i> Delivered
        </div>
        <div class="text-right font-semibold text-white">${deliveredRateLast}%</div>

        <div class="flex items-center gap-1 text-red-400">
          <i class="fas fa-times-circle"></i> Failed
        </div>
        <div class="text-right font-semibold text-white">${lastW.total_failed}</div>
      </div>
    </div>

    <!-- ────── SUMMARY ────── -->
   <div class="space-y-5 p-5 rounded-xl bg-gray-800/60 shadow-lg ring-1 ring-blue-700/40">

  <h3 class="flex items-center gap-2 text-blue-400 uppercase text-[11px] font-semibold tracking-widest">
    <i class="fas fa-info-circle text-blue-300"></i> Summary
  </h3>

  <ul class="space-y-2 text-sm">
    <li class="flex items-center gap-2 text-blue-200">
      <i class="fas fa-tag"></i>
      <strong class="text-white">Subject:</strong>
      <span class="font-mono truncate">${subject}</span>
    </li>
    <li class="flex items-center gap-2 text-blue-200">
      <i class="fas fa-calendar-alt"></i>
      <strong class="text-white">Scheduled:</strong>
      <span>${scheduleCount}</span>
    </li>
  </ul>

  <!-- Preview block -->
  <div>
    <p class="text-[11px] uppercase text-blue-300 font-semibold tracking-wide mb-1">
      <i class="fas fa-envelope-open-text mr-1"></i> Email Preview
    </p>
    <div class="bg-gray-900 border border-blue-700/40 rounded-lg p-3 text-sm text-gray-300 overflow-y-auto max-h-40 prose prose-invert prose-sm">
      ${bodyHTML}
    </div>
  </div>

  <!-- Delivery delta -->
  <div class="pt-3 mt-4 border-t border-blue-700/50">
    <p class="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Delivery Change vs LW
    </p>
    <div class="flex items-center gap-2">
      <i class="fas fa-arrow-${deliveredPercent - deliveredRateLast >= 0 ? 'up' : 'down'}
                 text-${deliveredPercent - deliveredRateLast >= 0 ? 'green' : 'red'}-400"></i>
      <span class="font-mono text-sm text-white">
        ${(deliveredPercent - deliveredRateLast).toFixed(1)}%
      </span>
    </div>
  </div>
</div>

</section>


    </article>
    `;

    container.insertAdjacentHTML('beforeend', html);
  });
}

function toggleStats(id) {
  const card = document.getElementById(`card-${id}`);
  const section = document.getElementById(`stats-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  if (!card || !section || !icon) return;

  const isOpen = !section.classList.contains('hidden');

  if (isOpen) {
    section.classList.add('hidden');
    card.setAttribute('aria-expanded', 'false');
    icon.style.transform = 'rotate(0deg)';
  } else {
    section.classList.remove('hidden');
    card.setAttribute('aria-expanded', 'true');
    icon.style.transform = 'rotate(180deg)';
  }
}




/* Holder for instance */
let sentTimeChart;

/**
 * Render or refresh the histogram‑plus‑line “emails sent” chart.
 * @param {Array<Object>} events – array of sent events:
 *        { event_time: ISO‑string, meta: { count:int }, event_type:'sent' }
 */
function renderSentOverTime(events) {
  /* ── 1. Aggregate by day ─────────────────────────────────── */
  const dayTotals = {}; // { '2025‑07‑03': 120, ... }

  events.forEach(e => {
    if (e.event_type !== 'sent' || e.meta?.count == null) return;
    const day = new Date(e.event_time).toISOString().substring(0, 10); // YYYY‑MM‑DD
    dayTotals[day] = (dayTotals[day] || 0) + e.meta.count;
  });

  const labels = Object.keys(dayTotals).sort();          // ordered date strings
  if (!labels.length) return;

  const dataCounts = labels.map(d => dayTotals[d]);      // parallel array

  const first = new Date(labels[0]), last = new Date(labels[labels.length - 1]);
  const msDay = 86_400_000;
  const min   = new Date(first.getTime() - msDay);
  const max   = new Date(last.getTime()  + msDay);

  /* ── 2. Build datasets ───────────────────────────────────── */
  const data = {
    labels,
    datasets: [
      { // BAR (histogram)
        type: 'bar',
        label: 'Recipients per Day',
        data: dataCounts,
        backgroundColor: 'rgba(99,102,241,0.6)',   // indigo‑500 @ 60 %
        borderRadius: 4
      },
      { // LINE (trend)
        type: 'line',
        label: 'Trend',
        data: dataCounts,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
        borderColor: 'rgb(236,72,153)',            // pink‑500
        backgroundColor: 'rgb(236,72,153)'
      }
    ]
  };

  /* ── 3. Chart options ────────────────────────────────────── */
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Emails Sent per Day',
        color: '#f3f4f6',
        font: { size: 14, weight: '600' },
        padding: { bottom: 12 }
      },
      tooltip: {
        callbacks: {
          title: ctx => ctx[0].label,
          label: ctx => ` ${ctx.parsed.y} recipients`
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', tooltipFormat: 'PP' },
        min, max,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        title: { display: true, text: 'Date', color: '#cbd5e1', font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          precision: 0,
          color: '#9ca3af',
          font: { size: 11 },
          callback: v => v.toLocaleString()
        },
        title: { display: true, text: 'Recipients', color: '#cbd5e1', font: { size: 12 } }
      }
    }
  };

  const ctx = document.getElementById('sentTimeChart');
  if (!sentTimeChart) {
    sentTimeChart = new Chart(ctx, { data, options: opts });
  } else {
    sentTimeChart.data = data;
    sentTimeChart.options = opts;
    sentTimeChart.update();
  }
}



/* Holder for the pie instance */
let deliverPie;

/**
 * Render or update the Delivered vs Bounced pie chart.
 * @param {number} deliveredCount
 * @param {number} bounceCount
 */
function renderDeliverPie(deliveredCount, bounceCount) {
  const ctx = document.getElementById('deliverPieChart');

  // Guard: avoid divide‑by‑zero & empty data
  const total = deliveredCount + bounceCount;
  if (!total) return;

  const data = {
    labels: ['Delivered', 'Bounced'],
    datasets: [{
      data: [deliveredCount, bounceCount],
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',  // purple‑500
        'rgba(236, 72, 153, 0.8)'   // pink‑500
      ],
      borderColor: '#1f2937',       // gray‑800 border for dark bg
      borderWidth: 2
    }]
  };

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e5e7eb', boxWidth: 12, font: { size: 11 } }
      },
      title: {
        display: true,
        text: 'Delivered vs Bounced',
        color: '#f3f4f6',
        font: { size: 14, weight: '600' },
        padding: { bottom: 12 }
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          }
        }
      }
    }
  };

  if (!deliverPie) {
    deliverPie = new Chart(ctx, { type: 'pie', data, options: opts });
  } else {
    deliverPie.data = data;
    deliverPie.options = opts;
    deliverPie.update();
  }
}
