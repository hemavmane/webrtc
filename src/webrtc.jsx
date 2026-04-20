import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://api.justoconsulting.com");

export default function MeetPage() {

  const { roomId } = useParams();

  const localRef = useRef();
  const remoteRefs = useRef({});

  const [users, setUsers] = useState([]);

  const pc = useRef({});

  // ================= JOIN ROOM =================
  useEffect(() => {

    socket.emit("join-room", {
      roomId,
      userName: "User"
    });

    socket.on("room-users", (users) => {
      setUsers(users);
    });

    socket.on("user-joined", (user) => {
      console.log("User joined", user);
    });

    socket.on("user-left", (user) => {
      console.log("User left", user);
    });

    // WebRTC signals
    socket.on("offer", async ({ offer, from }) => {
      await createAnswer(from, offer);
    });

    socket.on("answer", async ({ answer, from }) => {
      await pc.current[from]?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await pc.current.addIceCandidate(candidate);
    });

  }, []);

  // ================= MEDIA =================
  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localRef.current.srcObject = stream;
    return stream;
  };

  // ================= CREATE OFFER =================
  const createOffer = async (toSocketId) => {

    const stream = await getMedia();

    pc.current[toSocketId] = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    stream.getTracks().forEach(track => {
      pc.current[toSocketId].addTrack(track, stream);
    });

    pc.current[toSocketId].ontrack = (e) => {
      remoteRefs.current[toSocketId].srcObject = e.streams[0];
    };

    pc.current[toSocketId].onicecandidate = (e) => {
      socket.emit("ice-candidate", {
        roomId,
        candidate: e.candidate,
        to: toSocketId,
      });
    };

    const offer = await pc.current[toSocketId].createOffer();
    await pc.current[toSocketId].setLocalDescription(offer);

    socket.emit("offer", {
      roomId,
      offer,
    });
  };

  // ================= ANSWER =================
  const createAnswer = async (from, offer) => {

    const stream = await getMedia();

    pc.current[from] = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    stream.getTracks().forEach(track => {
      pc.current[from].addTrack(track, stream);
    });

    pc.current[from].ontrack = (e) => {
      remoteRefs.current[from].srcObject = e.streams[0];
    };

    await pc.current[from].setRemoteDescription(offer);

    const answer = await pc.current[from].createAnswer();
    await pc.current[from].setLocalDescription(answer);

    socket.emit("answer", {
      roomId,
      answer,
      to: from,
    });
  };

  return (
    <div>

      <h2>🎥 Meeting Room</h2>
      <p>{roomId}</p>

      <div>
        <video ref={localRef} autoPlay muted width="300" />
      </div>

      <h3>Participants</h3>

      {users.map(user => (
        <div key={user.id}>
          {user.name}

          <button onClick={() => createOffer(user.id)}>
            Call
          </button>

          <video
            ref={(el) => remoteRefs.current[user.id] = el}
            autoPlay
            width="300"
          />
        </div>
      ))}

    </div>
  );
}