const API_ENDPOINT = '/api/chat';
let useTamil = false;

const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
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
  const file = imageInput.files[0];

  if (!text && !file) return;

  if (text) addMessage(text, 'user');
  if (file) addMessage(`📷 Image: ${file.name}`, 'user');

  userInput.value = '';
  imageInput.value = '';

  let base64Image = null;
  if (file) {
    base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: text, 
        language: useTamil ? 'ta' : 'en',
        image: base64Image
      })
    });
    const data = await res.json();
    addMessage(data.reply, 'ai');
  } catch (err) {
    addMessage('Error: ' + err.message, 'ai');
  }
}

sendBtn.onclick = sendMessage;
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});
