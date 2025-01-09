// import React, { useState } from "react";
// import { ethers } from "ethers";
// import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

// function CoinbaseSmartWallet() {
//   const [address, setAddress] = useState("");
//   const [transactionHash, setTransactionHash] = useState("");

//   // Initialize Coinbase Wallet SDK
//   const wallet = new CoinbaseWalletSDK({
//     appName: "My DApp",
//     appLogoUrl: "YOUR_LOGO_URL",
//     darkMode: false,
//   });

//   // Connect to wallet
//   const connectWallet = async () => {
//     try {
//       const provider = wallet.makeWeb3Provider();
//       await provider.send("eth_requestAccounts", []);
//       const signer = provider.getSigner();
//       const userAddress = await signer.getAddress();
//       setAddress(userAddress);
//     } catch (error) {
//       console.error("Error connecting to wallet:", error);
//     }
//   };

//   // Send a transaction (1 cent)
//   const sendTransaction = async () => {
//     if (!address) {
//       alert("Please connect wallet first");
//       return;
//     }

//     try {
//       // Convert 1 cent to wei. Note: This is a very rough estimate, actual value depends on ETH price.
//       const amountInWei = ethers.utils.parseUnits("0.01", 18); // Assuming 1 cent is roughly 0.01 ETH at some point

//       const provider = wallet.makeWeb3Provider();
//       const signer = provider.getSigner();

//       const tx = {
//         to: "0xRecipientAddressHere", // Replace with the actual recipient address
//         value: amountInWei,
//       };

//       const transaction = await signer.sendTransaction(tx);
//       const receipt = await transaction.wait();
//       setTransactionHash(receipt.transactionHash);
//     } catch (error) {
//       console.error("Error sending transaction:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Coinbase Smart Wallet Example</h1>
//       <button onClick={connectWallet}>Connect Wallet</button>
//       {address && <p>Connected Address: {address}</p>}

//       <button onClick={sendTransaction}>Send 1 Cent</button>
//       {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
//     </div>
//   );
// }

// export default CoinbaseSmartWallet;
