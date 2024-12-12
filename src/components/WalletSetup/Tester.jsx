import React, { useState, useEffect } from "react";
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// Create a single NDK instance for your application
// You would typically create this once at application start
const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.damus.io", "wss://relay.primal.net"],
});

export const Tester = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [status, setStatus] = useState("");

  // On mount, connect to relays
  useEffect(() => {
    ndk.connect().catch(console.error);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!privateKey) return;

    try {
      // Create a signer from the private key
      const signer = new NDKPrivateKeySigner(privateKey);
      ndk.signer = signer; // This sets the active user internally as well
      // Once signer is ready, NDK emits "signer:ready" and sets activeUser.
      // If successful, mark the user as logged in.
      setIsLoggedIn(true);
      setStatus("Logged in successfully!");
    } catch (error) {
      console.error("Failed to log in", error);
      setStatus("Login failed.");
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent) return;
    if (!ndk.signer) {
      setStatus("You must be logged in to post.");
      return;
    }

    try {
      // Create a new event
      const event = new NDKEvent(ndk);
      event.kind = 1; // '1' is the standard kind for a text note
      event.content = postContent;

      // Sign the event (NDK will use the attached signer)
      await event.sign(ndk.signer);

      // Publish the event
      const relays = await event.publish();
      if (relays.size > 0) {
        setStatus("Posted successfully!");
        setPostContent("");
      } else {
        setStatus("Failed to publish to any relay.");
      }
    } catch (error) {
      console.error("Failed to post", error);
      setStatus("Failed to post content.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Nostr Login & Posting Demo</h1>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
          <h2>Login</h2>
          <p>Enter your Nostr private key (hex):</p>
          <input
            type="text"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <h2>Logged in!</h2>
          <p>Your pubkey: {ndk.activeUser?.hexpubkey}</p>
        </div>
      )}

      {isLoggedIn && (
        <form onSubmit={handlePost}>
          <h2>Post Content</h2>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            style={{ width: "100%", height: 100, marginBottom: 10 }}
          />
          <button type="submit">Publish Note</button>
        </form>
      )}

      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
};
