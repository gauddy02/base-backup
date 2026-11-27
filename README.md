# Base Network Health Check

A dependency-free Node.js CLI that checks whether a Base RPC endpoint is reachable, reports its chain ID and latest block, and fails if the endpoint points to the wrong network.

## Supported networks

| Network | Chain ID | Default RPC |
|---|---:|---|
| Base Mainnet | `8453` | `https://mainnet.base.org` |
| Base Sepolia | `84532` | `https://sepolia.base.org` |

## Requirements

- Node.js 18 or newer
- An internet connection

## Quick start

```bash
git clone https://github.com/gauddy02/base-backup.git
cd base-backup
npm run check
```

The default network is Base Sepolia. To check Base Mainnet:

```bash
BASE_NETWORK=mainnet npm run check
```

To use a custom RPC endpoint:

```bash
BASE_NETWORK=sepolia BASE_RPC_URL=https://your-rpc.example npm run check
```

PowerShell:

```powershell
$env:BASE_NETWORK="mainnet"
npm run check
```

## Tests

Run the automated CLI tests with Node.js's built-in test runner:

```bash
npm test
```

The tests cover unsupported-network handling in both human-readable and JSON modes. They do not require a live RPC endpoint.

## Machine-readable output

Pass `--json` through npm to get a JSON report suitable for scripts and monitoring:

```bash
npm run check -- --json
```

Example (values are illustrative):

```json
{
  "status": "OK",
  "network": "Base Sepolia",
  "chainId": 84532,
  "blockNumber": 12345678,
  "latencyMs": {
    "chainId": 42,
    "blockNumber": 39
  }
}
```

The latency values are measured in milliseconds for each JSON-RPC request. A failed check returns a JSON object with `status: "FAILED"` and an error message, and exits with a non-zero status code.

## Example human-readable output

```text
Base RPC health check
Network: Base Sepolia
RPC: https://sepolia.base.org
Chain ID: 84532 (verified)
Latest block: 12345678
Latency: chain ID 42 ms, block number 39 ms
Status: OK
```

The block number and latency above are illustrative; your result will reflect the live endpoint.

## What it checks

1. Sends an `eth_chainId` JSON-RPC request.
2. Confirms the returned chain ID matches the selected Base network.
3. Requests `eth_blockNumber` to verify the endpoint is responding to blockchain queries.
4. Measures request latency and prints either human-readable or JSON output.
5. Exits with a non-zero code on failure.

## Configuration

- `BASE_NETWORK`: `sepolia` (default) or `mainnet`.
- `BASE_RPC_URL`: optional custom JSON-RPC URL. When set, the returned chain ID is still verified against `BASE_NETWORK`.

## Security notes

- This tool is read-only. It does not request a wallet, private key, seed phrase, or signing permission.
- Never put private keys or seed phrases in environment variables for this health check.
- Public RPC endpoints can have rate limits; use a provider endpoint for sustained or production workloads.

## License

MIT
