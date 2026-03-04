const path = require("path");
const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "cantares.json");
const DB_BACKEND = (process.env.DB_BACKEND || "json").toLowerCase();
const SQLITE_PATH = process.env.DB_FILE || path.join(DATA_DIR, "cantares.sqlite");

const MAX_AVATAR_SIZE = 600000;
const MAX_AUDIO_SIZE = 1400000;
const MAX_FILE_SIZE = 5000000;
const MAX_MESSAGE_LENGTH = 600;

const DEFAULT_THEME = {
  cardBg: "linear-gradient(135deg, #eaf6ed 0%, #d8efe4 45%, #c9e7da 100%)",
  textColor: "#17231d",
  accent: "#1fa55b",
  borderRadius: "20px",
  borderColor: "rgba(23, 35, 29, 0.12)",
  shadow: "0 18px 40px rgba(15, 30, 22, 0.12)",
  align: "left",
};

const DEFAULT_CHAT_SETTINGS = {
  adminOnly: false,
  approvalRequired: false,
  memberCanWrite: true,
  adminCanEditChat: true,
  ephemeralDays: 0,
};

const DEFAULT_APP_THEME = {
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
};

const DEFAULT_APP_SETTINGS = {
  sound: true,
};

const LOGIN_LIMIT = {
  windowMs: 10 * 60 * 1000,
  maxAttempts: 5,
  lockMs: 10 * 60 * 1000,
};

const REGISTER_LIMIT = {
  windowMs: 30 * 60 * 1000,
  maxAttempts: 10,
};

const loginAttempts = new Map();
const registerAttempts = new Map();

let sqliteDb = null;
function loadSqlite() {
  if (sqliteDb) return sqliteDb;
  const Database = require("better-sqlite3");
  sqliteDb = new Database(SQLITE_PATH);
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.exec("CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)");
  return sqliteDb;
}

function readSqliteDb() {
  const db = loadSqlite();
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get("db");
  if (!row || !row.value) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

function writeSqliteDb(data) {
  const db = loadSqlite();
  const value = JSON.stringify(data, null, 2);
  db.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)").run("db", value);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "microphone=(self)");
  next();
});

const db = loadDb();
normalizeDb();

