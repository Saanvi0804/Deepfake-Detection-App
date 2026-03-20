# 📜 Digital Notary — Blockchain File Integrity Checker

A Web3 app that lets you **register** the SHA-256 fingerprint of any file on the Polygon blockchain and later **verify** whether that exact file has been tampered with.

> ⚠️ **What this app does and doesn't do**
> This tool detects *tampering of previously registered files* by comparing SHA-256 hashes. It does **not** perform AI-based deepfake detection. If a single bit of the file changes after registration, the fingerprints will not match and a tamper warning is shown.

---

## How It Works

1. **Hash** — A SHA-256 fingerprint is computed locally in your browser (the file never leaves your machine).
2. **Register** — The fingerprint is written to a Solidity smart contract on Polygon Amoy via MetaMask. This record is permanent and immutable.
3. **Verify** — Re-upload any file to check if its current fingerprint matches the on-chain record.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS (ES2022) |
| Blockchain | Polygon Amoy Testnet |
| Smart Contract | Solidity ^0.8.20 (`SimpleRegistry.sol`) |
| Web3 Library | Ethers.js v6 |
| Wallet | MetaMask |

---

## Project Structure

```
├── index.html          — UI layout and styles
├── app.js              — Hashing, wallet connection, contract interaction
└── SimpleRegistry.sol  — Smart contract source (deployed at address below)
```

**Contract address:** `0xfE73B25ED03247990a688100B166c507b6e6459F` (Polygon Amoy Testnet)

---

## Running Locally

### Prerequisites
- [MetaMask](https://metamask.io/download/) browser extension
- Polygon Amoy Testnet added to MetaMask ([guide](https://docs.polygon.technology/tools/wallets/metamask/add-polygon-network/))
- Free test POL from the [Polygon Amoy Faucet](https://faucet.polygon.technology/)

### Setup
1. Clone or download this repository.
2. Open in VS Code with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension installed.
3. Right-click `index.html` → **Open with Live Server**.

> Note: The app must be served over HTTP/HTTPS (not `file://`) for MetaMask to inject `window.ethereum`.

---

## Demo Flow

1. **Register** — Upload any file, click *Register Forever*, confirm in MetaMask. A PolygonScan link appears on success.
2. **Verify original** — Upload the same unmodified file and click *Check Ownership*. You'll see the green VERIFIED message.
3. **Detect tampering** — Open the file in a text editor, add a space, save it. Re-upload the modified file. The fingerprint changes → red TAMPERED warning.

---

## Changelog

| Commit | Change |
|---|---|
| `fix` | Input guards on Register/Check before file is selected |
| `fix` | Module-scoped state object; filename XSS sanitization |
| `feat` | LocalStorage history — survives page refresh (last 50 entries) |
| `feat` | Hashing spinner for large files; short hash with copy button |
| `feat` | PolygonScan transaction link after registration |
| `feat` | `SimpleRegistry.sol` source added to repo |
| `fix` | MetaMask missing/rejection handled with actionable messages |
| `style` | Full dark-theme redesign; drag-and-drop; responsive layout |
| `fix` | Wrap all DOM handlers in DOMContentLoaded to prevent crash on load |
| `fix` | Convert hash to bytes32 before passing to contract |
| `fix` | Remove duplicate bytes32Hash const declaration |
| `fix` | Hardcode Amoy-compatible gas fees (25/50 gwei) as getFeeData() unsupported |

---

## Known Limitations

- **Amoy Testnet only** — `eth_maxPriorityFeePerGas` is not supported on Amoy RPC, so gas fees are hardcoded at 25/50 gwei which meets the network minimum.
- **Session history only clears manually** — use the Clear button in the UI to wipe localStorage history.

---

## Author

**Saanvi Shetty** — *Digital Notary dApp*
