const mediaConstraints = {video : true, audio : false}
const roomName = new URLSearchParams(window.location.search).get("r")
if (roomName === null || roomName == ""){
  window.location.href = "?r=globalroom"
}

//a mapping from other's people socket id to the their dedicated peer connection
const connections = {

}

const sel = (selector) => document.querySelector(selector)
const zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))
async function getVideoStream(){
    return navigator.mediaDevices.getUserMedia(mediaConstraints)
}
function trace(message){
  console.log(`[INFO]: ${message}`)
}
function showMessage(message){
  let newChild = document.createTextNode(message)
  document.querySelector("div.message-logs").appendChild(newChild)
}

(async function(){
  const videoStream = await getVideoStream()
  sel("video#local-video").srcObject = videoStream

  const socket = io.connect(BACKEND_URL)
  trace("asked to join room")
  socket.emit("join create room",roomName)
  socket.on("participants",async (ids) => {
    trace(`participants: ${ids}`)
    if (ids === null){
      // nobody is here
      trace("ids null, nobody is here")
      showMessage("you're the only one here!")
    } else {
      trace(`received ids of ${ids}`)
      offers = await Promise.all(ids.map(id => {
        const pc = getLocalConnection()
        connections[id] = pc
        addVideoStream(pc, videoStream)
        return pc.createOffer()
      }))
      trace(`calculated offers: ${offers}`)

      zip([ids,offers]).map(([id,offer]) => {
        trace(`zipping at id ${id} and offer ${offer}`)
        const pc = connections[id]
        pc.setLocalDescription(offer)
        socket.emit("offer",socket.id,id,offer)
        trace(`emitted offer from ${socket.id} to ${id}`)
      })
    }
  })
  socket.on("offer",async (fromId,offer) => {
    trace(`received offer from ${fromId} with ${offer}`)
    let pc = connections[fromId]
    const rtcOffer = new RTCSessionDescription(offer) // just transforms it into the correct class
    pc.setRemoteDescription(rtcOffer)
    let answer = await pc.createAnswer()
    socket.emit("answer",socket.id,fromId,answer)
    trace(`sent answer from ${socket.id} to ${fromId} with ${answer}`)
  })

  socket.on("answer",(fromId,answer) => {
    trace(`received answer from ${fromId} with ${answer}`)
    let pc = connections[fromId]
    const rtcAnswer = new RTCSessionDescription(answer)
    pc.setRemoteDescription(rtcAnswer)
    trace(`set remote description to ${answer}`)
  })
})()
