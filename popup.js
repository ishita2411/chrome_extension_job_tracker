const saveJobBtn = document.getElementById('saveJobBtn');
const messageDiv = document.getElementById('message');

// Google Apps Script Web App endpoint
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuPd2XFUfSCSaHmNsja8jtkWnnxMzOSowFwb-Pewy9oI9nGfYp_UpCkGpzFEId4R4t/exec';

saveJobBtn.addEventListener('click', async () => {
  showMessage('Getting current page...', 'info');

  try {
    // Get the current tab's URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    let jobLink = currentTab.url;

    // Remove query parameters to get the clean base URL
    const urlObj = new URL(jobLink);
    jobLink = urlObj.origin + urlObj.pathname;

    if (!jobLink) {
      showMessage('Could not get page URL', 'error');
      return;
    }

    showMessage('Saving...', 'info');

    // Send the URL to Google Sheets
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobLink: jobLink,
        timestamp: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.status === 'duplicate') {
      showMessage('This job link already saved!', 'error');
    } else if (result.status === 'success') {
      showMessage('Job link saved successfully!', 'success');
    } else {
      showMessage('Error: ' + result.message, 'error');
    }
  } catch (error) {
    showMessage('Error saving job link. Check console.', 'error');
    console.error('Error:', error);
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.textContent = '';
      messageDiv.className = 'message';
    }, 3000);
  }
}
