const httpServer = require('http').createServer((_, res) => {
    res.end("hello");
});

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*"
    }
});

function trace(message){
  console.log(`[INFO]: ${message}`)
}

io.on('connection', socket => {
  trace('socket connected');
  socket.on("offer",offer => {
    console.log(offer)
    console.log(`received offer ${offer}`)
  })

  socket.on("join create room",roomName => {
    trace(`request to join room ${roomName} from ${socket.id}`)
    debugger
    if (io.sockets.adapter.rooms.get(roomName) != null){
      const idsMap = io.sockets.adapter.rooms.get(roomName)
      const ids = Array.from(idsMap.keys())
      trace(`ids are of ${ids}`)
      socket.emit("participants",ids)
    } else {
      socket.emit("participants",[])
    }
    socket.join(roomName)
  })

  socket.on("offer",(fromId,toId,offer) => {
    trace(`received offer from ${fromId} to ${toId} with ${offer}`)
    socket.to(toId).emit("offer",fromId,offer)
  })

  socket.on("answer",(fromId,toId,answer) => {
    trace(`received answer from ${fromId} to ${toId} with ${answer}`)
    socket.to(toId).emit("answer",fromId,answer)
  })

  socket.on("ice candidate",(fromId,toId,iceCandidate) => {
    trace(`received ice candidate from ${fromId} to ${toId} with ${iceCandidate}`)
    console.log(iceCandidate)
    socket.to(toId).emit("ice candidate",fromId,iceCandidate)
  })

});

httpServer.listen(3000, () => {
    trace('go to http://localhost:3000');
});
