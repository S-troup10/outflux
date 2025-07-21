 async function startCheckout(priceId) {
    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ priceId: priceId })
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error: " + data.error);
    }
  }




// Subscription management functions

async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.')) {
        return;
    }

    try {
        const response = await fetch('/cancel-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Subscription cancelled successfully. It will remain active until the end of your billing period.', 'success');
            // Refresh subscription status
            await loadSubscriptionStatus();
        } else {
            showNotification(data.error || 'Failed to cancel subscription', 'error');
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        showNotification('An error occurred while cancelling subscription', 'error');
    }
}

async function loadSubscriptionStatus() {
    try {
        const response = await fetch('/get-subscription-status');
        const data = await response.json();

        if (data.error) {
            console.error('Error loading subscription status:', data.error);
            return;
        }

        updateSubscriptionUI(data);
    } catch (error) {
        console.error('Error loading subscription status:', error);
    }
}

function updateSubscriptionUI(subscriptionData) {
    const statusElement = document.getElementById('subscription-status');
    const actionElement = document.getElementById('subscription-actions');

    if (!statusElement || !actionElement) return;

    if (subscriptionData.subscription === 'none' || subscriptionData.status === 'inactive') {
        statusElement.innerHTML = `
            <div class="text-center p-6">
                <i class="fas fa-circle text-gray-500 text-sm mr-2"></i>
                <span class="text-gray-400">No active subscription</span>
            </div>
        `;
        actionElement.innerHTML = '';
        return;
    }

    // Active subscription
    const planName = subscriptionData.subscription.charAt(0).toUpperCase() + subscriptionData.subscription.slice(1);
    const statusIcon = subscriptionData.status === 'active' ? 'fa-check-circle text-green-400' : 'fa-exclamation-circle text-yellow-400';
    
    let statusText = subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1);
    
    if (subscriptionData.cancel_at_period_end) {
        statusText += ' (Cancelling at period end)';
    }

    statusElement.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-xl font-bold text-white">${planName} Plan</h3>
                    <p class="text-blue-200 flex items-center">
                        <i class="fas ${statusIcon} mr-2"></i>
                        ${statusText}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-400">Next billing</p>
                    <p class="text-white">${new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    `;

    if (subscriptionData.status === 'active' && !subscriptionData.cancel_at_period_end) {
        actionElement.innerHTML = `
            <button onclick="cancelSubscription()" 
                    class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200">
                <i class="fas fa-times mr-2"></i>Cancel Subscription
            </button>
        `;
    } else {
        actionElement.innerHTML = '';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-600 text-white' :
        type === 'error' ? 'bg-red-600 text-white' :
        'bg-blue-600 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
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
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('subscription-status')) {
        loadSubscriptionStatus();
    }
});

// Check for URL parameters indicating success/error
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('success') === 'subscription_updated') {
        showNotification('Subscription updated successfully!', 'success');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        loadSubscriptionStatus();
    } else if (urlParams.get('cancelled') === 'true') {
        showNotification('Payment was cancelled', 'info');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    } else if (urlParams.get('error')) {
        const error = urlParams.get('error');
        let errorMessage = 'An error occurred';
        
        switch (error) {
            case 'no_session':
                errorMessage = 'Payment session not found';
                break;
            case 'payment_not_completed':
                errorMessage = 'Payment was not completed';
                break;
            case 'db_update_failed':
                errorMessage = 'Failed to update subscription status';
                break;
            case 'processing_failed':
                errorMessage = 'Failed to process payment';
                break;
            default:
                errorMessage = 'Payment processing error';
        }
        
        showNotification(errorMessage, 'error');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
});
