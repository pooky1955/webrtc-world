const mediaConstraints = {video : true, audio : true}
const roomName = new URLSearchParams(window.location.search).get("r")
if (roomName === null || roomName == ""){
  window.location.href = "?r=globalroom"
}

//a mapping from other's people socket id to the their dedicated peer connection
const connections = {}
const streams = {}
const offerOptions = {
  offerToReceiveVideo: true,
  offerToReceiveAudio : true
};

const sel = (selector) => document.querySelector(selector)
const zip= rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))
async function getVideoStream(){
    return navigator.mediaDevices.getUserMedia(mediaConstraints)
}
const createAddRemoteStreamHandler = (toId) => (e) => {
  trace(`Remote stream added from ${toId}`);
  const remoteStream = e.stream;
  streams[toId] = remoteStream
  const videoElement = document.createElement("video")
  sel("div.video-container").appendChild(videoElement)
  videoElement.srcObject = remoteStream
  videoElement.autoplay = true
  videoElement.id = toId
}
function trace(message){
  console.log(`[INFO]: ${message}`)
}

function traceImportant(message){
  const style = [
    'text-decoration : bold',
    'font-size : 14px',
    'font-weight : 800'
  ].join(";")
  console.log(`%c[IMPORTANT]: ${message}`,style)
}
function traceObject(object){
  console.log(object)
}
function showMessage(message){
  let newChild = document.createElement("li")
  newChild.textContent = message
  sel("ol.message-logs").appendChild(newChild)
}

const createIceChangeHandler = (toId) => (event) => {
  const pc = event.target
  traceImportant(`ICE state change for ${toId} event`);
  traceImportant(`${toId} ICE state: ${pc.iceConnectionState}`);
  traceObject(event)
}

function initPC(socket,id,videoStream){
  const pc = getLocalConnection()
  pc.addEventListener("icecandidate", createIceCandidateHandler(socket,id))
  pc.onaddstream = createAddRemoteStreamHandler(id)
  pc.addEventListener('iceconnectionstatechange', createIceChangeHandler(id));
  trace(`creating offer for id ${id}`)
  connections[id] = pc
  addVideoStream(pc, videoStream)
  return pc
}

(async function(){
  const videoStream = await getVideoStream()
  sel("video#local-video").srcObject = videoStream

  const socket = io.connect(BACKEND_URL)
  trace("asked to join room")
  socket.emit("join create room",roomName)
  socket.on("participants",async (ids) => {
    showMessage(`socket id : ${socket.id}`)
    trace(`participants: ${ids}`)
    if (ids.length === 0){
      // nobody is here
      trace("ids length of 0, nobody is here")
      showMessage("you're the only one here!")
    } else {
      trace(`received ids of ${ids}`)
      offers = await Promise.all(ids.map(id => {
        const pc = initPC(socket, id, videoStream)
        return pc.createOffer(offerOptions)
      }))
      trace(`calculated offers: ${offers}`)
      trace(`here are connections below`)
      traceObject(connections)

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
    if (!(fromId in connections)){
      trace(`creating new connection for offer from ${fromId}`)
      pc = initPC(socket, fromId, videoStream)
    }
    const rtcOffer = new RTCSessionDescription(offer) // just transforms it into the correct class
    pc.setRemoteDescription(rtcOffer)
    let answer = await pc.createAnswer()
    pc.setLocalDescription(answer)
    socket.emit("answer",socket.id,fromId,answer)
    trace(`sent answer from ${socket.id} to ${fromId} with ${answer}`)
  })

  socket.on("ice candidate",(fromId,iceCandidate) => {
    traceImportant(`received ice candidate from ${fromId} of ${iceCandidate}`)
    const rtcCandidate = new RTCIceCandidate(iceCandidate)
    connections[fromId].addIceCandidate(rtcCandidate)
  })

  socket.on("answer",(fromId,answer) => {
    trace(`received answer from ${fromId} with ${answer}`)
    let pc = connections[fromId]
    const rtcAnswer = new RTCSessionDescription(answer)
    pc.setRemoteDescription(rtcAnswer)
    trace(`set remote description to ${rtcAnswer}`)
  })

})()
