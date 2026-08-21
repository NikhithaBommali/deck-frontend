interface DemoHintBarProps {
  hint: string;
}

export function DemoHintBar({ hint }: DemoHintBarProps) {
  return (
    <div
      key={hint}
      className="flex-shrink-0 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-gold-500/20 via-gold-400/15 to-gold-500/20 border-b border-gold-500/35 demo-hint-enter"
      role="status"
      aria-live="polite"
    >
      <p className="max-w-3xl mx-auto text-center text-xs sm:text-sm leading-snug">
        <span className="demo-hint-icon mr-1.5 inline-block" aria-hidden>
          🎓
        </span>
        <span className="text-gold-300 font-bold">Demo</span>
        <span className="text-white/50 mx-1.5">·</span>
        <span className="text-gold-100/95 font-medium">{hint}</span>
      </p>
    </div>
  );
}
