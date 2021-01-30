const httpServer = require('http').createServer((req, res) => {
    res.end("hello");
});

const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*"
    }
});

io.on('connection', socket => {
  console.log('connect');
  socket.on("offer",offer => {
    console.log(offer)
    console.log(`received offer ${offer}`)
  })

  socket.on("join create room",roomName => {
    const ids = io.sockets.adapter.rooms.get(roomName)
    socket.emit("participants",ids)
    socket.join(roomName)
  })

  socket.on("offer",(fromId,toId,offer) => {
    socket.to(toId).emit("offer",fromId,offer)
  })

  socket.on("answer",(fromId,toId,answer) => {
    socket.to(toId).emit("answer",fromId,answer)
  })

});

httpServer.listen(3000, () => {
    console.log('go to http://localhost:3000');
});
