const TOKEN_KEY = "cantares_token";
const MAX_AUDIO_LENGTH = 1400000;
const MAX_FILE_SIZE = 5000000;
const MAX_AVATAR_LENGTH = 500000;
const REACTION_EMOJIS = ["👍", "😂", "❤️", "🔥"];
const SAFE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
]);

const PROFILE_THEMES = [
  {
    name: "Bosque",
    cardBg: "linear-gradient(135deg, #eaf6ed 0%, #d8efe4 45%, #c9e7da 100%)",
    textColor: "#17231d",
    accent: "#1fa55b",
    borderRadius: "20px",
    borderColor: "rgba(23, 35, 29, 0.12)",
    shadow: "0 18px 40px rgba(15, 30, 22, 0.12)",
    align: "left",
  },
  {
    name: "Arena",
    cardBg: "linear-gradient(135deg, #f7f0e2 0%, #efe0c6 50%, #e5d1aa 100%)",
    textColor: "#3c2c18",
    accent: "#c68c3a",
    borderRadius: "24px",
    borderColor: "rgba(78, 55, 27, 0.18)",
    shadow: "0 16px 36px rgba(78, 55, 27, 0.18)",
    align: "left",
  },
  {
    name: "Cielo",
    cardBg: "linear-gradient(135deg, #e5f2ff 0%, #cfe8ff 55%, #b5dbff 100%)",
    textColor: "#0f2e3a",
    accent: "#2b8db6",
    borderRadius: "18px",
    borderColor: "rgba(15, 46, 58, 0.16)",
    shadow: "0 20px 38px rgba(43, 141, 182, 0.18)",
    align: "left",
  },
  {
    name: "Noche",
    cardBg: "linear-gradient(135deg, #1f2f33 0%, #182326 60%, #10181b 100%)",
    textColor: "#f4f7f3",
    accent: "#1fa55b",
    borderRadius: "22px",
    borderColor: "rgba(244, 247, 243, 0.16)",
    shadow: "0 18px 40px rgba(0, 0, 0, 0.5)",
    align: "center",
  },
  {
    name: "Otono",
    cardBg: "linear-gradient(135deg, #f6e3c1 0%, #e8b882 45%, #cf7a45 100%)",
    textColor: "#3a1f12",
    accent: "#cf7a45",
    borderRadius: "16px",
    borderColor: "rgba(58, 31, 18, 0.18)",
    shadow: "0 16px 34px rgba(58, 31, 18, 0.2)",
    align: "left",
  },
  {
    name: "Laguna",
    cardBg: "linear-gradient(135deg, #d5f3f0 0%, #9de3dd 55%, #5cc9bf 100%)",
    textColor: "#0f3a37",
    accent: "#2fb6a7",
    borderRadius: "26px",
    borderColor: "rgba(15, 58, 55, 0.16)",
    shadow: "0 20px 36px rgba(47, 182, 167, 0.2)",
    align: "center",
  },
  {
    name: "Coral",
    cardBg: "linear-gradient(135deg, #ffe2d4 0%, #ffb6a1 50%, #ff8b73 100%)",
    textColor: "#5a1d12",
    accent: "#ff8b73",
    borderRadius: "20px",
    borderColor: "rgba(90, 29, 18, 0.16)",
    shadow: "0 18px 34px rgba(255, 139, 115, 0.22)",
    align: "right",
  },
  {
    name: "Grafito",
    cardBg: "linear-gradient(135deg, #e7e9ec 0%, #c8cbd1 55%, #9da3ad 100%)",
    textColor: "#1b1e24",
    accent: "#4b5563",
    borderRadius: "14px",
    borderColor: "rgba(27, 30, 36, 0.18)",
    shadow: "0 12px 28px rgba(27, 30, 36, 0.2)",
    align: "left",
  },
  {
    name: "Brisa",
    cardBg: "linear-gradient(135deg, #f3f6ff 0%, #d7e1ff 55%, #b7c7ff 100%)",
    textColor: "#1a2a4a",
    accent: "#5a7dff",
    borderRadius: "18px",
    borderColor: "rgba(26, 42, 74, 0.16)",
    shadow: "0 18px 36px rgba(90, 125, 255, 0.22)",
    align: "center",
  },
  {
    name: "Tierra",
    cardBg: "linear-gradient(135deg, #f2ede2 0%, #d7c8b3 50%, #b39b82 100%)",
    textColor: "#3a2a1b",
    accent: "#b38b59",
    borderRadius: "24px",
    borderColor: "rgba(58, 42, 27, 0.18)",
    shadow: "0 16px 32px rgba(58, 42, 27, 0.2)",
    align: "stacked",
  },
];

const APP_THEMES = [
  {
    name: "Bosque",
    bg: "#e5ece4",
    panel: "#ffffff",
    ink: "#17231d",
    muted: "#6d7a73",
    accent: "#1fa55b",
    accentDark: "#128c7e",
    bubble: "#e3f8d8",
    bubbleInk: "#143d29",
    border: "#d7e0d6",
  },
  {
    name: "Arena",
    bg: "#efe7db",
    panel: "#ffffff",
    ink: "#3c2c18",
    muted: "#7b6a54",
    accent: "#c68c3a",
    accentDark: "#a86d28",
    bubble: "#f9ead0",
    bubbleInk: "#3c2c18",
    border: "#e2d6c5",
  },
  {
    name: "Cielo",
    bg: "#e4eef8",
    panel: "#ffffff",
    ink: "#0f2e3a",
    muted: "#53717c",
    accent: "#2b8db6",
    accentDark: "#1d6d92",
    bubble: "#d8edf8",
    bubbleInk: "#0f2e3a",
    border: "#cddbe4",
  },
  {
    name: "Grafito",
    bg: "#e6e8eb",
    panel: "#ffffff",
    ink: "#1b1e24",
    muted: "#5c636f",
    accent: "#4b5563",
    accentDark: "#313844",
    bubble: "#e3e6ea",
    bubbleInk: "#1b1e24",
    border: "#d4d9df",
  },
  {
    name: "Noche",
    bg: "#1b2326",
    panel: "#222b2f",
    ink: "#f0f4f3",
    muted: "#b0b8b5",
    accent: "#1fa55b",
    accentDark: "#128c7e",
    bubble: "#2b3a40",
    bubbleInk: "#f0f4f3",
    border: "#334047",
  },
  {
    name: "Laguna",
    bg: "#d5f3f0",
    panel: "#ffffff",
    ink: "#0f3a37",
    muted: "#3c6a66",
    accent: "#2fb6a7",
    accentDark: "#1c8e82",
    bubble: "#c9efea",
    bubbleInk: "#0f3a37",
    border: "#b8e2dc",
  },
  {
    name: "Coral",
    bg: "#ffe2d4",
    panel: "#ffffff",
    ink: "#5a1d12",
    muted: "#8a4a3d",
    accent: "#ff8b73",
    accentDark: "#d86d59",
    bubble: "#ffd0c2",
    bubbleInk: "#5a1d12",
    border: "#f2c0b2",
  },
  {
    name: "Brisa",
    bg: "#f3f6ff",
    panel: "#ffffff",
    ink: "#1a2a4a",
    muted: "#506086",
    accent: "#5a7dff",
    accentDark: "#3a5ce0",
    bubble: "#dde6ff",
    bubbleInk: "#1a2a4a",
    border: "#cdd6f2",
  },
  {
    name: "Tierra",
    bg: "#f2ede2",
    panel: "#ffffff",
    ink: "#3a2a1b",
    muted: "#6f5d4a",
    accent: "#b38b59",
    accentDark: "#8d6a3f",
    bubble: "#eadfce",
    bubbleInk: "#3a2a1b",
    border: "#d8ccb8",
  },
  {
    name: "Otono",
    bg: "#f6e3c1",
    panel: "#ffffff",
    ink: "#3a1f12",
    muted: "#7b4a35",
    accent: "#cf7a45",
    accentDark: "#aa5d30",
    bubble: "#f1d3ad",
    bubbleInk: "#3a1f12",
    border: "#e6c29a",
  },
];

const state = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  activeTab: "global",
  activeChatId: null,
  chats: [],
  messages: {},
  friends: [],
  requests: [],
  groupInvites: [],
  blocks: new Set(),
  blockedList: [],
  presence: new Set(),
  searchResults: [],
  searchQuery: "",
  socket: null,
  profileCache: {},
  chatDetails: {},
  profileDraft: null,
  appTheme: null,
  appSettings: { sound: true },
  replyTo: null,
  attachOpen: false,
  pinDurationHours: 0,
  loadingPinnedChatId: null,
  audioCtx: null,
  scrollPositions: {},
  scrollAtBottom: {},
  forceScrollChatId: null,
  recording: {
    active: false,
    recorder: null,
    chunks: [],
    stream: null,
    startedAt: null,
    timerId: null,
  },
};

const dom = {
  auth: document.getElementById("auth"),
  authTabs: document.querySelectorAll(".auth-tab"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authError: document.getElementById("authError"),
  app: document.getElementById("app"),
  tabs: document.getElementById("tabs"),
  list: document.getElementById("list"),
  chatTitle: document.getElementById("chatTitle"),
  chatInfo: document.getElementById("chatInfo"),
  messages: document.getElementById("messages"),
  composer: document.getElementById("composer"),
  messageInput: document.getElementById("messageInput"),
  addMemberBtn: document.getElementById("addMemberBtn"),
  viewProfileBtn: document.getElementById("viewProfileBtn"),
  pinBtn: document.getElementById("pinBtn"),
  chatSettingsBtn: document.getElementById("chatSettingsBtn"),
  backBtn: document.getElementById("backBtn"),
  searchInput: document.getElementById("searchInput"),
  activeUser: document.getElementById("activeUser"),
  activeHandle: document.getElementById("activeHandle"),
  activeAvatar: document.getElementById("activeAvatar"),
  logoutBtn: document.getElementById("logoutBtn"),
  profileBtn: document.getElementById("profileBtn"),
  voiceBtn: document.getElementById("voiceBtn"),
  attachBtn: document.getElementById("attachBtn"),
  attachMenu: document.getElementById("attachMenu"),
  pollBtn: document.getElementById("pollBtn"),
  eventBtn: document.getElementById("eventBtn"),
  fileInput: document.getElementById("fileInput"),
  recordingBadge: document.getElementById("recordingBadge"),
  replyBar: document.getElementById("replyBar"),
  replyText: document.getElementById("replyText"),
  replyClose: document.getElementById("replyClose"),
  pinnedBar: document.getElementById("pinnedBar"),
  profileModal: document.getElementById("profileModal"),
  profileContent: document.getElementById("profileContent"),
  profileClose: document.getElementById("profileClose"),
  chatModal: document.getElementById("chatModal"),
  chatContent: document.getElementById("chatContent"),
  chatClose: document.getElementById("chatClose"),
};

function showAuth() {
  dom.auth.classList.remove("hidden");
  dom.app.classList.add("hidden");
}

function showApp() {
  dom.auth.classList.add("hidden");
  dom.app.classList.remove("hidden");
}

function setToken(token) {
  state.token = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function setAuthError(message) {
  dom.authError.textContent = message || "";
}

async function api(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  headers["Content-Type"] = "application/json";
  const token = state.token || localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers["x-auth-token"] = token;
    if (!state.token) state.token = token;
  }
  const res = await fetch(path, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error en la solicitud");
  }
  return data;
}

function formatTime(ms) {
  const date = new Date(ms);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function isSafeImageType(type) {
  const normalized = String(type || "").toLowerCase();
  return SAFE_IMAGE_TYPES.has(normalized);
}

function isSafeImageDataUrl(value) {
  return /^data:image\/(png|jpeg|jpg|gif|webp|bmp)(;|,)/i.test(String(value || ""));
}

function isSafeImageFile(file) {
  if (!file) return false;
  if (!isSafeImageType(file.type)) return false;
  return isSafeImageDataUrl(file.data);
}

function resolveAppTheme(theme) {
  const base = APP_THEMES[0];
  if (!theme || typeof theme !== "object") return base;
  return {
    name: theme.name || base.name,
    bg: theme.bg || base.bg,
    panel: theme.panel || base.panel,
    ink: theme.ink || base.ink,
    muted: theme.muted || base.muted,
    accent: theme.accent || base.accent,
    accentDark: theme.accentDark || base.accentDark,
    bubble: theme.bubble || base.bubble,
    bubbleInk: theme.bubbleInk || base.bubbleInk,
    border: theme.border || base.border,
  };
}

function applyAppTheme(theme) {
  const next = resolveAppTheme(theme);
  const root = document.documentElement;
  root.style.setProperty("--bg", next.bg);
  root.style.setProperty("--panel", next.panel);
  root.style.setProperty("--ink", next.ink);
  root.style.setProperty("--muted", next.muted);
  root.style.setProperty("--accent", next.accent);
  root.style.setProperty("--accent-dark", next.accentDark);
  root.style.setProperty("--bubble", next.bubble);
  root.style.setProperty("--bubble-ink", next.bubbleInk);
  root.style.setProperty("--border", next.border);
  const isDark = next.name && next.name.toLowerCase() === "noche";
  root.dataset.theme = isDark ? "dark" : "light";
}

function playNotificationSound() {
  if (!state.appSettings?.sound) return;
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!state.audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new Ctx();
  }
  const ctx = state.audioCtx;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 660;
  gain.gain.value = 0.05;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.12);
}

