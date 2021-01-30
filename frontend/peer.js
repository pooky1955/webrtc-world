function getLocalConnection(){
  let servers = null
  let localPC = new RTCPeerConnection(servers)
  localPC.add
  return localPC
}

function addVideoStream(localPC ,videoStream){
  localPC.addStream(videoStream)  
}

async function handleIceCandidate(event){
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);
    await otherPeer.addIceCandidate(newIceCandidate)
  }
}

