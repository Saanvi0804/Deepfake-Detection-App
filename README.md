# 🛡️ Digital Notary: Blockchain-Based Deepfake Detection

A Web3 application that uses the Polygon blockchain to notarize files and detect unauthorized modifications (Deepfakes) using SHA-256 cryptographic fingerprints.

## 🚀 How it Works
1. **Hashing**: The app generates a unique SHA-256 hash (fingerprint) for any uploaded file.
2. **Notarization**: Users sign a transaction via MetaMask to store this fingerprint on the Polygon Amoy network.
3. **Verification**: The app compares the current file's fingerprint against the blockchain registry.
4. **Detection**: If even a single pixel or character is changed, the fingerprint changes, and the app triggers a "TAMPERED" warning.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Blockchain**: Polygon Amoy Testnet
- **Smart Contract**: Solidity
- **Library**: Ethers.js (v6)
- **Wallet**: MetaMask

## 📂 Project Structure
- `index.html`: The user interface.
- `app.js`: Contains hashing logic, MetaMask connection, and blockchain interaction.
- `SimpleRegistry.sol`: The Smart Contract (deployed at `0xfE73B25ED03247990a688100B166c507b6e6459F`).

## 💡 Use Cases
- Verifying the authenticity of legal documents.
- Protecting digital art and media from AI-generated tampering.
- Creating a permanent, immutable record of document ownership.