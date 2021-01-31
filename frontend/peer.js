function getLocalConnection(){
  let servers = null
  let localPC = new RTCPeerConnection(servers)
  return localPC
}

function addVideoStream(localPC ,videoStream){
  localPC.addStream(videoStream)  
}

const createIceCandidateHandler = (socket,toId) => (event) => {
  const iceCandidate = event.candidate;
  if (iceCandidate) {
    socket.emit("ice candidate",socket.id,toId,iceCandidate)
  }
}


