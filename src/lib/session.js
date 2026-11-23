const SESSION_KEY = "bess.session_id";
const AI_CALLS_KEY = "bess.ai_calls";

export function getSessionId() {
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getAiCalls() {
  const parsed = Number(window.sessionStorage.getItem(AI_CALLS_KEY));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveAiCalls(count) {
  window.sessionStorage.setItem(AI_CALLS_KEY, String(count));
}