function isNearBottom() {
  const gap = dom.messages.scrollHeight - dom.messages.scrollTop - dom.messages.clientHeight;
  return gap < 80;
}

function rememberScroll(chatId) {
  if (!chatId) return;
  state.scrollPositions[chatId] = dom.messages.scrollTop;
  state.scrollAtBottom[chatId] = isNearBottom();
}

function scrollToBottom() {
  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function scheduleScrollBottom() {
  requestAnimationFrame(scrollToBottom);
  setTimeout(scrollToBottom, 60);
}

function applyScroll(chatId) {
  const saved = state.scrollPositions[chatId];
  const stickBottom = state.scrollAtBottom[chatId];
  if (state.forceScrollChatId === chatId || saved === undefined || stickBottom) {
    scheduleScrollBottom();
    state.scrollAtBottom[chatId] = true;
  } else {
    dom.messages.scrollTop = saved;
  }
  if (state.forceScrollChatId === chatId) {
    state.forceScrollChatId = null;
  }
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function setAvatar(el, avatar, name) {
  if (!el) return;
  if (avatar && isSafeImageDataUrl(avatar)) {
    el.style.backgroundImage = `url("${avatar}")`;
    el.textContent = "";
    el.classList.add("has-image");
  } else {
    el.style.backgroundImage = "none";
    el.textContent = initials(name || "U");
    el.classList.remove("has-image");
  }
}

function setProfileAlign(el, align) {
  if (!el) return;
  el.classList.remove("align-center", "align-right", "align-stacked");
  if (align === "center") {
    el.classList.add("align-center");
  } else if (align === "right") {
    el.classList.add("align-right");
  } else if (align === "stacked") {
    el.classList.add("align-stacked");
  }
}

function createAvatarElement(avatar, name, className = "avatar") {
  const el = document.createElement("div");
  el.className = className;
  setAvatar(el, avatar, name);
  return el;
}

function setActiveUser(user) {
  state.user = user;
  state.appTheme = resolveAppTheme(user.appTheme);
  state.appSettings = user.appSettings || { sound: true };
  applyAppTheme(state.appTheme);
  dom.activeUser.textContent = user.displayName || user.username || "Usuario";
  dom.activeHandle.textContent = user.username
    ? `@${user.username}${user.status ? ` · ${user.status}` : ""}`
    : "";
  setAvatar(dom.activeAvatar, user.avatar, user.displayName || user.username);
}

async function handleLogin(event) {
  event.preventDefault();
  setAuthError("");
  const form = new FormData(dom.loginForm);
  const payload = {
    username: form.get("username"),
    password: form.get("password"),
  };
  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(data.token);
    setActiveUser(data.user);
    showApp();
    connectSocket();
    await refreshAll();
  } catch (error) {
    setAuthError(error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setAuthError("");
  const form = new FormData(dom.registerForm);
  const payload = {
    displayName: form.get("displayName"),
    username: form.get("username"),
    password: form.get("password"),
  };
  try {
    const data = await api("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(data.token);
    setActiveUser(data.user);
    showApp();
    connectSocket();
    await refreshAll();
  } catch (error) {
    setAuthError(error.message);
  }
}

async function handleLogout() {
  try {
    await api("/api/logout", { method: "POST" });
  } catch (error) {
    // ignore network errors on logout
  }
  if (state.socket) {
    state.socket.disconnect();
    state.socket = null;
  }
  setToken("");
  state.user = null;
  showAuth();
}

async function refreshAll() {
  await Promise.all([
    loadChats(),
    loadFriends(),
    loadRequests(),
    loadInvites(),
    loadBlocks(),
  ]);
  ensureActiveChat();
  await loadActiveMessages();
  render();
}

async function loadChats() {
  const data = await api("/api/chats");
  state.chats = data.chats || [];
  syncSocketRooms();
}

async function loadFriends() {
  const data = await api("/api/friends");
  state.friends = (data.friends || []).map((friend) => ({
    ...friend,
    statusMessage: friend.status || "",
    presence: state.presence.has(friend.id),
  }));
  updateFriendPresence();
}

async function loadRequests() {
  const data = await api("/api/requests");
  state.requests = data.requests || [];
}

async function loadInvites() {
  const data = await api("/api/invites");
  state.groupInvites = data.invites || [];
}

async function loadBlocks() {
  const data = await api("/api/blocks");
  state.blockedList = data.blocked || [];
  state.blocks = new Set(state.blockedList.map((item) => item.id));
}

function ensureActiveChat() {
  if (state.activeTab === "friends") return;
  const current = state.chats.find((chat) => chat.id === state.activeChatId);
  if (current) return;
  const preferred = state.chats.find((chat) => chat.type === state.activeTab);
  const fallback = state.chats[0];
  const next = preferred || fallback;
  state.activeChatId = next ? next.id : null;
}

async function loadActiveMessages() {
  if (state.activeTab === "friends" || !state.activeChatId) return;
  const tasks = [];
  if (!state.messages[state.activeChatId]) {
    tasks.push(loadMessages(state.activeChatId));
  }
  tasks.push(loadChatDetails(state.activeChatId));
  await Promise.all(tasks);
}

async function loadMessages(chatId) {
  const data = await api(`/api/chats/${chatId}/messages?limit=80`);
  const messages = data.messages || [];
  const now = Date.now();
  state.messages[chatId] = messages.filter(
    (msg) => !state.blocks.has(msg.senderId) || msg.senderId === state.user.id
  ).filter((msg) => !msg.expireAt || msg.expireAt > now);
}

async function loadChatDetails(chatId) {
  if (!chatId) return null;
  try {
    const data = await api(`/api/chats/${chatId}/details`);
    state.chatDetails[chatId] = data;
    return data;
  } catch (error) {
    return null;
  }
}

function connectSocket() {
  if (state.socket) return;
  state.socket = window.io({
    auth: { token: state.token },
  });

  state.socket.on("message:new", (message) => {
    if (message.expireAt && message.expireAt <= Date.now()) return;
    if (state.blocks.has(message.senderId) && message.senderId !== state.user.id) {
      return;
    }
    if (!state.messages[message.chatId]) {
      state.messages[message.chatId] = [];
    }
    state.messages[message.chatId].push(message);
    const chat = state.chats.find((item) => item.id === message.chatId);
    if (chat) {
      if (message.type === "poll") {
        chat.lastMessage = message.poll?.question || "";
      } else if (message.type === "event") {
        chat.lastMessage = message.event?.title || "";
      } else {
        chat.lastMessage = message.text;
      }
      chat.lastType = message.type;
      chat.lastDeleted = Boolean(message.deletedAt);
      chat.lastTime = message.createdAt;
    }
    if (message.senderId !== state.user.id) {
      const shouldNotify = message.chatId !== state.activeChatId || document.hidden;
      if (shouldNotify) playNotificationSound();
    }
    render();
  });

  state.socket.on("message:update", (payload) => {
    const thread = state.messages[payload.chatId];
    if (!thread) return;
    const message = thread.find((item) => item.id === payload.id);
    if (!message) return;
    message.text = payload.text;
    message.updatedAt = payload.updatedAt;
    const chat = state.chats.find((item) => item.id === payload.chatId);
    const last = thread[thread.length - 1];
    if (chat && last && last.id === payload.id) {
      chat.lastMessage = payload.text;
    }
    renderMain();
    renderList();
  });

  state.socket.on("message:delete", (payload) => {
    const thread = state.messages[payload.chatId];
    if (!thread) return;
    const message = thread.find((item) => item.id === payload.id);
    if (!message) return;
    message.deletedAt = payload.deletedAt;
    message.text = "";
    message.audio = null;
    message.file = null;
    message.poll = null;
    message.event = null;
    const chat = state.chats.find((item) => item.id === payload.chatId);
    const last = thread[thread.length - 1];
    if (chat && last && last.id === payload.id) {
      chat.lastMessage = "";
      chat.lastDeleted = true;
    }
    renderMain();
    renderList();
  });

  state.socket.on("reaction:update", (payload) => {
    const thread = state.messages[payload.chatId];
    if (!thread) return;
    const message = thread.find((item) => item.id === payload.messageId);
    if (!message) return;
    message.reactions = payload.reactions || {};
    renderMain();
  });

  state.socket.on("poll:update", (payload) => {
    const thread = state.messages[payload.chatId];
    if (!thread) return;
    const message = thread.find((item) => item.id === payload.messageId);
    if (!message) return;
    message.poll = payload.poll;
    renderMain();
  });

  state.socket.on("requests:update", async () => {
    await Promise.all([loadRequests(), loadInvites()]);
    renderList();
  });

  state.socket.on("friends:update", async () => {
    await loadFriends();
    renderList();
    if (state.activeTab === "friends") {
      renderMain();
    }
  });

  state.socket.on("chats:update", async () => {
    await loadChats();
    renderList();
    if (state.activeChatId) {
      renderMain();
    }
  });

  state.socket.on("presence:list", (users) => {
    state.presence = new Set(users || []);
    updateFriendPresence();
    renderList();
  });

  state.socket.on("presence", ({ userId, status }) => {
    if (status === "online") {
      state.presence.add(userId);
    } else {
      state.presence.delete(userId);
    }
    updateFriendPresence();
    renderList();
    renderMain();
  });

  syncSocketRooms();
}

function syncSocketRooms() {
  if (!state.socket || !state.chats.length) return;
  state.chats.forEach((chat) => {
    state.socket.emit("chat:join", { chatId: chat.id });
  });
}

function updateFriendPresence() {
  state.friends = state.friends.map((friend) => {
    const presence = state.presence.has(friend.id);
    const base = presence ? "En linea" : "Desconectado";
    const status = friend.statusMessage ? `${friend.statusMessage} - ${base}` : base;
    return {
      ...friend,
      presence,
      status,
    };
  });
}

function setActiveTab(tab) {
  if (state.activeChatId) rememberScroll(state.activeChatId);
  state.activeTab = tab;
  if (tab !== "friends") {
    ensureActiveChat();
    loadActiveMessages().then(render);
  } else {
    render();
  }
}

function setActiveChat(chatId) {
  if (state.activeChatId && state.activeChatId !== chatId) {
    rememberScroll(state.activeChatId);
  }
  state.activeChatId = chatId;
  state.forceScrollChatId = chatId;
  clearReply();
  if (state.socket && chatId) {
    state.socket.emit("chat:join", { chatId });
  }
  render();
  Promise.all([loadMessages(chatId), loadChatDetails(chatId)])
    .then(render)
    .catch(() => render());
  if (window.innerWidth < 900) {
    dom.app.classList.remove("show-list");
  }
}

function getChatsByTab(tab) {
  if (tab === "friends") return [];
  return state.chats
    .filter((chat) => chat.type === tab)
    .sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));
}

function formatChatPreview(chat) {
  if (chat.lastDeleted) return "Mensaje eliminado";
  if (chat.lastType === "voice") return "Nota de voz";
  if (chat.lastType === "file") return "Archivo adjunto";
  if (chat.lastType === "poll") return "Encuesta";
  if (chat.lastType === "event") return "Evento";
  if (chat.lastMessage) return chat.lastMessage;
  return chat.subtitle || "Sin mensajes";
}

function formatPinnedPreview(message) {
  if (!message) return "";
  if (message.type === "voice") return "Nota de voz";
  if (message.type === "file") return message.file?.name || "Archivo adjunto";
  if (message.type === "poll") return message.poll?.question || "Encuesta";
  if (message.type === "event") return message.event?.title || "Evento";
  return message.text || "Mensaje";
}

function formatReplySnippet(message) {
  if (!message) return "";
  if (message.deletedAt) return "Mensaje eliminado";
  if (message.type === "voice") return "Nota de voz";
  if (message.type === "file") return message.file?.name || message.fileName || "Archivo";
  if (message.type === "poll") return message.poll?.question || "Encuesta";
  if (message.type === "event") return message.event?.title || "Evento";
  return message.text || "";
}

function resolveReplyData(message) {
  if (message.reply) return message.reply;
  if (!message.replyTo || !state.messages[message.chatId]) return null;
  const base = state.messages[message.chatId].find((m) => m.id === message.replyTo);
  if (!base) return null;
  return {
    id: base.id,
    senderId: base.senderId,
    senderName: base.senderName || "Usuario",
    type: base.type || "text",
    text: base.text || "",
    fileName: base.file ? base.file.name || "" : "",
    createdAt: base.createdAt,
    deletedAt: Boolean(base.deletedAt),
  };
}

function setReplyTo(message) {
  if (!message) return;
  state.replyTo = {
    id: message.id,
    senderName: message.senderName || "Usuario",
    type: message.type,
    text: message.text || "",
    file: message.file || null,
    poll: message.poll || null,
    event: message.event || null,
    deletedAt: message.deletedAt || null,
  };
  dom.replyText.textContent = `Respondiendo a ${state.replyTo.senderName}: ${formatReplySnippet(
    message
  )}`;
  dom.replyBar.classList.remove("hidden");
}

function clearReply() {
  state.replyTo = null;
  dom.replyText.textContent = "";
  dom.replyBar.classList.add("hidden");
}

function getReplyPreview() {
  if (!state.replyTo) return null;
  return {
    id: state.replyTo.id,
    senderId: state.replyTo.senderId,
    senderName: state.replyTo.senderName,
    type: state.replyTo.type,
    text: state.replyTo.text,
    fileName: state.replyTo.file ? state.replyTo.file.name || "" : "",
    createdAt: state.replyTo.createdAt,
    deletedAt: state.replyTo.deletedAt,
  };
}

function renderTabs() {
  [...dom.tabs.querySelectorAll(".tab")].forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });
}

