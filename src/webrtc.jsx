import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://api.justoconsulting.com");

export default function MeetPage() {
  const { roomId } = useParams();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const [streamStarted, setStreamStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    socket.emit("join-room", { roomId });
  }, [roomId]);

  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;
    window.localStream = stream;

    setStreamStarted(true);
  };

  const toggleMute = () => {
    const stream = window.localStream;
    stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const stream = window.localStream;
    stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
    setCameraOn(!cameraOn);
  };

  const endCall = () => {
    window.localStream?.getTracks().forEach(t => t.stop());
    window.location.href = "/";
  };

  return (
    <div style={styles.wrapper}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>🎥 Meet</div>
        <div style={styles.roomId}>{roomId}</div>
      </div>

      {/* VIDEO AREA */}
      <div style={styles.grid}>

        <div style={styles.videoBox}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />
          <div style={styles.label}>You</div>
        </div>

        <div style={styles.videoBox}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.video}
          />
          <div style={styles.label}>Participant</div>
        </div>

      </div>

      {/* FLOATING CONTROLS */}
      <div style={styles.controls}>

        {!streamStarted && (
          <button onClick={startMedia} style={styles.startBtn}>
            🎥 Start
          </button>
        )}

        <button onClick={toggleMute} style={styles.btn}>
          {isMuted ? "🔇" : "🎤"}
        </button>

        <button onClick={toggleCamera} style={styles.btn}>
          {cameraOn ? "📷" : "🚫"}
        </button>

        <button onClick={endCall} style={styles.endBtn}>
          ❌
        </button>

      </div>

    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    background: "#0f0f10",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  roomId: {
    fontSize: "12px",
    opacity: 0.6,
  },

  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
    padding: "15px",
  },

  videoBox: {
    position: "relative",
    borderRadius: "15px",
    overflow: "hidden",
    background: "#000",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "15px",
  },

  label: {
    position: "absolute",
    bottom: 10,
    left: 10,
    background: "rgba(0,0,0,0.6)",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
  },

  controls: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "12px",
    padding: "12px 18px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    borderRadius: "40px",
  },

  btn: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "none",
    background: "#333",
    color: "#fff",
    cursor: "pointer",
  },

  startBtn: {
    padding: "10px 15px",
    borderRadius: "20px",
    background: "#1a73e8",
    border: "none",
    color: "#fff",
  },

  endBtn: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "red",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
};