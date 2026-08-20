import { useRef } from 'react';

interface ResizeHandleProps {
  direction: 'column' | 'row';
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({
  direction,
  onResize,
  className = '',
}: ResizeHandleProps) {
  const lastPos = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    lastPos.current = direction === 'column' ? e.clientX : e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor =
      direction === 'column' ? 'col-resize' : 'row-resize';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    const pos = direction === 'column' ? e.clientX : e.clientY;
    const delta = pos - lastPos.current;
    if (delta !== 0) {
      onResize(delta);
      lastPos.current = pos;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  return (
    <div
      role="separator"
      aria-orientation={direction === 'column' ? 'vertical' : 'horizontal'}
      aria-label={direction === 'column' ? 'Resize column' : 'Resize row'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`
        absolute z-20 touch-none
        ${direction === 'column'
          ? 'right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-gold-500/30 active:bg-gold-500/50'
          : 'left-0 right-0 bottom-0 h-2 cursor-row-resize hover:bg-gold-500/30 active:bg-gold-500/50'
        }
        ${className}
      `}
    />
  );
}
