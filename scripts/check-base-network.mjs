#!/usr/bin/env node

const NETWORKS = {
  sepolia: {
    label: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
  },
  mainnet: {
    label: "Base Mainnet",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
  },
};

const networkKey = (process.env.BASE_NETWORK || "sepolia").toLowerCase();
const network = NETWORKS[networkKey];

if (!network) {
  console.error(
    `Unsupported BASE_NETWORK "${networkKey}". Choose "sepolia" or "mainnet".`,
  );
  process.exit(1);
}

const rpcUrl = process.env.BASE_RPC_URL || network.rpcUrl;

async function rpcRequest(method) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params: [],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (payload.error) {
    throw new Error(payload.error.message || "JSON-RPC request failed");
  }

  if (payload.result === undefined) {
    throw new Error("RPC response did not include a result");
  }

  return payload.result;
}

function parseHexInteger(value, fieldName) {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) {
    throw new Error(`Invalid ${fieldName} returned by RPC: ${String(value)}`);
  }

  return Number.parseInt(value, 16);
}

async function main() {
  console.log("Base RPC health check");
  console.log(`Network: ${network.label}`);
  console.log(`RPC: ${rpcUrl}`);

  const chainIdHex = await rpcRequest("eth_chainId");
  const chainId = parseHexInteger(chainIdHex, "chain ID");

  if (chainId !== network.chainId) {
    throw new Error(
      `Wrong network: expected chain ID ${network.chainId}, received ${chainId}`,
    );
  }

  console.log(`Chain ID: ${chainId} (verified)`);

  const blockHex = await rpcRequest("eth_blockNumber");
  const blockNumber = parseHexInteger(blockHex, "block number");

  console.log(`Latest block: ${blockNumber.toLocaleString("en-US")}`);
  console.log("Status: OK");
}

main().catch((error) => {
  console.error(`Status: FAILED — ${error.message}`);
  process.exitCode = 1;
});
