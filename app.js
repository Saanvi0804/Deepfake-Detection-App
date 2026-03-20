const contractAddress = "0xfE73B25ED03247990a688100B166c507b6e6459F";

const contractABI = [
    {
        "inputs": [{"internalType": "bytes32","name": "_hash","type": "bytes32"}],
        "name": "saveFingerprint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32","name": "","type": "bytes32"}],
        "name": "fingerprints",
        "outputs": [{"internalType": "address","name": "","type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Module-scoped state — avoids polluting window
const state = {
    signer: null,
    contract: null,
    currentHash: null,
};

//Helpers

function sanitizeFilename(name) {
    return name.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
}

function setStatus(html, type = '') {
    const el = document.getElementById('status');
    const colors = { ok: '#00e5a0', warn: '#f59e0b', err: '#ef4444', info: '#6b7280' };
    el.innerHTML = type
        ? `<span style="color:${colors[type] || '#e8eaf0'}">${html}</span>`
        : html;
}

// localStorage history

const STORAGE_KEY = 'notary_history';

function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
}

function saveHistoryEntry(entry) {
    const history = loadHistory();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

function renderHistoryEntry({ fileName, hash, timestamp }) {
    const list = document.getElementById('historyList');
    // Remove empty-state placeholder if present
    const empty = list.querySelector('.empty-state');
    if (empty) empty.remove();

    const safeFileName = sanitizeFilename(fileName);
    const date = new Date(timestamp).toLocaleString();
    const shortHash = hash.substring(0, 18) + '…';

    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
        <div class="history-item-meta">
            <div class="history-filename">📄 ${safeFileName}</div>
            <div class="history-hash" title="${hash}">${shortHash}</div>
            <div class="history-date">${date}</div>
            <div class="history-confirmed">✓ Confirmed on Polygon</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="checkSpecificHash('${hash}')">Verify</button>
    `;
    list.prepend(li);
}

function initHistory() {
    const history = loadHistory();
    if (history.length === 0) return;
    document.getElementById('historyList').innerHTML = '';
    history.forEach(e => renderHistoryEntry(e));
}

document.addEventListener('DOMContentLoaded', initHistory);

//Clear history

document.getElementById('clearHistoryBtn').onclick = () => {
    if (!confirm('Clear all registration history from this browser?')) return;
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('historyList').innerHTML =
        '<li class="empty-state">No files registered yet.</li>';
};

// Connect wallet

document.getElementById('connectBtn').onclick = async () => {
    const addrEl = document.getElementById('walletAddress');
    if (!window.ethereum) {
        addrEl.innerHTML = '⚠️ MetaMask not detected. <a href="https://metamask.io/download/" target="_blank" rel="noopener" style="color:#00e5a0;">Install MetaMask ↗</a>';
        return;
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        state.signer = await provider.getSigner();
        state.contract = new ethers.Contract(contractAddress, contractABI, state.signer);
        const address = await state.signer.getAddress();
        addrEl.className = 'connected';
        addrEl.innerText = address;
        document.getElementById('registerBtn').disabled = false;
        document.getElementById('checkBtn').disabled = false;
        document.getElementById('connectBtn').innerText = 'Connected ✓';
        document.getElementById('connectBtn').disabled = true;
    } catch (err) {
        console.error(err);
        if (err.code === 4001) {
            addrEl.innerText = '⚠️ Connection rejected. Please approve in MetaMask.';
        } else {
            addrEl.innerText = '❌ Connection failed. See console for details.';
        }
    }
};

// File hashing 

async function hashFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('fileInput').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const hashEl = document.getElementById('fileHash');
    hashEl.className = '';
    hashEl.innerText = '⏳ Computing fingerprint…';
    await new Promise(r => setTimeout(r, 0)); // yield to paint
    const hashHex = await hashFile(file);
    const short = hashHex.substring(0, 18) + '…' + hashHex.slice(-6);
    hashEl.className = 'has-hash';
    hashEl.innerHTML = `${short} <span style="color:#6b7280;cursor:pointer;font-size:0.7rem;" title="${hashHex}" onclick="navigator.clipboard.writeText('${hashHex}').then(()=>this.innerText='✓ Copied').catch(()=>{})">📋 copy</span>`;
    state.currentHash = hashHex;
    setStatus('');
};

// Reset file input so same file can be re-selected
document.getElementById('fileInput').onclick = (e) => { e.target.value = null; };

// Drag-and-drop

const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', async e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const hashEl = document.getElementById('fileHash');
    hashEl.className = '';
    hashEl.innerText = '⏳ Computing fingerprint…';
    await new Promise(r => setTimeout(r, 0));
    const hashHex = await hashFile(file);
    const short = hashHex.substring(0, 18) + '…' + hashHex.slice(-6);
    hashEl.className = 'has-hash';
    hashEl.innerHTML = `${short} <span style="color:#6b7280;cursor:pointer;font-size:0.7rem;" title="${hashHex}" onclick="navigator.clipboard.writeText('${hashHex}').then(()=>this.innerText='✓ Copied').catch(()=>{})">📋 copy</span>`;
    state.currentHash = hashHex;
    setStatus('');
});

//Register 

document.getElementById('registerBtn').onclick = async () => {
    if (!state.currentHash) {
        setStatus('⚠️ Please select a file first.', 'warn'); return;
    }
    try {
        setStatus('⏳ Checking if file is already registered…', 'info');
        const owner = await state.contract.fingerprints(state.currentHash);
        if (owner !== "0x0000000000000000000000000000000000000000") {
            setStatus(`ℹ️ Already registered by <span style="font-family:monospace">${owner.substring(0,10)}…</span>`, 'warn');
            return;
        }

        setStatus('⏳ Please confirm in MetaMask…', 'info');
        const feeData = await state.signer.provider.getFeeData();
        const tx = await state.contract.saveFingerprint(state.currentHash, {
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            maxFeePerGas: feeData.maxFeePerGas
        });

        setStatus('⏳ Waiting for confirmation…', 'info');
        const receipt = await tx.wait();
        const txHash = receipt.hash || tx.hash;
        const scanUrl = `https://amoy.polygonscan.com/tx/${txHash}`;
        setStatus(`✅ Registered! <a href="${scanUrl}" target="_blank" rel="noopener" style="color:#00e5a0;">View on PolygonScan ↗</a>`, 'ok');

        const fileInput = document.getElementById('fileInput');
        const rawName = fileInput.files[0] ? fileInput.files[0].name : "Unknown File";
        const entry = { fileName: rawName, hash: state.currentHash, timestamp: Date.now() };
        saveHistoryEntry(entry);
        renderHistoryEntry(entry);

    } catch (err) {
        console.error("Register error:", err);
        if (err.code === 4001 || err?.info?.error?.code === 4001) {
            setStatus('❌ Transaction rejected by user.', 'err');
        } else if (err.message?.toLowerCase().includes("insufficient funds")) {
            setStatus('❌ Insufficient funds. Top up with test POL from a faucet.', 'err');
        } else {
            setStatus('❌ Transaction failed. Check the console for details.', 'err');
        }
    }
};

// Check ownership

document.getElementById('checkBtn').onclick = async () => {
    if (!state.currentHash) {
        setStatus('⚠️ Please select a file first.', 'warn'); return;
    }
    try {
        setStatus('🔍 Querying blockchain…', 'info');
        const owner = await state.contract.fingerprints(state.currentHash);
        if (owner === "0x0000000000000000000000000000000000000000") {
            setStatus('🚨 TAMPERED / UNKNOWN — not found in the registry.', 'err');
        } else {
            setStatus(`✅ VERIFIED ORIGINAL — registered by <span style="font-family:monospace">${owner}</span>`, 'ok');
        }
    } catch (err) {
        setStatus('❌ Could not reach the contract. Check your network.', 'err');
    }
};

//Verify from history (must stay on window for inline onclick)

window.checkSpecificHash = async (hashToCheck) => {
    if (!state.contract) {
        setStatus('⚠️ Connect your wallet first to verify.', 'warn'); return;
    }
    try {
        setStatus('🔍 Verifying from history…', 'info');
        const owner = await state.contract.fingerprints(hashToCheck);
        if (owner === "0x0000000000000000000000000000000000000000") {
            setStatus('🚨 TAMPERED — this record appears invalid.', 'err');
        } else {
            setStatus(`✅ VERIFIED — owner: <span style="font-family:monospace">${owner.substring(0,10)}…</span>`, 'ok');
        }
    } catch (err) {
        setStatus('❌ Could not reach blockchain.', 'err');
    }
};