function renderList() {
  const query = dom.searchInput.value.trim().toLowerCase();
  dom.list.innerHTML = "";

  if (state.activeTab === "friends") {
    renderFriendsList(query);
    return;
  }

  if (state.activeTab === "group") {
    dom.list.appendChild(createGroupCard());
  }

  if (state.activeTab === "dm") {
    dom.list.appendChild(createDmCard());
  }

  const chats = getChatsByTab(state.activeTab).filter((chat) => {
    if (!query) return true;
    const friend = state.friends.find((f) => f.id === chat.dmUserId);
    const tags = Array.isArray(chat.tags) ? chat.tags.join(" ") : "";
    const hay = `${chat.name} ${chat.subtitle || ""} ${chat.description || ""} ${tags} ${
      friend ? friend.username : ""
    }`.toLowerCase();
    return hay.includes(query);
  });

  if (!chats.length) {
    dom.list.appendChild(emptyCard("No hay chats aun."));
    return;
  }

  chats.forEach((chat) => {
    const card = document.createElement("div");
    card.className = "card";
    if (chat.id === state.activeChatId) card.classList.add("active");
    card.addEventListener("click", () => setActiveChat(chat.id));

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = chat.name;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = labelForType(chat.type);
    title.appendChild(badge);

    const preview = document.createElement("div");
    preview.className = "card-subtitle";
    preview.textContent = formatChatPreview(chat);

    card.appendChild(title);
    card.appendChild(preview);
    if (Array.isArray(chat.tags) && chat.tags.length) {
      const tags = document.createElement("div");
      tags.className = "chat-tags";
      chat.tags.slice(0, 4).forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "chat-tag";
        chip.textContent = tag;
        tags.appendChild(chip);
      });
      card.appendChild(tags);
    }
    dom.list.appendChild(card);
  });

  if (query) {
    const friendMatches = state.friends.filter((friend) =>
      `${friend.name} ${friend.username}`.toLowerCase().includes(query)
    );
    if (friendMatches.length) {
      dom.list.appendChild(sectionTitle("Amigos"));
      friendMatches.forEach((friend) => {
        const row = document.createElement("div");
        row.className = "card";

        const title = document.createElement("div");
        title.className = "card-title";
        title.textContent = friend.name;

        const subtitle = document.createElement("div");
        subtitle.className = "card-subtitle";
        subtitle.textContent = `@${friend.username}`;

        row.appendChild(title);
        row.appendChild(subtitle);
        row.addEventListener("click", () => startDm(friend.username));
        dom.list.appendChild(row);
      });
    }
  }

}

function renderFriendsList(query) {
  dom.list.appendChild(searchUserCard());

  const invites = state.groupInvites.filter((invite) =>
    `${invite.chatName} ${invite.fromName} ${invite.fromUsername}`.toLowerCase().includes(query)
  );

  dom.list.appendChild(sectionTitle("Invitaciones a grupos"));
  if (!invites.length) {
    dom.list.appendChild(emptyCard("Sin invitaciones."));
  } else {
    invites.forEach((invite) => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("div");
      title.className = "card-title";
      title.textContent = invite.chatName;

      const subtitle = document.createElement("div");
      subtitle.className = "card-subtitle";
      subtitle.textContent = `Invita: ${invite.fromName}`;

      const actions = document.createElement("div");
      actions.className = "friends-actions";

      const accept = document.createElement("button");
      accept.className = "tiny primary";
      accept.textContent = "Unirme";
      accept.addEventListener("click", () => acceptInvite(invite.id));

      const reject = document.createElement("button");
      reject.className = "tiny";
      reject.textContent = "Rechazar";
      reject.addEventListener("click", () => rejectInvite(invite.id));

      actions.appendChild(accept);
      actions.appendChild(reject);

      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(actions);
      dom.list.appendChild(card);
    });
  }

  const requests = state.requests.filter((req) =>
    `${req.name} ${req.username}`.toLowerCase().includes(query)
  );
  const friends = state.friends.filter((friend) =>
    `${friend.name} ${friend.username}`.toLowerCase().includes(query)
  );

  dom.list.appendChild(sectionTitle("Solicitudes"));
  if (!requests.length) {
    dom.list.appendChild(emptyCard("Sin solicitudes pendientes."));
  } else {
    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("div");
      title.className = "card-title";

      const info = document.createElement("div");
      info.className = "suggestion-info";
      info.appendChild(createAvatarElement(req.avatar, req.name));

      const textWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "suggestion-name";
      name.textContent = req.name;
      const handle = document.createElement("div");
      handle.className = "suggestion-handle";
      handle.textContent = `@${req.username}`;

      textWrap.appendChild(name);
      textWrap.appendChild(handle);
      info.appendChild(textWrap);
      title.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "friends-actions";

      const accept = document.createElement("button");
      accept.className = "tiny primary";
      accept.textContent = "Aceptar";
      accept.addEventListener("click", () => acceptRequest(req.id));

      const reject = document.createElement("button");
      reject.className = "tiny";
      reject.textContent = "Rechazar";
      reject.addEventListener("click", () => rejectRequest(req.id));

      const profile = document.createElement("button");
      profile.className = "tiny";
      profile.textContent = "Perfil";
      profile.addEventListener("click", () => openProfile(req.fromId));

      actions.appendChild(accept);
      actions.appendChild(reject);
      actions.appendChild(profile);

      card.appendChild(title);
      card.appendChild(actions);
      dom.list.appendChild(card);
    });
  }

  dom.list.appendChild(sectionTitle("Amigos"));
  if (!friends.length) {
    dom.list.appendChild(emptyCard("Agrega tu primer amigo."));
  } else {
    friends.forEach((friend) => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("div");
      title.className = "card-title";

      const info = document.createElement("div");
      info.className = "suggestion-info";
      info.appendChild(createAvatarElement(friend.avatar, friend.name));

      const textWrap = document.createElement("div");
      const name = document.createElement("div");
      name.className = "suggestion-name";
      name.textContent = friend.name;
      const handle = document.createElement("div");
      handle.className = "suggestion-handle";
      handle.textContent = friend.status;
      textWrap.appendChild(name);
      textWrap.appendChild(handle);
      info.appendChild(textWrap);

      title.appendChild(info);

      const actions = document.createElement("div");
      actions.className = "friends-actions";

      const message = document.createElement("button");
      message.className = "tiny primary";
      message.textContent = "Mensaje";
      message.addEventListener("click", () => startDm(friend.username));

      const profile = document.createElement("button");
      profile.className = "tiny";
      profile.textContent = "Perfil";
      profile.addEventListener("click", () => openProfile(friend.id));

      const block = document.createElement("button");
      block.className = "tiny";
      block.textContent = "Bloquear";
      block.addEventListener("click", () => blockUser(friend.id));

      actions.appendChild(message);
      actions.appendChild(profile);
      actions.appendChild(block);

      card.appendChild(title);
      card.appendChild(actions);
      dom.list.appendChild(card);
    });
  }

  dom.list.appendChild(sectionTitle("Bloqueados"));
  if (!state.blockedList.length) {
    dom.list.appendChild(emptyCard("Sin usuarios bloqueados."));
    return;
  }
  state.blockedList.forEach((blocked) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";

    const info = document.createElement("div");
    info.className = "suggestion-info";
    info.appendChild(createAvatarElement(blocked.avatar, blocked.displayName));

    const textWrap = document.createElement("div");
    const name = document.createElement("div");
    name.className = "suggestion-name";
    name.textContent = blocked.displayName;
    const handle = document.createElement("div");
    handle.className = "suggestion-handle";
    handle.textContent = `@${blocked.username}`;
    textWrap.appendChild(name);
    textWrap.appendChild(handle);
    info.appendChild(textWrap);
    title.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "friends-actions";

    const unblock = document.createElement("button");
    unblock.className = "tiny primary";
    unblock.textContent = "Desbloquear";
    unblock.addEventListener("click", () => unblockUser(blocked.id));

    actions.appendChild(unblock);
    card.appendChild(title);
    card.appendChild(actions);
    dom.list.appendChild(card);
  });
}