function now() {
  return Date.now();
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isLocalIp(ip) {
  return ip === "127.0.0.1" || ip === "::1" || String(ip || "").startsWith("::ffff:127.0.0.1");
}

function pruneAttempts(map, ttlMs) {
  const cutoff = now() - ttlMs;
  for (const [key, entry] of map.entries()) {
    if ((entry.lockedUntil && entry.lockedUntil < now()) || entry.firstAt < cutoff) {
      map.delete(key);
    }
  }
}

function getLoginKey(req, username) {
  return `${getClientIp(req)}:${sanitizeUsername(username)}`;
}

function checkLoginLocked(req, username) {
  const key = getLoginKey(req, username);
  const entry = loginAttempts.get(key);
  if (!entry) return { locked: false, key };
  if (entry.lockedUntil && entry.lockedUntil > now()) {
    return { locked: true, key, retryAt: entry.lockedUntil };
  }
  return { locked: false, key };
}

function recordLoginFailure(key) {
  const current = loginAttempts.get(key);
  const ts = now();
  if (!current || ts - current.firstAt > LOGIN_LIMIT.windowMs) {
    loginAttempts.set(key, { count: 1, firstAt: ts, lockedUntil: 0 });
    return;
  }
  current.count += 1;
  if (current.count >= LOGIN_LIMIT.maxAttempts) {
    current.lockedUntil = ts + LOGIN_LIMIT.lockMs;
    current.count = 0;
    current.firstAt = ts;
  }
  loginAttempts.set(key, current);
}

function clearLoginFailures(key) {
  loginAttempts.delete(key);
}

function checkRegisterLimit(req) {
  const key = getClientIp(req);
  const entry = registerAttempts.get(key);
  const ts = now();
  if (!entry || ts - entry.firstAt > REGISTER_LIMIT.windowMs) {
    registerAttempts.set(key, { count: 1, firstAt: ts });
    return { limited: false };
  }
  if (entry.count >= REGISTER_LIMIT.maxAttempts) {
    return { limited: true, retryAt: entry.firstAt + REGISTER_LIMIT.windowMs };
  }
  entry.count += 1;
  registerAttempts.set(key, entry);
  return { limited: false };
}

function loadDb() {
  if (DB_BACKEND === "sqlite") {
    const existing = readSqliteDb();
    if (existing) return existing;
  }
  if (!fs.existsSync(DB_PATH)) {
    const fresh = {
      counters: { users: 0, chats: 0, messages: 0, friendRequests: 0, invites: 0 },
      users: [],
      sessions: [],
      chats: [],
      chatMembers: [],
      messages: [],
      friendRequests: [],
      groupInvites: [],
      friends: [],
      blocks: [],
      chatBans: [],
      chatRequests: [],
      chatBans: [],
      chatRequests: [],
    };
    if (DB_BACKEND === "sqlite") {
      writeSqliteDb(fresh);
    } else {
      fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    }
    return fresh;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (DB_BACKEND === "sqlite") {
      writeSqliteDb(parsed);
    }
    return parsed;
  } catch (error) {
    const backup = `${DB_PATH}.broken.${Date.now()}`;
    fs.writeFileSync(backup, raw);
    const fresh = {
      counters: { users: 0, chats: 0, messages: 0, friendRequests: 0, invites: 0 },
      users: [],
      sessions: [],
      chats: [],
      chatMembers: [],
      messages: [],
      friendRequests: [],
      groupInvites: [],
      friends: [],
      blocks: [],
    };
    if (DB_BACKEND === "sqlite") {
      writeSqliteDb(fresh);
    } else {
      fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    }
    return fresh;
  }
}

function normalizeDb() {
  let dirty = false;
  if (!db.counters || typeof db.counters !== "object") {
    db.counters = { users: 0, chats: 0, messages: 0, friendRequests: 0 };
    dirty = true;
  }
  ["users", "chats", "messages", "friendRequests", "invites"].forEach((key) => {
    if (typeof db.counters[key] !== "number") {
      db.counters[key] = 0;
      dirty = true;
    }
  });

  const arrayKeys = [
    "users",
    "sessions",
    "chats",
    "chatMembers",
    "messages",
    "friendRequests",
    "groupInvites",
    "friends",
    "blocks",
    "chatBans",
    "chatRequests",
  ];
  arrayKeys.forEach((key) => {
    if (!Array.isArray(db[key])) {
      db[key] = [];
      dirty = true;
    }
  });

  db.users.forEach((user) => {
    if (!user.displayName) {
      user.displayName = user.username || "Usuario";
      dirty = true;
    }
    if (user.avatar === undefined) {
      user.avatar = "";
      dirty = true;
    }
    if (user.bio === undefined) {
      user.bio = "";
      dirty = true;
    }
    if (user.info === undefined) {
      user.info = "";
      dirty = true;
    }
    if (user.location === undefined) {
      user.location = "";
      dirty = true;
    }
    if (user.website === undefined) {
      user.website = "";
      dirty = true;
    }
    if (user.status === undefined) {
      user.status = "";
      dirty = true;
    }
    if (!user.appTheme || typeof user.appTheme !== "object") {
      user.appTheme = { ...DEFAULT_APP_THEME };
      dirty = true;
    } else {
      const theme = user.appTheme;
      Object.keys(DEFAULT_APP_THEME).forEach((key) => {
        if (!theme[key]) {
          theme[key] = DEFAULT_APP_THEME[key];
          dirty = true;
        }
      });
    }
    if (!user.appSettings || typeof user.appSettings !== "object") {
      user.appSettings = { ...DEFAULT_APP_SETTINGS };
      dirty = true;
    } else if (user.appSettings.sound === undefined) {
      user.appSettings.sound = true;
      dirty = true;
    }
    if (!user.profileTheme || typeof user.profileTheme !== "object") {
      user.profileTheme = { ...DEFAULT_THEME };
      dirty = true;
    } else {
      const theme = user.profileTheme;
      if (!theme.cardBg) {
        theme.cardBg = DEFAULT_THEME.cardBg;
        dirty = true;
      }
      if (!theme.textColor) {
        theme.textColor = DEFAULT_THEME.textColor;
        dirty = true;
      }
      if (!theme.accent) {
        theme.accent = DEFAULT_THEME.accent;
        dirty = true;
      }
      if (!theme.borderRadius) {
        theme.borderRadius = DEFAULT_THEME.borderRadius;
        dirty = true;
      }
      if (!theme.borderColor) {
        theme.borderColor = DEFAULT_THEME.borderColor;
        dirty = true;
      }
      if (!theme.shadow) {
        theme.shadow = DEFAULT_THEME.shadow;
        dirty = true;
      }
      if (!theme.align) {
        theme.align = DEFAULT_THEME.align;
        dirty = true;
      }
    }
    if (!Array.isArray(user.customThemes)) {
      user.customThemes = [];
      dirty = true;
    }
  });

  db.chats.forEach((chat) => {
    if (chat.description === undefined) {
      chat.description = "";
      dirty = true;
    }
    if (chat.avatar === undefined) {
      chat.avatar = "";
      dirty = true;
    }
    if (!chat.settings || typeof chat.settings !== "object") {
      chat.settings = { ...DEFAULT_CHAT_SETTINGS };
      dirty = true;
    } else {
      Object.keys(DEFAULT_CHAT_SETTINGS).forEach((key) => {
        if (chat.settings[key] === undefined) {
          chat.settings[key] = DEFAULT_CHAT_SETTINGS[key];
          dirty = true;
        }
      });
    }
    if (!Array.isArray(chat.tags)) {
      chat.tags = [];
      dirty = true;
    }
    if (chat.pinnedMessageId === undefined) {
      chat.pinnedMessageId = null;
      dirty = true;
    }
    if (chat.pinnedBy === undefined) {
      chat.pinnedBy = null;
      dirty = true;
    }
    if (chat.pinnedUntil === undefined) {
      chat.pinnedUntil = null;
      dirty = true;
    }
  });

  db.blocks.forEach((block) => {
    if (block.wasFriend === undefined) {
      block.wasFriend = false;
      dirty = true;
    }
  });

  db.messages.forEach((msg) => {
    if (!msg.type) {
      msg.type = "text";
      dirty = true;
    }
    if (msg.content === undefined || msg.content === null) {
      msg.content = msg.text || "";
      dirty = true;
    }
    if (msg.audio === undefined) {
      msg.audio = null;
      dirty = true;
    }
    if (msg.file === undefined) {
      msg.file = null;
      dirty = true;
    }
    if (msg.updatedAt === undefined) {
      msg.updatedAt = null;
      dirty = true;
    }
    if (msg.deletedAt === undefined) {
      msg.deletedAt = null;
      dirty = true;
    }
    if (msg.reactions === undefined) {
      msg.reactions = {};
      dirty = true;
    }
    if (msg.reply === undefined) {
      msg.reply = null;
      dirty = true;
    }
    if (msg.poll === undefined) {
      msg.poll = null;
      dirty = true;
    }
    if (msg.event === undefined) {
      msg.event = null;
      dirty = true;
    }
    if (msg.expireAt === undefined) {
      msg.expireAt = null;
      dirty = true;
    }
  });

  if (dirty) saveDb();
}

function saveDb() {
  if (DB_BACKEND === "sqlite") {
    writeSqliteDb(db);
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
}

function nextId(kind) {
  db.counters[kind] += 1;
  return db.counters[kind];
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function sanitizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function safeString(value, max) {
  return String(value || "").trim().slice(0, max);
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function safeCssValue(value, fallback) {
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

function isSafeImageDataUrl(value) {
  const raw = String(value || "");
  return /^data:image\/(png|jpeg|jpg|gif|webp|bmp)(;|,)/i.test(raw);
}

function safeAlign(value, fallback) {
  if (value === "center" || value === "right" || value === "stacked" || value === "left") {
    return value;
  }
  return fallback;
}

function sanitizeTheme(input, fallback) {
  const theme = input || {};
  const base = fallback || { ...DEFAULT_THEME };
  const fallbackId = base.id || crypto.randomBytes(6).toString("hex");
  return {
    id: safeString(theme.id, 40) || fallbackId,
    name: safeString(theme.name, 40) || base.name || "Tema",
    cardBg: safeCssValue(theme.cardBg, base.cardBg),
    textColor: safeCssValue(theme.textColor, base.textColor),
    accent: safeCssValue(theme.accent, base.accent),
    borderRadius: safeCssValue(theme.borderRadius, base.borderRadius),
    borderColor: safeCssValue(theme.borderColor, base.borderColor),
    shadow: safeCssValue(theme.shadow, base.shadow),
    align: safeAlign(theme.align, base.align),
  };
}

function sanitizeReplyPreview(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = ["text", "voice", "file", "poll", "event"].includes(raw.type) ? raw.type : "text";
  return {
    id: Number(raw.id) || 0,
    senderId: Number(raw.senderId) || null,
    senderName: safeString(raw.senderName, 40) || "Usuario",
    type,
    text: safeString(raw.text, 200),
    fileName: safeString(raw.fileName, 120),
    createdAt: Number(raw.createdAt) || null,
    deletedAt: Boolean(raw.deletedAt),
  };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar || "",
    bio: user.bio || "",
    info: user.info || "",
    location: user.location || "",
    website: user.website || "",
    status: user.status || "",
    profileTheme: user.profileTheme || { ...DEFAULT_THEME },
    customThemes: Array.isArray(user.customThemes) ? user.customThemes : [],
    appTheme: user.appTheme || { ...DEFAULT_APP_THEME },
    appSettings: user.appSettings || { ...DEFAULT_APP_SETTINGS },
  };
}

function ensureGlobalChat() {
  const existing = db.chats.find((chat) => chat.type === "global");
  if (existing) return existing.id;
  const chat = {
    id: nextId("chats"),
    type: "global",
    name: "Chat Global",
    description: "Todos en Cantares",
    avatar: "",
    settings: { ...DEFAULT_CHAT_SETTINGS },
    pinnedMessageId: null,
    tags: [],
    createdBy: null,
    createdAt: now(),
  };
  db.chats.push(chat);
  saveDb();
  return chat.id;
}

const GLOBAL_CHAT_ID = ensureGlobalChat();

function ensureMembership(chatId, userId, role = "member") {
  const exists = db.chatMembers.some(
    (item) => item.chatId === chatId && item.userId === userId
  );
  if (exists) return;
  db.chatMembers.push({ chatId, userId, role, createdAt: now() });
  saveDb();
}

function ensureGlobalMember(userId) {
  ensureMembership(GLOBAL_CHAT_ID, userId, "member");
}

function getUserByUsername(username) {
  return db.users.find((user) => user.username === username);
}

function findUserByHandle(input) {
  const raw = String(input || "").trim();
  if (!raw) return { user: null, error: "Usuario invalido" };
  const cleaned = raw.replace(/^@/, "");
  const username = sanitizeUsername(cleaned);
  if (username) {
    const byUsername = getUserByUsername(username);
    if (byUsername) return { user: byUsername };
  }

  const needle = normalizeSearch(cleaned);
  const displayMatches = db.users.filter(
    (user) => normalizeSearch(user.displayName) === needle
  );
  if (displayMatches.length === 1) {
    return { user: displayMatches[0] };
  }
  if (displayMatches.length > 1) {
    return { user: null, error: "Nombre ambiguo, usa el @usuario" };
  }
  return { user: null };
}

function getUserById(userId) {
  return db.users.find((user) => user.id === userId);
}

function getChatById(chatId) {
  return db.chats.find((chat) => chat.id === chatId);
}

function getChatMember(chatId, userId) {
  return db.chatMembers.find((member) => member.chatId === chatId && member.userId === userId);
}

function getMemberRole(chatId, userId) {
  const member = getChatMember(chatId, userId);
  return member ? member.role : null;
}

function isChatAdmin(chatId, userId) {
  const role = getMemberRole(chatId, userId);
  return role === "owner" || role === "admin";
}

function cleanupExpired(chatId) {
  const chat = getChatById(chatId);
  if (!chat) return;
  const nowTs = now();
  if (chat.pinnedUntil && chat.pinnedUntil <= nowTs) {
    chat.pinnedMessageId = null;
    chat.pinnedBy = null;
    chat.pinnedUntil = null;
  }
  const expiredIds = new Set(
    db.messages
      .filter((m) => m.chatId === chatId && m.expireAt && m.expireAt <= nowTs)
      .map((m) => m.id)
  );
  if (expiredIds.size === 0) return;
  db.messages = db.messages.filter((m) => !expiredIds.has(m.id));
  if (chat.pinnedMessageId && expiredIds.has(chat.pinnedMessageId)) {
    chat.pinnedMessageId = null;
  }
  saveDb();
}

function authFromReq(req) {
  const token = req.get("x-auth-token");
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user) return null;
  return { ...publicUser(user), token };
}

function requireAuth(req, res, next) {
  const user = authFromReq(req);
  if (!user) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  req.user = user;
  next();
}

function isFriend(userId, friendId) {
  return db.friends.some((f) => f.userId === userId && f.friendId === friendId);
}

function isBlocked(userId, blockedId) {
  return db.blocks.some((item) => item.userId === userId && item.blockedId === blockedId);
}

function isEitherBlocked(userId, otherId) {
  return isBlocked(userId, otherId) || isBlocked(otherId, userId);
}

function removeFriendRelation(userId, otherId) {
  db.friends = db.friends.filter(
    (item) =>
      !(
        (item.userId === userId && item.friendId === otherId) ||
        (item.userId === otherId && item.friendId === userId)
      )
  );
}

function removeRequestsBetween(userId, otherId) {
  db.friendRequests = db.friendRequests.filter(
    (item) =>
      !(
        (item.fromId === userId && item.toId === otherId) ||
        (item.fromId === otherId && item.toId === userId)
      )
  );
}

function listChatsForUser(userId) {
  const chatIds = db.chatMembers
    .filter((member) => member.userId === userId)
    .map((member) => member.chatId);
  const rows = db.chats.filter((chat) => chatIds.includes(chat.id));
  const nowTs = now();

  return rows.map((row) => {
    const lastMessage = db.messages
      .filter((msg) => msg.chatId === row.id)
      .filter((msg) => !msg.expireAt || msg.expireAt > nowTs)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    let name = row.name || "";
    let subtitle = "";
    let dmUserId = null;
    let dmAvatar = "";

    if (row.type === "global") {
      name = "Chat Global";
      subtitle = "Todos en Cantares";
    } else if (row.type === "group") {
      const count = db.chatMembers.filter((m) => m.chatId === row.id).length;
      subtitle = `${count} miembros`;
    } else if (row.type === "dm") {
      const otherMember = db.chatMembers.find(
        (m) => m.chatId === row.id && m.userId !== userId
      );
      if (otherMember) {
        const other = getUserById(otherMember.userId);
        if (other) {
          name = other.displayName || other.username;
          dmUserId = other.id;
          dmAvatar = other.avatar || "";
          subtitle = "Privado";
        }
      }
    }

    let lastPreview = lastMessage ? lastMessage.content : "";
    if (lastMessage) {
      if (lastMessage.type === "voice") lastPreview = "";
      if (lastMessage.type === "file") lastPreview = "";
      if (lastMessage.type === "poll") lastPreview = lastMessage.poll?.question || "Encuesta";
      if (lastMessage.type === "event") lastPreview = lastMessage.event?.title || "Evento";
    }

    return {
      id: row.id,
      type: row.type,
      name,
      subtitle,
      description: row.description || "",
      avatar: row.avatar || "",
      settings: row.settings || { ...DEFAULT_CHAT_SETTINGS },
      pinnedMessageId: row.pinnedMessageId || null,
      pinnedBy: row.pinnedBy || null,
      pinnedUntil: row.pinnedUntil || null,
      tags: row.tags || [],
      role: getMemberRole(row.id, userId),
      lastMessage: lastPreview,
      lastType: lastMessage ? lastMessage.type : null,
      lastDeleted: lastMessage ? Boolean(lastMessage.deletedAt) : false,
      lastTime: lastMessage ? lastMessage.createdAt : null,
      dmUserId,
      dmAvatar,
    };
  });
}

function ensureDmChat(userId, otherId) {
  const chatIds = db.chatMembers
    .filter((member) => member.userId === userId)
    .map((member) => member.chatId);
  const dm = db.chats.find((chat) => chat.type === "dm" && chatIds.includes(chat.id));
  if (dm) {
    const otherMember = db.chatMembers.find(
      (member) => member.chatId === dm.id && member.userId === otherId
    );
    if (otherMember) return dm.id;
  }

  const chat = {
    id: nextId("chats"),
    type: "dm",
    name: null,
    description: "",
    avatar: "",
    settings: { ...DEFAULT_CHAT_SETTINGS },
    pinnedMessageId: null,
    tags: [],
    createdBy: userId,
    createdAt: now(),
  };
  db.chats.push(chat);
  db.chatMembers.push({ chatId: chat.id, userId, role: "member", createdAt: now() });
  db.chatMembers.push({ chatId: chat.id, userId: otherId, role: "member", createdAt: now() });
  saveDb();
  return chat.id;
}

app.use(express.json({ limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/register", (req, res) => {
  pruneAttempts(registerAttempts, REGISTER_LIMIT.windowMs);
  const limit = checkRegisterLimit(req);
  if (limit.limited) {
    res.status(429).json({ error: "Demasiados registros, intenta mas tarde." });
    return;
  }
  const displayName = safeString(req.body.displayName, 40);
  const username = sanitizeUsername(req.body.username);
  const password = String(req.body.password || "");

  if (!displayName || displayName.length < 2) {
    res.status(400).json({ error: "Nombre invalido" });
    return;
  }
  if (!username || username.length < 3) {
    res.status(400).json({ error: "Usuario invalido" });
    return;
  }
  if (!password || password.length < 4) {
    res.status(400).json({ error: "Contrasena invalida" });
    return;
  }

  const existing = getUserByUsername(username);
  if (existing) {
    res.status(400).json({ error: "Usuario ya existe" });
    return;
  }

  const user = {
    id: nextId("users"),
    username,
    displayName,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: now(),
    avatar: "",
    bio: "",
    info: "",
    location: "",
    website: "",
    status: "",
    profileTheme: { ...DEFAULT_THEME },
    appTheme: { ...DEFAULT_APP_THEME },
    appSettings: { ...DEFAULT_APP_SETTINGS },
  };
  db.users.push(user);
  ensureGlobalMember(user.id);

  const token = createToken();
  db.sessions.push({ token, userId: user.id, createdAt: now() });
  saveDb();

  res.json({ user: publicUser(user), token });
});

app.post("/api/login", (req, res) => {
  const username = sanitizeUsername(req.body.username);
  const password = String(req.body.password || "");
  pruneAttempts(loginAttempts, LOGIN_LIMIT.windowMs);
  const lock = checkLoginLocked(req, username);
  if (lock.locked) {
    res
      .status(429)
      .json({ error: "Demasiados intentos. Intenta mas tarde.", retryAt: lock.retryAt });
    return;
  }
  const user = getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    recordLoginFailure(lock.key);
    res.status(400).json({ error: "Credenciales invalidas" });
    return;
  }

  clearLoginFailures(lock.key);
  ensureGlobalMember(user.id);

  const token = createToken();
  db.sessions.push({ token, userId: user.id, createdAt: now() });
  saveDb();

  res.json({ user: publicUser(user), token });
});

app.post("/api/logout", requireAuth, (req, res) => {
  db.sessions = db.sessions.filter((s) => s.token !== req.user.token);
  saveDb();
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  res.json({ user: publicUser(user) });
});

app.patch("/api/profile", requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (req.body.username !== undefined) {
    const username = sanitizeUsername(req.body.username);
    if (!username || username.length < 3) {
      res.status(400).json({ error: "Usuario invalido" });
      return;
    }
    const existing = getUserByUsername(username);
    if (existing && existing.id !== user.id) {
      res.status(400).json({ error: "Usuario ya existe" });
      return;
    }
    user.username = username;
  }

  if (req.body.displayName !== undefined) {
    const displayName = safeString(req.body.displayName, 40);
    if (!displayName) {
      res.status(400).json({ error: "Nombre invalido" });
      return;
    }
    user.displayName = displayName;
  }

  if (req.body.bio !== undefined) {
    user.bio = safeString(req.body.bio, 160);
  }
  if (req.body.info !== undefined) {
    user.info = safeString(req.body.info, 160);
  }
  if (req.body.location !== undefined) {
    user.location = safeString(req.body.location, 40);
  }
  if (req.body.website !== undefined) {
    user.website = safeString(req.body.website, 120);
  }
  if (req.body.status !== undefined) {
    user.status = safeString(req.body.status, 40);
  }

  if (req.body.appTheme !== undefined) {
    const theme = req.body.appTheme || {};
    const current = user.appTheme || { ...DEFAULT_APP_THEME };
    user.appTheme = {
      name: safeString(theme.name, 40) || current.name,
      bg: safeCssValue(theme.bg, current.bg),
      panel: safeCssValue(theme.panel, current.panel),
      ink: safeCssValue(theme.ink, current.ink),
      muted: safeCssValue(theme.muted, current.muted),
      accent: safeCssValue(theme.accent, current.accent),
      accentDark: safeCssValue(theme.accentDark, current.accentDark),
      bubble: safeCssValue(theme.bubble, current.bubble),
      bubbleInk: safeCssValue(theme.bubbleInk, current.bubbleInk),
      border: safeCssValue(theme.border, current.border),
    };
  }

  if (req.body.appSettings !== undefined) {
    const settings = req.body.appSettings || {};
    user.appSettings = {
      sound: settings.sound === undefined ? Boolean(user.appSettings?.sound ?? true) : Boolean(settings.sound),
    };
  }

  if (req.body.profileTheme !== undefined) {
    const theme = req.body.profileTheme || {};
    const current = user.profileTheme || { ...DEFAULT_THEME };
    user.profileTheme = {
      cardBg: safeCssValue(theme.cardBg, current.cardBg),
      textColor: safeCssValue(theme.textColor, current.textColor),
      accent: safeCssValue(theme.accent, current.accent),
      borderRadius: safeCssValue(theme.borderRadius, current.borderRadius),
      borderColor: safeCssValue(theme.borderColor, current.borderColor),
      shadow: safeCssValue(theme.shadow, current.shadow),
      align: safeAlign(theme.align, current.align),
    };
  }

  if (req.body.customThemes !== undefined) {
    const incoming = Array.isArray(req.body.customThemes) ? req.body.customThemes : [];
    const limited = incoming.slice(0, 12).map((item) =>
      sanitizeTheme(item, user.profileTheme || { ...DEFAULT_THEME })
    );
    user.customThemes = limited;
  }

  if (req.body.avatar !== undefined) {
    const avatar = String(req.body.avatar || "");
    if (avatar && !isSafeImageDataUrl(avatar)) {
      res.status(400).json({ error: "Avatar invalido" });
      return;
    }
    if (avatar.length > MAX_AVATAR_SIZE) {
      res.status(400).json({ error: "Avatar muy grande" });
      return;
    }
    user.avatar = avatar;
  }

  saveDb();
  res.json({ user: publicUser(user) });
});

app.get("/api/users/search", requireAuth, (req, res) => {
  const query = normalizeSearch(req.query.q);
  if (!query) {
    res.json({ results: [] });
    return;
  }

  const results = db.users
    .filter((user) => user.id !== req.user.id)
    .filter((user) => !isEitherBlocked(req.user.id, user.id))
    .map((user) => {
      const hay = normalizeSearch(`${user.username} ${user.displayName}`);
      return { user, hay };
    })
    .filter((item) => item.hay.includes(query))
    .slice(0, 8)
    .map((item) => {
      const user = item.user;
      const isFriendValue = isFriend(req.user.id, user.id);
      const pendingOut = db.friendRequests.some(
        (fr) => fr.fromId === req.user.id && fr.toId === user.id
      );
      const pendingIn = db.friendRequests.some(
        (fr) => fr.fromId === user.id && fr.toId === req.user.id
      );
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar || "",
        bio: user.bio || "",
        isFriend: isFriendValue,
        pendingOut,
        pendingIn,
      };
    });

  res.json({ results });
});

app.get("/api/users/:id", requireAuth, (req, res) => {
  const userId = Number(req.params.id);
  const user = getUserById(userId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  const blockedByYou = isBlocked(req.user.id, user.id);
  const blockedYou = isBlocked(user.id, req.user.id);
  const pendingOut = db.friendRequests.some(
    (fr) => fr.fromId === req.user.id && fr.toId === user.id
  );
  const pendingIn = db.friendRequests.some(
    (fr) => fr.fromId === user.id && fr.toId === req.user.id
  );
  res.json({
    user: publicUser(user),
    isFriend: isFriend(req.user.id, user.id),
    blockedByYou,
    blockedYou,
    pendingOut,
    pendingIn,
  });
});

app.get("/api/blocks", requireAuth, (req, res) => {
  const blockedIds = db.blocks.filter((b) => b.userId === req.user.id).map((b) => b.blockedId);
  const blockedUsers = blockedIds
    .map((id) => getUserById(id))
    .filter(Boolean)
    .map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar || "",
    }));
  res.json({ blocked: blockedUsers });
});

