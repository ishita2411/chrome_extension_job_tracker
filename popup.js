const jobForm = document.getElementById('jobForm');
const jobInput = document.getElementById('jobLink');
const messageDiv = document.getElementById('message');

// Google Apps Script Web App endpoint
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyWy--OFMAT81P0nRpeqm7ZHJRnqNRP9IWKvL4vMNctZ1iTEIg4MRcK-WChCv6A0Jm/exec';

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const jobLink = jobInput.value.trim();

  if (!jobLink) {
    showMessage('Please enter a job link', 'error');
    return;
  }

  showMessage('Saving...', 'info');

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobLink: jobLink,
        timestamp: new Date().toISOString(),
      }),
    });

    showMessage('Job link saved successfully!', 'success');
    jobInput.value = '';
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
