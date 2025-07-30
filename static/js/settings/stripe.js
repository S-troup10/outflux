async function startCheckout(priceId) {
  document.getElementById("loader").classList.remove("hidden");
  const res = await fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priceId: priceId }),
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    showToast("Error: " + data.error);
    document.getElementById("loader").classList.add("hidden");
  }
}

// Subscription management functions





async function manageSubscription() {
  try {
    document.getElementById("loader").classList.remove("hidden");
    const response = await fetch("/create-customer-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      showNotification(
        data.error || "Failed to create management session",
        "error"
      );
      document.getElementById("loader").classList.remove("hidden");
    }
  } catch (error) {
    document.getElementById("loader").classList.remove("hidden");
    console.error("Error creating management session:", error);
    showNotification(
      "An error occurred while creating management session",
      "error"
    );
  }
}








async function loadSubscriptionStatus() {
  try {
    const response = await fetch("/get-subscription-status");
    const data = await response.json();

    if (data.error) {
      console.error("Error loading subscription status:", data.error);
      return;
    }

    updateSubscriptionUI(data);
  } catch (error) {
    console.error("Error loading subscription status:", error);
  }
}





function Direct_to_subscriptions() {
  switchScreen("settings");
  switchSettingsTab("subscription");
}



let email_limit;

function update_limits(subscription, renew) {

  window.isProUser = subscription !== 'none';
   // this is for daily
  let plan_limit;
  if (subscription == "none") {
    email_limit = 3;
    plan_limit = "Base Plan (90 emails / month)";
  }
  if (subscription == "pro") {
    email_limit = 50;
    plan_limit = "Pro Plan (1500 emails / month)";
  }
  if (subscription == "premium") {
    email_limit = 9999;
    plan_limit = "Premium Plan (Unlimited emails / month)";
  }
  console.log(sent_count);
  const limit_text = sent_count + "/" + email_limit;
  document.getElementById("usage-emails-sent").innerText = limit_text;

  document.getElementById("usage-emails-limit").innerText = plan_limit;

  document.getElementById("usage-emails-date").innerText = renew;

  populateAccessList(subscription);
}

function updateSubscriptionUI(subscriptionData) {
  const renewDate = new Date(subscriptionData.current_period_end);
  const formatted = renewDate.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const interval = setInterval(() => {
    if (typeof MAIN_DETAILS !== "undefined" && MAIN_DETAILS !== null) {
      // MAIN_DETAILS is ready, run the function
      console.log("sub: ", subscriptionData);
      update_limits(subscriptionData.subscription, formatted);
      clearInterval(interval); // stop checking
    }
  }, 200); // check every 200ms

  const isPro = subscriptionData.subscription !== "none";


  const overlay = document.getElementById("pro-lock-overlay");
  const analytics = document.getElementById("analytics");

  if (!isPro) {
    analytics.style.overflow = "hidden";
    const button = document.getElementById("free_button");
    button.disabled = true;
    button.classList.add("opacity-50", "cursor-not-allowed");
    button.innerText = button.innerText + " (Selected)";
    button.classList.forEach((cls) => {
      if (cls.startsWith("hover:")) {
        button.classList.remove(cls);
      }
    });

    overlay.classList.remove("hidden");
  }

  if (subscriptionData.subscription == "pro") {
    const button = document.getElementById("pro_button");
    button.disabled = true;
    button.classList.add("opacity-50", "cursor-not-allowed");
    button.innerText = button.innerText + " (Selected)";
    button.classList.forEach((cls) => {
      if (cls.startsWith("hover:")) {
        button.classList.remove(cls);
      }
    });
  }

  if (subscriptionData.subscription == "premium") {
    const button = document.getElementById("premium_button");
    button.disabled = true;
    button.classList.add("opacity-50", "cursor-not-allowed");
    button.innerText = button.innerText + " (Selected)";
    button.classList.forEach((cls) => {
      if (cls.startsWith("hover:")) {
        button.classList.remove(cls);
      }
    });
  }

  const statusElement = document.getElementById("subscription-status");
  const actionElement = document.getElementById("subscription-actions");

  if (!statusElement || !actionElement) return;

  if (
    subscriptionData.subscription === "none" ||
    subscriptionData.status === "inactive"
  ) {
    statusElement.innerHTML = `
            <div class="text-center p-6 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl">
                <i class="fas fa-circle text-gray-500 text-sm mr-2"></i>
                <span class="text-gray-400">No active subscription</span>
            </div>
        `;
    actionElement.innerHTML = "";
    return;
  }

  // Active subscription
  const planName =
    subscriptionData.subscription.charAt(0).toUpperCase() +
    subscriptionData.subscription.slice(1);
  const statusIcon =
    subscriptionData.status === "active"
      ? "fa-check-circle text-green-400"
      : "fa-exclamation-circle text-yellow-400";

  let statusText =
    subscriptionData.status.charAt(0).toUpperCase() +
    subscriptionData.status.slice(1);
  if (subscriptionData.cancel_at_period_end) {
    statusText += " (Cancelling at period end)";
  }

  statusElement.innerHTML = `
        <div class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-800/40 to-purple-900/50 p-6 shadow-md">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 class="text-2xl font-extrabold text-white mb-1">${planName} Plan</h3>
                    <p class="text-blue-200 text-sm flex items-center">
                        <i class="fas ${statusIcon} mr-2"></i>${statusText}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-400">Next Billing</p>
                    <p class="text-white font-semibold text-lg">${formatted}</p>
                </div>
            </div>
        </div>
    `;

  // Beautiful Manage Subscription Button
  if (subscriptionData.has_customer) {
    actionElement.innerHTML = `
            <div class="mt-6 flex justify-center">
                <button onclick="manageSubscription()" 
                        class="relative group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition duration-300 ease-in-out shadow-lg">
                    <i class="fas fa-cog mr-2 text-white text-base"></i>
                    <span>Manage Subscription</span>
                   
                </button>
            </div>
        `;
  } else {
    actionElement.innerHTML = "";
  }
}








