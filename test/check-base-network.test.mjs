import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../scripts/check-base-network.mjs", import.meta.url));

function runCli(args = []) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      BASE_NETWORK: "unsupported-network",
      BASE_RPC_URL: "",
    },
  });
}

test("unsupported networks exit with a failure status", () => {
  const result = runCli();

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unsupported BASE_NETWORK/);
});

test("JSON mode returns a parseable failure report for unsupported networks", () => {
  const result = runCli(["--json"]);

  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, "FAILED");
  assert.equal(report.network, "unsupported-network");
  assert.match(report.error, /Choose "sepolia" or "mainnet"/);
});
