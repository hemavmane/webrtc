import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [link, setLink] = useState("");
  const navigate = useNavigate();

  const createMeeting = () => {
    const roomId = "hemameetlink-" + Math.random().toString(36).substring(2, 10);
    navigate(`/meet/${roomId}`);
  };

  const joinMeeting = () => {
    if (!link) return;
    const roomId = link.split("/").pop();
    navigate(`/meet/${roomId}`);
  };

  return (
    <div style={styles.container}>
      <h1>🎥 Google Meet Clone</h1>

      <button onClick={createMeeting} style={styles.primaryBtn}>
        ➕ Create Meeting
      </button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Paste meeting link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          style={styles.input}
        />
        <button onClick={joinMeeting} style={styles.secondaryBtn}>
          🔗 Join Meeting
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtn: {
    padding: "12px 20px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 15px",
    marginLeft: "10px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  input: {
    padding: "10px",
    width: "300px",
  },
};