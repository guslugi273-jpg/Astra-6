const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
}

let state = {
  active_id: 1,
  chats: { 1: [] },
  attachedFile: null
};

const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const sessionsBar = document.getElementById('sessions-bar');
const btnNewChat = document.getElementById('btn-new-chat');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('file-preview-container');
const previewName = document.getElementById('file-preview-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const voiceBtn = document.getElementById('voice-btn');
const roleSelector = document.getElementById('role-selector');

attachBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const isText = file.type.startsWith('text/') || file.name.match(/\.(py|js|json|html|css|md|csv)$/i);

  if (isText) {
    reader.onload = (event) => {
      state.attachedFile = { name: file.name, type: 'text', content: event.target.result };
      showPreview(file.name);
    };
    reader.readAsText(file);
  } else {
    reader.onload = (event) => {
      state.attachedFile = { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'media', content: event.target.result };
      showPreview(file.name);
    };
    reader.readAsDataURL(file);
  }
};

function showPreview(name) {
  previewName.textContent = `📎 ${name}`;
  previewContainer.classList.remove('hidden');
}

removeFileBtn.onclick = () => {
  state.attachedFile = null;
  fileInput.value = '';
  previewContainer.classList.add('hidden');
};

// Голосовой ввод (Web Speech API)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';

  voiceBtn.onclick = () => {
    recognition.start();
    voiceBtn.style.color = '#ef4444';
  };

  recognition.onresult = (event) => {
    messageInput.value += (messageInput.value ? ' ' : '') + event.results[0][0].transcript;
    voiceBtn.style.color = '';
  };

  recognition.onerror = () => { voiceBtn.style.color = ''; };
  recognition.onend = () => { voiceBtn.style.color = ''; };
} else {
  voiceBtn.style.display = 'none';
}

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
        <p>Чем ASTRA 6 может помочь вам сегодня?</p>
      </div>`;
    return;
  }

  currentChat.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${msg.role}`;
    
    let contentHtml = msg.content;
    if (msg.file) {
      if (msg.file.type === 'image') {
        contentHtml += `<br/><img src="${msg.file.content}" class="message-img" />`;
      } else if (msg.file.type === 'text') {
        contentHtml += `<br/><pre style="background:#0002;padding:6px;border-radius:4px;margin-top:6px;overflow-x:auto;"><code>${msg.file.content.slice(0, 300)}...</code></pre>`;
      }
    }
    
    bubble.innerHTML = contentHtml;
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
  if (!text && !state.attachedFile) return;

  const currentChat = state.chats[state.active_id] || [];
  const msgObj = { 
    role: 'user', 
    content: text + (state.attachedFile?.type === 'text' ? `\n\n[Содержимое файла ${state.attachedFile.name}]:\n${state.attachedFile.content}` : ''),
    file: state.attachedFile
  };

  currentChat.push(msgObj);
  messageInput.value = '';
  const attached = state.attachedFile;
  removeFileBtn.click();
  renderMessages();

  // Имитация ответа с учетом роли
  setTimeout(() => {
    const role = roleSelector.value;
    let reply = `[ASTRA 6 - ${role.toUpperCase()}]: Запрос обработан.`;
    if (attached) reply += ` Файл "${attached.name}" проанализирован.`;
    currentChat.push({ role: 'assistant', content: reply });
    renderMessages();
  }, 700);
};

renderSessions();
renderMessages();