function renderMain() {
  if (state.activeTab === "friends") {
    dom.chatTitle.textContent = "Amistades";
    dom.chatInfo.textContent = "Solicitudes y contactos";
    dom.addMemberBtn.style.display = "none";
    dom.viewProfileBtn.style.display = "none";
    dom.pinBtn.style.display = "none";
    dom.chatSettingsBtn.style.display = "none";
    dom.pinnedBar.classList.add("hidden");
    dom.messages.innerHTML = "";
    dom.messages.appendChild(emptyCard("Gestiona tus amigos desde aqui."));
    dom.composer.style.display = "none";
    return;
  }

  const chat = state.chats.find((item) => item.id === state.activeChatId);
  if (!chat) {
    dom.chatTitle.textContent = "Sin chat";
    dom.chatInfo.textContent = "Crea o selecciona un chat.";
    dom.messages.innerHTML = "";
    dom.messages.appendChild(emptyCard("No hay conversacion activa."));
    dom.composer.style.display = "none";
    dom.addMemberBtn.style.display = "none";
    dom.viewProfileBtn.style.display = "none";
    dom.pinBtn.style.display = "none";
    dom.chatSettingsBtn.style.display = "none";
    dom.pinnedBar.classList.add("hidden");
    return;
  }

  const details = state.chatDetails[chat.id];

  dom.chatTitle.textContent = chat.name;
  dom.chatInfo.textContent = resolveChatInfo(chat);
  const role = details ? details.role : null;
  const canPin = chat.type !== "group" || role === "owner" || role === "admin";
  let canWrite = true;
  if (chat.type === "group") {
    const settings = details?.chat?.settings || {};
    const isAdmin = role === "owner" || role === "admin";
    if (settings.adminOnly && !isAdmin) canWrite = false;
    if (settings.memberCanWrite === false && role === "member") canWrite = false;
  }
  dom.pinBtn.style.display = canPin ? "inline-flex" : "none";
  dom.addMemberBtn.style.display = chat.type === "group" ? "inline-flex" : "none";
  dom.viewProfileBtn.style.display = chat.type === "dm" ? "inline-flex" : "none";
  dom.chatSettingsBtn.style.display = "inline-flex";
  dom.composer.style.display = "grid";
  dom.messageInput.disabled = !canWrite;
  dom.messageInput.placeholder = canWrite
    ? "Escribe un mensaje"
    : "Solo admins pueden escribir";
  const sendBtn = dom.composer.querySelector('button[type="submit"]');
  if (sendBtn) sendBtn.disabled = !canWrite;
  dom.voiceBtn.disabled = !canWrite;
  dom.attachBtn.disabled = !canWrite;
  const threadAll = state.messages[chat.id] || [];
  const fallbackPinned = chat.pinnedMessageId
    ? threadAll.find((msg) => msg.id === chat.pinnedMessageId)
    : null;
  const pinnedMessage = details?.pinnedMessage || fallbackPinned;
  const pinnedUntil = details?.chat?.pinnedUntil || chat.pinnedUntil || null;
  if (!pinnedMessage && chat.pinnedMessageId && state.loadingPinnedChatId !== chat.id) {
    state.loadingPinnedChatId = chat.id;
    loadChatDetails(chat.id)
      .then(() => {
        state.loadingPinnedChatId = null;
        renderMain();
      })
      .catch(() => {
        state.loadingPinnedChatId = null;
      });
  }
  if (pinnedMessage) {
    dom.pinnedBar.classList.remove("hidden");
    dom.pinnedBar.textContent = "";
    const label = document.createElement("strong");
    label.textContent = "Fijado:";
    const text = document.createElement("span");
    text.textContent = formatPinnedPreview(pinnedMessage);
    dom.pinnedBar.appendChild(label);
    dom.pinnedBar.appendChild(text);
    if (pinnedUntil) {
      const until = new Date(pinnedUntil);
      const stamp = `${String(until.getHours()).padStart(2, "0")}:${String(
        until.getMinutes()
      ).padStart(2, "0")} ${String(until.getDate()).padStart(2, "0")}/${
        String(until.getMonth() + 1).padStart(2, "0")
      }/${until.getFullYear()}`;
      const time = document.createElement("span");
      time.style.marginLeft = "8px";
      time.style.color = "var(--muted)";
      time.textContent = `hasta ${stamp}`;
      dom.pinnedBar.appendChild(time);
    }
  } else {
    dom.pinnedBar.classList.add("hidden");
  }

  if (chat.type === "dm") {
    dom.viewProfileBtn.dataset.userId = chat.dmUserId || "";
  } else {
    dom.viewProfileBtn.dataset.userId = "";
  }

  const now = Date.now();
  const thread = (state.messages[chat.id] || []).filter(
    (msg) => !msg.expireAt || msg.expireAt > now
  );
  dom.messages.innerHTML = "";
  if (!thread.length) {
    dom.messages.appendChild(emptyCard("Di hola y empieza la conversacion."));
    dom.messages.scrollTop = 0;
    state.scrollPositions[chat.id] = 0;
    state.scrollAtBottom[chat.id] = true;
    return;
  }

  thread.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = "message";
    if (message.senderId === state.user.id) {
      bubble.classList.add("mine");
    }
    if (message.deletedAt) {
      bubble.classList.add("deleted");
    }

    const meta = document.createElement("div");
    meta.className = "meta clickable";
    const edited = message.updatedAt ? " (editado)" : "";
    meta.textContent = `${message.senderName} - ${formatTime(message.createdAt)}${edited}`;
    meta.addEventListener("click", () => openProfile(message.senderId));

    const content = document.createElement("div");
    const replyData = resolveReplyData(message);
    if (replyData) {
      const reply = document.createElement("div");
      reply.className = "reply-quote";
      const name = replyData.senderName || "Usuario";
      const preview = replyData.deletedAt
        ? "Mensaje eliminado"
        : formatReplySnippet(replyData);
      reply.textContent = `${name}: ${preview}`;
      content.appendChild(reply);
    }
    if (message.deletedAt) {
      content.textContent = "Mensaje eliminado";
    } else if (message.type === "voice") {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = message.audio;
      content.appendChild(audio);
    } else if (message.type === "poll") {
      const poll = renderPoll(message);
      if (poll) content.appendChild(poll);
    } else if (message.type === "event") {
      const event = renderEvent(message);
      if (event) content.appendChild(event);
    } else if (message.type === "file" && message.file) {
      const fileWrap = document.createElement("div");
      const name = document.createElement("div");
      name.textContent = message.file.name || "Archivo";
      name.style.fontWeight = "600";

      const meta = document.createElement("div");
      meta.className = "card-subtitle";
      meta.textContent = `${formatFileSize(message.file.size)} · ${message.file.type || ""}`;

        if (isSafeImageFile(message.file)) {
          const img = document.createElement("img");
          img.src = message.file.data;
          img.alt = message.file.name || "imagen";
          img.style.maxWidth = "220px";
          img.style.borderRadius = "12px";
        img.style.marginTop = "6px";
        img.addEventListener("load", () => {
          if (state.activeChatId === chat.id && state.scrollAtBottom[chat.id]) {
            scheduleScrollBottom();
          }
        });
        fileWrap.appendChild(img);
      }

      const link = document.createElement("a");
      link.href = message.file.data;
      link.download = message.file.name || "archivo";
      link.textContent = "Descargar";
      link.style.display = "inline-block";
      link.style.marginTop = "6px";

      fileWrap.appendChild(name);
      fileWrap.appendChild(meta);
      fileWrap.appendChild(link);
      content.appendChild(fileWrap);
    } else {
      content.textContent = message.text;
    }

    bubble.appendChild(meta);
    bubble.appendChild(content);

    if (!message.deletedAt) {
      const actions = document.createElement("div");
      actions.className = "message-actions";

      const reply = document.createElement("button");
      reply.textContent = "Responder";
      reply.addEventListener("click", () => setReplyTo(message));
      actions.appendChild(reply);

      if (message.senderId === state.user.id && message.type === "text") {
        const edit = document.createElement("button");
        edit.textContent = "Editar";
        edit.addEventListener("click", () => editMessage(message));
        actions.appendChild(edit);
      }

      if (canPin) {
        const pin = document.createElement("button");
        pin.textContent = "Fijar";
        pin.addEventListener("click", () => pinMessage(message.id));
        actions.appendChild(pin);
      }

      if (message.senderId === state.user.id) {
        const remove = document.createElement("button");
        remove.textContent = "Borrar";
        remove.addEventListener("click", () => deleteMessage(message));
        actions.appendChild(remove);
      }

      if (actions.children.length) {
        bubble.appendChild(actions);
      }
    }

    const reactions = createReactionBar(message);
    if (reactions) {
      bubble.appendChild(reactions);
    }

    dom.messages.appendChild(bubble);
  });
  applyScroll(chat.id);
}

function resolveChatInfo(chat) {
  if (chat.type === "global") return chat.subtitle || "Todos en Cantares";
  if (chat.type === "group") return chat.subtitle || "Grupo";
  if (chat.type === "dm") {
    const friend = state.friends.find((f) => f.id === chat.dmUserId);
    return friend ? friend.status : chat.subtitle || "Privado";
  }
  return "";
}

function labelForType(type) {
  if (type === "global") return "GLOBAL";
  if (type === "group") return "GRUPO";
  return "DM";
}

function emptyCard(text) {
  const div = document.createElement("div");
  div.className = "empty";
  div.textContent = text;
  return div;
}

function toggleReaction(messageId, emoji) {
  if (!state.socket) return;
  state.socket.emit("reaction:toggle", { messageId, emoji });
}

function votePoll(messageId, optionId) {
  if (!state.socket) return;
  state.socket.emit("poll:vote", { messageId, optionId });
}

function createReactionBar(message) {
  const bar = document.createElement("div");
  bar.className = "reaction-bar";
  const reactions = message.reactions || {};
  REACTION_EMOJIS.forEach((emoji) => {
    const count = Array.isArray(reactions[emoji]) ? reactions[emoji].length : 0;
    if (count > 0) {
      const chip = document.createElement("button");
      chip.className = "reaction-chip";
      chip.textContent = `${emoji} ${count}`;
      if (reactions[emoji].includes(state.user.id)) {
        chip.classList.add("active");
      }
      chip.addEventListener("click", () => toggleReaction(message.id, emoji));
      bar.appendChild(chip);
    }
  });

  if (!message.deletedAt) {
    REACTION_EMOJIS.forEach((emoji) => {
      const quick = document.createElement("button");
      quick.className = "reaction-quick";
      quick.textContent = emoji;
      if (Array.isArray(reactions[emoji]) && reactions[emoji].includes(state.user.id)) {
        quick.classList.add("active");
      }
      quick.addEventListener("click", () => toggleReaction(message.id, emoji));
      bar.appendChild(quick);
    });
  }

  return bar.children.length ? bar : null;
}

function renderPoll(message) {
  const poll = message.poll;
  if (!poll) return null;
  const wrap = document.createElement("div");
  wrap.className = "poll";

  const question = document.createElement("div");
  question.style.fontWeight = "600";
  question.textContent = poll.question || "Encuesta";
  wrap.appendChild(question);

  (poll.options || []).forEach((option) => {
    const votes = option.votes || [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "poll-option";
    if (votes.includes(state.user.id)) button.classList.add("active");
    button.textContent = `${option.text} (${votes.length})`;
    button.addEventListener("click", () => votePoll(message.id, option.id));
    wrap.appendChild(button);
  });

  return wrap;
}

function renderEvent(message) {
  const event = message.event;
  if (!event) return null;
  const wrap = document.createElement("div");
  wrap.className = "event-card";

  const title = document.createElement("div");
  title.style.fontWeight = "600";
  title.textContent = event.title || "Evento";

  const when = document.createElement("div");
  when.textContent = `${event.date || ""}${event.time ? ` · ${event.time}` : ""}`;

  const note = document.createElement("div");
  note.textContent = event.note || "";

  wrap.appendChild(title);
  wrap.appendChild(when);
  if (event.reminderMinutes) {
    const remind = document.createElement("div");
    remind.textContent = `Recordatorio: ${event.reminderMinutes} min antes`;
    wrap.appendChild(remind);
  }
  if (event.note) wrap.appendChild(note);

  return wrap;
}

function renderChatFiles(chatId, container) {
  if (!container) return;
  container.innerHTML = "";
  const thread = state.messages[chatId] || [];
  const files = thread.filter(
    (message) => message.type === "file" && message.file && !message.deletedAt
  );
  if (!files.length) {
    const empty = document.createElement("div");
    empty.className = "card-subtitle";
    empty.textContent = "Sin archivos compartidos.";
    container.appendChild(empty);
    return;
  }

  files.forEach((message) => {
    const card = document.createElement("div");
    card.className = "file-card";
      if (isSafeImageFile(message.file)) {
        const img = document.createElement("img");
        img.src = message.file.data;
        img.alt = message.file.name || "imagen";
        card.appendChild(img);
      }

    const name = document.createElement("div");
    name.textContent = message.file.name || "Archivo";

    const meta = document.createElement("div");
    meta.className = "card-subtitle";
    meta.textContent = `${formatFileSize(message.file.size)} · ${message.file.type || ""}`;

    const link = document.createElement("a");
    link.href = message.file.data;
    link.download = message.file.name || "archivo";
    link.textContent = "Descargar";

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(link);
    container.appendChild(card);
  });
}

function sectionTitle(text) {
  const div = document.createElement("div");
  div.className = "section-title";
  div.textContent = text;
  return div;
}

function createGroupCard() {
  const card = document.createElement("div");
  card.className = "quick-card";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = "Crear grupo nuevo";

  const desc = document.createElement("div");
  desc.className = "card-subtitle";
  desc.textContent = "Invita por usuario separado por coma";

  const button = document.createElement("button");
  button.className = "tiny primary";
  button.textContent = "Nuevo grupo";
  button.addEventListener("click", createGroupPrompt);

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(button);
  return card;
}

function createDmCard() {
  const card = document.createElement("div");
  card.className = "quick-card";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = "Nuevo DM";

  const desc = document.createElement("div");
  desc.className = "card-subtitle";
  desc.textContent = "Solo con amigos";

  const button = document.createElement("button");
  button.className = "tiny primary";
  button.textContent = "Iniciar DM";
  button.addEventListener("click", () => {
    const username = window.prompt("Usuario de tu amigo");
    if (username) startDm(username);
  });

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(button);
  return card;
}

function searchUserCard() {
  const card = document.createElement("div");
  card.className = "quick-card";

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = "Buscar usuarios";

  const input = document.createElement("input");
  input.id = "userSearchInput";
  input.placeholder = "Nombre o usuario";
  input.value = state.searchQuery;
  input.addEventListener("input", (event) => handleUserSearchInput(event.target.value));

  const resultsWrap = document.createElement("div");
  resultsWrap.className = "suggestions";
  resultsWrap.id = "userSearchResults";
  renderSearchResults(resultsWrap);

  card.appendChild(title);
  card.appendChild(input);
  card.appendChild(resultsWrap);
  return card;
}

let searchTimer = null;
function handleUserSearchInput(value) {
  state.searchQuery = value;
  if (searchTimer) clearTimeout(searchTimer);
  if (!value.trim()) {
    state.searchResults = [];
    updateSearchResultsUI();
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      const data = await api(`/api/users/search?q=${encodeURIComponent(value.trim())}`);
      state.searchResults = data.results || [];
      updateSearchResultsUI();
    } catch (error) {
      state.searchResults = [];
      updateSearchResultsUI();
    }
  }, 300);
}