function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
    type === "success"
      ? "bg-green-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-blue-600 text-white"
  }`;

  notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
              type === "success"
                ? "fa-check-circle"
                : type === "error"
                ? "fa-exclamation-circle"
                : "fa-info-circle"
            } mr-2"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}







// Load subscription status when page loads
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("subscription-status")) {
    loadSubscriptionStatus();
  }
});







// Check for URL parameters indicating success/error
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("success") === "subscription_updated") {
    ShowToast("Subscription updated successfully!");
    // Clean up URL
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
    loadSubscriptionStatus();
  } else if (urlParams.get("cancelled") === "true") {
    ShowToast("Payment was cancelled");
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
  } else if (urlParams.get("error")) {
    const error = urlParams.get("error");
    let errorMessage = "An error occurred";

    switch (error) {
      case "no_session":
        errorMessage = "Payment session not found";
        break;
      case "payment_not_completed":
        errorMessage = "Payment was not completed";
        break;
      case "db_update_failed":
        errorMessage = "Failed to update subscription status";
        break;
      case "processing_failed":
        errorMessage = "Failed to process payment";
        break;
      default:
        errorMessage = "Payment processing error";
    }

    ShowToast(errorMessage, False);
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
  }
});



const featuresByPlan = {
  free: [
    {
      icon: "fa-envelope-open-text",
      text: "3 emails/day (approx. 90/month)",
      color: "text-blue-400",
    },
    { icon: "fa-edit", text: "Basic email editor", color: "text-blue-400" },
    { icon: "fa-headset", text: "Email support", color: "text-blue-400" },
  ],
  pro: [
    {
      icon: "fa-envelope",
      text: "1,500 emails/month",
      color: "text-yellow-300",
    },
    {
      icon: "fa-edit",
      text: "Enhanced email editor",
      color: "text-yellow-300",
    },
    {
      icon: "fa-chart-bar",
      text: "Detailed analytics dashboard",
      color: "text-yellow-300",
    },
    {
      icon: "fa-th-large",
      text: "Customizable templates",
      color: "text-yellow-300",
    },
    { icon: "fa-headset", text: "Priority support", color: "text-yellow-300" },
  ],
  premium: [
    { icon: "fa-infinity", text: "Unlimited emails", color: "text-yellow-600" },
    {
      icon: "fa-users",
      text: "Multi-user/team accounts",
      color: "text-yellow-600",
    },
    {
      icon: "fa-plug",
      text: "API & CRM integrations",
      color: "text-yellow-600",
    },
    { icon: "fa-headset", text: "24/7 VIP support", color: "text-yellow-600" },
  ],
};

function populateAccessList(plan) {
  const ul = document.getElementById("usage_access");
  ul.innerHTML = "";

  const features = featuresByPlan[plan] || [];

  if (features.length === 0) {
    ul.innerHTML = `<li class="text-slate-400">No access information available.</li>`;
    return;
  }

  features.forEach((feature) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-blue-400/50 shadow transition-all duration-300";

    li.innerHTML = `
        <i class="fas ${feature.icon} ${feature.color} w-5 text-lg"></i>
        <span class="text-slate-200">${feature.text}</span>
      `;

    ul.appendChild(li);
  });
}


function showThankYouModal() {
  document.getElementById('thank-you-modal').classList.remove('hidden');
}

function closeThankYouModal() {
  document.getElementById('thank-you-modal').classList.add('hidden');
}

function isWithinUsageLimit() {
    return sent_count <= email_limit;
}