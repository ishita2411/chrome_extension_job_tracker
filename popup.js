const greetBtn = document.getElementById('greetBtn');
const messageDiv = document.getElementById('message');

greetBtn.addEventListener('click', () => {
  messageDiv.textContent = 'Hello! Your extension is working.';
});
