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
});

httpServer.listen(3000, () => {
    console.log('go to http://localhost:3000');
});
