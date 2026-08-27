import assert from "node:assert/strict";
import test from "node:test";

import { getNetworkAddresses } from "#lib/index";

function compareIpv4Addresses(left: string, right: string): number {
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);

  for (let index = 0; index < 4; index += 1) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) return difference;
  }

  return 0;
}

test("should return sorted non-loopback IPv4 network addresses", () => {
  const addresses = getNetworkAddresses();

  for (const address of addresses) {
    assert.match(address, /^\d{1,3}(\.\d{1,3}){3}$/);
    assert.equal(address.includes("127.0.0.1"), false);
  }

  assert.deepEqual(addresses, [...addresses].sort(compareIpv4Addresses));
});
