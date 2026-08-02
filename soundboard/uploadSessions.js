const sessions = new Map();
const TTL_MS = 10 * 60 * 1000;

export function createUploadSession(token, data) {
  const timeout = setTimeout(() => sessions.delete(token), TTL_MS);
  sessions.set(token, { ...data, timeout });
}

export function consumeUploadSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  clearTimeout(session.timeout);
  sessions.delete(token);
  return session;
}
