const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'stock.json');

function ensureFile() {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], products: [], customers: [], orders: [] }, null, 2));
  }
}

function readDb() {
  ensureFile();
  const raw = fs.readFileSync(dbPath, 'utf8');
  const parsed = JSON.parse(raw || '{}');
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    products: Array.isArray(parsed.products) ? parsed.products : [],
    customers: Array.isArray(parsed.customers) ? parsed.customers : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : []
  };
}

function writeDb(data) {
  ensureFile();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function matchQuery(item, query = {}) {
  return Object.keys(query).every((key) => {
    const expected = query[key];
    if (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) {
      return Object.keys(expected).every((nestedKey) => item[key]?.[nestedKey] === expected[nestedKey]);
    }
    return item[key] === expected;
  });
}

function decorateList(items) {
  const arr = Array.isArray(items) ? [...items] : [];

  arr.sort = function (field) {
    const key = typeof field === 'string' ? field : '';
    if (!key) return this;
    return this.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')));
  };

  arr.select = function (fields = '') {
    const include = fields && fields !== '-__v';
    if (!include) return this.map((item) => ({ ...item }));
    const parsed = fields
      .split(' ')
      .filter(Boolean)
      .filter((field) => !field.startsWith('-'));

    return this.map((item) => {
      const output = {};
      parsed.forEach((field) => {
        if (item[field] !== undefined) output[field] = item[field];
      });
      return output;
    });
  };

  return arr;
}

function decorateEntity(item) {
  if (!item || typeof item !== 'object') return item;

  const clone = { ...item };
  clone.select = function (fields = '') {
    const include = fields && fields !== '-__v';
    if (!include) return { ...clone };
    const parsed = fields
      .split(' ')
      .filter(Boolean)
      .filter((field) => !field.startsWith('-'));

    const output = {};
    parsed.forEach((field) => {
      if (clone[field] !== undefined) output[field] = clone[field];
    });
    return output;
  };

  return clone;
}

async function initDb() {
  ensureFile();
  return readDb();
}

async function list(collectionName, query = {}) {
  const state = readDb();
  const items = (state[collectionName] || []).filter((item) => matchQuery(item, query));
  return decorateList(items);
}

async function findOne(collectionName, query = {}) {
  const state = readDb();
  const item = (state[collectionName] || []).find((entry) => matchQuery(entry, query));
  return item ? decorateEntity(item) : null;
}

async function findById(collectionName, id) {
  const state = readDb();
  const item = (state[collectionName] || []).find((entry) => String(entry._id) === String(id));
  return item ? decorateEntity(item) : null;
}

async function create(collectionName, payload = {}) {
  const state = readDb();
  const item = { ...payload, _id: payload._id || createId() };
  state[collectionName] = [...(state[collectionName] || []), item];
  writeDb(state);
  return decorateEntity(item);
}

async function update(collectionName, id, payload = {}) {
  const state = readDb();
  const index = (state[collectionName] || []).findIndex((entry) => String(entry._id) === String(id));
  if (index === -1) return null;

  const existing = state[collectionName][index];
  const updated = { ...existing, ...payload, _id: existing._id };
  state[collectionName][index] = updated;
  writeDb(state);
  return decorateEntity(updated);
}

async function remove(collectionName, id) {
  const state = readDb();
  const existing = (state[collectionName] || []).find((entry) => String(entry._id) === String(id));
  if (!existing) return null;

  state[collectionName] = (state[collectionName] || []).filter((entry) => String(entry._id) !== String(id));
  writeDb(state);
  return decorateEntity(existing);
}

async function clearCollection(collectionName) {
  const state = readDb();
  state[collectionName] = [];
  writeDb(state);
}

async function deleteMany(collectionName, query = {}) {
  const state = readDb();
  const remaining = (state[collectionName] || []).filter((entry) => !matchQuery(entry, query));
  state[collectionName] = remaining;
  writeDb(state);
  return remaining.length;
}

module.exports = {
  initDb,
  list,
  findOne,
  findById,
  create,
  update,
  remove,
  clearCollection,
  deleteMany,
  createId,
  readDb,
  writeDb
};
