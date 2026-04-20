import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";


const socket = io("https://api.justoconsulting.com/webrtc");

export default function Meet() {
  const { roomId } = useParams();

  const localRef = useRef();
  const remoteRef = useRef();
  const peerRef = useRef();

  const [users, setUsers] = useState([]);
  const [streamReady, setStreamReady] = useState(false);

  // ================= JOIN ROOM =================
  useEffect(() => {
    socket.emit("join-room", { roomId });

    socket.on("user-joined", (user) => {
      setUsers((prev) => [...prev, user]);
    });

    // OFFER
    socket.on("offer", async ({ from, offer }) => {
      await createPeer(from);

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

    return () => socket.disconnect();
  }, [roomId]);

  // ================= START MEDIA =================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    localRef.current.srcObject = stream;
    window.localStream = stream;

    setStreamReady(true);
  };

  // ================= PEER CONNECTION =================
  const createPeer = (to) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    window.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, window.localStream);
    });

    pc.ontrack = (event) => {
      remoteRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to,
          candidate: event.candidate,
        });
      }
    };

    peerRef.current = pc;
    return pc;
  };

  // ================= START CALL =================
  const startCall = async (toSocketId) => {
    if (!window.localStream) {
      alert("Start camera first");
      return;
    }

    const pc = createPeer(toSocketId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
      to: toSocketId,
      offer,
    });
  };

  return (
    <div className="meet-wrapper">

      {/* VIDEO GRID */}
      <div className="meet-grid">
        <video ref={localRef} autoPlay muted className="video" />
        <video ref={remoteRef} autoPlay className="video" />
      </div>

      {/* CONTROLS */}
      <div className="controls">
        {!streamReady && (
          <button onClick={startMedia} className="btn blue">
            🎥 Start Camera
          </button>
        )}

        <button
          onClick={() => startCall(users?.[0]?.id)}
          className="btn green"
        >
          📞 Call
        </button>
      </div>

      {/* PARTICIPANTS */}
      <div className="sidebar">
        <h4>Participants</h4>
        {users.length === 0 ? (
          <p>No users yet</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="user">
              👤 {u.id}
            </div>
          ))
        )}
      </div>

    </div>
  );
}