app.post("/api/blocks/:id", requireAuth, (req, res) => {
  const blockedId = Number(req.params.id);
  const target = getUserById(blockedId);
  if (!target) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  if (blockedId === req.user.id) {
    res.status(400).json({ error: "No puedes bloquearte" });
    return;
  }
    if (!isBlocked(req.user.id, blockedId)) {
      const wasFriend =
        isFriend(req.user.id, blockedId) || isFriend(blockedId, req.user.id);
      db.blocks.push({ userId: req.user.id, blockedId, createdAt: now(), wasFriend });
      removeFriendRelation(req.user.id, blockedId);
      removeRequestsBetween(req.user.id, blockedId);
      saveDb();
      emitToUsers([req.user.id, blockedId], "friends:update", {});
    }
    res.json({ ok: true });
  });

app.delete("/api/blocks/:id", requireAuth, (req, res) => {
  const blockedId = Number(req.params.id);
  const record = db.blocks.find(
    (item) => item.userId === req.user.id && item.blockedId === blockedId
  );
  db.blocks = db.blocks.filter(
    (item) => !(item.userId === req.user.id && item.blockedId === blockedId)
  );
  if (record && record.wasFriend) {
    const target = getUserById(blockedId);
    if (target) {
      if (!isFriend(req.user.id, blockedId)) {
        db.friends.push({ userId: req.user.id, friendId: blockedId, createdAt: now() });
      }
      if (!isFriend(blockedId, req.user.id)) {
        db.friends.push({ userId: blockedId, friendId: req.user.id, createdAt: now() });
      }
    }
  }
  saveDb();
  emitToUsers([req.user.id, blockedId], "friends:update", {});
  res.json({ ok: true });
});

