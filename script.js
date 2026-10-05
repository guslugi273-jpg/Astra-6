const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const user = tg?.initDataUnsafe?.user || { id: 12345678 };
let state = {
  active_id: 1,
  chats: { 1: [] }
};

const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const sessionsBar = document.getElementById('sessions-bar');
const btnNewChat = document.getElementById('btn-new-chat');

function renderSessions() {
  sessionsBar.innerHTML = '';
  Object.keys(state.chats).forEach(id => {
    const chip = document.createElement('div');
    chip.className = `session-chip ${parseInt(id) === state.active_id ? 'active' : ''}`;
    chip.textContent = `Диалог #${id}`;
    chip.onclick = () => switchSession(parseInt(id));
    sessionsBar.appendChild(chip);
  });
}

function renderMessages() {
  chatArea.innerHTML = '';
  const currentChat = state.chats[state.active_id] || [];
  
  if (currentChat.length === 0) {
    chatArea.innerHTML = `
      <div class="empty-state">
        <div class="sparkle-icon">✨</div>
        <p>Чем я могу помочь вам сегодня?</p>
      </div>`;
    return;
  }

  currentChat.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${msg.role}`;
    bubble.textContent = msg.content;
    chatArea.appendChild(bubble);
  });

  chatArea.scrollTop = chatArea.scrollHeight;
}

function switchSession(id) {
  state.active_id = id;
  renderSessions();
  renderMessages();
}

btnNewChat.onclick = () => {
  const newId = Object.keys(state.chats).length + 1;
  state.chats[newId] = [];
  switchSession(newId);
};

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const currentChat = state.chats[state.active_id] || [];
  currentChat.push({ role: 'user', content: text });
  messageInput.value = '';
  renderMessages();

  // Имитация ответа Astra AI
  setTimeout(() => {
    currentChat.push({ role: 'assistant', content: `[Mini App]: Запрос "${text}" обработан.` });
    renderMessages();
  }, 800);
};

renderSessions();
renderMessages();
