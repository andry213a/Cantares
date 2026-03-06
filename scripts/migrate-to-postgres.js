const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = process.env.JSON_PATH || path.join(DATA_DIR, "..", "cantares.json");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

if (!fs.existsSync(DB_PATH)) {
  console.error("No se encontro cantares.json en:", DB_PATH);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counters (kind TEXT PRIMARY KEY, value INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      avatar TEXT NOT NULL,
      bio TEXT NOT NULL,
      info TEXT NOT NULL,
      location TEXT NOT NULL,
      website TEXT NOT NULL,
      status TEXT NOT NULL,
      profile_theme JSONB NOT NULL,
      custom_themes JSONB NOT NULL,
      app_theme JSONB NOT NULL,
      app_settings JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT,
      description TEXT NOT NULL,
      avatar TEXT NOT NULL,
      settings JSONB NOT NULL,
      pinned_message_id INTEGER,
      pinned_by INTEGER,
      pinned_until BIGINT,
      tags JSONB NOT NULL,
      created_by INTEGER,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_members (
      chat_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      chat_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      audio TEXT,
      file JSONB,
      poll JSONB,
      event JSONB,
      reply JSONB,
      reactions JSONB NOT NULL,
      expire_at BIGINT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT,
      deleted_at BIGINT
    );
    CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY,
      from_id INTEGER NOT NULL,
      to_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS group_invites (
      id INTEGER PRIMARY KEY,
      chat_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      invited_by INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS blocks (
      user_id INTEGER NOT NULL,
      blocked_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL,
      was_friend BOOLEAN NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_bans (
      chat_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_requests (
      chat_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at BIGINT NOT NULL
    );
  `);
}

async function migrate() {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "TRUNCATE counters, users, sessions, chats, chat_members, messages, friend_requests, group_invites, friends, blocks, chat_bans, chat_requests"
    );

    for (const [kind, value] of Object.entries(db.counters || {})) {
      await client.query("INSERT INTO counters (kind, value) VALUES ($1,$2)", [kind, value]);
    }

    for (const user of db.users || []) {
      await client.query(
        `INSERT INTO users (id, username, display_name, password_hash, created_at, avatar, bio, info, location, website, status, profile_theme, custom_themes, app_theme, app_settings)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          user.id,
          user.username,
          user.displayName,
          user.passwordHash,
          user.createdAt,
          user.avatar || "",
          user.bio || "",
          user.info || "",
          user.location || "",
          user.website || "",
          user.status || "",
          user.profileTheme || {},
          user.customThemes || [],
          user.appTheme || {},
          user.appSettings || {},
        ]
      );
    }

    for (const session of db.sessions || []) {
      await client.query(
        "INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)",
        [session.token, session.userId, session.createdAt]
      );
    }

    for (const chat of db.chats || []) {
      await client.query(
        `INSERT INTO chats (id, type, name, description, avatar, settings, pinned_message_id, pinned_by, pinned_until, tags, created_by, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          chat.id,
          chat.type,
          chat.name,
          chat.description || "",
          chat.avatar || "",
          chat.settings || {},
          chat.pinnedMessageId ?? null,
          chat.pinnedBy ?? null,
          chat.pinnedUntil ?? null,
          chat.tags || [],
          chat.createdBy ?? null,
          chat.createdAt,
        ]
      );
    }

    for (const member of db.chatMembers || []) {
      await client.query(
        "INSERT INTO chat_members (chat_id, user_id, role, created_at) VALUES ($1,$2,$3,$4)",
        [member.chatId, member.userId, member.role, member.createdAt]
      );
    }

    for (const message of db.messages || []) {
      await client.query(
        `INSERT INTO messages (id, chat_id, user_id, type, content, audio, file, poll, event, reply, reactions, expire_at, created_at, updated_at, deleted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          message.id,
          message.chatId,
          message.userId,
          message.type || "text",
          message.content || "",
          message.audio || null,
          message.file || null,
          message.poll || null,
          message.event || null,
          message.reply || null,
          message.reactions || {},
          message.expireAt ?? null,
          message.createdAt,
          message.updatedAt ?? null,
          message.deletedAt ?? null,
        ]
      );
    }

    for (const reqItem of db.friendRequests || []) {
      await client.query(
        "INSERT INTO friend_requests (id, from_id, to_id, created_at) VALUES ($1,$2,$3,$4)",
        [reqItem.id, reqItem.fromId, reqItem.toId, reqItem.createdAt]
      );
    }

    for (const invite of db.groupInvites || []) {
      await client.query(
        "INSERT INTO group_invites (id, chat_id, user_id, invited_by, created_at) VALUES ($1,$2,$3,$4,$5)",
        [invite.id, invite.chatId, invite.userId, invite.invitedBy, invite.createdAt]
      );
    }

    for (const friend of db.friends || []) {
      await client.query(
        "INSERT INTO friends (user_id, friend_id, created_at) VALUES ($1,$2,$3)",
        [friend.userId, friend.friendId, friend.createdAt]
      );
    }

    for (const block of db.blocks || []) {
      await client.query(
        "INSERT INTO blocks (user_id, blocked_id, created_at, was_friend) VALUES ($1,$2,$3,$4)",
        [block.userId, block.blockedId, block.createdAt, Boolean(block.wasFriend)]
      );
    }

    for (const ban of db.chatBans || []) {
      await client.query(
        "INSERT INTO chat_bans (chat_id, user_id, created_at) VALUES ($1,$2,$3)",
        [ban.chatId, ban.userId, ban.createdAt]
      );
    }

    for (const req of db.chatRequests || []) {
      await client.query(
        "INSERT INTO chat_requests (chat_id, user_id, created_at) VALUES ($1,$2,$3)",
        [req.chatId, req.userId, req.createdAt]
      );
    }

    await client.query("COMMIT");
    console.log("Migracion completada.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en migracion:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
