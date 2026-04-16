const saveJobBtn = document.getElementById('saveJobBtn');
const messageDiv = document.getElementById('message');
const companyNameInput = document.getElementById('companyName');

// Google Apps Script Web App endpoint
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxeY38iALG_JEp5aHcTK2xLOXwjUyqVnuJdlIb8OUQEDXFOevM5CjGKLto43iUCvfP-/exec';

// Load company name when popup opens
window.addEventListener('load', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // Use sendMessage with Promise for better error handling
    try {
      const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'getCompanyName' });
      if (response && response.companyName) {
        companyNameInput.value = response.companyName;
      }
    } catch (error) {
      console.log('Content script not available on this page:', error.message);
    }
    
    // Clear any loading messages
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  } catch (error) {
    console.error('Error loading company name:', error);
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }
});

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

    // Get company name from input
    const companyName = companyNameInput.value.trim();

    if (!companyName) {
      showMessage('Please enter a company name', 'error');
      return;
    }

    showMessage('Saving...', 'info');

    // Send the URL and company name to Google Sheets
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobLink: jobLink,
        companyName: companyName,
        timestamp: new Date().toISOString().split('T')[0],
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