app.get("/api/chats", requireAuth, (req, res) => {
  const chats = listChatsForUser(req.user.id);
  res.json({ chats });
});

app.get("/api/chats/:id/messages", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const isMember = db.chatMembers.some(
    (member) => member.chatId === chatId && member.userId === req.user.id
  );
  if (!isMember) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }

  cleanupExpired(chatId);

  const blockedIds = new Set(
    db.blocks.filter((b) => b.userId === req.user.id).map((b) => b.blockedId)
  );

  const rows = db.messages
    .filter((msg) => msg.chatId === chatId)
    .filter((msg) => !blockedIds.has(msg.userId) || msg.userId === req.user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .reverse()
    .map((msg) => {
      const sender = getUserById(msg.userId);
      const isDeleted = Boolean(msg.deletedAt);
      return {
        id: msg.id,
        chatId: msg.chatId,
        senderId: msg.userId,
        senderName: sender ? sender.displayName : "Usuario",
        senderAvatar: sender ? sender.avatar || "" : "",
        type: msg.type || "text",
        text: isDeleted ? "" : msg.content,
        audio: isDeleted ? null : msg.audio,
        file: isDeleted ? null : msg.file,
        reply: msg.reply || null,
        replyTo: msg.reply ? msg.reply.id : null,
        reactions: msg.reactions || {},
        poll: isDeleted ? null : msg.poll,
        event: isDeleted ? null : msg.event,
        expireAt: msg.expireAt || null,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        deletedAt: msg.deletedAt,
      };
    });

  res.json({ messages: rows });
});

app.get("/api/chats/:id/details", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }

  cleanupExpired(chatId);

  const members = db.chatMembers
    .filter((m) => m.chatId === chatId)
    .map((m) => {
      const user = getUserById(m.userId);
      return {
        id: m.userId,
        username: user ? user.username : "",
        displayName: user ? user.displayName : "Usuario",
        avatar: user ? user.avatar || "" : "",
        status: user ? user.status || "" : "",
        role: m.role,
      };
    });

  const bans = db.chatBans
    .filter((b) => b.chatId === chatId)
    .map((b) => {
      const user = getUserById(b.userId);
      return {
        id: b.userId,
        username: user ? user.username : "",
        displayName: user ? user.displayName : "Usuario",
        avatar: user ? user.avatar || "" : "",
      };
    });

  const requests = db.chatRequests
    .filter((r) => r.chatId === chatId)
    .map((r) => {
      const user = getUserById(r.userId);
      return {
        id: r.userId,
        username: user ? user.username : "",
        displayName: user ? user.displayName : "Usuario",
        avatar: user ? user.avatar || "" : "",
      };
    });

  let pinnedMessage = null;
  if (chat.pinnedMessageId) {
    const msg = db.messages.find((m) => m.id === chat.pinnedMessageId);
    if (msg) {
      pinnedMessage = {
        id: msg.id,
        type: msg.type || "text",
        text: msg.content,
        audio: msg.audio,
        file: msg.file,
        poll: msg.poll,
        event: msg.event,
        reply: msg.reply,
        reactions: msg.reactions || {},
        createdAt: msg.createdAt,
        senderId: msg.userId,
      };
    }
  }

  res.json({
    chat: {
      id: chat.id,
      type: chat.type,
      name: chat.name || "",
      description: chat.description || "",
      avatar: chat.avatar || "",
      settings: chat.settings || { ...DEFAULT_CHAT_SETTINGS },
      pinnedMessageId: chat.pinnedMessageId || null,
      pinnedBy: chat.pinnedBy || null,
      pinnedUntil: chat.pinnedUntil || null,
      tags: chat.tags || [],
      createdBy: chat.createdBy || null,
    },
    role: member.role,
    members,
    bans,
    requests,
    pinnedMessage,
  });
});