function updateSearchResultsUI() {
  const container = document.getElementById("userSearchResults");
  if (!container) return;
  renderSearchResults(container);
}

function renderSearchResults(container) {
  container.innerHTML = "";
  if (!state.searchQuery.trim()) return;

  if (!state.searchResults.length) {
    const empty = document.createElement("div");
    empty.className = "card-subtitle";
    empty.textContent = "Sin resultados";
    container.appendChild(empty);
    return;
  }

  state.searchResults.forEach((user) => {
    const row = document.createElement("div");
    row.className = "suggestion";

    const info = document.createElement("div");
    info.className = "suggestion-info";
    info.appendChild(createAvatarElement(user.avatar, user.displayName));

    const textWrap = document.createElement("div");
    const name = document.createElement("div");
    name.className = "suggestion-name";
    name.textContent = user.displayName;
    const handle = document.createElement("div");
    handle.className = "suggestion-handle";
    handle.textContent = `@${user.username}`;
    textWrap.appendChild(name);
    textWrap.appendChild(handle);
    info.appendChild(textWrap);

    const action = document.createElement("button");
    action.className = "tiny primary";
    action.textContent = "Agregar";

    if (user.isFriend) {
      action.textContent = "Amigo";
      action.disabled = true;
    } else if (user.pendingOut) {
      action.textContent = "Pendiente";
      action.disabled = true;
    } else if (user.pendingIn) {
      action.textContent = "Tiene solicitud";
      action.disabled = true;
    } else {
      action.addEventListener("click", () => sendFriendRequestTo(user.username));
    }

    info.addEventListener("click", () => openProfile(user.id));

    row.appendChild(info);
    row.appendChild(action);
    container.appendChild(row);
  });
}

