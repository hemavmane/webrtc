import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const createMeeting = () => {
    const roomId =
      "hemameet-" + Math.random().toString(36).substring(2, 10);

    navigate(`/meet/${roomId}`);
  };

  return (
    <div style={styles.container}>
      <h1>🎥 Hemameet</h1>

      <button onClick={createMeeting} style={styles.btn}>
        Create Meeting
      </button>
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
    background: "#0f0f10",
    color: "#fff",
  },
  btn: {
    marginTop: 20,
    padding: 12,
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },
};