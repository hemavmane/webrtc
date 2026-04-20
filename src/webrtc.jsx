import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://api.justoconsulting.com/webrtc", {
  transports: ["websocket"],
  withCredentials: true,
});

export default function CallPage() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const [myId, setMyId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);

  // ================= CREATE PEER =================
  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ],
    }); pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId) {
        socket.emit("ice-candidate", {
          toSocketId: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  // ================= MEDIA =================
  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
  };

  // ================= START CALL =================
  const startCall = async () => {
    peerConnection.current = createPeerConnection(targetId);

    await getMedia();

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", {
      toSocketId: targetId,
      offer,
    });
  };

  // ================= ACCEPT =================
  const acceptCall = async () => {
    peerConnection.current = createPeerConnection(incomingCall.from);

    await getMedia();

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      toSocketId: incomingCall.from,
      answer,
    });

    setIncomingCall(null);
  };

  // ================= SOCKET =================
  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
      console.log("Connected:", socket.id);
    });

    socket.on("incoming-call", ({ from, offer }) => {
      setIncomingCall({ from, offer });
    });

    socket.on("call-answered", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error(err);
      }
    });

    return () => socket.off();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📞 Live Call</h2>

      <p><b>Your ID:</b> {myId}</p>

      <input
        placeholder="Enter other user's ID"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
      />

      <br /><br />

      <button onClick={startCall}>📞 Call</button>

      {incomingCall && (
        <div>
          <p>Incoming Call...</p>
          <button onClick={acceptCall}>✅ Accept</button>
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <video ref={localVideoRef} autoPlay muted playsInline width="300" />
        <video ref={remoteVideoRef} autoPlay playsInline width="300" />
      </div>
    </div>
  );
}