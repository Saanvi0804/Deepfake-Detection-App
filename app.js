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

let signer;
let contract;

document.getElementById('connectBtn').onclick = async () => {
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            
            // We initialize the contract here
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const address = await signer.getAddress();
            document.getElementById('walletAddress').innerText = "Connected: " + address;
            document.getElementById('registerBtn').disabled = false;
            document.getElementById('checkBtn').disabled = false;
        } catch (err) {
            console.error(err);
            alert("Connection failed!");
        }
    }
};

document.getElementById('fileInput').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('fileHash').innerText = "Fingerprint: " + hashHex;
    window.currentHash = hashHex;
};

document.getElementById('registerBtn').onclick = async () => {
    if (!window.currentHash) {
        document.getElementById('status').innerHTML = "<b style='color:orange;'>⚠️ Please select a file first.</b>";
        return;
    }
    try {
        document.getElementById('status').innerText = "⏳ Checking if file is new...";
        
        const owner = await contract.fingerprints(window.currentHash);
        if (owner !== "0x0000000000000000000000000000000000000000") {
            document.getElementById('status').innerHTML = "<b style='color:orange;'>ℹ️ Already Registered! No need to sign again.</b>";
            return;
        }

        document.getElementById('status').innerText = "⏳ Please confirm in MetaMask...";
        const tx = await contract.saveFingerprint(window.currentHash, {
            maxPriorityFeePerGas: ethers.parseUnits("35", "gwei"),
            maxFeePerGas: ethers.parseUnits("50", "gwei")
        });
        
        await tx.wait();
        document.getElementById('status').innerHTML = "<b style='color:green;'>✅ Successfully Registered Forever!</b>";

        const list = document.getElementById('historyList');
        const fileInput = document.getElementById('fileInput');
        const fileName = fileInput.files[0] ? fileInput.files[0].name : "Unknown File";
        const savedHash = window.currentHash; 
        
        if (list.innerText.includes("No files")) list.innerHTML = "";

        const entry = document.createElement('li');
        entry.style.padding = "10px";
        entry.style.borderBottom = "1px solid #ddd";
        entry.style.display = "flex";
        entry.style.justifyContent = "space-between";
        entry.style.alignItems = "center";
        
        entry.innerHTML = `
            <div>
                <b>📄 ${fileName}</b><br>
                <small style="color:blue;">Hash: ${savedHash.substring(0,20)}...</small><br>
                <span style="color:green; font-size: 0.8em;">✓ Confirmed on Polygon</span>
            </div>
            <button onclick="checkSpecificHash('${savedHash}')" style="padding: 5px 10px; cursor: pointer;">Verify Now</button>
        `;
        list.prepend(entry); 

    } catch (err) {
        console.error("LOG:", err);
        if (err.code === 4001 || err?.info?.error?.code === 4001) {
            document.getElementById('status').innerText = "❌ Transaction rejected by user.";
        } else if (err.message && err.message.toLowerCase().includes("insufficient funds")) {
            document.getElementById('status').innerText = "❌ Insufficient funds. Please top up your wallet with test POL.";
        } else {
            document.getElementById('status').innerText = "❌ Transaction failed. Check console for details.";
        }
    }
};

document.getElementById('checkBtn').onclick = async () => {
    if (!window.currentHash) {
        document.getElementById('status').innerHTML = "<b style='color:orange;'>⚠️ Please select a file first.</b>";
        return;
    }
    try {
        const owner = await contract.fingerprints(window.currentHash);
        if (owner === "0x0000000000000000000000000000000000000000") {
            document.getElementById('status').innerHTML = "<b style='color:red;'>🚨 TAMPERED/UNKNOWN: Not found in blockchain registry.</b>";
        } else {
            document.getElementById('status').innerHTML = "<b style='color:green;'>✅ VERIFIED ORIGINAL: Registered by " + owner + "</b>";
        }
    } catch (err) {
        document.getElementById('status').innerText = "❌ Error: Could not reach the contract.";
    }
};


document.getElementById('fileInput').onclick = (e) => {
    e.target.value = null; 
};


window.checkSpecificHash = async (hashToCheck) => {
    try {
        document.getElementById('status').innerText = "🔍 Verifying from history...";
        const owner = await contract.fingerprints(hashToCheck);
        
        if (owner === "0x0000000000000000000000000000000000000000") {
            document.getElementById('status').innerHTML = "<b style='color:red;'>🚨 TAMPERED: This record appears invalid.</b>";
        } else {
            document.getElementById('status').innerHTML = "<b style='color:green;'>✅ VERIFIED: Record found for owner " + owner.substring(0,10) + "...</b>";
        }
    } catch (err) {
        document.getElementById('status').innerText = "❌ Error: Could not reach blockchain.";
    }
};