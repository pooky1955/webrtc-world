function getLocalConnection(){
  let localPC = new RTCPeerConnection({iceServers : serversList})
  return localPC
}

function addVideoStream(localPC ,videoStream){
  localPC.addStream(videoStream)  
}

const createIceCandidateHandler = (socket,toId) => (e) => {
  const iceCandidate = e.candidate;
  if (iceCandidate) {
    traceImportant(`emitting from ${socket.id} to ${toId} ice candidate ${iceCandidate}`)
    traceObject(iceCandidate)
    socket.emit("ice candidate",socket.id,toId,iceCandidate)
  }
}