async function createGroupPrompt() {
  const name = window.prompt("Nombre del grupo");
  if (!name) return;
  const rawMembers = window.prompt("Usuarios a invitar (separa por coma)") || "";
  const members = rawMembers
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  try {
    const data = await api("/api/groups", {
      method: "POST",
      body: JSON.stringify({ name, members }),
    });
    await loadChats();
    state.activeTab = "group";
    state.activeChatId = data.chatId;
    await loadMessages(data.chatId);
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

async function startDm(username) {
  try {
    const data = await api("/api/dm", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    await loadChats();
    state.activeTab = "dm";
    state.activeChatId = data.chatId;
    await loadMessages(data.chatId);
    render();
  } catch (error) {
    window.alert(error.message);
  }
}

async function sendFriendRequestTo(username) {
  try {
    await api("/api/requests", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    state.searchQuery = "";
    state.searchResults = [];
    await loadRequests();
    renderList();
  } catch (error) {
    window.alert(error.message);
  }
}

async function acceptRequest(requestId) {
  await api(`/api/requests/${requestId}/accept`, { method: "POST" });
  await Promise.all([loadRequests(), loadFriends()]);
  render();
}

async function rejectRequest(requestId) {
  await api(`/api/requests/${requestId}/reject`, { method: "POST" });
  await loadRequests();
  render();
}

async function acceptInvite(inviteId) {
  try {
    const data = await api(`/api/invites/${inviteId}/accept`, { method: "POST" });
    await Promise.all([loadInvites(), loadChats()]);
    if (data.chatId) {
      state.activeTab = "group";
      setActiveChat(data.chatId);
      await loadMessages(data.chatId);
    } else {
      render();
    }
  } catch (error) {
    window.alert(error.message);
  }
}

async function rejectInvite(inviteId) {
  await api(`/api/invites/${inviteId}/reject`, { method: "POST" });
  await loadInvites();
  render();
}

function handleComposer(event) {
  event.preventDefault();
  const text = dom.messageInput.value.trim();
  if (!text || !state.activeChatId || !state.socket) return;
  const payload = { chatId: state.activeChatId, text };
  if (state.replyTo) {
    payload.replyTo = state.replyTo.id;
    payload.replyPreview = getReplyPreview();
  }
  state.socket.emit("message:send", payload);
  dom.messageInput.value = "";
  clearReply();
}

function handleAddMember() {
  const chat = state.chats.find((item) => item.id === state.activeChatId);
  if (!chat || chat.type !== "group") return;
  const username = window.prompt("Usuario a invitar");
  if (!username) return;
  api(`/api/groups/${chat.id}/invite`, {
    method: "POST",
    body: JSON.stringify({ username }),
  })
    .then(loadChats)
    .then(render)
    .catch((error) => window.alert(error.message));
}

function handleBack() {
  dom.app.classList.add("show-list");
}

async function editMessage(message) {
  const nextText = window.prompt("Editar mensaje", message.text || "");
  if (!nextText) return;
  try {
    await api(`/api/messages/${message.id}`, {
      method: "PATCH",
      body: JSON.stringify({ text: nextText }),
    });
  } catch (error) {
    window.alert(error.message);
  }
}

async function deleteMessage(message) {
  const ok = window.confirm("Borrar mensaje?");
  if (!ok) return;
  try {
    await api(`/api/messages/${message.id}`, {
      method: "DELETE",
    });
  } catch (error) {
    window.alert(error.message);
  }
}

async function pinMessage(messageId) {
  if (!state.activeChatId) return;
  try {
    await api(`/api/chats/${state.activeChatId}/pin`, {
      method: "POST",
      body: JSON.stringify({ messageId, durationHours: state.pinDurationHours || 0 }),
    });
    await Promise.all([loadChats(), loadChatDetails(state.activeChatId)]);
    renderMain();
  } catch (error) {
    window.alert(error.message);
  }
}

async function unpinMessage() {
  if (!state.activeChatId) return;
  try {
    await api(`/api/chats/${state.activeChatId}/unpin`, { method: "POST" });
    await Promise.all([loadChats(), loadChatDetails(state.activeChatId)]);
    renderMain();
  } catch (error) {
    window.alert(error.message);
  }
}

async function togglePin() {
  const details = state.chatDetails[state.activeChatId];
  if (details && details.pinnedMessage) {
    unpinMessage();
    return;
  }
  const thread = state.messages[state.activeChatId] || [];
  if (!thread.length) return;
  const last = thread[thread.length - 1];
  const durationRaw = window.prompt(
    "Tiempo fijado (horas). Deja vacio para infinito",
    "24"
  );
  const durationHours = Number(durationRaw || 0);
  state.pinDurationHours = Number.isNaN(durationHours) ? 0 : durationHours;
  pinMessage(last.id);
}

async function blockUser(userId) {
  const ok = window.confirm("Bloquear a este usuario?");
  if (!ok) return;
  try {
    await api(`/api/blocks/${userId}`, { method: "POST" });
    await refreshAll();
  } catch (error) {
    window.alert(error.message);
  }
}

async function unblockUser(userId) {
  try {
    await api(`/api/blocks/${userId}`, { method: "DELETE" });
    await refreshAll();
  } catch (error) {
    window.alert(error.message);
  }
}

async function deleteAccount() {
  const ok = window.confirm(
    "Eliminar tu cuenta borrara tu perfil, mensajes y chats. Esta accion no se puede deshacer."
  );
  if (!ok) return;
  const confirmText = String(window.prompt('Escribe "ELIMINAR" para confirmar.') || "")
    .trim()
    .toUpperCase();
  if (confirmText !== "ELIMINAR") {
    window.alert("Cancelado.");
    return;
  }
  try {
    await api("/api/me", { method: "DELETE" });
    localStorage.removeItem(TOKEN_KEY);
    state.token = null;
    state.user = null;
    if (state.socket) {
      state.socket.disconnect();
      state.socket = null;
    }
    window.location.href = "/auth/register";
  } catch (error) {
    window.alert(error.message);
  }
}

async function openProfile(userId) {
  if (!userId) return;
  if (state.user && userId === state.user.id) {
    renderProfileModal({ user: state.user }, true);
    return;
  }
  if (state.profileCache[userId]) {
    renderProfileModal(state.profileCache[userId], false);
    return;
  }
  try {
    const data = await api(`/api/users/${userId}`);
    state.profileCache[userId] = data;
    renderProfileModal(data, false);
  } catch (error) {
    window.alert(error.message);
  }
}

function closeProfileModal() {
  dom.profileModal.classList.add("hidden");
  dom.profileContent.innerHTML = "";
  state.profileDraft = null;
}

function closeChatModal() {
  dom.chatModal.classList.add("hidden");
  dom.chatContent.innerHTML = "";
}

async function openChatSettings() {
  const chat = state.chats.find((item) => item.id === state.activeChatId);
  if (!chat) return;
  const details = state.chatDetails[chat.id] || (await loadChatDetails(chat.id));
  if (!details) {
    window.alert("No se pudo cargar el chat.");
    return;
  }
  renderChatSettings(chat, details);
  dom.chatModal.classList.remove("hidden");
}

function renderProfileModal(data, isSelf) {
  const profile = data.user || data;
  const theme = { ...PROFILE_THEMES[0], ...(profile.profileTheme || {}) };
  const blockedByYou = data.blockedByYou;
  const blockedYou = data.blockedYou;

  dom.profileContent.innerHTML = `
    <div class="profile-preview" id="profilePreview">
      <div class="profile-header">
        <div class="avatar large" id="profileAvatar"></div>
        <div>
          <div class="profile-name" id="profileName"></div>
          <div class="profile-handle" id="profileHandle"></div>
        </div>
      </div>
      <div class="profile-bio" id="profileBio"></div>
      <div class="profile-bio" id="profileStatus"></div>
      <div class="profile-bio" id="profileInfo"></div>
      <div class="profile-bio" id="profileLocation"></div>
      <div class="profile-bio" id="profileWebsite"></div>
    </div>
    <div class="profile-actions" id="profileActions"></div>
    <form class="profile-form ${isSelf ? "" : "hidden"}" id="profileForm">
      <div class="form-section-title">Identidad</div>
      <label>
        Nombre para mostrar
        <input type="text" id="profileDisplayName" />
      </label>
      <label>
        Usuario
        <input type="text" id="profileUsername" />
      </label>
      <label>
        Imagen de perfil
        <input type="file" id="profileAvatarInput" accept="image/*" />
      </label>

      <div class="form-section-title">Descripcion</div>
      <label>
        Descripcion corta
        <textarea id="profileBioInput"></textarea>
      </label>
      <label>
        Info personal
        <textarea id="profileInfoInput"></textarea>
      </label>
      <label>
        Ubicacion
        <input type="text" id="profileLocationInput" />
      </label>
      <label>
        Sitio web
        <input type="text" id="profileWebsiteInput" />
      </label>

      <div class="form-section-title">Estado</div>
      <label>
        Estado personalizado
        <input type="text" id="profileStatusInput" />
      </label>
      <label>
        Notificaciones sonoras
        <input type="checkbox" id="profileSoundInput" />
      </label>

      <div class="form-section-title">Tema de la app</div>
      <div class="profile-theme" id="appThemeOptions"></div>

      <div class="form-section-title">Apariencia de la tarjeta</div>
      <label>
        Fondo de tarjeta
        <div class="profile-theme" id="profileThemeOptions"></div>
        <input type="text" id="profileCardBg" />
      </label>
      <div class="form-section-title">Temas personalizados</div>
      <div class="profile-theme" id="customThemeOptions"></div>
      <button type="button" class="tiny" id="saveCustomTheme">Guardar tema actual</button>
      <label>
        Color de texto
        <input type="text" id="profileTextColor" />
      </label>
      <label>
        Color de acento
        <input type="text" id="profileAccent" />
      </label>
      <label>
        Radio de la tarjeta
        <input type="text" id="profileBorderRadius" />
      </label>
      <label>
        Color del borde
        <input type="text" id="profileBorderColor" />
      </label>
      <label>
        Sombra
        <input type="text" id="profileShadow" />
      </label>
      <label>
        Alineacion
        <select id="profileAlign">
          <option value="left">Izquierda</option>
          <option value="center">Centrada</option>
          <option value="right">Derecha</option>
          <option value="stacked">Apilada</option>
        </select>
      </label>

      <button type="submit" class="primary">Guardar cambios</button>
    </form>
  `;

  const preview = dom.profileContent.querySelector("#profilePreview");
  preview.style.background = theme.cardBg;
  preview.style.color = theme.textColor;
  preview.style.borderRadius = theme.borderRadius || "20px";
  preview.style.borderColor = theme.borderColor || "rgba(23, 35, 29, 0.12)";
  preview.style.boxShadow = theme.shadow || "0 18px 40px rgba(15, 30, 22, 0.12)";
  preview.style.setProperty("--profile-accent", theme.accent || "#1fa55b");
  setProfileAlign(preview, theme.align);

  const avatarEl = dom.profileContent.querySelector("#profileAvatar");
  setAvatar(avatarEl, profile.avatar, profile.displayName || profile.username);
  dom.profileContent.querySelector("#profileName").textContent =
    profile.displayName || profile.username;
  dom.profileContent.querySelector("#profileHandle").textContent = profile.username
    ? `@${profile.username}`
    : "";
  dom.profileContent.querySelector("#profileBio").textContent = profile.bio || "";
  dom.profileContent.querySelector("#profileStatus").textContent = profile.status
    ? `Estado: ${profile.status}`
    : "";
  dom.profileContent.querySelector("#profileInfo").textContent = profile.info || "";
  dom.profileContent.querySelector("#profileLocation").textContent = profile.location
    ? `Ubicacion: ${profile.location}`
    : "";
  dom.profileContent.querySelector("#profileWebsite").textContent = profile.website
    ? `Web: ${profile.website}`
    : "";

  const actions = dom.profileContent.querySelector("#profileActions");
  actions.innerHTML = "";

  if (isSelf) {
    const openButton = document.createElement("button");
    openButton.className = "primary";
    openButton.textContent = "Tu perfil";
    actions.appendChild(openButton);

    const removeButton = document.createElement("button");
    removeButton.className = "danger";
    removeButton.textContent = "Eliminar cuenta";
    removeButton.addEventListener("click", deleteAccount);
    actions.appendChild(removeButton);
  } else {
    if (blockedYou) {
      const blocked = document.createElement("button");
      blocked.textContent = "Te bloqueo";
      blocked.disabled = true;
      actions.appendChild(blocked);
    } else if (blockedByYou) {
      const unblock = document.createElement("button");
      unblock.className = "primary";
      unblock.textContent = "Desbloquear";
      unblock.addEventListener("click", () => unblockUser(profile.id));
      actions.appendChild(unblock);
    } else {
      if (data.isFriend) {
        const message = document.createElement("button");
        message.className = "primary";
        message.textContent = "Enviar mensaje";
        message.addEventListener("click", () => startDm(profile.username));
        actions.appendChild(message);
      } else if (data.pendingOut) {
        const pending = document.createElement("button");
        pending.textContent = "Solicitud enviada";
        pending.disabled = true;
        actions.appendChild(pending);
      } else if (data.pendingIn) {
        const accept = document.createElement("button");
        accept.className = "primary";
        accept.textContent = "Aceptar solicitud";
        accept.addEventListener("click", () => {
          const request = state.requests.find((r) => r.fromId === profile.id);
          if (request) acceptRequest(request.id);
        });
        actions.appendChild(accept);
      } else {
        const add = document.createElement("button");
        add.className = "primary";
        add.textContent = "Agregar amistad";
        add.addEventListener("click", () => sendFriendRequestTo(profile.username));
        actions.appendChild(add);
      }

      const block = document.createElement("button");
      block.textContent = "Bloquear";
      block.addEventListener("click", () => blockUser(profile.id));
      actions.appendChild(block);
    }
  }

  if (isSelf) {
    state.profileDraft = {
      ...profile,
      profileTheme: {
        cardBg: theme.cardBg,
        textColor: theme.textColor,
        accent: theme.accent,
        borderRadius: theme.borderRadius,
        borderColor: theme.borderColor,
        shadow: theme.shadow,
        align: theme.align,
      },
      avatarData: null,
    };

    const displayNameInput = dom.profileContent.querySelector("#profileDisplayName");
    const usernameInput = dom.profileContent.querySelector("#profileUsername");
    const bioInput = dom.profileContent.querySelector("#profileBioInput");
    const infoInput = dom.profileContent.querySelector("#profileInfoInput");
    const locationInput = dom.profileContent.querySelector("#profileLocationInput");
    const websiteInput = dom.profileContent.querySelector("#profileWebsiteInput");
    const avatarInput = dom.profileContent.querySelector("#profileAvatarInput");
    const statusInput = dom.profileContent.querySelector("#profileStatusInput");
    const soundInput = dom.profileContent.querySelector("#profileSoundInput");
    const cardBgInput = dom.profileContent.querySelector("#profileCardBg");
    const textColorInput = dom.profileContent.querySelector("#profileTextColor");
    const accentInput = dom.profileContent.querySelector("#profileAccent");
    const borderRadiusInput = dom.profileContent.querySelector("#profileBorderRadius");
    const borderColorInput = dom.profileContent.querySelector("#profileBorderColor");
    const shadowInput = dom.profileContent.querySelector("#profileShadow");
    const alignInput = dom.profileContent.querySelector("#profileAlign");
    const themeOptions = dom.profileContent.querySelector("#profileThemeOptions");
    const appThemeOptions = dom.profileContent.querySelector("#appThemeOptions");
    const customThemeOptions = dom.profileContent.querySelector("#customThemeOptions");
    const saveCustomThemeBtn = dom.profileContent.querySelector("#saveCustomTheme");

    displayNameInput.value = profile.displayName || "";
    usernameInput.value = profile.username || "";
    bioInput.value = profile.bio || "";
    infoInput.value = profile.info || "";
    locationInput.value = profile.location || "";
    websiteInput.value = profile.website || "";
    statusInput.value = profile.status || "";
    soundInput.checked = Boolean(state.appSettings?.sound ?? true);
    cardBgInput.value = theme.cardBg || "";
    textColorInput.value = theme.textColor || "";
    accentInput.value = theme.accent || "";
    borderRadiusInput.value = theme.borderRadius || "";
    borderColorInput.value = theme.borderColor || "";
    shadowInput.value = theme.shadow || "";
    alignInput.value = ["left", "center", "right", "stacked"].includes(theme.align)
      ? theme.align
      : "left";

    PROFILE_THEMES.forEach((preset) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "profile-chip";
      chip.textContent = preset.name;
      chip.addEventListener("click", () => {
        cardBgInput.value = preset.cardBg;
        textColorInput.value = preset.textColor;
        accentInput.value = preset.accent;
        borderRadiusInput.value = preset.borderRadius || "20px";
        borderColorInput.value = preset.borderColor || "rgba(23, 35, 29, 0.12)";
        shadowInput.value = preset.shadow || "0 18px 40px rgba(15, 30, 22, 0.12)";
        alignInput.value = ["left", "center", "right", "stacked"].includes(preset.align)
          ? preset.align
          : "left";
        updateProfilePreview();
      });
      themeOptions.appendChild(chip);
    });

    function applyThemeToInputs(theme) {
      cardBgInput.value = theme.cardBg || "";
      textColorInput.value = theme.textColor || "";
      accentInput.value = theme.accent || "";
      borderRadiusInput.value = theme.borderRadius || "20px";
      borderColorInput.value = theme.borderColor || "rgba(23, 35, 29, 0.12)";
      shadowInput.value = theme.shadow || "0 18px 40px rgba(15, 30, 22, 0.12)";
      alignInput.value = ["left", "center", "right", "stacked"].includes(theme.align)
        ? theme.align
        : "left";
      updateProfilePreview();
    }

    let customThemes = Array.isArray(profile.customThemes) ? [...profile.customThemes] : [];

    function renderCustomThemes() {
      customThemeOptions.innerHTML = "";
      if (!customThemes.length) {
        const empty = document.createElement("div");
        empty.className = "card-subtitle";
        empty.textContent = "Aun no tienes temas.";
        customThemeOptions.appendChild(empty);
        return;
      }
      customThemes.forEach((theme) => {
        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.gap = "6px";
        wrap.style.alignItems = "center";

        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "profile-chip";
        chip.textContent = theme.name || "Tema";
        chip.addEventListener("click", () => applyThemeToInputs(theme));

        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "tiny";
        edit.textContent = "Editar";
        edit.addEventListener("click", async () => {
          const name = window.prompt("Nuevo nombre del tema", theme.name || "Tema");
          if (!name) return;
          theme.name = name;
          await saveCustomThemes();
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "tiny";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", async () => {
          const ok = window.confirm("Eliminar este tema?");
          if (!ok) return;
          customThemes = customThemes.filter((item) => item.id !== theme.id);
          await saveCustomThemes();
        });

        wrap.appendChild(chip);
        wrap.appendChild(edit);
        wrap.appendChild(remove);
        customThemeOptions.appendChild(wrap);
      });
    }

    async function saveCustomThemes() {
      try {
        const data = await api("/api/profile", {
          method: "PATCH",
          body: JSON.stringify({ customThemes }),
        });
        setActiveUser(data.user);
        state.profileCache = {};
        customThemes = Array.isArray(data.user.customThemes)
          ? [...data.user.customThemes]
          : [];
        renderCustomThemes();
      } catch (error) {
        window.alert(error.message);
      }
    }

    saveCustomThemeBtn.addEventListener("click", async () => {
      const name = window.prompt("Nombre del tema");
      if (!name) return;
      const id = `${Date.now()}`;
      const theme = {
        id,
        name,
        cardBg: cardBgInput.value,
        textColor: textColorInput.value,
        accent: accentInput.value,
        borderRadius: borderRadiusInput.value,
        borderColor: borderColorInput.value,
        shadow: shadowInput.value,
        align: alignInput.value,
      };
      customThemes.push(theme);
      await saveCustomThemes();
    });

    renderCustomThemes();

    let selectedAppTheme = resolveAppTheme(state.appTheme || profile.appTheme);
    APP_THEMES.forEach((preset) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "profile-chip";
      chip.textContent = preset.name;
      chip.addEventListener("click", () => {
        selectedAppTheme = preset;
        applyAppTheme(preset);
      });
      appThemeOptions.appendChild(chip);
    });

    function safePreviewValue(value, fallback) {
      const raw = String(value || "").trim();
      if (!raw) return fallback;
      if (raw.length > 240) return fallback;
      if (/[;{}]/.test(raw)) return fallback;
      const lowered = raw.toLowerCase();
      if (
        lowered.includes("url(") ||
        lowered.includes("@import") ||
        lowered.includes("expression(") ||
        lowered.includes("javascript:") ||
        lowered.includes("data:text/html")
      ) {
        return fallback;
      }
      return raw;
    }

    function updateProfilePreview() {
      preview.style.background = safePreviewValue(cardBgInput.value, theme.cardBg);
      preview.style.color = safePreviewValue(textColorInput.value, theme.textColor);
      preview.style.borderRadius = safePreviewValue(borderRadiusInput.value, theme.borderRadius);
      preview.style.borderColor = safePreviewValue(borderColorInput.value, theme.borderColor);
      preview.style.boxShadow = safePreviewValue(shadowInput.value, theme.shadow);
      preview.style.setProperty(
        "--profile-accent",
        safePreviewValue(accentInput.value, theme.accent)
      );
      setProfileAlign(
        preview,
        ["left", "center", "right", "stacked"].includes(alignInput.value)
          ? alignInput.value
          : theme.align
      );
    }

    cardBgInput.addEventListener("input", updateProfilePreview);
    textColorInput.addEventListener("input", updateProfilePreview);
    accentInput.addEventListener("input", updateProfilePreview);
    borderRadiusInput.addEventListener("input", updateProfilePreview);
    borderColorInput.addEventListener("input", updateProfilePreview);
    shadowInput.addEventListener("input", updateProfilePreview);
    alignInput.addEventListener("change", updateProfilePreview);

    avatarInput.addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!isSafeImageType(file.type)) {
        window.alert("Formato de imagen no permitido. Usa PNG, JPG, GIF o WEBP.");
        avatarInput.value = "";
        return;
      }
      const dataUrl = await resizeImageToDataUrl(file, MAX_AVATAR_LENGTH, 512);
      state.profileDraft.avatarData = dataUrl;
      setAvatar(avatarEl, dataUrl, profile.displayName || profile.username);
    });

    const form = dom.profileContent.querySelector("#profileForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        displayName: displayNameInput.value,
        username: usernameInput.value,
        bio: bioInput.value,
        info: infoInput.value,
        location: locationInput.value,
        website: websiteInput.value,
        status: statusInput.value,
        appTheme: selectedAppTheme,
        appSettings: {
          sound: soundInput.checked,
        },
        customThemes,
        profileTheme: {
          cardBg: cardBgInput.value,
          textColor: textColorInput.value,
          accent: accentInput.value,
          borderRadius: borderRadiusInput.value,
          borderColor: borderColorInput.value,
          shadow: shadowInput.value,
          align: alignInput.value,
        },
      };
      if (state.profileDraft.avatarData !== null) {
        payload.avatar = state.profileDraft.avatarData;
      }
      try {
        const data = await api("/api/profile", {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setActiveUser(data.user);
        state.profileCache = {};
        await refreshAll();
        renderProfileModal({ user: data.user }, true);
      } catch (error) {
        window.alert(error.message);
      }
    });
  }

  dom.profileModal.classList.remove("hidden");
}

