// // src/components/SignMessageForm.js
// import React, { useState } from "react";
// import { useWalletStore } from "./useCoinbaseWallet";

// export const SignMessageForm = () => {
//   const [message, setMessage] = useState("");
//   const [signature, setSignature] = useState();
//   const { connected, signMessage } = useWalletStore((state) => ({
//     connected: state.connected,
//     signMessage: state.signMessage,
//   }));

//   const handleSign = async () => {
//     if (!connected) {
//       alert("Connect to your wallet first!");
//       return;
//     }
//     const sig = await signMessage(message);
//     if (sig) setSignature(sig);
//   };

//   return (
//     <div
//       style={{
//         border: "1px solid #ccc",
//         padding: "1rem",
//         maxWidth: "300px",
//         margin: "1rem auto",
//       }}
//     >
//       <h3>Sign a Message</h3>
//       <input
//         type="text"
//         placeholder="Enter a message"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         style={{ width: "100%", marginBottom: "0.5rem" }}
//       />
//       <button onClick={handleSign} disabled={!connected}>
//         Sign
//       </button>
//       {signature && (
//         <div style={{ marginTop: "1rem", wordWrap: "break-word" }}>
//           <h4>Signature:</h4>
//           <p>{signature}</p>
//         </div>
//       )}
//     </div>
//   );
// };
