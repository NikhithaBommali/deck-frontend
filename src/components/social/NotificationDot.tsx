export function notifySocialVibrate() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([80, 40, 80]);
  }
}

export function NotificationDot({ className = '' }: { className?: string }) {
  return (
    <span
      className={`absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-felt-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse ${className}`}
      aria-hidden
    />
  );
}
