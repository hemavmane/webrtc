import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateMeet() {

  const navigate = useNavigate();
  const [link, setLink] = useState("");

  const createMeeting = () => {
    const roomId = "hemameetlink-" + Math.random().toString(36).substring(2, 10);

    const url = `${window.location.origin}/meet/${roomId}`;

    setLink(url);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  return (
    <div style={{ padding: 20 }}>

      <h2>🎥 Google Meet Clone</h2>

      <button onClick={createMeeting}>
        ➕ Create Meeting
      </button>

      {link && (
        <div style={{ marginTop: 20 }}>
          <p>Share this link:</p>

          <input value={link} readOnly style={{ width: "100%" }} />

          <button onClick={copyLink}>
            📋 Copy Link
          </button>

          <button onClick={() => navigate(`/meet/${link.split("/").pop()}`)}>
            🚀 Join Now
          </button>
        </div>
      )}

    </div>
  );
}