const API_ENDPOINT = '/api/chat';
let useTamil = false;

const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const langToggle = document.getElementById('langToggle');

langToggle.onclick = () => {
  useTamil = !useTamil;
  langToggle.textContent = useTamil ? "Tamil: ON" : "Tamil: OFF";
};

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = 'message ' + sender;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  userInput.value = '';

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language: useTamil ? 'ta' : 'en' })
    });
    const data = await res.json();
    addMessage(data.reply, 'ai');
  } catch (err) {
    addMessage('Error: ' + err.message, 'ai');
  }
}

sendBtn.onclick = sendMessage;
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
