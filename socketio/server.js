const app = require('express')();
const httpServer = require('http').createServer(app);
const options = {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    // origin: ['https://example.com', 'https://dev.example.com'],
    // allowedHeaders: ['my-custom-header'],
    // credentials: true,
  },
};
const io = require('socket.io')(httpServer, options);
const PORT = 7000;

const users = {};
// console.log('this is the connet users', users);

io.on('connection', (socket) => {
  console.log(`Someone is connected ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`${socket.id} user is disconnected`);
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }

    io.emit('all_users', users);
  });
  socket.on('new_user', (createUser) => {
    console.log('this is new user', createUser);
    users[createUser] = socket.id;
    // TODO Broadcating to all the users that newuser is connected
    io.emit('all_users', users);
  });
  socket.on('send_message', (data) => {
    const socketId = users[data.reciver];
    io.to(socketId).emit('new_message', data);
    console.log(data);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: ["https://example.com", "https://dev.example.com"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   }
// });