app.patch("/api/chats/:id", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  if (chat.type !== "group") {
    res.status(400).json({ error: "Solo grupos se pueden editar" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  const role = getMemberRole(chatId, req.user.id);
  if (role === "admin" && chat.settings && chat.settings.adminCanEditChat === false) {
    res.status(403).json({ error: "Solo el creador puede editar" });
    return;
  }

  if (req.body.name !== undefined) {
    const name = safeString(req.body.name, 60);
    if (!name) {
      res.status(400).json({ error: "Nombre invalido" });
      return;
    }
    chat.name = name;
  }
  if (req.body.description !== undefined) {
    chat.description = safeString(req.body.description, 160);
  }
  if (req.body.avatar !== undefined) {
    const avatar = String(req.body.avatar || "");
    if (avatar && !isSafeImageDataUrl(avatar)) {
      res.status(400).json({ error: "Avatar invalido" });
      return;
    }
    if (avatar.length > MAX_AVATAR_SIZE) {
      res.status(400).json({ error: "Avatar muy grande" });
      return;
    }
    chat.avatar = avatar;
  }
  if (req.body.settings) {
    chat.settings = {
      adminOnly: Boolean(req.body.settings.adminOnly),
      approvalRequired: Boolean(req.body.settings.approvalRequired),
      memberCanWrite:
        req.body.settings.memberCanWrite === undefined
          ? Boolean(chat.settings?.memberCanWrite ?? true)
          : Boolean(req.body.settings.memberCanWrite),
      adminCanEditChat:
        req.body.settings.adminCanEditChat === undefined
          ? Boolean(chat.settings?.adminCanEditChat ?? true)
          : Boolean(req.body.settings.adminCanEditChat),
      ephemeralDays:
        req.body.settings.ephemeralDays === undefined
          ? Number(chat.settings?.ephemeralDays || 0)
          : Number(req.body.settings.ephemeralDays || 0),
    };
    if (![0, 1, 7, 30].includes(chat.settings.ephemeralDays)) {
      chat.settings.ephemeralDays = 0;
    }
  }
  if (req.body.tags !== undefined) {
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    chat.tags = tags
      .map((tag) => safeString(tag, 18))
      .filter((tag) => tag.length >= 1);
  }

  saveDb();
  res.json({ ok: true });
});

app.patch("/api/chats/:id/settings", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }
  const isAdmin = isChatAdmin(chatId, req.user.id);
  if (chat.type === "group" && !isAdmin) {
    res.status(403).json({ error: "Solo admins pueden cambiar ajustes" });
    return;
  }
  if (chat.type === "global") {
    res.status(403).json({ error: "No permitido" });
    return;
  }

  if (!chat.settings || typeof chat.settings !== "object") {
    chat.settings = { ...DEFAULT_CHAT_SETTINGS };
  }

  if (req.body.ephemeralDays !== undefined) {
    const days = Number(req.body.ephemeralDays || 0);
    chat.settings.ephemeralDays = [0, 1, 7, 30].includes(days) ? days : 0;
  }

  if (req.body.tags !== undefined) {
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    chat.tags = tags
      .map((tag) => safeString(tag, 18))
      .filter((tag) => tag.length >= 1);
  }

  saveDb();
  res.json({ ok: true, settings: chat.settings, tags: chat.tags || [] });
});

app.post("/api/chats/:id/leave", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  if (chat.type === "global") {
    res.status(400).json({ error: "No puedes salir del global" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }
  if (chat.type === "group" && member.role === "owner") {
    res.status(400).json({ error: "Transfiere o elimina el grupo" });
    return;
  }
  db.chatMembers = db.chatMembers.filter(
    (m) => !(m.chatId === chatId && m.userId === req.user.id)
  );
  if (chat.type === "dm") {
    const remaining = db.chatMembers.filter((m) => m.chatId === chatId);
    if (remaining.length === 0) {
      db.chats = db.chats.filter((c) => c.id !== chatId);
      db.messages = db.messages.filter((m) => m.chatId !== chatId);
    }
  }
  saveDb();
  res.json({ ok: true });
});

app.delete("/api/chats/:id", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  if (chat.type !== "group") {
    res.status(400).json({ error: "Solo grupos se pueden eliminar" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member || member.role !== "owner") {
    res.status(403).json({ error: "Solo el creador puede eliminar" });
    return;
  }
  db.chats = db.chats.filter((c) => c.id !== chatId);
  db.chatMembers = db.chatMembers.filter((m) => m.chatId !== chatId);
  db.messages = db.messages.filter((m) => m.chatId !== chatId);
  db.chatBans = db.chatBans.filter((b) => b.chatId !== chatId);
  db.chatRequests = db.chatRequests.filter((r) => r.chatId !== chatId);
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/members/:userId/role", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.params.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  const owner = getChatMember(chatId, req.user.id);
  if (!owner || owner.role !== "owner") {
    res.status(403).json({ error: "Solo el creador puede cambiar roles" });
    return;
  }
  const target = getChatMember(chatId, targetId);
  if (!target) {
    res.status(404).json({ error: "Miembro no encontrado" });
    return;
  }
  if (target.role === "owner") {
    res.status(400).json({ error: "No puedes cambiar al creador" });
    return;
  }
  const nextRole = req.body.role === "admin" ? "admin" : "member";
  target.role = nextRole;
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/transfer", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.body.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  const owner = getChatMember(chatId, req.user.id);
  if (!owner || owner.role !== "owner") {
    res.status(403).json({ error: "Solo el creador puede transferir" });
    return;
  }
  const target = getChatMember(chatId, targetId);
  if (!target) {
    res.status(404).json({ error: "Miembro no encontrado" });
    return;
  }
  owner.role = "admin";
  target.role = "owner";
  chat.createdBy = targetId;
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/kick", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.body.userId);
  const ban = Boolean(req.body.ban);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  const target = getChatMember(chatId, targetId);
  if (!target) {
    res.status(404).json({ error: "Miembro no encontrado" });
    return;
  }
  if (target.role === "owner") {
    res.status(400).json({ error: "No puedes expulsar al creador" });
    return;
  }
  db.chatMembers = db.chatMembers.filter(
    (m) => !(m.chatId === chatId && m.userId === targetId)
  );
  if (ban && !db.chatBans.some((b) => b.chatId === chatId && b.userId === targetId)) {
    db.chatBans.push({ chatId, userId: targetId, createdAt: now() });
  }
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/ban", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.body.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  if (!db.chatBans.some((b) => b.chatId === chatId && b.userId === targetId)) {
    db.chatBans.push({ chatId, userId: targetId, createdAt: now() });
  }
  db.chatMembers = db.chatMembers.filter(
    (m) => !(m.chatId === chatId && m.userId === targetId)
  );
  db.chatRequests = db.chatRequests.filter(
    (r) => !(r.chatId === chatId && r.userId === targetId)
  );
  saveDb();
  res.json({ ok: true });
});

app.delete("/api/chats/:id/ban/:userId", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.params.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  db.chatBans = db.chatBans.filter(
    (b) => !(b.chatId === chatId && b.userId === targetId)
  );
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/requests/:userId/approve", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.params.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  const request = db.chatRequests.find((r) => r.chatId === chatId && r.userId === targetId);
  if (!request) {
    res.status(404).json({ error: "Solicitud no encontrada" });
    return;
  }
  if (db.chatBans.some((b) => b.chatId === chatId && b.userId === targetId)) {
    res.status(400).json({ error: "Usuario bloqueado" });
    return;
  }
  ensureMembership(chatId, targetId, "member");
  db.chatRequests = db.chatRequests.filter(
    (r) => !(r.chatId === chatId && r.userId === targetId)
  );
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/requests/:userId/reject", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const targetId = Number(req.params.userId);
  const chat = getChatById(chatId);
  if (!chat || chat.type !== "group") {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  if (!isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  db.chatRequests = db.chatRequests.filter(
    (r) => !(r.chatId === chatId && r.userId === targetId)
  );
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/pin", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const messageId = Number(req.body.messageId);
  const durationHours = Number(req.body.durationHours || 0);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }
  if (chat.type === "group" && !isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Solo admins pueden fijar" });
    return;
  }
  const message = db.messages.find((m) => m.id === messageId && m.chatId === chatId);
  if (!message) {
    res.status(404).json({ error: "Mensaje no encontrado" });
    return;
  }
  chat.pinnedMessageId = messageId;
  chat.pinnedBy = req.user.id;
  if (durationHours && durationHours > 0) {
    chat.pinnedUntil = now() + durationHours * 60 * 60 * 1000;
  } else {
    chat.pinnedUntil = null;
  }
  saveDb();
  res.json({ ok: true });
});

app.post("/api/chats/:id/unpin", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: "Chat no encontrado" });
    return;
  }
  const member = getChatMember(chatId, req.user.id);
  if (!member) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }
  if (chat.type === "group" && !isChatAdmin(chatId, req.user.id)) {
    res.status(403).json({ error: "Solo admins pueden quitar pin" });
    return;
  }
  if (chat.type !== "group" && chat.pinnedBy && chat.pinnedBy !== req.user.id) {
    res.status(403).json({ error: "Solo quien fijo puede quitarlo" });
    return;
  }
  chat.pinnedMessageId = null;
  chat.pinnedBy = null;
  chat.pinnedUntil = null;
  saveDb();
  res.json({ ok: true });
});

