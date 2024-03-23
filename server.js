const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,userLeave,getRoomUser } = require('./utils/users');
const app = express();

const botName = 'Mj ChatBot';
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname,'public')))

io.on('connection',socket => {
    socket.on('joinRoom', ({username , room }) =>{
    const user = userJoin(socket.id ,username , room);
    socket.join(user.room);
    socket.emit('message',formatMessage(botName,'Welcome to MjChat!!!'));
    socket.broadcast.to(user.room).emit('message',formatMessage(botName , `${user.username} has joined the chat`));

    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUser(user.room)

    });


    });
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user !== undefined && user!==null){

            io.to(user.room).emit('message',formatMessage(botName,` ${user.username} has left the chat`));


         io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUser(user.room)

    });
    }
    });
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        console.log(user);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });


});

const port = 3000 || process.env.PORT;

server.listen(port,() => console.log(`Server Running on ${port}!!`));
