function getLocalConnection(){
  let servers = null
  let localPC = new RTCPeerConnection(servers)
  return localPC
}

function addVideoStream(localPC ,videoStream){
  localPC.addStream(videoStream)  
}

const createIceCandidateHandler = (socket,toId) => (e) => {
  const iceCandidate = e.candidate;
  if (iceCandidate) {
    trace(`emitting from ${socket.id} to ${toId}ice candidate ${iceCandidate}`)
    socket.emit("ice candidate",socket.id,toId,iceCandidate)
  }
}


