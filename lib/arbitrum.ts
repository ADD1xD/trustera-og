import { createPublicClient, http, Chain } from "viem";

// WorldChain Mainnet Configuration
export const worldchain: Chain = {
  id: 480,
  name: "WorldChain",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
    public: {
      http: ["https://worldchain-mainnet.g.alchemy.com/public"],
    },
  },
  blockExplorers: {
    default: {
      name: "WorldChain Explorer",
      url: "https://worldchain-mainnet.explorer.alchemy.com",
    },
  },
};

// Keep legacy export name so existing imports don't break
export const arbitrumSepolia = worldchain;

// Public client for reading chain data
export const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(),
});

// Platform wallet address (custodial - receives creation fees)
export const PLATFORM_WALLET_ADDRESS = process.env
  .NEXT_PUBLIC_PLATFORM_WALLET as `0x${string}`;

// Creation fee in ETH - minimal for testing
export const CREATION_FEE = "0.0001";
export const CREATION_FEE_WEI = BigInt("100000000000000"); // 0.0001 ETH in wei

// Utility to verify transaction on WorldChain
export async function verifyTransaction(txHash: `0x${string}`): Promise<{
  success: boolean;
  from?: string;
  to?: string;
  value?: bigint;
  error?: string;
}> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const tx = await publicClient.getTransaction({ hash: txHash });

    if (receipt.status !== "success") {
      return { success: false, error: "Transaction failed" };
    }

    return {
      success: true,
      from: tx.from,
      to: tx.to || undefined,
      value: tx.value,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Explorer base URL
const EXPLORER_URL = "https://worldchain-mainnet.explorer.alchemy.com";

// Get explorer URL for transaction
export function getExplorerTxUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

// Get explorer URL for address
export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}