function renderChatSettings(chat, details) {
  const isGroup = chat.type === "group";
  const isDm = chat.type === "dm";
  const role = details.role || "member";
  const canAdmin = isGroup && (role === "owner" || role === "admin");
  const isOwner = isGroup && role === "owner";
  const canEditGroup =
    isGroup && (role === "owner" || (role === "admin" && details.chat.settings?.adminCanEditChat !== false));
  const canEditSettings = isDm || canAdmin;

  dom.chatContent.innerHTML = `
    <div class="profile-preview chat-preview" id="chatPreview">
      <div class="profile-header">
        <div class="avatar large" id="chatAvatar"></div>
        <div>
          <div class="profile-name" id="chatName"></div>
          <div class="profile-handle" id="chatType"></div>
        </div>
      </div>
      <div class="profile-bio" id="chatDescription"></div>
    </div>
    <div class="profile-actions" id="chatActions"></div>
    <form class="profile-form ${canEditGroup ? "" : "hidden"}" id="chatForm">
      <div class="form-section-title">Datos del chat</div>
      <label>
        Nombre
        <input type="text" id="chatNameInput" />
      </label>
      <label>
        Descripcion
        <textarea id="chatDescriptionInput"></textarea>
      </label>
      <label>
        Imagen del chat
        <input type="file" id="chatAvatarInput" accept="image/*" />
      </label>
      <label>
        Solo admins pueden escribir
        <input type="checkbox" id="chatAdminOnly" />
      </label>
      <label>
        Miembros pueden escribir
        <input type="checkbox" id="chatMemberWrite" />
      </label>
      <label>
        Admins pueden editar info
        <input type="checkbox" id="chatAdminEdit" />
      </label>
      <label>
        Requiere aprobacion para entrar
        <input type="checkbox" id="chatApproval" />
      </label>
      <button type="submit" class="primary">Guardar cambios</button>
    </form>
    <form class="profile-form ${canEditSettings ? "" : "hidden"}" id="chatSettingsForm">
      <div class="form-section-title">Ajustes del chat</div>
      <label>
        Mensajes temporales
        <select id="chatEphemeral">
          <option value="0">Desactivado</option>
          <option value="1">1 dia</option>
          <option value="7">1 semana</option>
          <option value="30">1 mes</option>
        </select>
      </label>
      <label>
        Etiquetas (separadas por coma)
        <input type="text" id="chatTags" />
      </label>
      <button type="submit" class="primary">Guardar ajustes</button>
    </form>
    <div class="form-section-title">Miembros</div>
    <div class="suggestions" id="chatMembers"></div>
    <div class="form-section-title ${canAdmin ? "" : "hidden"}">Solicitudes</div>
    <div class="suggestions ${canAdmin ? "" : "hidden"}" id="chatRequests"></div>
    <div class="form-section-title ${canAdmin ? "" : "hidden"}">Bloqueados</div>
    <div class="suggestions ${canAdmin ? "" : "hidden"}" id="chatBans"></div>
    <div class="form-section-title">Archivos</div>
    <div class="file-gallery" id="chatFiles"></div>
  `;

  const preview = dom.chatContent.querySelector("#chatPreview");
  preview.style.background = "var(--panel)";
  preview.style.borderRadius = "20px";
  preview.style.borderColor = "var(--border)";
  preview.style.boxShadow = "var(--shadow)";

  const avatarEl = dom.chatContent.querySelector("#chatAvatar");
  setAvatar(avatarEl, details.chat.avatar || "", chat.name);
  dom.chatContent.querySelector("#chatName").textContent = chat.name;
  dom.chatContent.querySelector("#chatType").textContent = isGroup
    ? "Grupo"
    : isDm
    ? "Chat privado"
    : "Chat global";
  dom.chatContent.querySelector("#chatDescription").textContent =
    details.chat.description || chat.subtitle || "";

  const actions = dom.chatContent.querySelector("#chatActions");
  actions.innerHTML = "";

  const pinBtn = document.createElement("button");
  pinBtn.className = "primary";
  pinBtn.textContent = details.pinnedMessage ? "Quitar fijado" : "Fijar ultimo";
  pinBtn.addEventListener("click", () => (details.pinnedMessage ? unpinMessage() : togglePin()));
  actions.appendChild(pinBtn);

  if (isGroup) {
    const leave = document.createElement("button");
    leave.textContent = "Salir del grupo";
    leave.addEventListener("click", () => leaveChat(chat.id));
    actions.appendChild(leave);
    if (isOwner) {
      const remove = document.createElement("button");
      remove.textContent = "Eliminar grupo";
      remove.addEventListener("click", () => deleteGroup(chat.id));
      actions.appendChild(remove);
    }
  } else if (isDm) {
    const other = details.members.find((m) => m.id !== state.user.id);
    const profile = document.createElement("button");
    profile.textContent = "Ver perfil";
    profile.addEventListener("click", () => openProfile(other?.id));
    actions.appendChild(profile);

    const block = document.createElement("button");
    block.textContent = "Bloquear";
    block.addEventListener("click", () => blockUser(other?.id));
    actions.appendChild(block);

    const close = document.createElement("button");
    close.textContent = "Cerrar chat";
    close.addEventListener("click", () => leaveChat(chat.id));
    actions.appendChild(close);
  }

  if (canEditGroup) {
    const nameInput = dom.chatContent.querySelector("#chatNameInput");
    const descInput = dom.chatContent.querySelector("#chatDescriptionInput");
    const avatarInput = dom.chatContent.querySelector("#chatAvatarInput");
    const adminOnlyInput = dom.chatContent.querySelector("#chatAdminOnly");
    const memberWriteInput = dom.chatContent.querySelector("#chatMemberWrite");
    const adminEditInput = dom.chatContent.querySelector("#chatAdminEdit");
    const approvalInput = dom.chatContent.querySelector("#chatApproval");

    nameInput.value = details.chat.name || chat.name;
    descInput.value = details.chat.description || "";
    adminOnlyInput.checked = Boolean(details.chat.settings?.adminOnly);
    memberWriteInput.checked = details.chat.settings?.memberCanWrite !== false;
    adminEditInput.checked = details.chat.settings?.adminCanEditChat !== false;
    approvalInput.checked = Boolean(details.chat.settings?.approvalRequired);

    let avatarData = null;
    avatarInput.addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (!isSafeImageType(file.type)) {
        window.alert("Formato de imagen no permitido. Usa PNG, JPG, GIF o WEBP.");
        avatarInput.value = "";
        return;
      }
      avatarData = await resizeImageToDataUrl(file, MAX_AVATAR_LENGTH, 512);
      setAvatar(avatarEl, avatarData, chat.name);
    });

    const form = dom.chatContent.querySelector("#chatForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {
        name: nameInput.value,
        description: descInput.value,
        settings: {
          adminOnly: adminOnlyInput.checked,
          approvalRequired: approvalInput.checked,
          memberCanWrite: memberWriteInput.checked,
          adminCanEditChat: adminEditInput.checked,
        },
      };
      if (avatarData !== null) payload.avatar = avatarData;
      try {
        await api(`/api/chats/${chat.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await Promise.all([loadChats(), loadChatDetails(chat.id)]);
        render();
        openChatSettings();
      } catch (error) {
        window.alert(error.message);
      }
    });
  }

  if (canEditSettings) {
    const settingsForm = dom.chatContent.querySelector("#chatSettingsForm");
    const ephemeralInput = dom.chatContent.querySelector("#chatEphemeral");
    const tagsInput = dom.chatContent.querySelector("#chatTags");

    ephemeralInput.value = String(details.chat.settings?.ephemeralDays || 0);
    tagsInput.value = Array.isArray(details.chat.tags) ? details.chat.tags.join(", ") : "";

    settingsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const tags = tagsInput.value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = {
        ephemeralDays: Number(ephemeralInput.value || 0),
        tags,
      };
      try {
        await api(`/api/chats/${chat.id}/settings`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        await Promise.all([loadChats(), loadChatDetails(chat.id)]);
        render();
        openChatSettings();
      } catch (error) {
        window.alert(error.message);
      }
    });
  }

  const membersWrap = dom.chatContent.querySelector("#chatMembers");
  membersWrap.innerHTML = "";
  details.members.forEach((member) => {
    const row = document.createElement("div");
    row.className = "suggestion";

    const info = document.createElement("div");
    info.className = "suggestion-info";
    info.appendChild(createAvatarElement(member.avatar, member.displayName));

    const textWrap = document.createElement("div");
    const name = document.createElement("div");
    name.className = "suggestion-name";
    name.textContent = member.displayName;
    const handle = document.createElement("div");
    handle.className = "suggestion-handle";
    handle.textContent = `${member.role} · @${member.username}`;
    textWrap.appendChild(name);
    textWrap.appendChild(handle);
    info.appendChild(textWrap);
    info.addEventListener("click", () => openProfile(member.id));

    const actionsWrap = document.createElement("div");

    if (isGroup && isOwner && member.id !== state.user.id) {
      const toggle = document.createElement("button");
      toggle.className = "tiny";
      toggle.textContent = member.role === "admin" ? "Quitar admin" : "Hacer admin";
      toggle.addEventListener("click", () =>
        changeMemberRole(chat.id, member.id, member.role === "admin" ? "member" : "admin")
      );
      actionsWrap.appendChild(toggle);

      const transfer = document.createElement("button");
      transfer.className = "tiny primary";
      transfer.textContent = "Transferir";
      transfer.addEventListener("click", () => transferOwner(chat.id, member.id));
      actionsWrap.appendChild(transfer);
    }

    if (isGroup && canAdmin && member.id !== state.user.id && member.role !== "owner") {
      const kick = document.createElement("button");
      kick.className = "tiny";
      kick.textContent = "Expulsar";
      kick.addEventListener("click", () => kickMember(chat.id, member.id, false));
      actionsWrap.appendChild(kick);

      const ban = document.createElement("button");
      ban.className = "tiny";
      ban.textContent = "Banear";
      ban.addEventListener("click", () => kickMember(chat.id, member.id, true));
      actionsWrap.appendChild(ban);
    }

    row.appendChild(info);
    if (actionsWrap.children.length) row.appendChild(actionsWrap);
    membersWrap.appendChild(row);
  });

  if (canAdmin) {
    const requestsWrap = dom.chatContent.querySelector("#chatRequests");
    requestsWrap.innerHTML = "";
    if (!details.requests.length) {
      const empty = document.createElement("div");
      empty.className = "card-subtitle";
      empty.textContent = "Sin solicitudes.";
      requestsWrap.appendChild(empty);
    } else {
      details.requests.forEach((req) => {
        const row = document.createElement("div");
        row.className = "suggestion";
        const info = document.createElement("div");
        info.className = "suggestion-info";
        info.appendChild(createAvatarElement(req.avatar, req.displayName));

        const textWrap = document.createElement("div");
        const name = document.createElement("div");
        name.className = "suggestion-name";
        name.textContent = req.displayName;
        const handle = document.createElement("div");
        handle.className = "suggestion-handle";
        handle.textContent = `@${req.username}`;
        textWrap.appendChild(name);
        textWrap.appendChild(handle);
        info.appendChild(textWrap);

        const actionsWrap = document.createElement("div");
        const approve = document.createElement("button");
        approve.className = "tiny primary";
        approve.textContent = "Aceptar";
        approve.addEventListener("click", () => approveChatRequest(chat.id, req.id));
        const reject = document.createElement("button");
        reject.className = "tiny";
        reject.textContent = "Rechazar";
        reject.addEventListener("click", () => rejectChatRequest(chat.id, req.id));
        actionsWrap.appendChild(approve);
        actionsWrap.appendChild(reject);

        row.appendChild(info);
        row.appendChild(actionsWrap);
        requestsWrap.appendChild(row);
      });
    }

    const bansWrap = dom.chatContent.querySelector("#chatBans");
    bansWrap.innerHTML = "";
    if (!details.bans.length) {
      const empty = document.createElement("div");
      empty.className = "card-subtitle";
      empty.textContent = "Sin bloqueados.";
      bansWrap.appendChild(empty);
    } else {
      details.bans.forEach((ban) => {
        const row = document.createElement("div");
        row.className = "suggestion";
        const info = document.createElement("div");
        info.className = "suggestion-info";
        info.appendChild(createAvatarElement(ban.avatar, ban.displayName));

        const textWrap = document.createElement("div");
        const name = document.createElement("div");
        name.className = "suggestion-name";
        name.textContent = ban.displayName;
        const handle = document.createElement("div");
        handle.className = "suggestion-handle";
        handle.textContent = `@${ban.username}`;
        textWrap.appendChild(name);
        textWrap.appendChild(handle);
        info.appendChild(textWrap);

        const actionsWrap = document.createElement("div");
        const unban = document.createElement("button");
        unban.className = "tiny primary";
        unban.textContent = "Desbloquear";
        unban.addEventListener("click", () => unbanMember(chat.id, ban.id));
        actionsWrap.appendChild(unban);

        row.appendChild(info);
        row.appendChild(actionsWrap);
        bansWrap.appendChild(row);
      });
    }
  }
}

async function changeMemberRole(chatId, userId, role) {
  try {
    await api(`/api/chats/${chatId}/members/${userId}/role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function transferOwner(chatId, userId) {
  const ok = window.confirm("Transferir propiedad del grupo?");
  if (!ok) return;
  try {
    await api(`/api/chats/${chatId}/transfer`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function kickMember(chatId, userId, ban) {
  try {
    await api(`/api/chats/${chatId}/kick`, {
      method: "POST",
      body: JSON.stringify({ userId, ban }),
    });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function approveChatRequest(chatId, userId) {
  try {
    await api(`/api/chats/${chatId}/requests/${userId}/approve`, { method: "POST" });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function rejectChatRequest(chatId, userId) {
  try {
    await api(`/api/chats/${chatId}/requests/${userId}/reject`, { method: "POST" });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function unbanMember(chatId, userId) {
  try {
    await api(`/api/chats/${chatId}/ban/${userId}`, { method: "DELETE" });
    await loadChatDetails(chatId);
    renderChatSettings(
      state.chats.find((c) => c.id === chatId),
      state.chatDetails[chatId]
    );
  } catch (error) {
    window.alert(error.message);
  }
}

async function leaveChat(chatId) {
  const ok = window.confirm("Salir de este chat?");
  if (!ok) return;
  try {
    await api(`/api/chats/${chatId}/leave`, { method: "POST" });
    if (state.socket) {
      state.socket.emit("chat:leave", { chatId });
    }
    closeChatModal();
    await refreshAll();
  } catch (error) {
    window.alert(error.message);
  }
}

async function deleteGroup(chatId) {
  const ok = window.confirm("Eliminar grupo definitivamente?");
  if (!ok) return;
  try {
    await api(`/api/chats/${chatId}`, { method: "DELETE" });
    if (state.socket) {
      state.socket.emit("chat:leave", { chatId });
    }
    closeChatModal();
    await refreshAll();
  } catch (error) {
    window.alert(error.message);
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function resizeImageToDataUrl(file, maxLength, maxDim = 512) {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    return await fileToDataUrl(file);
  }
  const dataUrl = await fileToDataUrl(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const isPng = file.type.includes("png");
  let quality = 0.85;
  let output = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
  if (output.length <= maxLength) return output;

  if (!isPng) {
    quality = 0.7;
    output = canvas.toDataURL("image/jpeg", quality);
    if (output.length <= maxLength) return output;
    quality = 0.55;
    output = canvas.toDataURL("image/jpeg", quality);
    if (output.length <= maxLength) return output;
  }

  const shrinkScale = 384 / Math.max(width, height);
  if (shrinkScale < 1) {
    const w2 = Math.max(1, Math.round(width * shrinkScale));
    const h2 = Math.max(1, Math.round(height * shrinkScale));
    canvas.width = w2;
    canvas.height = h2;
    ctx.drawImage(img, 0, 0, w2, h2);
    output = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.65);
  }

  return output;
}

async function toggleRecording() {
  if (state.recording.active) {
    state.recording.recorder.stop();
    return;
  }
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    window.alert("Tu navegador no soporta mensajes de voz.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.recording.active = true;
    state.recording.recorder = recorder;
    state.recording.chunks = [];
    state.recording.stream = stream;
    state.recording.startedAt = Date.now();
    if (state.recording.timerId) {
      clearInterval(state.recording.timerId);
    }
    state.recording.timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.recording.startedAt) / 1000);
      dom.recordingBadge.textContent = `Grabando mensaje de voz... ${elapsed}s`;
    }, 500);
    dom.recordingBadge.classList.remove("hidden");
    dom.voiceBtn.classList.add("recording");
    dom.recordingBadge.textContent = "Grabando mensaje de voz... 0s";

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.recording.chunks.push(event.data);
      }
    };
    recorder.onstop = async () => {
      const blob = new Blob(state.recording.chunks, { type: recorder.mimeType });
      state.recording.stream.getTracks().forEach((track) => track.stop());
      const dataUrl = await fileToDataUrl(blob);
      state.recording.active = false;
      state.recording.recorder = null;
      state.recording.stream = null;
      if (state.recording.timerId) {
        clearInterval(state.recording.timerId);
        state.recording.timerId = null;
      }
      state.recording.startedAt = null;
      dom.recordingBadge.classList.add("hidden");
      dom.voiceBtn.classList.remove("recording");
      if (dataUrl.length > MAX_AUDIO_LENGTH) {
        window.alert("El audio es muy largo.");
        return;
      }
      sendVoiceMessage(dataUrl);
    };
    recorder.start();
  } catch (error) {
    if (state.recording.timerId) {
      clearInterval(state.recording.timerId);
      state.recording.timerId = null;
    }
    state.recording.startedAt = null;
    window.alert("No se pudo acceder al microfono.");
  }
}

function sendVoiceMessage(audio) {
  if (!audio || !state.activeChatId || !state.socket) return;
  const payload = { chatId: state.activeChatId, type: "voice", audio };
  if (state.replyTo) {
    payload.replyTo = state.replyTo.id;
    payload.replyPreview = getReplyPreview();
  }
  state.socket.emit("message:send", payload);
  clearReply();
}

async function handleFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  event.target.value = "";
  toggleAttachMenu(false);
  if (!state.socket || !state.activeChatId) return;
  if (file.size > MAX_FILE_SIZE) {
    window.alert("El archivo es muy grande.");
    return;
  }
  try {
    const dataUrl = await fileToDataUrl(file);
    state.socket.emit("message:send", {
      chatId: state.activeChatId,
      type: "file",
      file: {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: dataUrl,
      },
      replyTo: state.replyTo ? state.replyTo.id : undefined,
      replyPreview: state.replyTo ? getReplyPreview() : undefined,
    });
    clearReply();
  } catch (error) {
    window.alert("No se pudo leer el archivo.");
  }
}

function openPollPrompt() {
  if (!state.socket || !state.activeChatId) return;
  const question = window.prompt("Pregunta de la encuesta");
  if (!question) return;
  const rawOptions = window.prompt("Opciones separadas por coma");
  if (!rawOptions) return;
  const options = rawOptions
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (options.length < 2) {
    window.alert("Necesitas al menos 2 opciones.");
    return;
  }
  const payload = {
    chatId: state.activeChatId,
    type: "poll",
    poll: { question, options },
  };
  if (state.replyTo) {
    payload.replyTo = state.replyTo.id;
    payload.replyPreview = getReplyPreview();
  }
  state.socket.emit("message:send", payload);
  clearReply();
}

function openEventPrompt() {
  if (!state.socket || !state.activeChatId) return;
  const chat = state.chats.find((item) => item.id === state.activeChatId);
  if (!chat || chat.type !== "group") {
    window.alert("Los eventos solo estan disponibles en grupos.");
    return;
  }
  const title = window.prompt("Titulo del evento");
  if (!title) return;
  const date = window.prompt("Fecha (YYYY-MM-DD)");
  if (!date) return;
  const time = window.prompt("Hora (HH:mm)", "19:00") || "";
  const note = window.prompt("Nota (opcional)") || "";
  const reminder = window.prompt("Recordatorio en minutos (opcional)", "60") || "0";
  const payload = {
    chatId: state.activeChatId,
    type: "event",
    event: {
      title,
      date,
      time,
      note,
      reminderMinutes: Number(reminder) || 0,
    },
  };
  if (state.replyTo) {
    payload.replyTo = state.replyTo.id;
    payload.replyPreview = getReplyPreview();
  }
  state.socket.emit("message:send", payload);
  clearReply();
}

function toggleAttachMenu(force) {
  const next = force !== undefined ? force : !state.attachOpen;
  state.attachOpen = next;
  if (state.attachOpen) {
    dom.attachMenu.classList.remove("hidden");
  } else {
    dom.attachMenu.classList.add("hidden");
  }
}

function render() {
  renderTabs();
  renderList();
  renderMain();
}

function initAuthTabs() {
  dom.authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      dom.authTabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.auth;
      if (mode === "login") {
        dom.loginForm.classList.remove("hidden");
        dom.registerForm.classList.add("hidden");
      } else {
        dom.registerForm.classList.remove("hidden");
        dom.loginForm.classList.add("hidden");
      }
      setAuthError("");
    });
  });
}

async function bootstrap() {
  initAuthTabs();
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.composer.addEventListener("submit", handleComposer);
  dom.addMemberBtn.addEventListener("click", handleAddMember);
  dom.viewProfileBtn.addEventListener("click", () => {
    const userId = Number(dom.viewProfileBtn.dataset.userId || 0);
    if (userId) openProfile(userId);
  });
  dom.backBtn.addEventListener("click", handleBack);
  dom.searchInput.addEventListener("input", renderList);
  dom.profileBtn.addEventListener("click", () => openProfile(state.user.id));
  dom.profileClose.addEventListener("click", closeProfileModal);
  dom.profileModal.addEventListener("click", (event) => {
    if (event.target === dom.profileModal) closeProfileModal();
  });
  dom.voiceBtn.addEventListener("click", toggleRecording);
  dom.attachBtn.addEventListener("click", () => toggleAttachMenu());
  dom.pollBtn.addEventListener("click", () => {
    toggleAttachMenu(false);
    openPollPrompt();
  });
  dom.eventBtn.addEventListener("click", () => {
    toggleAttachMenu(false);
    openEventPrompt();
  });
  dom.fileInput.addEventListener("change", handleFileSelect);
  dom.replyClose.addEventListener("click", clearReply);
  dom.pinBtn.addEventListener("click", togglePin);
  dom.chatSettingsBtn.addEventListener("click", openChatSettings);
  dom.chatClose.addEventListener("click", closeChatModal);
  dom.chatModal.addEventListener("click", (event) => {
    if (event.target === dom.chatModal) closeChatModal();
  });
  document.addEventListener("click", (event) => {
    if (!state.attachOpen) return;
    if (dom.attachMenu.contains(event.target) || dom.attachBtn.contains(event.target)) return;
    toggleAttachMenu(false);
  });
  dom.messages.addEventListener("scroll", () => {
    if (!state.activeChatId) return;
    rememberScroll(state.activeChatId);
  });

  dom.tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab");
    if (!button) return;
    setActiveTab(button.dataset.tab);
    if (window.innerWidth < 900) {
      dom.app.classList.add("show-list");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      dom.app.classList.remove("show-list");
    }
  });

  if (state.token) {
    try {
      const data = await api("/api/me");
      setActiveUser(data.user);
      showApp();
      connectSocket();
      await refreshAll();
    } catch (error) {
      setToken("");
      showAuth();
    }
  } else {
    showAuth();
  }
}

bootstrap();
