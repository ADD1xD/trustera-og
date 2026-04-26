import { keccak256, getAddress, toHex, type Hex } from "viem";

/**
 * Derives a deterministic, checksummed Ethereum-style address from a World ID
 * nullifier hash. Each verified human gets a stable, app-specific 0x... address
 * tied to their World ID — without requiring MetaMask or any external wallet.
 *
 * The derivation is one-way (uses keccak256) and namespaced with a domain
 * separator so the resulting "world address" is unrelated to any actual
 * Ethereum wallet the user might own. This is an *identity* address used to
 * track the user inside the app, not a wallet that can sign transactions.
 *
 * @param nullifierHash - hex string from `idkitResponse.responses[0].nullifier`
 *                       (e.g. "0x1a2b3c..." or a uint256-as-hex)
 * @returns checksummed 0x... address (20 bytes)
 */
export function deriveWorldAddress(nullifierHash: string): `0x${string}` {
  if (!nullifierHash) {
    throw new Error("nullifierHash is required to derive a world address");
  }

  // Normalize to a hex string with 0x prefix
  const normalized: Hex = nullifierHash.startsWith("0x")
    ? (nullifierHash as Hex)
    : (`0x${nullifierHash}` as Hex);

  // Domain separator prevents the derived address from colliding with any
  // direct re-use of the nullifier elsewhere on chain.
  const domainSeparator = toHex("trustera:world-address:v1");

  // keccak256( domainSeparator || nullifierHash )
  const concat = (domainSeparator + normalized.slice(2)) as Hex;
  const digest = keccak256(concat);

  // Ethereum addresses are the last 20 bytes (40 hex chars) of a keccak hash
  const addr = (`0x${digest.slice(-40)}`) as `0x${string}`;

  // Apply EIP-55 checksum
  return getAddress(addr);
}
