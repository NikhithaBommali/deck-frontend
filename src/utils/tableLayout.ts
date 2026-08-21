export function getSeatPosition(
  seatIndex: number,
  mySeatIndex: number,
  total: number,
  spread: 'normal' | 'wide' = 'normal',
  verticalCenter = 50
): { x: number; y: number } {
  const adjusted = (seatIndex - mySeatIndex + total) % total;
  const angle = (adjusted / total) * 2 * Math.PI + Math.PI / 2;
  const rx = spread === 'wide' ? 48 : 42;
  const ry = spread === 'wide' ? 44 : 38;
  return {
    x: 50 + rx * Math.cos(angle),
    y: verticalCenter + ry * Math.sin(angle),
  };
}
