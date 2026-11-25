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

## Example output

```text
Base RPC health check
Network: Base Sepolia
RPC: https://sepolia.base.org
Chain ID: 84532 (verified)
Latest block: 12345678
Status: OK
```

The block number above is illustrative; your result will reflect the live endpoint.

## What it checks

1. Sends an `eth_chainId` JSON-RPC request.
2. Confirms the returned chain ID matches the selected Base network.
3. Requests `eth_blockNumber` to verify the endpoint is responding to blockchain queries.
4. Prints a concise status report and exits with a non-zero code on failure.

## Configuration

- `BASE_NETWORK`: `sepolia` (default) or `mainnet`.
- `BASE_RPC_URL`: optional custom JSON-RPC URL. When set, the returned chain ID is still verified against `BASE_NETWORK`.

## Security notes

- This tool is read-only. It does not request a wallet, private key, seed phrase, or signing permission.
- Never put private keys or seed phrases in environment variables for this health check.
- Public RPC endpoints can have rate limits; use a provider endpoint for sustained or production workloads.

## License

MIT
