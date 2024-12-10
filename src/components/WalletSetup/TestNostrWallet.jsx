import React, { useState } from "react";
import QRCode from "qrcode.react";
import { useNostrWallet } from "../../hooks/useNostrWallet";

const recipientNpub =
  "npub14vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0utts52axlt";

export const TestNostrWallet = () => {
  const {
    isConnected,
    errorMessage,
    nostrPubKey,
    auth,
    initiateDeposit,
    sendOneSatToNpub,
    walletBalance,
    cashuWallet,
    createNewWallet,
  } = useNostrWallet(
    localStorage.getItem("local_npub"),
    localStorage.getItem("local_nsec")
  );

  const [nsec, setNsec] = useState("");
  const [depositAmount, setDepositAmount] = useState(10);
  const [invoice, setInvoice] = useState("");
  const [depositPending, setDepositPending] = useState(false);

  const handleAuth = () => {
    auth(nsec);
  };

  const handleDeposit = async () => {
    setDepositPending(true);
    const pr = await initiateDeposit(depositAmount);
    if (pr) {
      setInvoice(pr);
    }
    setDepositPending(false);
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    alert("Invoice copied to clipboard!");
  };

  const handleZap = async () => {
    try {
      await sendOneSatToNpub(recipientNpub);
      console.log("Zap successful!");
    } catch (error) {
      console.error("Zap failed:", error);
    }
  };

  const totalBalance =
    (walletBalance || [])?.reduce((sum, b) => sum + (b.amount || 0), 0) || null;

  if (!nostrPubKey) {
    return (
      <div style={{ padding: "1rem" }}>
        <h3>Login with nsec</h3>
        <input
          type="text"
          value={nsec}
          onChange={(e) => setNsec(e.target.value)}
          placeholder="Enter your nsec"
        />
        <button onClick={handleAuth}>Login</button>
      </div>
    );
  }

  if (!isConnected) {
    return <div style={{ padding: "1rem" }}>Connecting to Nostr relays...</div>;
  }

  // Decide whether to show deposit form
  // If totalBalance > 0, user already has sats, skip showing deposit form
  console.log("TOTAL BALANCE?", totalBalance);
  const showDepositForm = !totalBalance || (totalBalance === 0 && !invoice);

  console.log("cashu wallet", cashuWallet);

  return (
    <div style={{ padding: "1rem" }}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <p>Connected as: {nostrPubKey}</p>
      <p>Nostr: Connected</p>

      <h4>Wallet Balance: {totalBalance} sat</h4>
      {walletBalance &&
        walletBalance.map((b, i) => (
          <div key={i}>
            {b.amount} {b.unit}
          </div>
        ))}

      {showDepositForm && (
        <div style={{ marginBottom: "1rem" }}>
          <h4>Deposit Sats into your wallet</h4>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(parseInt(e.target.value, 10))}
            placeholder="Amount in sats"
          />
          <button onClick={handleDeposit} disabled={depositPending}>
            {depositPending ? "Creating invoice..." : "Create LN Invoice"}
          </button>
        </div>
      )}

      {invoice && (
        <div style={{ marginBottom: "1rem" }}>
          <h4>Pay this invoice to deposit:</h4>
          <QRCode value={invoice} size={256} style={{ zIndex: 1000000 }} />
          <button onClick={copyInvoice}>Copy Invoice</button>
          <p>Use your Lightning wallet to pay this invoice.</p>
          <p>
            After payment, the deposit.success event should fire, and your
            wallet will have sats.
          </p>
        </div>
      )}

      {totalBalance > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Send a nutzap</h4>
          <button onClick={handleZap}>Send 1 sat to recipient</button>
        </div>
      )}

      {cashuWallet ? (
        <div>you arleady dcreated a wallet!</div>
      ) : (
        <button onClick={createNewWallet}>Create wallet</button>
      )}
    </div>
  );
};
