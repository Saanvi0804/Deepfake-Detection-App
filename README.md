# 🛡️ Digital Notary: Blockchain-Based Deepfake Detection

A professional Web3 application designed to combat digital misinformation and unauthorized file tampering using the **Polygon Amoy** blockchain network. This tool allows users to notarize digital assets and verify their authenticity in real-time.

---

## 🚀 How it Works
1. **Cryptographic Hashing**: The app generates a unique **SHA-256 fingerprint** for any uploaded file.
2. **Blockchain Notarization**: The fingerprint is stored on the Polygon blockchain via a smart contract. This record is immutable and permanent.
3. **Deepfake Detection**: When a file is re-uploaded, the app compares its current fingerprint against the blockchain registry.
4. **Tamper Alert**: If a single character or pixel has been changed, the fingerprints will not match, and the system triggers a **Red Tamper Warning**.

---

## 🛠️ Tech Stack
* **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
* **Blockchain**: Polygon Amoy Testnet
* **Smart Contract**: Solidity (SimpleRegistry.sol)
* **Library**: Ethers.js (v6)
* **Wallet**: MetaMask

---

## 📂 Project Structure
* `index.html`: The user interface and layout.
* `app.js`: Contains hashing logic, MetaMask connection, and blockchain interaction.
* `SimpleRegistry.sol`: The smart contract logic deployed at `0xfE73B25ED03247990a688100B166c507b6e6459F`.

---

## ⚙️ How to Run This Project Locally

### 1. Prerequisites
* Install the **MetaMask** browser extension.
* Add the **Polygon Amoy Testnet** to your MetaMask networks.
* Obtain free test tokens (POL) from a **Polygon Amoy Faucet**.

### 2. Setup & Launch
1. Clone this repository or download the files.
2. Open the project folder in **VS Code**.
3. Install the **Live Server** extension in VS Code.
4. Right-click `index.html` and select **"Open with Live Server"**.

### 3. Usage Instructions
1. **Connect**: Click **"Connect MetaMask"** to link your wallet.
2. **Select File**: Choose the document you wish to protect.
3. **Register**: Click **"Register Forever"** to save the hash to the blockchain.
4. **Verify**: Click **"Check Ownership"** or use the **"Verify Now"** button in your history list to confirm authenticity.

---

## 🎓 Presentation Demo Flow
1. **Registration**: Upload a file and show it successfully writing to the blockchain.
2. **Proof of Origin**: Show the green **"Verified"** message indicating your wallet owns the record.
3. **Tamper Test**: Edit the file (add one space), save it, and re-upload. Point out the new fingerprint.
4. **Detection**: Show the red **"TAMPERED"** warning to prove the system detected the change.

---

## 👨‍💻 Author
**Saanvi Shetty** *Deepfake Detection dApp*