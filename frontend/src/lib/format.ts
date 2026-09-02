export function toEth(wei: bigint): string {
  const formatted = Number(wei) / 1e18;
  return formatted.toLocaleString(undefined, { maximumFractionDigits: 4 });
}