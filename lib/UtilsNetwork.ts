import { isIP } from "node:net";
import { networkInterfaces } from "node:os";

/**
 * Utility functions for network address discovery.
 */

/**
 * Local-area private IPv4 ranges (RFC1918 and loopback), inclusive [start, end]
 * expressed as 32-bit integers.
 */
const PRIVATE_IPV4_RANGES: [number, number][] = [
  [0x0a000000, 0x0affffff], // 10.0.0.0/8
  [0xac100000, 0xac1fffff], // 172.16.0.0/12
  [0xc0a80000, 0xc0a8ffff], // 192.168.0.0/16
  [0x7f000000, 0x7fffffff], // 127.0.0.0/8
];

const LOOPBACK_HOSTNAMES = ["localhost", "localhost.localdomain"];

function ipv4ToInt(ip: string): number {
  return (
    ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
  );
}

function isLanIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (/^f[cd]/.test(lower)) return true; // fc00::/7 (ULA)
  if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 (link-local)
  return false;
}

/**
 * Returns whether the given hostname or IP address is a local-area network address.
 *
 * Only IP literals and the well-known localhost hostnames are handled; arbitrary
 * hostnames are not resolved via DNS. IPv4 covers the RFC1918 private ranges
 * (`10/8`, `172.16/12`, `192.168/16`) and loopback (`127/8`). IPv6 covers the
 * loopback (`::1`), ULA (`fc00::/7`) and link-local (`fe80::/10`) ranges.
 *
 * @category Network
 * @param hostOrIp - The hostname or IP address to inspect.
 * @returns `true` when the input is a local-area address, otherwise `false`.
 *
 * @example
 * import { isLanAddress } from "nsuite";
 *
 * isLanAddress("192.168.1.10"); // true
 * isLanAddress("8.8.8.8"); // false
 */
export function isLanAddress(hostOrIp: string): boolean {
  const value = hostOrIp.trim().toLowerCase();
  if (LOOPBACK_HOSTNAMES.includes(value)) return true;
  if (isIP(value) === 4) {
    const numeric = ipv4ToInt(value);
    return PRIVATE_IPV4_RANGES.some(
      ([start, end]) => numeric >= start && numeric <= end,
    );
  }
  if (isIP(value) === 6) return isLanIpv6(value);
  return false;
}

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
