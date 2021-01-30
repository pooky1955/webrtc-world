const mediaConstraints = {video : true, audio : false}
const roomName = window.location.search

//a mapping from other's people socket id to the their dedicated peer connection
const connections = {

}
const zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))
async function getVideoStream(){
    return navigator.mediaDevices.getUserMedia(mediaConstraints)
}

(async function(){
  const videoStream = await getVideoStream()


  const socket = io.connect(BACKEND_URL)
  socket.emit("join create room",roomName)
  socket.on("participants",(ids) => {
    offers = await Promise.all(ids.map(id => {
      const pc = getLocalConnection()
      connections[id] = pc
      addVideoStream(pc, videoStream)
      return pc.createOffer()
    }))
     
    zip([ids,offers]).map(([id,offer]) => {
      const pc = connections[ids]
      pc.setLocalDescription(offer)
      socket.emit("offer",socket.id,id,offer)
    })

  })
  socket.on("offer",async (fromId,offer) => {
    let pc = connections[fromId]
    pc.setRemoteDescription(offer)
    let answer = await pc.createAnswer()
    socket.emit("answer",socket.id,fromId,answer)
  })

  socket.on("answer",(fromId,offer) => {
    let pc = connections[fromId]
    pc.setRemoteDescription(offer)
  })
})()
