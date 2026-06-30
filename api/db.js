const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'user_profiles.json');

function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
}

function readProfiles() {
  initDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}

function writeProfiles(data) {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const db = {
  userProfiles: {
    findUnique: async ({ where: { id, email } }) => {
      const profiles = readProfiles();
      if (id) return profiles[id] || null;
      if (email) {
        return Object.values(profiles).find(p => p.email === email) || null;
      }
      return null;
    },
    upsert: async ({ where: { id }, update, create }) => {
      const profiles = readProfiles();
      const existing = profiles[id] || {};
      const merged = {
        ...create,
        ...existing,
        ...update,
        updated_at: new Date().toISOString()
      };
      profiles[id] = merged;
      writeProfiles(profiles);
      return merged;
    },
    update: async ({ where: { id }, data }) => {
      const profiles = readProfiles();
      if (!profiles[id]) throw new Error(`Profile not found: ${id}`);
      profiles[id] = {
        ...profiles[id],
        ...data,
        updated_at: new Date().toISOString()
      };
      writeProfiles(profiles);
      return profiles[id];
    }
  }
};

module.exports = db;
