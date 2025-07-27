



function scrollToBuilder() {
  const builder = document.getElementById("grapesjsEditor");
  
    builder.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
}

function appendCardToGrid(template_id, title, htmlContent, tags = [], features = []) {
  const grid = document.getElementById('email_template_list');
  if (!grid) return;

  const scrollbarStyles = `
    <style>
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-thumb {
        background-color: #ec4899; /* pink-500 */
        border-radius: 4px;
      }
      ::-webkit-scrollbar-track {
        background-color: #1f2937; /* gray-800 */
      }

      html {
        scrollbar-width: thin;
        scrollbar-color: #ec4899 #1f2937;
      }
    </style>
  `;

  const safeHTML = (scrollbarStyles + htmlContent)
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ');

  const tagElements = tags.map(tag => `
    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-tr from-pink-800 to-pink-600 text-pink-100 shadow-sm uppercase tracking-wide">
      ${tag}
    </span>
  `).join('');

  const featureElements = features.map(feature => `
    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-600">
      ${feature}
    </span>
  `).join('');

  const card = document.createElement('div');
  card.className = `
    group bg-gray-900 border border-gray-800 rounded-2xl shadow-lg hover:shadow-pink-500/30 
    hover:ring-1 hover:ring-pink-600 transition-all duration-300 overflow-hidden flex flex-col
  `.trim();

  card.innerHTML = `
    <!-- Preview Area -->
    <div class="relative w-full h-56 bg-white overflow-hidden border-b border-gray-700 nice-scrollbar">
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
        <h4 class="text-white font-bold text-base truncate">${title || 'Untitled Template'}</h4>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
         <button
  class="text-gray-500 hover:text-pink-400"
  title="Preview"
  onclick="event.stopPropagation(); display_template_display_modal('${template_id}')">
  <i class="fas fa-eye text-sm"></i>
</button>

        </div>
      </div>

      <!-- Tags -->
      ${tagElements ? `<div class="flex flex-wrap gap-1">${tagElements}</div>` : ''}

      <!-- Features -->
      ${featureElements ? `<div class="flex flex-wrap gap-1">${featureElements}</div>` : ''}

      <!-- CTA -->
      <div class="pt-2 mt-auto">
       <button
  class="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white py-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition"
  onclick="event.stopPropagation(); showConfirmation({
    title: 'Apply This Template',
    message: 'This action will override all content currently in the builder.',
    onConfirm: () => { apply_template('${template_id}') }
  });"
>
  Use Template
</button>

      </div>
    </div>
  `;

  grid.appendChild(card);
}







function clearGrid() {
  const grid = document.getElementById('email_template_list');
  if (grid) grid.innerHTML = '';
}

// Render templates to grid
function renderTemplates(templatesToRender) {
  clearGrid();
  templatesToRender.forEach(({ id, title, html, tags = [], features = [] }) => {
    appendCardToGrid(id, title, html, tags, features);
  });
}

function filterTemplates(searchTerm) {
  const lowerTerm = searchTerm.trim().toLowerCase();
  const grid = document.getElementById('email_template_list');
  if (!grid) return;

  const cards = Array.from(grid.children);

  cards.forEach(card => {
    const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
    const tags = Array.from(card.querySelectorAll('div.flex.flex-wrap.gap-1 span')).map(el => el.textContent.toLowerCase());
    const features = Array.from(card.querySelectorAll('div.flex.flex-wrap.gap-1 span')).map(el => el.textContent.toLowerCase());

    // Check if search term is in title, tags, or features
    const matchInTitle = title.includes(lowerTerm);
    const matchInTags = tags.some(t => t.includes(lowerTerm));
    const matchInFeatures = features.some(f => f.includes(lowerTerm));

    if (lowerTerm === '' || matchInTitle || matchInTags || matchInFeatures) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}




// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderTemplates(templates);
  document.getElementById('template-count').innerText = templates.length;
});











