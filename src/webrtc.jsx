import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://api.justoconsulting.com");

export default function MeetPage() {
  const { roomId } = useParams();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const remoteStreamRef = useRef(new MediaStream());

  const [streamStarted, setStreamStarted] = useState(false);
  const [users, setUsers] = useState([]);

  // ================= JOIN ROOM =================
  useEffect(() => {
    socket.emit("join-room", { roomId });

    socket.on("room-users", (data) => {
      setUsers(data);
    });

    socket.on("user-joined", (data) => {
      setUsers((prev) => [...prev, data.user]);
    });

    socket.on("user-left", (data) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.id));
    });

    // OFFER
    socket.on("offer", async ({ from, offer }) => {
      peerRef.current = createPeer(from);

      await peerRef.current.setRemoteDescription(offer);

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        to: from,
        answer,
      });
    });

    // ANSWER
    socket.on("answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer);
    });

    // ICE
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(candidate);
      }
    });
  }, [roomId]);

  // ================= MEDIA =================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localVideoRef.current.srcObject = stream;
    window.localStream = stream;

    setStreamStarted(true);
  };

  // ================= PEER =================
  const createPeer = (to) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    window.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, window.localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });

      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  // ================= START CALL =================
  const startCall = async (toSocketId) => {
    peerRef.current = createPeer(toSocketId);

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("offer", {
      to: toSocketId,
      offer,
    });
  };

  return (
    <div style={styles.wrapper}>

      {/* VIDEO GRID */}
      <div style={styles.grid}>
        <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        {!streamStarted && (
          <button onClick={startMedia} style={styles.btn}>
            🎥 Start
          </button>
        )}

        <button
          onClick={() => startCall(users?.[0]?.id)}
          style={styles.btn}
        >
          📞 Call
        </button>
      </div>

      {/* PARTICIPANTS */}
      <div style={styles.sidebar}>
        <h4>Participants</h4>
        {users.map((u, i) => (
          <div key={i} style={styles.user}>
            👤 {u.name || "User"}
          </div>
        ))}
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

  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: 10,
  },

  video: {
    width: "100%",
    height: "100%",
    background: "#000",
    borderRadius: 10,
    objectFit: "cover",
  },

  controls: {
    padding: 10,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    background: "#111",
  },

  btn: {
    padding: "10px 15px",
    background: "#1a73e8",
    border: "none",
    color: "#fff",
    borderRadius: 8,
  },

  sidebar: {
    position: "absolute",
    right: 10,
    top: 60,
    background: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 10,
  },

  user: {
    padding: 5,
    marginTop: 5,
    background: "#222",
    borderRadius: 5,
  },
};