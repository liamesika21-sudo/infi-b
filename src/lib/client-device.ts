"use client";

const DEVICE_ID_STORAGE_KEY = "infi_device_id";
const SESSION_ID_STORAGE_KEY = "infi_session_id";

let fallbackDeviceId = "";
let fallbackSessionId = "";

function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateDeviceId(): string {
  try {
    const existingDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existingDeviceId) return existingDeviceId;

    const deviceId = createClientId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    return deviceId;
  } catch {
    fallbackDeviceId ||= createClientId();
    return fallbackDeviceId;
  }
}

export function getOrCreateSessionId(): string {
  try {
    const existingSessionId = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existingSessionId) return existingSessionId;

    const sessionId = createClientId();
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    fallbackSessionId ||= createClientId();
    return fallbackSessionId;
  }
}