const templates = [
  {
    id: '1',
    title: 'Professional',
    tags: ['Business', 'Report'],
    features: ['Responsive', 'Clean Layout'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd;">
        <tr>
          <td style="background:#003366; padding:30px; text-align:center; color:white;">
            <h1 style="margin:0; font-size:28px;">Quarterly Business Review</h1>
            <p style="margin:5px 0 0; font-size:14px; opacity:0.8;">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px;">
            <img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" alt="Business Meeting" style="width:100%; border-radius:8px; display:block;">
          </td>
        </tr>
        <tr>
          <td style="padding:20px; color:#333; font-size:16px; line-height:1.5;">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px; border-top:1px solid #eee;">
            <h2 style="color:#003366; font-size:22px; margin-bottom:10px;">Key Achievements</h2>
            <ul style="color:#555; font-size:15px; line-height:1.4;">
              <li>Achievement 1</li><li>Achievement 2</li><li>Achievement 3</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="padding:20px; background:#f9fafb;">
            <h2 style="color:#003366; font-size:22px; margin-bottom:10px;">Upcoming Initiatives</h2>
            <p style="color:#555; font-size:15px;">Curabitur faucibus leo a cursus consequat...</p>
            <a   style="display:inline-block; margin-top:15px; padding:12px 24px; background:#0077cc; color:#fff; border-radius:5px; text-decoration:none;">Learn More</a>
          </td>
        </tr>
        <tr>
          <td style="background:#003366; color:#bbb; font-size:12px; padding:15px; text-align:center;">
            <p>© 2025 Company Name</p><p>123 Business Rd, Suite 100</p>
            <a   style="color:#66b2ff;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '2',
    title: 'Dark',
    tags: ['Modern', 'Product'],
    features: ['Call-to-Action', 'Testimonial'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background:#ffffff; border:1px solid #ddd;">
        <tr>
          <td style="background:#222; padding:30px; text-align:center; color:white;">
            <h1 style="margin:0;">Introducing FlexDesk Pro</h1>
            <p style="opacity:0.7;">Lorem ipsum dolor sit amet</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px;">
            <img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" alt="Modern Office Desk" style="width:100%; border-radius:8px;">
          </td>
        </tr>
        <tr>
          <td style="padding:20px;">
            <h2>Why You’ll Love It</h2>
            <ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>
          </td>
        </tr>
        <tr>
          <td style="text-align:center; padding:20px;">
            <a   style="background:#007bff; color:white; padding:15px 30px; border-radius:6px;">Shop Now</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f0f0; padding:20px;">
            <blockquote>“This is great.”</blockquote>
            <p>— Alex Johnson</p>
          </td>
        </tr>
        <tr>
          <td style="background:#222; color:#aaa; text-align:center; padding:15px;">
            <p>© 2025 FlexDesk Co.</p><a   style="color:#66b2ff;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '3',
    title: 'Holiday Promo',
    tags: ['Seasonal', 'Sale'],
    features: ['Discount Banner', 'Festive Colors'],
    html: `
      <table width="100%" style="max-width:600px; margin:auto; font-family:sans-serif;">
        <tr><td style="background:#ff4757; color:white; padding:30px; text-align:center;">
          <h1>🎁 Holiday Sale!</h1>
          <p>Up to 50% off all items</p>
        </td></tr>
        <tr><td style="padding:20px;"><img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" style="width:100%;"></td></tr>
        <tr><td style="padding:20px; text-align:center;">
          <a   style="background:#2ed573; padding:12px 24px; color:white; border-radius:6px; font-weight:bold;">Shop Now</a>
        </td></tr>
      </table>
    `
  },

  {
  id: '4',
  title: 'Minimalist Update',
  tags: ['Update', 'Minimal'],
  features: ['Text Focused', 'Fast Load'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #e0e0e0;">
      <!-- Header -->
      <tr>
        <td style="background:#212121; color:#ffffff; padding:24px; text-align:center;">
          <h2 style="margin:0; font-size:22px;">This Month’s Update</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:24px; color:#333; font-size:15px; line-height:1.6;">
          <p>Hi there,</p>
          <p>We’ve made several improvements across the board to make your experience even better:</p>
          <ul style="padding-left:20px; margin:16px 0;">
            <li>Simplified interface for quicker navigation</li>
            <li>Performance enhancements on all platforms</li>
            <li>Minor bug fixes and accessibility updates</li>
          </ul>
          <p>We hope you enjoy the smoother experience. As always, thank you for being part of our journey.</p>
        </td>
      </tr>

      <!-- Image -->
      <tr>
        <td style="padding:0;">
          <img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" alt="Update Preview" style="width:100%; display:block;">
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f5f5f5; color:#888; font-size:12px; padding:20px; text-align:center;">
          <p style="margin:0;">© 2025 Company Name, All rights reserved.</p>
          <p style="margin:4px 0 0;">123 Example Rd, City, Country</p>
          <a href="#" style="color:#4a148c; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
},
{
  id: '5',
  title: 'Plain Text Announcement',
  tags: ['Announcement', 'Simple'],
  features: ['No Images', 'High Deliverability'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Georgia, serif; background:#ffffff; border:1px solid #dddddd;">
      <!-- Header -->
      <tr>
        <td style="background:#004080; color:#ffffff; padding:24px; text-align:center;">
          <h1 style="margin:0; font-size:24px;">We're Making a Change</h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:24px; color:#222222; font-size:16px; line-height:1.7;">
          <p>Hello,</p>
          <p>We're writing to inform you of an important change to our service, effective immediately. Our new policy aims to improve clarity and enhance your experience across all touchpoints.</p>
          <p>Please take a moment to review the updated terms and let us know if you have any questions.</p>
          <p>Thank you for your continued trust.</p>
          <p style="margin-top:32px;">— The Team</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8f8f8; color:#777; font-size:12px; padding:20px; text-align:center;">
          <p style="margin:0;">© 2025 Your Company</p>
          <p style="margin:4px 0 0;">456 Notification Ave, Mailtown, World</p>
          <a href="#" style="color:#004080; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
},
{
  id: '6',
  title: 'Service Downtime Notice',
  tags: ['Notice', 'Service', 'Status'],
  features: ['No Images', 'High Clarity', 'Time Sensitive'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Segoe UI', sans-serif; background:#ffffff; border:1px solid #ddd;">
      <!-- Header -->
      <tr>
        <td style="background:#b91c1c; color:#ffffff; padding:24px; text-align:center;">
          <h2 style="margin:0; font-size:22px;">Scheduled Maintenance Alert</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:24px; color:#111827; font-size:16px; line-height:1.6;">
          <p>Dear User,</p>
          <p>We wanted to inform you about a scheduled maintenance window that will take place on:</p>
          <ul style="padding-left:20px;">
            <li><strong>Date:</strong> Saturday, August 10th, 2025</li>
            <li><strong>Time:</strong> 1:00 AM – 3:00 AM (UTC)</li>
          </ul>
          <p>During this time, our platform will be temporarily unavailable. We recommend saving your work ahead of time and avoiding usage during this window.</p>
          <p>We apologize for the inconvenience and thank you for your patience.</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f3f4f6; color:#6b7280; font-size:12px; padding:20px; text-align:center;">
          <p style="margin:0;">Need help? Contact our support team at <a href="mailto:support@example.com" style="color:#b91c1c; text-decoration:none;">support@example.com</a></p>
          <p style="margin:8px 0 0;">© 2025 Example Inc. All rights reserved.</p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '7',
  title: 'Account Verification',
  tags: ['Security', 'Verification'],
  features: ['No Images', 'Clean Layout', 'High Deliverability'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background:#ffffff; border:1px solid #e5e7eb;">
      <!-- Header -->
      <tr>
        <td style="background:#111827; padding:24px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:24px;">Verify Your Account</h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:24px; color:#1f2937; font-size:16px; line-height:1.6;">
          <p>Hi there,</p>
          <p>To complete your account setup, please verify your email address. Just click the button below and you're all set.</p>

          <table cellspacing="0" cellpadding="0" style="margin: 24px 0;">
            <tr>
              <td align="center">
                <a href="#" style="background:#10b981; color:#ffffff; padding:12px 24px; font-size:16px; border-radius:6px; text-decoration:none; display:inline-block;">
                  Verify Email
                </a>
              </td>
            </tr>
          </table>

          <p>If you did not sign up for this account, you can safely ignore this email.</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb; padding:16px; font-size:12px; color:#6b7280; text-align:center;">
          <p style="margin:0;">Need help? Contact <a href="mailto:support@example.com" style="color:#10b981; text-decoration:none;">support@example.com</a></p>
          <p style="margin:8px 0 0;">© 2025 SecureApp Inc. All rights reserved.</p>
        </td>
      </tr>
    </table>
  `
}
, {
  id: '8',
  title: 'Event Invitation',
  tags: ['Event', 'Invite'],
  features: ['No Images', 'Centered Layout', 'Clear CTA'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#ffffff; border:1px solid #e5e7eb;">
      <!-- Header -->
      <tr>
        <td style="background:#4f46e5; padding:32px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:26px;">You're Invited!</h1>
          <p style="margin-top:8px; font-size:14px; opacity:0.9;">Join us for an exclusive online event</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:28px 24px; font-size:16px; color:#111827; line-height:1.6;">
          <p>Hello,</p>
          <p>We’re excited to invite you to our upcoming virtual event where we’ll be sharing important updates, networking opportunities, and exclusive previews of what's coming next.</p>
          <p>Don’t miss this chance to connect with like-minded professionals and our team.</p>

          <table cellspacing="0" cellpadding="0" style="margin: 24px 0;">
            <tr>
              <td align="center">
                <a href="#" style="background:#4f46e5; color:#ffffff; padding:12px 24px; font-size:15px; border-radius:6px; text-decoration:none; display:inline-block;">
                  RSVP Now
                </a>
              </td>
            </tr>
          </table>

          <p>We look forward to seeing you there!</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f3f4f6; padding:20px; font-size:12px; color:#6b7280; text-align:center;">
          <p style="margin:0;">Questions? Email us at <a href="mailto:events@example.com" style="color:#4f46e5; text-decoration:none;">events@example.com</a></p>
          <p style="margin-top:8px;">© 2025 EventCorp. All rights reserved.</p>
        </td>
      </tr>
    </table>
  `
}
,
{
  id: '9',
  title: 'Thank You Note',
  tags: ['Thank You', 'Personal'],
  features: ['No Images', 'Clean Layout', 'Friendly Tone'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family:'Georgia', serif; background:#ffffff; border:1px solid #ddd;">
      <!-- Header -->
      <tr>
        <td style="background:#16a34a; padding:30px; text-align:center; color:white;">
          <h1 style="margin:0; font-size:26px;">Thank You!</h1>
          <p style="margin-top:8px; font-size:14px; opacity:0.9;">We appreciate your support</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px 24px; font-size:16px; color:#1f2937; line-height:1.6;">
          <p>Hi there,</p>
          <p>We just wanted to take a moment to say thank you. Whether you've recently joined us, shared your feedback, or supported us in any way — it truly means the world.</p>
          <p>We're continuously working to improve and deliver better experiences, and your encouragement is what drives us forward.</p>
          <p>Warm regards,<br>The Team</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f3f4f6; padding:20px; font-size:12px; color:#6b7280; text-align:center;">
          <p style="margin:0;">Need help? <a href="#" style="color:#16a34a; text-decoration:none;">Contact Support</a></p>
          <p style="margin-top:8px;">© 2025 Gratitude Inc.</p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '10',
  title: 'Bold Product Drop',
  tags: ['Announcement', 'Launch'],
  features: ['No Image', 'Big CTA', 'Modern Style'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#0f172a; color:white;">
      <!-- Main Section -->
      <tr>
        <td style="padding:40px 30px; text-align:center;">
          <h1 style="font-size:30px; margin:0; letter-spacing:1px;">🔥 Introducing Something Big</h1>
          <p style="margin:20px 0 0; font-size:16px; color:#cbd5e1;">We’ve reimagined what’s possible — and it’s finally here.</p>
        </td>
      </tr>

      <!-- Details -->
      <tr>
        <td style="padding:30px; background:#1e293b; text-align:left;">
          <p style="font-size:15px; line-height:1.6; margin:0;">
            Built from the ground up, our latest product is fast, flexible, and designed to scale. Whether you're a startup or an enterprise, this is made for you.
          </p>
          <ul style="margin-top:15px; padding-left:20px; color:#94a3b8; font-size:14px;">
            <li>Faster Performance</li>
            <li>Smarter Automation</li>
            <li>Clean, Minimal UI</li>
          </ul>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="text-align:center; padding:40px 20px;">
          <a href="#" style="display:inline-block; padding:14px 32px; background:#ec4899; color:white; font-weight:bold; border-radius:6px; text-decoration:none;">
            Explore Now →
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0f172a; padding:20px; font-size:12px; color:#64748b; text-align:center;">
          <p style="margin:0;">You received this email because you're subscribed to our updates.</p>
          <p style="margin:6px 0 0;"><a href="#" style="color:#f472b6; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}
,
{
  id: '11',
  title: 'Two-Column Newsletter',
  tags: ['Newsletter', 'Clean', 'Two-Column'],
  features: ['Responsive', 'Text & Links', 'No Images'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd; color:#333;">
      <tr>
        <td style="background:#2563eb; color:#fff; padding:30px; text-align:center;">
          <h1 style="margin:0; font-size:28px;">Monthly Insights</h1>
          <p style="margin-top:5px; font-size:14px; opacity:0.9;">Your roundup of the latest news and updates</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Left Column -->
              <td style="width:50%; vertical-align:top; padding-right:15px;">
                <h2 style="font-size:18px; margin-top:0;">Feature Story</h2>
                <p style="font-size:14px; line-height:1.5;">
                  Discover how our new tools are helping businesses streamline their workflow and increase productivity.
                </p>
                <a href="#" style="color:#2563eb; font-weight:bold; text-decoration:none;">Read more &raquo;</a>
              </td>
              <!-- Right Column -->
              <td style="width:50%; vertical-align:top; padding-left:15px; border-left:1px solid #eee;">
                <h2 style="font-size:18px; margin-top:0;">Upcoming Events</h2>
                <ul style="font-size:14px; padding-left:20px; margin:0;">
                  <li><strong>July 20:</strong> Webinar on AI Trends</li>
                  <li><strong>Aug 10:</strong> Product Launch Event</li>
                  <li><strong>Sep 5:</strong> Customer Appreciation Day</li>
                </ul>
                <a href="#" style="color:#2563eb; font-weight:bold; text-decoration:none;">View all events &raquo;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#f3f4f6; padding:15px; font-size:12px; color:#777; text-align:center;">
          <p style="margin:0;">© 2025 Company Name. All rights reserved.</p>
          <p style="margin:5px 0 0;"><a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '12',
  title: 'Simple Promo',
  tags: ['Promotion', 'Clean', 'Single Column'],
  features: ['Strong CTA', 'Mobile Friendly', 'Minimal Design'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#ffffff; border:1px solid #ddd;">
      <tr>
        <td style="background:#ef4444; color:#ffffff; text-align:center; padding:30px;">
          <h1 style="margin:0; font-size:32px; font-weight:bold;">Limited Time Offer!</h1>
          <p style="margin:10px 0 0; font-size:18px; opacity:0.9;">Get 30% off on all products</p>
        </td>
      </tr>
      <tr>
        <td style="padding:30px; color:#333333; font-size:16px; line-height:1.6; text-align:center;">
          <p>Don't miss out on our exclusive deal. Upgrade your setup with the best gear and save big today.</p>
          <a href="#" style="display:inline-block; margin-top:20px; padding:15px 40px; background:#ef4444; color:#fff; text-decoration:none; font-weight:bold; border-radius:6px; font-size:16px;">Shop Now</a>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb; text-align:center; font-size:12px; color:#666; padding:20px; border-top:1px solid #e5e7eb;">
          <p style="margin:0;">© 2025 Your Company. All rights reserved.</p>
          <p style="margin:5px 0 0;"><a href="#" style="color:#ef4444; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '13',
  title: 'Monthly Newsletter',
  tags: ['Newsletter', 'Multi-Section', 'Clean'],
  features: ['Sectioned Layout', 'Quote Highlight', 'Readable'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Verdana, Geneva, Tahoma, sans-serif; background:#ffffff; border:1px solid #ccc;">
      <tr>
        <td style="background:#2563eb; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px; font-weight:bold;">This Month’s Highlights</h1>
          <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">Catch up on the latest news and updates</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; color:#333; font-size:16px; line-height:1.5;">
          <h2 style="margin-top:0;">Top Stories</h2>
          <ul style="padding-left:20px; color:#555; font-size:14px; line-height:1.4;">
            <li>Exciting new product launch</li>
            <li>Upcoming events and webinars</li>
            <li>Tips & tricks to boost your productivity</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; background:#f0f4ff; font-style: italic; color:#3b82f6; font-size:16px; text-align:center;">
          <p>"The secret of getting ahead is getting started." – Mark Twain</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; color:#333; font-size:16px; line-height:1.5;">
          <h2>Get Involved</h2>
          <p>Join our community forums, participate in upcoming challenges, and share your success stories with us!</p>
          <a href="#" style="display:inline-block; margin-top:15px; padding:12px 24px; background:#2563eb; color:#fff; border-radius:5px; text-decoration:none; font-weight:bold;">Join Now</a>
        </td>
      </tr>
      <tr>
        <td style="background:#2563eb; color:#ddd; font-size:12px; padding:15px; text-align:center;">
          <p style="margin:0;">© 2025 Your Company. All rights reserved.</p>
          <p style="margin:5px 0 0;"><a href="#" style="color:#a5b4fc; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '14',
  title: 'Event Invitation',
  tags: ['Invitation', 'Event', 'Simple'],
  features: ['Clear CTA', 'Minimal Design', 'Responsive'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd;">
      <tr>
        <td style="background:#10b981; padding:30px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:26px; font-weight:bold;">You're Invited!</h1>
          <p style="margin:10px 0 0; font-size:16px; opacity:0.85;">Join us for an exclusive event you won’t want to miss.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <h2 style="margin-top:0;">Event Details</h2>
          <p><strong>Date:</strong> August 25, 2025</p>
          <p><strong>Time:</strong> 6:00 PM - 9:00 PM</p>
          <p><strong>Location:</strong> Grand Hall, Downtown Conference Center</p>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; text-align:center;">
          <a href="#" style="background:#10b981; color:#fff; padding:15px 30px; font-weight:bold; border-radius:6px; text-decoration:none; font-size:16px; display:inline-block;">
            RSVP Now
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:15px; font-size:14px; color:#666; text-align:center;">
          <p>We look forward to seeing you there!</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb; font-size:12px; color:#999; padding:15px; text-align:center; border-top:1px solid #ddd;">
          <p style="margin:0;">© 2025 Company Name. All rights reserved.</p>
          <a href="#" style="color:#10b981; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
}
,
{
  id: '15',
  title: 'Simple Email Style',
  tags: ['Basic', 'Clean', 'Readable'],
  features: ['Plain Text', 'Professional', 'Easy to Customize'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd;">
      <tr>
        <td style="padding:20px; color:#333; font-size:16px; line-height:1.6;">
          <p>Hi <strong>Recipient,</strong></p>
          
          <p>I hope this email finds you well. I wanted to reach out regarding our recent discussions and provide you with the latest updates.</p>
          
          <p>Please let me know if you have any questions or need further information. I look forward to hearing from you.</p>
          
          <p>Best regards,<br>
          <strong>Your Name</strong><br>
          Your Position<br>
          <a href="mailto:youremail@example.com" style="color:#1d4ed8; text-decoration:none;">youremail@example.com</a><br>
          <a href="tel:+1234567890" style="color:#1d4ed8; text-decoration:none;">+1 (234) 567-890</a></p>
        </td>
      </tr>
      <tr>
        <td style="padding:15px; font-size:12px; color:#777; text-align:center; border-top:1px solid #eee;">
          <p>© 2025 Your Company. All rights reserved.</p>
          <a href="#" style="color:#1d4ed8; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
},
{
  id: '16',
  title: 'Friendly Newsletter',
  tags: ['Newsletter', 'Simple', 'Clean'],
  features: ['Readable', 'Call to Action', 'Mobile Friendly'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd;">
      <tr>
        <td style="background:#f9fafb; padding:20px; text-align:center; border-bottom:1px solid #ddd;">
          <h1 style="margin:0; color:#333;">Monthly Updates</h1>
          <p style="margin:5px 0 0; color:#666; font-size:14px;">Your friendly monthly newsletter</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hello Friend,</p>
          <p>We hope you’re having a great month! Here are some highlights and news to keep you in the loop.</p>
          <ul style="padding-left:20px; color:#555; font-size:15px; line-height:1.5;">
            <li>Exciting new feature releases.</li>
            <li>Upcoming events and webinars.</li>
            <li>Tips and tricks to get the most out of our service.</li>
          </ul>
          <p>If you’d like to learn more, click the button below:</p>
          <p style="text-align:center;">
            <a href="#" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">Read More</a>
          </p>
          <p>Thank you for being with us!</p>
          <p>Best,<br><strong>Your Team</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:15px; font-size:12px; color:#777; text-align:center; border-top:1px solid #eee;">
          <p>© 2025 Your Company. All rights reserved.</p>
          <a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
}, 
{
  id: '17',
  title: 'Professional Update',
  tags: ['Update', 'Professional', 'Simple'],
  features: ['Clean Layout', 'Mobile Friendly', 'Easy to Read'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ccc;">
      <tr>
        <td style="padding:20px; color:#333; font-size:16px; line-height:1.5;">
          <p>Dear Valued Customer,</p>
          <p>We hope this message finds you well. We are reaching out to update you on some important changes and improvements we’ve made to enhance your experience with our services.</p>
          <p>Highlights include:</p>
          <ul style="color:#555; font-size:15px; line-height:1.5; padding-left:20px;">
            <li>Improved customer support availability.</li>
            <li>New features designed to increase productivity.</li>
            <li>Upcoming scheduled maintenance dates.</li>
          </ul>
          <p>If you have any questions or need assistance, please don’t hesitate to contact us.</p>
          <p>Best regards,<br><strong>The Support Team</strong></p>
        </td>
      </tr>
      <tr>
        <td style="padding:15px; font-size:12px; color:#777; text-align:center; border-top:1px solid #eee;">
          <p>© 2025 Your Company Name. All rights reserved.</p>
          <a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
}
, {
  id: '18',
  title: 'Customer Notification',
  tags: ['Notification', 'Professional', 'Clean'],
  features: ['Simple Design', 'Clear CTA', 'Responsive'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#ffffff; border:1px solid #ddd;">
      <tr>
        <td style="padding:25px; color:#222; font-size:16px; line-height:1.6;">
          <p>Hello,</p>
          <p>We wanted to inform you about an important update to your account settings. Please review the details below and take action if necessary.</p>
          <ul style="color:#555; font-size:15px; line-height:1.5; padding-left:20px;">
            <li>Update to privacy policy effective next month.</li>
            <li>New security features to protect your data.</li>
            <li>How to enable two-factor authentication.</li>
          </ul>
          <p>To learn more or make changes, please <a href="#" style="color:#2563eb; text-decoration:none; font-weight:bold;">visit your account settings</a>.</p>
          <p>Thank you for your attention.</p>

          <p>Best regards,<br>
          <em>Customer Support Team</em><br>
          Your Company Name</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9f9f9; padding:15px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Your Company Name. All rights reserved.</p>
          <a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a>
        </td>
      </tr>
    </table>
  `
}
, 
{
  id: '19',
  title: 'Important Update',
  tags: ['Update', 'Clean', 'Professional'],
  features: ['Responsive', 'Clear CTA', 'Accessible'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#ffffff; border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="background:#2563eb; padding:20px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:24px; font-weight:bold;">Important Update from Our Team</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:30px; color:#333333; font-size:16px; line-height:1.5;">
          <p>Dear Customer,</p>
          <p>We’re reaching out to inform you about some important changes that may affect your account. Please review the key points below:</p>
          <ul style="margin-top:0; margin-bottom:20px; padding-left:20px; color:#555555;">
            <li>Enhanced security measures to keep your data safe.</li>
            <li>Improved user interface for easier navigation.</li>
            <li>New features to enhance your experience.</li>
          </ul>
          <p>To get started or learn more, please click the button below:</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="#" style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:6px; font-weight:600; display:inline-block; font-size:16px;">View Details</a>
          </p>
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          <p>Thank you for being with us.</p>
          <p>Warm regards,<br><strong>The Support Team</strong></p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb; text-align:center; padding:20px; font-size:12px; color:#999999; border-top:1px solid #e0e0e0;">
          <p>© 2025 Your Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '20',
  title: 'Monthly Newsletter',
  tags: ['Newsletter', 'Clean', 'Informative'],
  features: ['Mobile Friendly', 'Sectioned Layout', 'Readable'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Helvetica Neue', Arial, sans-serif; background:#ffffff; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="background:#4f46e5; padding:25px; color:#fff; text-align:center;">
          <h1 style="margin:0; font-size:26px; font-weight:bold;">Your Monthly Update</h1>
          <p style="margin-top:6px; font-size:14px; opacity:0.85;">Latest news and insights from our team</p>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hi there,</p>
          <p>Welcome to this month’s newsletter! Here’s what’s new:</p>
          
          <h2 style="color:#4f46e5; font-size:20px; margin-bottom:8px;">Feature Highlights</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li>New dashboard improvements to boost productivity.</li>
            <li>Upcoming webinars and training sessions.</li>
            <li>Spotlight on customer success stories.</li>
          </ul>

          <h2 style="color:#4f46e5; font-size:20px; margin-top:25px; margin-bottom:8px;">From Our Blog</h2>
          <p style="color:#555;">Read our latest articles packed with tips and best practices:</p>
          <ul style="padding-left:20px; color:#555; font-size:15px; margin-top:0;">
            <li><a href="#" style="color:#4f46e5; text-decoration:none;">How to maximize your workflow</a></li>
            <li><a href="#" style="color:#4f46e5; text-decoration:none;">Top 10 productivity hacks</a></li>
            <li><a href="#" style="color:#4f46e5; text-decoration:none;">Customer success story: Jane Doe</a></li>
          </ul>

          <p style="margin-top:30px;">Thank you for staying connected. We look forward to helping you grow!</p>
          <p>Cheers,<br><strong>The Team</strong></p>
        </td>
      </tr>
      <tr>
        <td style="background:#f3f4f6; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p style="margin:0;">© 2025 Your Company Name. All rights reserved.</p>
          <p style="margin:5px 0 0;"><a href="#" style="color:#4f46e5; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '21',
  title: 'Welcome Email',
  tags: ['Welcome', 'Friendly', 'Onboarding'],
  features: ['Clear CTA', 'Personalized', 'Clean Layout'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#10b981; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Welcome to Our Community!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hi there,</p>
          <p>Thanks for joining us! We're thrilled to have you on board. Here’s a quick overview to help you get started.</p>

          <h2 style="color:#10b981; font-size:20px;">Getting Started</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li>Complete your profile to personalize your experience.</li>
            <li>Explore the dashboard and tools available.</li>
            <li>Contact our support team anytime you need help.</li>
          </ul>

          <p style="margin-top:30px; text-align:center;">
            <a href="#" style="background:#10b981; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">Get Started</a>
          </p>

          <p>Cheers,<br>The Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#10b981; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '22',
  title: 'Event Invitation',
  tags: ['Event', 'Invitation', 'RSVP'],
  features: ['Call to Action', 'Calendar Link', 'Responsive'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#ffffff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#2563eb; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">You're Invited!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Dear Friend,</p>
          <p>Join us for an exciting event filled with networking and learning opportunities.</p>

          <h2 style="color:#2563eb; font-size:20px;">Event Details</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li><strong>Date:</strong> August 15, 2025</li>
            <li><strong>Time:</strong> 6:00 PM - 9:00 PM</li>
            <li><strong>Location:</strong> 123 Conference Center, City</li>
          </ul>

          <p style="margin-top:30px; text-align:center;">
            <a href="#" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">RSVP Now</a>
          </p>

          <p>We look forward to seeing you there!</p>
          <p>Best,<br>The Events Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f3f4f6; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '23',
  title: 'Product Launch',
  tags: ['Launch', 'Product', 'Announcement'],
  features: ['Promotional', 'Image Included', 'Clear CTA'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#ef4444; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Introducing Our Latest Product!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; text-align:center;">
          <img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" alt="Product Image" style="width:100%; max-width:400px; border-radius:8px;">
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>We're excited to announce the launch of our brand-new product designed to simplify your workflow.</p>

          <h2 style="color:#ef4444; font-size:20px;">Key Features</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li>Innovative design for maximum efficiency</li>
            <li>Seamless integration with existing tools</li>
            <li>24/7 customer support</li>
          </ul>

          <p style="margin-top:30px; text-align:center;">
            <a href="#" style="background:#ef4444; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">Learn More</a>
          </p>

          <p>Thank you for being with us.</p>
          <p>Warm regards,<br>Product Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#fef2f2; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#ef4444; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{
  id: '24',
  title: 'Customer Feedback Survey',
  tags: ['Survey', 'Feedback', 'Engagement'],
  features: ['Simple', 'Clear CTA', 'Engaging'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#8b5cf6; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">We Value Your Feedback</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hi there,</p>
          <p>To serve you better, we'd love to hear your thoughts about our services.</p>

          <p style="margin-top:25px; text-align:center;">
            <a href="#" style="background:#8b5cf6; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold;">Take the Survey</a>
          </p>

          <p style="margin-top:30px;">Thank you for helping us improve.</p>
          <p>Best regards,<br>Customer Care Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f5f3ff; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#8b5cf6; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},{
  id: '25',
  title: 'Account Notification',
  tags: ['Notification', 'Account', 'Security'],
  features: ['Important', 'Security', 'Clear Info'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#efbb38; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Important Account Update</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Dear User,</p>
          <p>We wanted to inform you about a recent change to your account settings.</p>

          <h2 style="color:#efbb38; font-size:20px;">What's Changed?</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li>Password reset successful</li>
            <li>New login detected from a new device</li>
            <li>Updated contact information</li>
          </ul>

          <p style="margin-top:30px;">If you did not authorize these changes, please <a href="#" style="color:#efbb38; text-decoration:none; font-weight:bold;">contact support immediately</a>.</p>

          <p>Thank you,<br>Security Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#fff7d6; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#efbb38; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}, {
  id: '26',
  title: 'Password Reset',
  tags: ['Security', 'Urgent'],
  features: ['Action Required', 'Clear Instructions'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#ef4444; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Reset Your Password</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hi,</p>
          <p>We received a request to reset your password. Click the button below to choose a new one.</p>

          <p style="text-align:center; margin-top:30px;">
            <a href="#" style="background:#ef4444; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Reset Password</a>
          </p>

          <p>If you didn’t request this, you can safely ignore this email.</p>
          <p>Thanks,<br>Security Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#fee2e2; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#ef4444; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}, {
  id: '27',
  title: 'Monthly Newsletter',
  tags: ['Newsletter', 'Updates', 'Informative'],
  features: ['Multiple Sections', 'Clean Layout'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#2563eb; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Your July Updates</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; color:#333;">
          <h2 style="color:#2563eb;">Feature Highlights</h2>
          <p>Discover the latest features we've added to improve your experience.</p>
          <ul style="padding-left:20px; color:#555;">
            <li>New dashboard customization options</li>
            <li>Improved mobile responsiveness</li>
            <li>Bug fixes and performance improvements</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td style="padding:20px; color:#333;">
          <h2 style="color:#2563eb;">Upcoming Events</h2>
          <p>Mark your calendar for these exciting events:</p>
          <ul style="padding-left:20px; color:#555;">
            <li>Webinar on August 10</li>
            <li>Community Meetup on August 24</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td style="background:#f3f4f6; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}, {
  id: '28',
  title: 'Order Confirmation',
  tags: ['Order', 'Confirmation', 'Transactional'],
  features: ['Clear Details', 'Order Summary'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#10b981; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Thank You for Your Order!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hi,</p>
          <p>We’re happy to confirm your order has been received and is being processed.</p>

          <h2 style="color:#10b981;">Order Summary</h2>
          <table width="100%" cellpadding="5" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 15px; color:#555;">
            <tr>
              <th align="left" style="border-bottom:1px solid #ddd;">Item</th>
              <th align="right" style="border-bottom:1px solid #ddd;">Price</th>
            </tr>
            <tr>
              <td style="border-bottom:1px solid #eee;">Product A</td>
              <td align="right" style="border-bottom:1px solid #eee;">$49.99</td>
            </tr>
            <tr>
              <td style="border-bottom:1px solid #eee;">Product B</td>
              <td align="right" style="border-bottom:1px solid #eee;">$29.99</td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Total</td>
              <td align="right" style="font-weight:bold;">$79.98</td>
            </tr>
          </table>

          <p style="margin-top:30px;">We will notify you once your order ships.</p>
          <p>Thanks for shopping with us!</p>
          <p>Best,<br>Customer Support</p>
        </td>
      </tr>
      <tr>
        <td style="background:#d1fae5; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#10b981; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}, {
  id: '29',
  title: 'Service Reminder',
  tags: ['Reminder', 'Service', 'Notification'],
  features: ['Friendly Tone', 'Action Prompt'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#f59e0b; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Your Service is Due Soon</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Hello,</p>
          <p>This is a friendly reminder that your next scheduled service appointment is coming up.</p>

          <h2 style="color:#f59e0b;">Appointment Details</h2>
          <ul style="padding-left:20px; color:#555; font-size:15px;">
            <li><strong>Date:</strong> September 5, 2025</li>
            <li><strong>Time:</strong> 10:00 AM</li>
            <li><strong>Location:</strong> 456 Service Center, City</li>
          </ul>

          <p style="margin-top:30px; text-align:center;">
            <a href="#" style="background:#f59e0b; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Confirm Appointment</a>
          </p>

          <p>Thank you for choosing us!</p>
          <p>Best regards,<br>Service Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#fef3c7; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#f59e0b; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}, {
  id: '30',
  title: 'Thank You Note',
  tags: ['Thank You', 'Appreciation'],
  features: ['Warm', 'Simple', 'Personal'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <tr>
        <td style="background:#6366f1; padding:30px; text-align:center; color:#fff;">
          <h1 style="margin:0; font-size:28px;">Thank You!</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
          <p>Dear Valued Customer,</p>
          <p>We want to express our sincere gratitude for your continued support.</p>

          <p>It’s customers like you who make our work so rewarding.</p>

          <p>We look forward to serving you again soon!</p>

          <p>Warm regards,<br>The Team</p>
        </td>
      </tr>
      <tr>
        <td style="background:#e0e7ff; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
          <p>© 2025 Company Name. All rights reserved.</p>
          <p><a href="#" style="color:#6366f1; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
},
{

 id: '31',
    title: 'Welcome Aboard',
    tags: ['Welcome', 'Onboarding'],
    features: ['Friendly', 'Informative'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#3b82f6; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Welcome to Our Community!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Hi there,</p>
            <p>Thank you for joining us! We're excited to have you on board. Explore the features and get the most out of your experience.</p>
            <p>If you have any questions, feel free to reach out.</p>
            <p>Cheers,<br>The Team</p>
          </td>
        </tr>
        <tr>
          <td style="background:#bfdbfe; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#3b82f6; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '32',
    title: 'Event Invitation',
    tags: ['Event', 'Invitation'],
    features: ['Call to Action', 'Visual Appeal'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#8b5cf6; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">You’re Invited!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Hello,</p>
            <p>We’re excited to invite you to our upcoming event. Join us for a day full of learning and networking.</p>
            <p><strong>Date:</strong> August 15, 2025<br><strong>Location:</strong> Downtown Conference Hall</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#8b5cf6; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">RSVP Now</a>
            </p>
            <p>We hope to see you there!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ddd6fe; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#8b5cf6; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '33',
    title: 'Weekly Digest',
    tags: ['Digest', 'Summary'],
    features: ['Brief', 'Engaging'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#f97316; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Your Weekly Digest</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Hi there,</p>
            <p>Here’s what’s new this week:</p>
            <ul style="padding-left:20px; color:#555;">
              <li>Insightful articles tailored for you</li>
              <li>Latest trends and news</li>
              <li>Upcoming events you shouldn’t miss</li>
            </ul>
            <p>Stay tuned for more updates!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fed7aa; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#f97316; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '34',
    title: 'Feedback Request',
    tags: ['Feedback', 'Survey'],
    features: ['Engagement', 'User Input'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#f43f5e; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">We Value Your Feedback</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Hello,</p>
            <p>Your opinion matters to us! Please take a moment to share your thoughts and help us improve.</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#f43f5e; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Give Feedback</a>
            </p>
            <p>Thank you for helping us grow!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fee2e2; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#f43f5e; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '35',
    title: 'Account Activation',
    tags: ['Activation', 'Welcome'],
    features: ['Clear CTA', 'Urgent'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#22c55e; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Activate Your Account</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Welcome!</p>
            <p>To get started, please activate your account by clicking the button below.</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#22c55e; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Activate Now</a>
            </p>
            <p>If you did not sign up, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#dcfce7; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#22c55e; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  }
  ,
  {
    id: '36',
    title: 'Product Launch',
    tags: ['Launch', 'Product'],
    features: ['Exciting', 'Visual'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#ef4444; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Introducing Our New Product</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:20px; text-align:center;">
            <img src="https://www.svgrepo.com/show/508699/landscape-placeholder.svg" alt="Product Image" style="width:80%; max-width:400px; border-radius:8px;">
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>We’re thrilled to announce the launch of our latest product designed to make your life easier and better.</p>
            <p>Discover all the amazing features and benefits by clicking the button below.</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#ef4444; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Learn More</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fee2e2; padding:20px; font-size:12px; color:#999; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#ef4444; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '37',
    title: 'Holiday Greetings',
    tags: ['Holiday', 'Seasonal'],
    features: ['Warm', 'Personal'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Georgia, serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#10b981; padding:30px; text-align:center; color:#fff; font-family: 'Georgia', serif;">
            <h1 style="margin:0; font-size:28px;">Happy Holidays!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5; font-family: 'Georgia', serif;">
            <p>Season’s greetings from all of us at Company Name. Wishing you a joyful holiday and a prosperous new year.</p>
            <p>Thank you for being a valued part of our community.</p>
            <p>Stay safe and enjoy the festivities!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#d1fae5; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#10b981; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '38',
    title: 'Password Reset',
    tags: ['Security', 'Account'],
    features: ['Urgent', 'Clear CTA'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#2563eb; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Reset Your Password</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to proceed.</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Reset Password</a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#dbeafe; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#2563eb; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '39',
    title: 'Monthly Newsletter',
    tags: ['Newsletter', 'Updates'],
    features: ['Informative', 'Branding'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#7c3aed; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Your Monthly News</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <h2 style="margin-top:0;">Highlights this month</h2>
            <ul style="padding-left:20px; color:#555;">
              <li>Exciting company milestones</li>
              <li>Upcoming product features</li>
              <li>Community spotlights</li>
            </ul>
            <p>Thank you for staying connected!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ede9fe; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#7c3aed; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },
  {
    id: '40',
    title: 'Service Reminder',
    tags: ['Reminder', 'Service'],
    features: ['Polite', 'Clear CTA'],
    html: `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:auto; font-family: Arial, sans-serif; background:#fff; border:1px solid #ddd; border-radius:8px;">
        <tr>
          <td style="background:#d97706; padding:30px; text-align:center; color:#fff;">
            <h1 style="margin:0; font-size:28px;">Service Reminder</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:25px; color:#333; font-size:16px; line-height:1.5;">
            <p>Dear Customer,</p>
            <p>This is a friendly reminder that your scheduled service is coming up soon.</p>
            <p>Please click the button below to confirm or reschedule.</p>
            <p style="text-align:center; margin-top:30px;">
              <a href="#" style="background:#d97706; color:#fff; padding:12px 24px; border-radius:5px; font-weight:bold; text-decoration:none;">Manage Appointment</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#fed7aa; padding:20px; font-size:12px; color:#555; text-align:center; border-top:1px solid #ddd;">
            <p>© 2025 Company Name. All rights reserved.</p>
            <p><a href="#" style="color:#d97706; text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    `
  },


  {
  id: '42',
  title: 'Complete Vehicle Service Experience',
  tags: ['Premium', 'Service', 'Reminder', 'Engaging'],
  features: ['Hero image', 'Timeline', 'Testimonials', 'Responsive'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:760px; margin:auto; font-family:'Segoe UI', sans-serif; background-color:#f4f4f4; color:#333; border-radius:10px; overflow:hidden; box-shadow:0 5px 20px rgba(0,0,0,0.1);">
      
      <!-- Hero Header -->
      <tr>
        <td style="background:#1e293b; padding:40px 30px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:36px;">Your Premium Service Journey Begins</h1>
          <p style="margin-top:10px; font-size:18px;">Complete Care. Unmatched Confidence.</p>
        </td>
      </tr>

      <!-- Hero Image -->
      <tr>
        <td>
          <img src="https://images.unsplash.com/photo-1597764691850-5fe3e5501361" width="100%" alt="Vehicle Service" style="display:block; max-height:300px; object-fit:cover;">
        </td>
      </tr>

      <!-- Introduction -->
      <tr>
        <td style="background:#ffffff; padding:30px;">
          <p>Hi [Customer Name],</p>
          <p>As a valued client, we’re excited to guide you through your upcoming premium vehicle service. This is more than just maintenance — it’s a full care experience designed for longevity, safety, and performance.</p>

          <h2 style="color:#0f172a; margin-top:30px;">🚗 What to Expect From This Visit:</h2>
          <ul style="padding-left:20px; margin-top:10px;">
            <li>Full Multi-Point Vehicle Inspection</li>
            <li>Oil Change with Synthetic Upgrade</li>
            <li>Brake Health Analysis & Fluid Check</li>
            <li>Tyre Rotation & Tread Evaluation</li>
            <li>Battery & Charging System Diagnostic</li>
            <li>Detailed Interior Sanitation</li>
            <li>Complimentary Exterior Wash</li>
          </ul>
        </td>
      </tr>

      <!-- Timeline -->
      <tr>
        <td style="background:#f1f5f9; padding:30px;">
          <h2 style="margin-bottom:15px; color:#1e293b;">📅 Personalized Service Timeline</h2>
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px;">
            <tr>
              <td style="padding:10px;"><strong>🕘 9:00 AM</strong></td>
              <td style="padding:10px;">Vehicle Drop-Off & Welcome Consultation</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:10px;"><strong>🛠️ 9:30 AM</strong></td>
              <td style="padding:10px;">Full System Diagnostics & Fluids Inspection</td>
            </tr>
            <tr>
              <td style="padding:10px;"><strong>🔍 11:00 AM</strong></td>
              <td style="padding:10px;">Brake, Battery, and Engine Analysis</td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:10px;"><strong>🧼 12:30 PM</strong></td>
              <td style="padding:10px;">Cleaning & Interior Detail</td>
            </tr>
            <tr>
              <td style="padding:10px;"><strong>✅ 2:00 PM</strong></td>
              <td style="padding:10px;">Final Quality Checks & Pick-Up Notification</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Testimonials -->
      <tr>
        <td style="background:#ffffff; padding:30px;">
          <h2 style="margin-bottom:15px; color:#0f172a;">⭐ What Customers Are Saying</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #e2e8f0;">
                <p style="font-style:italic;">"Absolutely top-tier experience. My car feels brand new again!"</p>
                <p style="font-size:14px; color:#555;">– Jordan M.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #e2e8f0;">
                <p style="font-style:italic;">"Professional, transparent, and worth every penny."</p>
                <p style="font-size:14px; color:#555;">– Elise R.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <p style="font-style:italic;">"This service was leagues ahead of the usual garage. Loved it."</p>
                <p style="font-size:14px; color:#555;">– Shaun D.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA Block -->
      <tr>
        <td style="background:#e2e8f0; padding:30px; text-align:center;">
          <h2 style="color:#1e293b;">🗓️ Secure Your Service Slot</h2>
          <p style="margin:10px 0 25px;">Appointments fill up quickly. Lock in your spot now to ensure your vehicle gets the premium treatment it deserves.</p>
          <a href="#" style="background:#10b981; color:#ffffff; padding:16px 32px; font-size:16px; font-weight:bold; border-radius:8px; text-decoration:none;">Book My Service</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0f172a; color:#cbd5e1; padding:30px; text-align:center; font-size:13px;">
          <p>AutoCare Elite, 123 Motorway Dr, Autoville, ZZ 45678</p>
          <p>Email: <a href="mailto:support@autocareelite.com" style="color:#3b82f6;">support@autocareelite.com</a> | Call: (123) 456-7890</p>
          <p style="margin-top:10px;">
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Facebook</a> |
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Instagram</a> |
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Website</a>
          </p>
          <p style="margin-top:15px;"><a href="#" style="color:#f87171; text-decoration:none;">Unsubscribe</a> | <a href="#" style="color:#f87171; text-decoration:none;">Privacy Policy</a></p>
        </td>
      </tr>

    </table>
  `
},
{
  id: '44',
  title: 'Elite Auto Service Alert (Expanded)',
  tags: ['Luxury', 'Bold', 'Value-Dense'],
  features: ['Double content per section', 'Compact', 'Modern'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:700px; margin:auto; font-family:'Helvetica Neue', sans-serif; background:#fdfdfd; border-radius:12px; box-shadow:0 6px 30px rgba(0,0,0,0.08); overflow:hidden;">

      <!-- Banner / Headline -->
      <tr>
        <td style="background:linear-gradient(135deg, #0f172a, #334155); color:#fff; padding:50px 30px; text-align:center;">
          <h1 style="font-size:30px; margin:0;">Elite Auto Service Alert</h1>
          <p style="margin-top:10px; font-size:16px; opacity:0.85;">Performance. Protection. Precision.</p>
          <p style="margin-top:8px; font-size:14px; opacity:0.7;">Experience a smoother, safer ride with certified care and zero hassle.</p>
        </td>
      </tr>

      <!-- Icon Grid / Highlights -->
      <tr>
        <td style="padding:30px 30px; background:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;">
            <tr>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/car.png" alt="Service" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>Pro Diagnostics</strong></p>
                <p style="font-size:12px; color:#555;">Advanced scanning for hidden issues before they affect performance.</p>
              </td>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/wrench.png" alt="Tools" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>Precision Tune-Up</strong></p>
                <p style="font-size:12px; color:#555;">Engine optimization and fluid balance for maximum efficiency.</p>
              </td>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/checked-2.png" alt="Check" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>Certified Report</strong></p>
                <p style="font-size:12px; color:#555;">A full checklist emailed to you with insights and technician notes.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/clock.png" alt="Fast" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>Same-Day Service</strong></p>
                <p style="font-size:12px; color:#555;">Drop-off in the morning, back on the road by evening.</p>
              </td>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/customer-support.png" alt="Support" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>VIP Support</strong></p>
                <p style="font-size:12px; color:#555;">Real-time updates and service advisors always available.</p>
              </td>
              <td style="padding:12px;">
                <img src="https://img.icons8.com/fluency/48/parking.png" alt="Pickup" style="margin:auto;">
                <p style="margin:8px 0 0; font-size:14px;"><strong>Pickup & Drop</strong></p>
                <p style="font-size:12px; color:#555;">Stay home — we’ll handle the logistics and bring your car back serviced.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="padding:30px 30px; background:#f9fafb; color:#1e293b;">
          <p style="font-size:16px; margin-bottom:16px;">Hi [Customer Name],</p>
          <p style="font-size:15px; margin-bottom:12px;">
            We’re reaching out to let you know that your vehicle is due for its premium service experience.
          </p>
          <p style="font-size:14px; margin-bottom:0;">
            Based on your driving history and vehicle type, we've curated a care plan that balances performance, safety, and long-term reliability. Our technicians will walk you through a tailored service — and you’ll be kept in the loop every step of the way.
          </p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:35px 30px; text-align:center; background:#f9fafb;">
          <a href="#" style="display:inline-block; background:#10b981; color:#fff; padding:16px 30px; font-size:16px; border-radius:8px; text-decoration:none; font-weight:bold;">Confirm My Service Slot</a>
          <p style="font-size:13px; color:#64748b; margin-top:10px;">Need to reschedule? No problem — just click and select a new date.</p>
        </td>
      </tr>

      <!-- Testimonials x2 -->
      <tr>
        <td style="padding:25px 30px; background:#ffffff; border-top:1px solid #e5e7eb; text-align:center;">
          <p style="font-size:13px; margin:0; font-style:italic; color:#555;">
            “Hands-down the smoothest car service process I've ever used. Zero stress.”<br>
            <span style="font-size:12px;">– Laura B.</span>
          </p>
          <p style="font-size:13px; margin:20px 0 0; font-style:italic; color:#555;">
            “From booking to pickup, everything was handled with care and clarity.”<br>
            <span style="font-size:12px;">– Marcus V.</span>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0f172a; color:#cbd5e1; text-align:center; font-size:12px; padding:25px;">
          <p style="margin:0;">AutoCare Elite • 123 Motorway Dr, Autoville</p>
          <p style="margin:5px 0;">support@autocareelite.com • (123) 456-7890</p>
          <p style="margin-top:10px;">
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Facebook</a> |
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Instagram</a> |
            <a href="#" style="color:#93c5fd; text-decoration:none; margin:0 8px;">Website</a>
          </p>
          <p style="margin-top:10px;">
            <a href="#" style="color:#f87171; text-decoration:none;">Unsubscribe</a> |
            <a href="#" style="color:#f87171; text-decoration:none;">Privacy Policy</a>
          </p>
        </td>
      </tr>

    </table>
  `
},
{
  id: '45',
  title: 'Precision Service, Delivered',
  tags: ['Luxury', 'Apple-style', 'Sleek', 'Content-rich'],
  features: ['Minimalist aesthetic', 'Full of premium content', 'Elegant layout'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:760px; margin:auto; background:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a; line-height:1.6;">

      <!-- Header -->
      <tr>
        <td style="padding:60px 30px 40px; text-align:center;">
          <img src="https://img.icons8.com/ios-filled/50/000000/car--v1.png" width="50" alt="Auto Icon" style="margin-bottom:20px;" />
          <h1 style="font-size:36px; font-weight:600; margin:0;">Precision Service. Delivered.</h1>
          <p style="font-size:18px; margin:10px 0 0; color:#4b5563;">Experience the future of automotive care — elegant, efficient, and effortless.</p>
        </td>
      </tr>

      <!-- Hero Image -->
      <tr>
        <td>
          <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80" width="100%" style="max-height:300px; object-fit:cover;" alt="Luxury car service" />
        </td>
      </tr>

      <!-- Welcome Message -->
      <tr>
        <td style="padding:50px 30px;">
          <h2 style="font-size:24px; font-weight:500; margin-bottom:15px;">Hi [Customer Name],</h2>
          <p style="margin:0 0 20px;">Your vehicle is due for its precision-tuned service. This isn’t a routine check — it's a comprehensive performance evaluation paired with white-glove treatment.</p>
          <p style="margin:0;">Book today and unlock priority support, same-day turnaround, and a full digital health report for your vehicle.</p>
        </td>
      </tr>

      <!-- Features Section -->
      <tr>
        <td style="padding:40px 30px; background:#f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center; padding:20px;">
                <img src="https://img.icons8.com/ios-filled/40/000000/inspection.png" alt="Inspection Icon" />
                <h3 style="margin:15px 0 5px; font-size:18px;">Full Diagnostics</h3>
                <p style="font-size:14px; color:#4b5563;">We scan and evaluate 100+ systems with certified-grade precision.</p>
              </td>
              <td style="text-align:center; padding:20px;">
                <img src="https://img.icons8.com/ios-filled/40/000000/gear.png" alt="Tune-Up Icon" />
                <h3 style="margin:15px 0 5px; font-size:18px;">Performance Tuning</h3>
                <p style="font-size:14px; color:#4b5563;">Enhance responsiveness, efficiency, and fuel economy in one go.</p>
              </td>
              <td style="text-align:center; padding:20px;">
                <img src="https://img.icons8.com/ios-filled/40/000000/checkmark.png" alt="Report Icon" />
                <h3 style="margin:15px 0 5px; font-size:18px;">Digital Health Report</h3>
                <p style="font-size:14px; color:#4b5563;">You’ll receive a detailed, visual service report straight to your inbox.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Visual CTA -->
      <tr>
        <td style="padding:60px 30px; text-align:center;">
          <h2 style="font-size:26px; font-weight:600; margin-bottom:20px;">Reserve Your Service Window</h2>
          <p style="font-size:16px; color:#4b5563; margin-bottom:30px;">Spots are limited. Confirm your appointment now and we’ll handle the rest — pickup included.</p>
          <a href="#" style="display:inline-block; background:#000000; color:#ffffff; text-decoration:none; padding:16px 36px; font-size:16px; border-radius:8px; font-weight:500;">Schedule My Service</a>
        </td>
      </tr>

      <!-- Trust Builder -->
      <tr>
        <td style="padding:40px 30px; background:#f1f5f9; text-align:center;">
          <p style="font-style:italic; font-size:14px; color:#4b5563; margin-bottom:10px;">“Honestly felt like a premium tech product launch, not a car service. I’m impressed.”</p>
          <p style="font-size:13px; color:#6b7280;">— Natalie F., Elite Member</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:40px 30px; text-align:center; font-size:12px; color:#9ca3af;">
          <p style="margin:0;">AutoCare Elite · 123 Motorway Drive · Autoville</p>
          <p style="margin:5px 0;">support@autocareelite.com · (123) 456-7890</p>
          <p style="margin-top:10px;">
            <a href="#" style="color:#6b7280; text-decoration:none;">Unsubscribe</a> | 
            <a href="#" style="color:#6b7280; text-decoration:none;">Privacy Policy</a>
          </p>
        </td>
      </tr>

    </table>
  `
}, 
{
  id: '46',
  title: 'Premium Service Notice',
  tags: ['Reminder', 'Luxury', 'Apple-style'],
  features: ['Minimalist Design', 'Content-Rich', 'High Trust'],
  html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:700px; margin:auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f8f8f8; border-radius:12px; overflow:hidden; box-shadow:0 0 30px rgba(0,0,0,0.05);">
      <!-- Header -->
      <tr>
        <td style="background:#000; padding:40px; text-align:center;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" width="40" alt="Apple" style="margin-bottom:20px;">
          <h1 style="color:#fff; font-size:26px; margin:0;">Time for Your Next Service</h1>
          <p style="color:#aaa; font-size:14px; margin-top:8px;">Tailored for your experience</p>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding:40px; color:#111; background:#fff;">
          <h2 style="margin-top:0; font-size:20px;">A Smoother Journey Ahead</h2>
          <p style="font-size:15px; line-height:1.6;">
            We noticed it's time for your routine service. Regular maintenance ensures performance, reliability, and peace of mind. At Neura, we treat your vehicle—and your time—with care and precision.
          </p>

          <ul style="margin-top:25px; padding-left:20px; font-size:15px; line-height:1.8;">
            <li>✔ Personalized diagnostics by certified technicians</li>
            <li>✔ Complimentary fluid top-up & interior clean</li>
            <li>✔ Service history sync with your digital profile</li>
          </ul>

          <p style="margin-top:30px;">
            <a href="#" style="background:#000; color:#fff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:500;">Book Now</a>
          </p>
        </td>
      </tr>

      <!-- Device Image Section -->
      <tr>
        <td style="text-align:center; background:#fafafa; padding:30px;">
          <img src="https://images.unsplash.com/photo-1597003431868-0eae87ed94e4?auto=format&fit=crop&w=800&q=80" width="100%" alt="Vehicle" style="max-width:640px; border-radius:10px;">
          <p style="font-size:13px; color:#888; margin-top:10px;">Your next service, redefined by elegance and innovation.</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f0f0f0; padding:30px; text-align:center; font-size:12px; color:#777;">
          <p style="margin:0;">Need help? <a href="#" style="color:#000; text-decoration:underline;">Contact Support</a></p>
          <p style="margin:8px 0;">© 2025 Neura Automotive. All rights reserved.</p>
          <p style="margin:0;"><a href="#" style="color:#555; text-decoration:none;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  `
}
























];



function apply_template(id, custom = false) {
  console.log('applying tempate: ', id, custom_templates);
   console.log('compare:', templates, custom_templates);
  let selected;
  if (custom == true) {
    selected = custom_templates.find(t => t.id == id);
  } else 
  {
    selected = templates.find(t => t.id === id);
  }
  if (selected && selected.html) {
    setEmailHtml(selected.html);
    scrollToBuilder();
  }
}

// Load templates into the grid


// Update template count



function display_template_display_modal(template_id, custom = false) {
  console.log('compare:', templates, custom_templates);
  const modal = document.getElementById('temp-display_modal');
  const modalInner = document.getElementById('modal-inner');
  const iframe = document.getElementById('templatePreviewFrame');

  if (!modal || !iframe || !modalInner) return;

  // Lookup the template by ID
  let template;
  if (custom == true) {
    template = custom_templates.find(t => t.id == template_id);
  } else {
    template = templates.find(t => t.id === template_id);
  }
  if (!template || !template.html) return;

  const safe_html = template.html;

  const styledHTML = `
    <style>
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-thumb { background-color: #ec4899; border-radius: 4px; }
      ::-webkit-scrollbar-track { background-color: #f1f1f1; }
      html { scrollbar-width: thin; scrollbar-color: #ec4899 #f1f1f1; }
      body { margin: 0; }
    </style>
    ${safe_html}
  `;

  iframe.srcdoc = styledHTML;

  // Show modal
  modal.classList.remove('hidden');

  // Trigger CSS transitions
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');

    modalInner.classList.remove('scale-95');
    modalInner.classList.add('scale-100');
  }, 20);
}


function close_template_display_modal() {
  const modal = document.getElementById('temp-display_modal');
  const modalInner = document.getElementById('modal-inner');
  const iframe = document.getElementById('templatePreviewFrame');

  if (!modal || !iframe || !modalInner) return;

  // Start hide animation
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');

  modalInner.classList.remove('scale-100');
  modalInner.classList.add('scale-95');

  // After animation finishes, hide modal and clear iframe
  setTimeout(() => {
    modal.classList.add('hidden');
    iframe.srcdoc = '';
  }, 300); // same duration as your CSS transition
}
