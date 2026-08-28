import { networkInterfaces } from "node:os";

/**
 * Utility functions for network address discovery.
 */

/**
 * Compares two IPv4 addresses by their numeric octets.
 *
 * @param left - The first IPv4 address.
 * @param right - The second IPv4 address.
 * @returns A negative value when `left` is smaller, a positive value when `right` is smaller, or `0` when they are equal.
 */
function compareIpv4Addresses(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);

  for (let index = 0; index < 4; index += 1) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) return difference;
  }

  return 0;
}

/**
 * Returns the local IPv4 addresses that Vite classifies as network addresses.
 *
 * Loopback addresses containing `127.0.0.1` are excluded. Returned addresses are
 * sorted by their numeric IPv4 value in ascending order.
 *
 * @category Network
 * @returns Sorted local IPv4 network addresses.
 *
 * @example
 * import { getNetworkAddresses } from "nsuite";
 *
 * const addresses = getNetworkAddresses();
 */
export function getNetworkAddresses(): string[] {
  const addresses = Object.values(networkInterfaces())
    .flatMap((networkInterface) => networkInterface ?? [])
    .filter(
      (detail) =>
        detail.address &&
        detail.family === "IPv4" &&
        !detail.address.includes("127.0.0.1"),
    )
    .map((detail) => detail.address);

  return addresses.sort(compareIpv4Addresses);
}
