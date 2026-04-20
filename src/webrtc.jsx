import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://api.justoconsulting.com");

export default function MeetPage() {
  const { roomId } = useParams();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  const [streamStarted, setStreamStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  // ================= JOIN ROOM =================
  useEffect(() => {
    socket.emit("join-room", { roomId });
  }, [roomId]);

  // ================= START MEDIA =================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;
    window.localStream = stream;

    setStreamStarted(true);
  };

  // ================= MUTE =================
  const toggleMute = () => {
    const stream = window.localStream;
    stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
    setIsMuted(!isMuted);
  };

  // ================= CAMERA =================
  const toggleCamera = () => {
    const stream = window.localStream;
    stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
    setCameraOn(!cameraOn);
  };

  // ================= END CALL =================
  const endCall = () => {
    window.localStream?.getTracks().forEach(track => track.stop());
    window.location.href = "/";
  };

  return (
    <div style={styles.wrapper}>

      {/* TOP BAR */}
      <div style={styles.topBar}>
        <h3>📍 Room: {roomId}</h3>
      </div>

      {/* VIDEO AREA */}
      <div style={styles.videoGrid}>

        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={styles.video}
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.video}
        />

      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>

        {!streamStarted && (
          <button onClick={startMedia} style={styles.startBtn}>
            🎥 Start
          </button>
        )}

        <button onClick={toggleMute} style={styles.btn}>
          {isMuted ? "🔇 Unmute" : "🎤 Mute"}
        </button>

        <button onClick={toggleCamera} style={styles.btn}>
          {cameraOn ? "📷 Off" : "📷 On"}
        </button>

        <button onClick={endCall} style={styles.endBtn}>
          ❌ End
        </button>

      </div>

    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#111",
    color: "#fff",
  },
  topBar: {
    padding: "10px",
    background: "#222",
  },
  videoGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    padding: "10px",
  },
  video: {
    width: "100%",
    height: "100%",
    background: "#000",
    borderRadius: "10px",
    objectFit: "cover",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    background: "#222",
  },
  btn: {
    padding: "10px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  startBtn: {
    padding: "10px",
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  endBtn: {
    padding: "10px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
};