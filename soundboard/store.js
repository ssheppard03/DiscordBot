import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(moduleDir, '..', 'data', 'soundboard');
const filesDir = path.join(dataDir, 'files');
const soundsPath = path.join(dataDir, 'sounds.json');

fs.mkdirSync(filesDir, { recursive: true });

function load() {
  try {
    return JSON.parse(fs.readFileSync(soundsPath, 'utf8'));
  } catch {
    return { sounds: [] };
  }
}

function save(data) {
  fs.writeFileSync(soundsPath, JSON.stringify(data, null, 2));
}

export function listSounds() {
  return load().sounds;
}

export function getSound(id) {
  return load().sounds.find(s => s.id === id) ?? null;
}

export function getSoundFilePath(filename) {
  return path.join(filesDir, filename);
}

export function generateId() {
  const sounds = load().sounds;
  let id;
  do {
    id = randomUUID().replace(/-/g, '').slice(0, 12);
  } while (sounds.some(s => s.id === id));
  return id;
}

export function addSound({ id, name, emoji, filename, addedBy }) {
  const data = load();
  const entry = { id, name, emoji, filename, addedBy, addedAt: new Date().toISOString() };
  data.sounds.push(entry);
  save(data);
  return entry;
}
