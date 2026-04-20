import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";


// WebRTC namespace (IMPORTANT)
const socket = io("https://api.justoconsulting.com");

export default function Meet() {
  const { roomId } = useParams();

  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerRef = useRef();

  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [peerId, setPeerId] = useState(null);

  // ================= JOIN ROOM =================
  const joinRoom = () => {
    if (!email) return alert("Enter email first");

    socket.emit("join-room", { roomId, email });
    setJoined(true);
  };

  // ================= SOCKET EVENTS =================
  useEffect(() => {
    socket.on("user-joined", ({ socketId }) => {
      setPeerId(socketId);
    });

    socket.on("offer", async ({ from, offer }) => {
      const pc = createPeer(from);
      peerRef.current = pc;

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", {
        to: from,
        answer,
      });
    });

    socket.on("answer", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(candidate);
      }
    });

    return () => socket.disconnect();
  }, []);

  // ================= START CAMERA =================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localVideo.current.srcObject = stream;
    window.localStream = stream;
  };

  // ================= PEER CONNECTION =================
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
      remoteVideo.current.srcObject = event.streams[0];
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
  const startCall = async (to) => {
    if (!window.localStream) {
      alert("Start camera first");
      return;
    }

    const pc = createPeer(to);
    peerRef.current = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
      to,
      offer,
    });
  };

  // AUTO CONNECT WHEN PEER JOINS
  useEffect(() => {
    if (peerId && window.localStream) {
      startCall(peerId);
    }
  }, [peerId]);

  return (
    <div className="meet-container">

      {/* TOP BAR */}
      <div className="topbar">
        <h3>🎥 Hemameet Room</h3>
        <p>{roomId}</p>
      </div>

      {/* JOIN BOX */}
      {!joined && (
        <div className="join-box">
          <input
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      )}

      {/* VIDEO AREA */}
      <div className="video-grid">
        <video ref={localVideo} autoPlay muted className="video" />
        <video ref={remoteVideo} autoPlay className="video" />
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <button onClick={startMedia}>🎥 Start Camera</button>
        <button onClick={() => startCall(peerId)}>📞 Call</button>
      </div>

    </div>
  );
}