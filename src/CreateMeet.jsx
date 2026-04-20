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
    <div style={styles.wrapper}>

      <div style={styles.card}>
        <h1>🎥 Google Meet Clone</h1>
        <p>Start or join a secure video meeting</p>

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
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f0f10",
    color: "#fff",
  },

  card: {
    padding: "40px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    textAlign: "center",
  },

  primary: {
    padding: "12px 20px",
    background: "#1a73e8",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    marginTop: "20px",
    cursor: "pointer",
  },

  joinBox: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    width: "250px",
  },

  secondary: {
    padding: "10px 15px",
    borderRadius: "8px",
    background: "#333",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};