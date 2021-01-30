const mediaConstraints = {video : true, audio : false}
const roomName = window.location.search

//a mapping from other's people socket id to the their dedicated peer connection
const connections = {

}

async function getVideoStream(){
    return navigator.mediaDevices.getUserMedia(mediaConstraints)
}

(async function(){
  const videoStream = await getVideoStream()


  const socket = io.connect(BACKEND_URL)
  socket.emit("offer",offer)
  socket.emit("join create room",roomName)
  socket.on("participants",(ids) => {
    ids.forEach(id => {
      const pc = getLocalConnection()
      addVideoStream(pc, videoStream)
      const offer = await pc.createOffer()
      pc.setLocalDescription(offer)
    })
  })
  socket.on("offer",(offer) => {
    pc.setRemoteDescription(offer)
  })
})()
