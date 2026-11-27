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

const jsonOutput = process.argv.includes("--json");
const networkKey = (process.env.BASE_NETWORK || "sepolia").toLowerCase();
const network = NETWORKS[networkKey];

function fail(message, details = {}) {
  if (jsonOutput) {
    console.log(JSON.stringify({ status: "FAILED", network: networkKey, error: message, ...details }));
  } else {
    console.error(`Status: FAILED — ${message}`);
  }
  process.exitCode = 1;
}

if (!network) {
  fail(`Unsupported BASE_NETWORK "${networkKey}". Choose "sepolia" or "mainnet".`);
} else {
  const rpcUrl = process.env.BASE_RPC_URL || network.rpcUrl;

  async function rpcRequest(method) {
    const startedAt = performance.now();
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

    return {
      result: payload.result,
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }

  function parseHexInteger(value, fieldName) {
    if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) {
      throw new Error(`Invalid ${fieldName} returned by RPC: ${String(value)}`);
    }

    const parsed = Number.parseInt(value, 16);
    if (!Number.isSafeInteger(parsed)) {
      throw new Error(`${fieldName} exceeds JavaScript's safe integer range`);
    }
    return parsed;
  }

  async function main() {
    const chainResponse = await rpcRequest("eth_chainId");
    const chainId = parseHexInteger(chainResponse.result, "chain ID");

    if (chainId !== network.chainId) {
      throw new Error(`Wrong network: expected chain ID ${network.chainId}, received ${chainId}`);
    }

    const blockResponse = await rpcRequest("eth_blockNumber");
    const blockNumber = parseHexInteger(blockResponse.result, "block number");

    const report = {
      status: "OK",
      network: network.label,
      chainId,
      blockNumber,
      latencyMs: {
        chainId: chainResponse.latencyMs,
        blockNumber: blockResponse.latencyMs,
      },
    };

    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log("Base RPC health check");
    console.log(`Network: ${report.network}`);
    console.log(`RPC: ${rpcUrl}`);
    console.log(`Chain ID: ${chainId} (verified)`);
    console.log(`Latest block: ${blockNumber.toLocaleString("en-US")}`);
    console.log(`Latency: chain ID ${chainResponse.latencyMs} ms, block number ${blockResponse.latencyMs} ms`);
    console.log("Status: OK");
  }

  main().catch((error) => fail(error.message));
}
