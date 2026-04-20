import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  const createMeeting = () => {
    const roomId =
      "hemameetlink-" + Math.random().toString(36).substring(2, 10);

    navigate(`/meet/${roomId}`);
  };

  const joinMeeting = () => {
    if (!link) return;
    const roomId = link.split("/").pop();
    navigate(`/meet/${roomId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🎥 Google Meet Clone</h1>

        <button onClick={createMeeting} style={styles.primary}>
          ➕ Create Meeting
        </button>

        <div style={styles.joinBox}>
          <input
            placeholder="Paste meeting link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinMeeting} style={styles.secondary}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f0f10",
    color: "#fff",
  },
  card: {
    padding: 40,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    textAlign: "center",
  },
  primary: {
    marginTop: 20,
    padding: "12px 20px",
    background: "#1a73e8",
    border: "none",
    color: "#fff",
    borderRadius: 10,
  },
  joinBox: {
    marginTop: 20,
    display: "flex",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    width: 250,
  },
  secondary: {
    padding: "10px 15px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },
};