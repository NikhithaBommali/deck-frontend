const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface UserProfile {
  username: string;
  displayName: string;
  profilePicture: string;
}

export async function fetchProfile(username: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile/${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function saveProfile(
  username: string,
  displayName: string,
  profilePicture?: string
): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, profilePicture }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PROFILE_STORAGE_KEY = 'deck-score-profile';

export function loadStoredProfile(): { name: string; picture: string } {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { name: '', picture: '' };
    return JSON.parse(raw);
  } catch {
    return { name: '', picture: '' };
  }
}

export function storeProfile(name: string, picture: string): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ name, picture }));
}
