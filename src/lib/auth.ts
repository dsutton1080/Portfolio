// src/lib/auth.ts

const USER_KEY = "user";

export function loginUser(user: { email: string; name?: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
} 