app.patch("/api/messages/:id", requireAuth, (req, res) => {
  const messageId = Number(req.params.id);
  const message = db.messages.find((msg) => msg.id === messageId);
  if (!message) {
    res.status(404).json({ error: "Mensaje no encontrado" });
    return;
  }
  if (message.userId !== req.user.id) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  if (message.deletedAt) {
    res.status(400).json({ error: "Mensaje eliminado" });
    return;
  }
  if (message.type !== "text") {
    res.status(400).json({ error: "Solo texto se puede editar" });
    return;
  }
  const text = safeString(req.body.text, MAX_MESSAGE_LENGTH);
  if (!text) {
    res.status(400).json({ error: "Mensaje invalido" });
    return;
  }
  message.content = text;
  message.updatedAt = now();
  saveDb();

  io.to(`chat:${message.chatId}`).emit("message:update", {
    id: message.id,
    chatId: message.chatId,
    text: message.content,
    updatedAt: message.updatedAt,
  });
  res.json({ ok: true });
});

app.delete("/api/messages/:id", requireAuth, (req, res) => {
  const messageId = Number(req.params.id);
  const message = db.messages.find((msg) => msg.id === messageId);
  if (!message) {
    res.status(404).json({ error: "Mensaje no encontrado" });
    return;
  }
  if (message.userId !== req.user.id) {
    res.status(403).json({ error: "Sin permiso" });
    return;
  }
  if (!message.deletedAt) {
    message.deletedAt = now();
    message.content = "";
    message.audio = null;
    message.file = null;
    message.poll = null;
    message.event = null;
    saveDb();
  }
  io.to(`chat:${message.chatId}`).emit("message:delete", {
    id: message.id,
    chatId: message.chatId,
    deletedAt: message.deletedAt,
  });
  res.json({ ok: true });
});

app.post("/api/groups", requireAuth, (req, res) => {
  const name = safeString(req.body.name, 50);
  const members = Array.isArray(req.body.members) ? req.body.members : [];
  if (!name || name.length < 2) {
    res.status(400).json({ error: "Nombre invalido" });
    return;
  }

  const chat = {
    id: nextId("chats"),
    type: "group",
    name,
    description: safeString(req.body.description, 160),
    avatar: "",
    settings: { ...DEFAULT_CHAT_SETTINGS },
    pinnedMessageId: null,
    tags: [],
    createdBy: req.user.id,
    createdAt: now(),
  };
  db.chats.push(chat);
  db.chatMembers.push({ chatId: chat.id, userId: req.user.id, role: "owner", createdAt: now() });

  members.forEach((raw) => {
    const username = sanitizeUsername(raw);
    if (!username) return;
    const user = getUserByUsername(username);
    if (user && !isEitherBlocked(req.user.id, user.id) && user.id !== req.user.id) {
      const exists = db.groupInvites.some(
        (invite) => invite.chatId === chat.id && invite.userId === user.id
      );
      if (!exists) {
        db.groupInvites.push({
          id: nextId("invites"),
          chatId: chat.id,
          userId: user.id,
          invitedBy: req.user.id,
          createdAt: now(),
        });
        emitToUser(user.id, "requests:update", { type: "group" });
      }
    }
  });
  saveDb();

  const memberIds = db.chatMembers
    .filter((m) => m.chatId === chat.id)
    .map((m) => m.userId);
  emitToUsers(memberIds, "chats:update", { chatId: chat.id });

  res.json({ chatId: chat.id });
});

app.post("/api/groups/:id/invite", requireAuth, (req, res) => {
  const chatId = Number(req.params.id);
  const chat = db.chats.find((item) => item.id === chatId && item.type === "group");
  if (!chat) {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }

  const isMember = db.chatMembers.some(
    (member) => member.chatId === chatId && member.userId === req.user.id
  );
  if (!isMember) {
    res.status(403).json({ error: "Sin acceso" });
    return;
  }

  const lookup = findUserByHandle(req.body.username);
  if (lookup.error) {
    res.status(400).json({ error: lookup.error });
    return;
  }
  const user = lookup.user;
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  if (isEitherBlocked(req.user.id, user.id)) {
    res.status(400).json({ error: "No permitido" });
    return;
  }
  if (db.chatBans.some((b) => b.chatId === chatId && b.userId === user.id)) {
    res.status(400).json({ error: "Usuario bloqueado" });
    return;
  }
  const alreadyMember = db.chatMembers.some(
    (member) => member.chatId === chatId && member.userId === user.id
  );
  if (alreadyMember) {
    res.json({ ok: true, requested: false, already: true });
    return;
  }

  const exists = db.groupInvites.some(
    (invite) => invite.chatId === chatId && invite.userId === user.id
  );
  if (!exists) {
    db.groupInvites.push({
      id: nextId("invites"),
      chatId,
      userId: user.id,
      invitedBy: req.user.id,
      createdAt: now(),
    });
    saveDb();
    emitToUser(user.id, "requests:update", { type: "group" });
  }
  res.json({ ok: true, requested: true, already: false });
});

app.post("/api/requests", requireAuth, (req, res) => {
  const lookup = findUserByHandle(req.body.username);
  if (lookup.error) {
    res.status(400).json({ error: lookup.error });
    return;
  }
  const user = lookup.user;
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  if (user.id === req.user.id) {
    res.status(400).json({ error: "No puedes agregarte" });
    return;
  }
  if (isFriend(req.user.id, user.id)) {
    res.status(400).json({ error: "Ya son amigos" });
    return;
  }
  if (isEitherBlocked(req.user.id, user.id)) {
    res.status(400).json({ error: "No permitido" });
    return;
  }

  const already = db.friendRequests.some(
    (reqItem) => reqItem.fromId === req.user.id && reqItem.toId === user.id
  );
  if (already) {
    res.status(400).json({ error: "Solicitud ya enviada" });
    return;
  }

  db.friendRequests.push({
    id: nextId("friendRequests"),
    fromId: req.user.id,
    toId: user.id,
    createdAt: now(),
  });
  saveDb();
  emitToUser(user.id, "requests:update", { type: "friend" });
  res.json({ ok: true });
});

