interface DemoHintBarProps {
  hint: string;
}

export function DemoHintBar({ hint }: DemoHintBarProps) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-lg mx-auto px-4 py-3 rounded-xl bg-gold-500/95 text-felt-900 text-sm font-semibold text-center shadow-lg border border-gold-300/50">
        <span className="mr-1.5" aria-hidden>
          🎓
        </span>
        Demo: {hint}
      </div>
    </div>
  );
}
