import assert from "node:assert/strict";
import test from "node:test";

import { getNetworkAddresses, isLanAddress } from "#lib/index";

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

test("isLanAddress should treat LAN addresses and lowercase localhost as true", () => {
  const lanAddresses = [
    "10.0.0.1",
    "10.255.255.255",
    "172.16.0.0",
    "172.31.255.255",
    "192.168.1.1",
    "127.0.0.1",
    "127.0.0.9",
    "localhost",
    "localhost.localdomain",
    "::1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "fea0::1",
    "FE80::1",
  ];

  for (const address of lanAddresses) {
    assert.equal(
      isLanAddress(address),
      true,
      `expected ${address} to be a LAN address`,
    );
  }
});

test("isLanAddress should treat public IPs, non-LAN hostnames and garbage as false", () => {
  const nonLanAddresses = [
    "8.8.8.8",
    "11.0.0.1",
    "172.32.0.1",
    "192.169.0.1",
    "128.0.0.1",
    "1.2.3.4",
    "fec0::1",
    "fed0::1",
    "feff::1",
    "example.com",
    "not-an-ip",
    "",
  ];

  for (const address of nonLanAddresses) {
    assert.equal(
      isLanAddress(address),
      false,
      `expected ${address} not to be a LAN address`,
    );
  }
});
