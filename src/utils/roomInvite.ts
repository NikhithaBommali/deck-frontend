const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(normalizeRoomCode(code));
}

export function getAppBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildRoomInviteUrl(roomCode: string): string {
  const code = normalizeRoomCode(roomCode);
  const base = getAppBaseUrl();
  return `${base}/?code=${code}`;
}

export function buildRoomInviteMessage(
  roomCode: string,
  hostName?: string
): string {
  const code = normalizeRoomCode(roomCode);
  const url = buildRoomInviteUrl(code);
  const hostLine = hostName?.trim()
    ? `${hostName.trim()} invited you to play Deck Score!`
    : 'Join my Deck Score game!';

  return `🃏 ${hostLine}

Room Code: ${code}

Tap here to join:
${url}`;
}

export function getInviteCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('code') || params.get('join');
  if (fromQuery) {
    const code = normalizeRoomCode(fromQuery);
    return isValidRoomCode(code) ? code : null;
  }

  const pathMatch = window.location.pathname.match(/\/join\/([A-Za-z0-9]{6})/);
  if (pathMatch) {
    const code = normalizeRoomCode(pathMatch[1]);
    return isValidRoomCode(code) ? code : null;
  }

  return null;
}

export function clearInviteFromUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('join');

  if (/\/join\/[A-Za-z0-9]{6}/i.test(url.pathname)) {
    url.pathname = '/';
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', next || '/');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function copyRoomCode(roomCode: string): Promise<boolean> {
  return copyText(normalizeRoomCode(roomCode));
}

export async function copyRoomInviteLink(roomCode: string): Promise<boolean> {
  return copyText(buildRoomInviteUrl(roomCode));
}

export async function copyRoomInviteMessage(
  roomCode: string,
  hostName?: string
): Promise<boolean> {
  return copyText(buildRoomInviteMessage(roomCode, hostName));
}

export type ShareInviteResult =
  | { success: true; method: 'share' | 'copy' }
  | { success: false; method: 'cancelled' | 'failed' };

export async function shareRoomInvite(
  roomCode: string,
  hostName?: string
): Promise<ShareInviteResult> {
  const message = buildRoomInviteMessage(roomCode, hostName);
  const url = buildRoomInviteUrl(roomCode);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join Deck Score',
        text: message,
        url,
      });
      return { success: true, method: 'share' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }

  const copied = await copyText(message);
  return copied
    ? { success: true, method: 'copy' }
    : { success: false, method: 'failed' };
}