app.get("/api/requests", requireAuth, (req, res) => {
  const rows = db.friendRequests
    .filter((item) => item.toId === req.user.id)
    .filter((item) => !isEitherBlocked(req.user.id, item.fromId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => {
      const from = getUserById(item.fromId);
      return {
        id: item.id,
        fromId: item.fromId,
        name: from ? from.displayName : "Usuario",
        username: from ? from.username : "",
        avatar: from ? from.avatar || "" : "",
      };
    });
  res.json({ requests: rows });
});

app.get("/api/invites", requireAuth, (req, res) => {
  const rows = db.groupInvites
    .filter((invite) => invite.userId === req.user.id)
    .map((invite) => {
      const chat = getChatById(invite.chatId);
      const from = getUserById(invite.invitedBy);
      return {
        id: invite.id,
        chatId: invite.chatId,
        chatName: chat ? chat.name : "Grupo",
        chatAvatar: chat ? chat.avatar || "" : "",
        fromId: invite.invitedBy,
        fromName: from ? from.displayName : "Usuario",
        fromUsername: from ? from.username : "",
        createdAt: invite.createdAt,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json({ invites: rows });
});

app.post("/api/invites/:id/accept", requireAuth, (req, res) => {
  const inviteId = Number(req.params.id);
  const invite = db.groupInvites.find(
    (item) => item.id === inviteId && item.userId === req.user.id
  );
  if (!invite) {
    res.status(404).json({ error: "Invitacion no encontrada" });
    return;
  }
  const chat = getChatById(invite.chatId);
  if (!chat || chat.type !== "group") {
    db.groupInvites = db.groupInvites.filter((i) => i.id !== inviteId);
    saveDb();
    res.status(404).json({ error: "Grupo no disponible" });
    return;
  }
  if (db.chatBans.some((b) => b.chatId === invite.chatId && b.userId === req.user.id)) {
    res.status(400).json({ error: "Estas bloqueado en el grupo" });
    return;
  }
  ensureMembership(invite.chatId, req.user.id, "member");
  db.groupInvites = db.groupInvites.filter((i) => i.id !== inviteId);
  saveDb();
  const memberIds = db.chatMembers
    .filter((m) => m.chatId === invite.chatId)
    .map((m) => m.userId);
  emitToUsers(memberIds, "chats:update", { chatId: invite.chatId });
  res.json({ ok: true, chatId: invite.chatId });
});

app.post("/api/invites/:id/reject", requireAuth, (req, res) => {
  const inviteId = Number(req.params.id);
  db.groupInvites = db.groupInvites.filter(
    (item) => !(item.id === inviteId && item.userId === req.user.id)
  );
  saveDb();
  res.json({ ok: true });
});

app.post("/api/requests/:id/accept", requireAuth, (req, res) => {
  const requestId = Number(req.params.id);
  const request = db.friendRequests.find(
    (item) => item.id === requestId && item.toId === req.user.id
  );
  if (!request) {
    res.status(404).json({ error: "Solicitud no encontrada" });
    return;
  }
  if (isEitherBlocked(req.user.id, request.fromId)) {
    res.status(400).json({ error: "No permitido" });
    return;
  }

  db.friendRequests = db.friendRequests.filter((item) => item.id !== requestId);
  if (!isFriend(req.user.id, request.fromId)) {
    db.friends.push({ userId: req.user.id, friendId: request.fromId, createdAt: now() });
  }
  if (!isFriend(request.fromId, req.user.id)) {
    db.friends.push({ userId: request.fromId, friendId: req.user.id, createdAt: now() });
  }
  saveDb();
  emitToUsers([req.user.id, request.fromId], "friends:update", {});
  res.json({ ok: true });
});

app.post("/api/requests/:id/reject", requireAuth, (req, res) => {
  const requestId = Number(req.params.id);
  db.friendRequests = db.friendRequests.filter(
    (item) => !(item.id === requestId && item.toId === req.user.id)
  );
  saveDb();
  res.json({ ok: true });
});

app.get("/api/friends", requireAuth, (req, res) => {
  const rows = db.friends
    .filter((item) => item.userId === req.user.id)
    .map((item) => getUserById(item.friendId))
    .filter((user) => user && !isEitherBlocked(req.user.id, user.id))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((user) => ({
      id: user.id,
      name: user.displayName,
      username: user.username,
      avatar: user.avatar || "",
      status: user.status || "",
    }));
  res.json({ friends: rows });
});

app.post("/api/dm", requireAuth, (req, res) => {
  const lookup = findUserByHandle(req.body.username);
  if (lookup.error) {
    res.status(400).json({ error: lookup.error });
    return;
  }
  const user = lookup.user;
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  if (user.id === req.user.id) {
    res.status(400).json({ error: "No puedes hablar contigo" });
    return;
  }
  if (!isFriend(req.user.id, user.id)) {
    res.status(403).json({ error: "Primero agrega como amigo" });
    return;
  }
  if (isEitherBlocked(req.user.id, user.id)) {
    res.status(403).json({ error: "No permitido" });
    return;
  }

  const chatId = ensureDmChat(req.user.id, user.id);
  emitToUsers([req.user.id, user.id], "chats:update", { chatId });
  res.json({ chatId });
});

app.delete("/api/me", requireAuth, (req, res) => {
  const userId = req.user.id;
  const user = getUserById(userId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  const friendIds = db.friends
    .filter((f) => f.userId === userId || f.friendId === userId)
    .map((f) => (f.userId === userId ? f.friendId : f.userId));

  const memberChatIds = db.chatMembers
    .filter((m) => m.userId === userId)
    .map((m) => m.chatId);

  db.sessions = db.sessions.filter((s) => s.userId !== userId);
  db.friendRequests = db.friendRequests.filter(
    (reqItem) => reqItem.fromId !== userId && reqItem.toId !== userId
  );
  db.friends = db.friends.filter((f) => f.userId !== userId && f.friendId !== userId);
  db.blocks = db.blocks.filter((b) => b.userId !== userId && b.blockedId !== userId);
  db.groupInvites = db.groupInvites.filter(
    (invite) => invite.userId !== userId && invite.invitedBy !== userId
  );
  db.chatBans = db.chatBans.filter((b) => b.userId !== userId);
  db.chatRequests = db.chatRequests.filter((r) => r.userId !== userId);

  db.messages = db.messages.filter((m) => m.userId !== userId);
  db.chatMembers = db.chatMembers.filter((m) => m.userId !== userId);

  const affectedChatIds = new Set(memberChatIds);
  affectedChatIds.forEach((chatId) => {
    const chat = getChatById(chatId);
    if (!chat) return;
    const members = db.chatMembers.filter((m) => m.chatId === chatId);

    if (chat.type === "dm") {
      if (members.length < 2) {
        db.chats = db.chats.filter((c) => c.id !== chatId);
        db.messages = db.messages.filter((m) => m.chatId !== chatId);
        db.chatBans = db.chatBans.filter((b) => b.chatId !== chatId);
        db.chatRequests = db.chatRequests.filter((r) => r.chatId !== chatId);
        return;
      }
    }

    if (chat.type === "group") {
      if (members.length === 0) {
        db.chats = db.chats.filter((c) => c.id !== chatId);
        db.messages = db.messages.filter((m) => m.chatId !== chatId);
        db.chatBans = db.chatBans.filter((b) => b.chatId !== chatId);
        db.chatRequests = db.chatRequests.filter((r) => r.chatId !== chatId);
        return;
      }
      if (chat.createdBy === userId) {
        const newOwner = members[0];
        chat.createdBy = newOwner.userId;
        members.forEach((m) => {
          if (m.userId === newOwner.userId) {
            m.role = "owner";
          }
        });
      }
    }

    if (chat.pinnedMessageId) {
      const exists = db.messages.some((m) => m.id === chat.pinnedMessageId);
      if (!exists) {
        chat.pinnedMessageId = null;
        chat.pinnedBy = null;
        chat.pinnedUntil = null;
      }
    }
  });

  db.users = db.users.filter((u) => u.id !== userId);
  saveDb();

  const notifyChats = Array.from(affectedChatIds).filter((chatId) =>
    db.chats.some((c) => c.id === chatId)
  );
  notifyChats.forEach((chatId) => {
    const ids = db.chatMembers.filter((m) => m.chatId === chatId).map((m) => m.userId);
    emitToUsers(ids, "chats:update", { chatId });
  });
  emitToUsers(friendIds, "friends:update", {});

  if (onlineUsers.has(userId)) {
    onlineUsers.delete(userId);
    io.emit("presence", { userId, status: "offline" });
  }

  res.json({ ok: true });
});

app.get(
  [
    "/",
    "/auth/login",
    "/auth/register",
    "/app",
    "/app/global",
    "/app/friends",
    "/app/requests",
    "/app/settings",
    "/app/chats/:chatId",
    "/app/profile/:userId",
  ],
  (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
);

const onlineUsers = new Map();

function addOnline(userId, socketId) {
  const set = onlineUsers.get(userId) || new Set();
  set.add(socketId);
  onlineUsers.set(userId, set);
  return set.size;
}

function removeOnline(userId, socketId) {
  const set = onlineUsers.get(userId);
  if (!set) return 0;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return 0;
  }
  return set.size;
}

function emitToUser(userId, event, payload) {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
}

function emitToUsers(userIds, event, payload) {
  const unique = Array.from(new Set(userIds));
  unique.forEach((userId) => emitToUser(userId, event, payload));
}

io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) {
    next(new Error("unauthorized"));
    return;
  }
  const session = db.sessions.find((item) => item.token === token);
  if (!session) {
    next(new Error("unauthorized"));
    return;
  }
  const user = getUserById(session.userId);
  if (!user) {
    next(new Error("unauthorized"));
    return;
  }
  socket.user = user;
  socket.token = token;
  next();
});

io.on("connection", (socket) => {
  const user = socket.user;
  const count = addOnline(user.id, socket.id);
  if (count === 1) {
    io.emit("presence", { userId: user.id, status: "online" });
  }
  socket.emit("presence:list", Array.from(onlineUsers.keys()));

  const chatIds = db.chatMembers
    .filter((member) => member.userId === user.id)
    .map((member) => member.chatId);
  chatIds.forEach((chatId) => socket.join(`chat:${chatId}`));

  socket.on("chat:join", (payload) => {
    const chatId = Number(payload && payload.chatId);
    if (!chatId) return;
    const member = getChatMember(chatId, user.id);
    if (!member) return;
    socket.join(`chat:${chatId}`);
  });

  socket.on("chat:leave", (payload) => {
    const chatId = Number(payload && payload.chatId);
    if (!chatId) return;
    socket.leave(`chat:${chatId}`);
  });

  socket.on("message:send", (payload) => {
    if (!payload) return;
    const chatId = Number(payload.chatId);
    const chat = db.chats.find((item) => item.id === chatId);
    if (!chat) return;

    const member = getChatMember(chatId, user.id);
    if (!member) return;
    const settings = chat.settings || { ...DEFAULT_CHAT_SETTINGS };
    if (chat.type === "group") {
      if (db.chatBans.some((b) => b.chatId === chatId && b.userId === user.id)) return;
      if (settings.adminOnly && !isChatAdmin(chatId, user.id)) return;
      if (!settings.memberCanWrite && member.role === "member") return;
    }

    if (chat.type === "dm") {
      const otherMember = db.chatMembers.find(
        (member) => member.chatId === chatId && member.userId !== user.id
      );
      if (otherMember && isEitherBlocked(user.id, otherMember.userId)) {
        return;
      }
    }

    cleanupExpired(chatId);

    let type = "text";
    let text = "";
    let audio = null;
    let file = null;
    let poll = null;
    let event = null;

    if (payload.type === "voice") {
      type = "voice";
      audio = String(payload.audio || "");
      if (!audio || !audio.startsWith("data:audio")) return;
      if (audio.length > MAX_AUDIO_SIZE) return;
      text = "";
    } else if (payload.type === "file") {
      type = "file";
      const incoming = payload.file || {};
      const name = safeString(incoming.name, 120);
      const data = String(incoming.data || "");
      const mime = safeString(incoming.type, 80);
      const size = Number(incoming.size) || 0;
      if (!name || !data || !data.startsWith("data:")) return;
      if (size <= 0 || size > MAX_FILE_SIZE) return;
      if (data.length > MAX_FILE_SIZE * 1.6) return;
      file = { name, type: mime || "application/octet-stream", size, data };
      text = "";
    } else if (payload.type === "poll") {
      type = "poll";
      const incoming = payload.poll || {};
      const question = safeString(incoming.question, 120);
      const options = Array.isArray(incoming.options) ? incoming.options : [];
      const sanitized = options
        .map((opt) => safeString(opt, 60))
        .filter((opt) => opt.length >= 1);
      if (!question || sanitized.length < 2) return;
      poll = {
        question,
        options: sanitized.slice(0, 6).map((text, index) => ({
          id: `${index + 1}`,
          text,
          votes: [],
        })),
      };
      text = "";
    } else if (payload.type === "event") {
      if (chat.type !== "group") return;
      type = "event";
      const incoming = payload.event || {};
      const title = safeString(incoming.title, 120);
      const date = safeString(incoming.date, 20);
      const time = safeString(incoming.time, 10);
      const note = safeString(incoming.note, 160);
      const reminderMinutes = Number(incoming.reminderMinutes || 0);
      if (!title || !date) return;
      const timestamp = Date.parse(`${date}T${time || "00:00"}`);
      event = {
        title,
        date,
        time,
        note,
        reminderMinutes: Number.isNaN(reminderMinutes) ? 0 : reminderMinutes,
        timestamp: Number.isNaN(timestamp) ? null : timestamp,
      };
      text = "";
    } else {
      text = safeString(payload.text, MAX_MESSAGE_LENGTH);
      if (!text) return;
    }

    const createdAt = now();
    const replyTo = Number(payload.replyTo || 0) || null;
    let reply = null;
    if (replyTo) {
      const base = db.messages.find((m) => m.id === replyTo && m.chatId === chatId);
      if (base) {
        const baseSender = getUserById(base.userId);
        reply = {
          id: base.id,
          senderId: base.userId,
          senderName: baseSender ? baseSender.displayName : "Usuario",
          type: base.type || "text",
          text: base.deletedAt ? "" : base.content,
          fileName: base.file ? base.file.name || "" : "",
          createdAt: base.createdAt,
          deletedAt: Boolean(base.deletedAt),
        };
      } else {
        const preview = sanitizeReplyPreview(payload.replyPreview);
        if (preview) reply = preview;
      }
    }
    const expireAt =
      settings.ephemeralDays && settings.ephemeralDays > 0
        ? createdAt + settings.ephemeralDays * 24 * 60 * 60 * 1000
        : null;
    const message = {
      id: nextId("messages"),
      chatId,
      userId: user.id,
      type,
      content: text,
      audio,
      file,
      poll,
      event,
      reply,
      reactions: {},
      expireAt,
      createdAt,
      updatedAt: null,
      deletedAt: null,
    };
    db.messages.push(message);
    saveDb();

    io.to(`chat:${chatId}`).emit("message:new", {
      id: message.id,
      chatId,
      senderId: user.id,
      senderName: user.displayName,
      senderAvatar: user.avatar || "",
      type,
      text: message.content,
      audio: message.audio,
      file: message.file,
      poll: message.poll,
      event: message.event,
      reply: message.reply,
      replyTo: message.reply ? message.reply.id : replyTo || null,
      reactions: message.reactions,
      expireAt: message.expireAt,
      createdAt,
      updatedAt: null,
      deletedAt: null,
    });
  });

  socket.on("reaction:toggle", (payload) => {
    const messageId = Number(payload && payload.messageId);
    const emoji = String(payload && payload.emoji);
    if (!messageId || !emoji) return;
    if (!["👍", "😂", "❤️", "🔥"].includes(emoji)) return;
    const message = db.messages.find((m) => m.id === messageId);
    if (!message || message.deletedAt) return;
    const member = getChatMember(message.chatId, user.id);
    if (!member) return;
    message.reactions = message.reactions || {};
    const current = new Set(message.reactions[emoji] || []);
    if (current.has(user.id)) {
      current.delete(user.id);
    } else {
      current.add(user.id);
    }
    message.reactions[emoji] = Array.from(current);
    saveDb();
    io.to(`chat:${message.chatId}`).emit("reaction:update", {
      messageId: message.id,
      chatId: message.chatId,
      reactions: message.reactions,
    });
  });

  socket.on("poll:vote", (payload) => {
    const messageId = Number(payload && payload.messageId);
    const optionId = String(payload && payload.optionId);
    if (!messageId || !optionId) return;
    const message = db.messages.find((m) => m.id === messageId);
    if (!message || message.type !== "poll" || !message.poll || message.deletedAt) return;
    const member = getChatMember(message.chatId, user.id);
    if (!member) return;

    const options = message.poll.options || [];
    const target = options.find((opt) => String(opt.id) === optionId);
    if (!target) return;
    const hadVote = (target.votes || []).includes(user.id);
    options.forEach((opt) => {
      opt.votes = (opt.votes || []).filter((id) => id !== user.id);
    });
    if (!hadVote) {
      target.votes = target.votes || [];
      target.votes.push(user.id);
    }
    saveDb();
    io.to(`chat:${message.chatId}`).emit("poll:update", {
      messageId: message.id,
      chatId: message.chatId,
      poll: message.poll,
    });
  });

  socket.on("disconnect", () => {
    const remaining = removeOnline(user.id, socket.id);
    if (remaining === 0) {
      io.emit("presence", { userId: user.id, status: "offline" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cantares running on http://localhost:${PORT}`);
});
