import { formatEther } from "viem";

export function toEth(wei: bigint): string {
  const eth = formatEther(wei);
  const [whole, frac = ""] = eth.split(".");
  const trimmed = frac.replace(/0+$/, "");
  const fixed = trimmed.length > 0 ? `${whole}.${trimmed.slice(0, 4)}` : whole;
  return Number(fixed).toLocaleString(undefined, { maximumFractionDigits: 4 });
}