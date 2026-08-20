export function getSeatPosition(
  seatIndex: number,
  mySeatIndex: number,
  total: number
): { x: number; y: number } {
  const adjusted = (seatIndex - mySeatIndex + total) % total;
  const angle = (adjusted / total) * 2 * Math.PI + Math.PI / 2;
  const rx = 42;
  const ry = 38;
  return {
    x: 50 + rx * Math.cos(angle),
    y: 50 + ry * Math.sin(angle),
  };
}
