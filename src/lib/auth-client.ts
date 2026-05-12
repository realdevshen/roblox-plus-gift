export const TOKEN_KEY = "auth_token";
export const DEVICE_KEY = "device_id";
export const ADMIN_KEY = "admin_password";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminPassword(p: string) {
  sessionStorage.setItem(ADMIN_KEY, p);
}

export function clearAdminPassword() {
  sessionStorage.removeItem(ADMIN_KEY);
}
