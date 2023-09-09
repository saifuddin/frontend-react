import React, { useRef, useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

function App() {
  const [peers, setPeers] = useState([]);
  const socket = useRef();
  const stream = useRef();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(streamData => {
        stream.current = streamData;

        // socket.current = io.connect("/"); // Connect to the server
        socket.current = io.connect("http://localhost:3001"); // Connect to the Node.js server
        socket.current.on("offer", data => {
          createPeer(data, false);
        });
      });
    } else {
      alert("getUserMedia not supported on your browser!");
    }
  }, []);

  const createPeer = (data, initiator) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: stream.current
    });

    peer.on("signal", signal => {
      if(initiator) {
        socket.current.emit("offer", signal);
      } else {
        socket.current.emit("answer", signal);
      }
    });

    if(!initiator) {
      peer.signal(data);
    }

    setPeers(oldPeers => [...oldPeers, peer]);
  };

  return (
    <div className="App">
      <button onClick={() => createPeer(null, true)}>
        Start Voice Chat
      </button>
    </div>
  );
}

export default App;
